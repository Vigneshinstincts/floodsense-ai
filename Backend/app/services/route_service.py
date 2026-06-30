import httpx
from app.config import get_settings
from app.models.schemas import (
    RouteData, RouteStep, FloodRiskLevel, TrafficStatus
)
from app.services.flood_service import calculate_flood_risk
from app.utils.helpers import haversine_km
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


def decode_polyline(encoded: str) -> list[list[float]]:
    """Decode Google-format polyline encoding into [[lat,lon], ...] pairs."""
    coords = []
    index = 0
    lat = 0
    lng = 0

    while index < len(encoded):
        # Decode latitude
        result = 0
        shift = 0
        while True:
            b = ord(encoded[index]) - 63
            index += 1
            result |= (b & 0x1F) << shift
            shift += 5
            if b < 0x20:
                break
        dlat = ~(result >> 1) if result & 1 else result >> 1
        lat += dlat

        # Decode longitude
        result = 0
        shift = 0
        while True:
            b = ord(encoded[index]) - 63
            index += 1
            result |= (b & 0x1F) << shift
            shift += 5
            if b < 0x20:
                break
        dlng = ~(result >> 1) if result & 1 else result >> 1
        lng += dlng

        coords.append([lat / 1e5, lng / 1e5])

    return coords


async def fetch_osrm_route(
    origin_lat: float, origin_lon: float,
    dest_lat: float, dest_lon: float
) -> dict:
    """Call the public OSRM API for a driving route."""
    url = (
        f"{settings.OSRM_BASE_URL}/route/v1/driving/"
        f"{origin_lon},{origin_lat};{dest_lon},{dest_lat}"
    )
    params = {
        "overview": "full",
        "geometries": "polyline",
        "steps": "true",
        "annotations": "false",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

    if data.get("code") != "Ok" or not data.get("routes"):
        raise ValueError(f"OSRM returned no route: {data.get('code')}")

    return data["routes"][0]


def assess_traffic(duration_s: float, distance_m: float) -> TrafficStatus:
    """
    Estimate traffic status from speed implied by OSRM duration.
    OSRM gives free-flow time; we apply Bengaluru congestion heuristics.
    """
    if distance_m == 0:
        return TrafficStatus.CLEAR

    speed_kmh = (distance_m / 1000) / (duration_s / 3600)

    if speed_kmh >= 40:
        return TrafficStatus.CLEAR
    elif speed_kmh >= 25:
        return TrafficStatus.MODERATE
    elif speed_kmh >= 10:
        return TrafficStatus.HEAVY
    else:
        return TrafficStatus.STANDSTILL


def apply_flood_penalty(
    duration_s: float,
    flood_level: FloodRiskLevel,
    rain_mm: float
) -> float:
    """
    Add travel time penalty based on flood risk.
    Reflects real-world slowdowns during Bengaluru flooding.
    """
    multipliers = {
        FloodRiskLevel.LOW: 1.0,
        FloodRiskLevel.MEDIUM: 1.25,
        FloodRiskLevel.HIGH: 1.6,
    }
    base = duration_s * multipliers[flood_level]

    # Additional penalty for heavy rain
    if rain_mm >= 50:
        base *= 1.2
    elif rain_mm >= 20:
        base *= 1.1

    return base


def calculate_safety_score(
    flood_level: FloodRiskLevel,
    traffic: TrafficStatus,
    rain_mm: float
) -> float:
    """Return a safety score 0–100 (100 = perfectly safe)."""
    score = 100.0

    flood_penalty = {
        FloodRiskLevel.LOW: 0,
        FloodRiskLevel.MEDIUM: 25,
        FloodRiskLevel.HIGH: 50,
    }
    traffic_penalty = {
        TrafficStatus.CLEAR: 0,
        TrafficStatus.MODERATE: 5,
        TrafficStatus.HEAVY: 15,
        TrafficStatus.STANDSTILL: 25,
    }

    score -= flood_penalty[flood_level]
    score -= traffic_penalty[traffic]

    if rain_mm >= 50:
        score -= 20
    elif rain_mm >= 20:
        score -= 10
    elif rain_mm >= 5:
        score -= 5

    return max(0.0, round(score, 1))


def build_route_warnings(
    flood_level: FloodRiskLevel,
    traffic: TrafficStatus,
    rain_mm: float,
    affected_zones: list[str],
) -> list[str]:
    """Generate human-readable warnings for the route."""
    warnings = []

    if flood_level == FloodRiskLevel.HIGH:
        warnings.append("⚠️ High flood risk on or near this route.")
    if flood_level == FloodRiskLevel.MEDIUM:
        warnings.append("🟡 Moderate waterlogging possible on this route.")
    if affected_zones:
        zones = ", ".join(affected_zones[:3])
        warnings.append(f"🚧 Flood-prone areas nearby: {zones}.")
    if traffic == TrafficStatus.HEAVY:
        warnings.append("🚦 Heavy traffic detected. Expect significant delays.")
    if traffic == TrafficStatus.STANDSTILL:
        warnings.append("🛑 Traffic standstill. Consider alternative transport.")
    if rain_mm >= 50:
        warnings.append("🌧️ Extremely heavy rain. Travel only if essential.")
    elif rain_mm >= 20:
        warnings.append("🌧️ Heavy rain. Drive slowly and avoid underpasses.")

    if not warnings:
        warnings.append("✅ Route looks clear. Safe to travel.")

    return warnings


async def get_route(
    origin_lat: float, origin_lon: float,
    dest_lat: float, dest_lon: float,
    rain_mm: float = 0.0,
) -> RouteData:
    """
    Main route service entry point.
    Fetches OSRM route, applies flood/traffic logic, returns RouteData.
    """
    # 1. Get raw route from OSRM
    osrm_route = await fetch_osrm_route(origin_lat, origin_lon, dest_lat, dest_lon)

    distance_m = osrm_route["distance"]
    duration_s = osrm_route["duration"]
    distance_km = round(distance_m / 1000, 2)

    # 2. Decode polyline geometry for Leaflet
    geometry = decode_polyline(osrm_route["geometry"])

    # 3. Parse turn-by-turn steps
    steps = []
    for leg in osrm_route.get("legs", []):
        for step in leg.get("steps", []):
            maneuver = step.get("maneuver", {})
            instruction = maneuver.get("type", "").replace("-", " ").title()
            modifier = maneuver.get("modifier", "")
            if modifier:
                instruction = f"{instruction} {modifier}".title()
            name = step.get("name", "")
            if name:
                instruction = f"{instruction} onto {name}"

            steps.append(RouteStep(
                instruction=instruction or "Continue",
                distance_m=round(step.get("distance", 0), 1),
                duration_s=round(step.get("duration", 0), 1),
            ))

    # 4. Assess flood risk at midpoint of route
    mid_idx = len(geometry) // 2
    mid_lat = geometry[mid_idx][0] if geometry else origin_lat
    mid_lon = geometry[mid_idx][1] if geometry else origin_lon

    flood_data = calculate_flood_risk(mid_lat, mid_lon, rain_mm)
    flood_level = flood_data.level
    affected_zones = flood_data.affected_zones

    # 5. Assess traffic from OSRM speed
    traffic = assess_traffic(duration_s, distance_m)

    # 6. Apply flood/rain time penalty
    adjusted_duration_s = apply_flood_penalty(duration_s, flood_level, rain_mm)
    duration_min = round(adjusted_duration_s / 60, 1)

    # 7. Safety score and warnings
    safety_score = calculate_safety_score(flood_level, traffic, rain_mm)
    warnings = build_route_warnings(flood_level, traffic, rain_mm, affected_zones)

    logger.info(
        f"Route {distance_km}km | {duration_min}min | "
        f"flood={flood_level} | traffic={traffic} | safety={safety_score}"
    )

    return RouteData(
        distance_km=distance_km,
        duration_min=duration_min,
        traffic_status=traffic,
        geometry=geometry,
        steps=steps,
        flood_risk_on_route=flood_level,
        safety_score=safety_score,
        warnings=warnings,
    )