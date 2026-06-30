from app.models.schemas import FareData, FloodRiskLevel
from app.utils.helpers import haversine_km
from app.utils.logger import get_logger
import pandas as pd
from pathlib import Path

logger = get_logger(__name__)

BUS_ROUTES_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "bus_routes.csv"

try:
    BUS_ROUTES_DF = pd.read_csv(BUS_ROUTES_PATH)
    logger.info(f"Loaded {len(BUS_ROUTES_DF)} bus routes from CSV")
except Exception as e:
    logger.error(f"Failed to load bus routes CSV: {e}")
    BUS_ROUTES_DF = pd.DataFrame()

# Bengaluru cab fare constants (market rates 2024)
CAB_RATES = {
    "mini":  {"base": 50,  "per_km": 12, "per_min": 1.8, "min_fare": 60},
    "sedan": {"base": 65,  "per_km": 14, "per_min": 2.0, "min_fare": 80},
}

SURGE_MULTIPLIERS = {
    FloodRiskLevel.LOW:    1.0,
    FloodRiskLevel.MEDIUM: 1.3,
    FloodRiskLevel.HIGH:   1.8,
}


def find_nearest_bus_route(
    origin_lat: float, origin_lon: float,
    dest_lat: float, dest_lon: float,
) -> tuple[str | None, str | None, float | None]:
    """
    Find the nearest BMTC bus route by matching origin and destination stops.
    Returns (route_number, route_name, estimated_fare).
    """
    if BUS_ROUTES_DF.empty:
        return None, None, None

    df = BUS_ROUTES_DF.copy()

    df["origin_dist"] = df.apply(
        lambda r: haversine_km(origin_lat, origin_lon, r["origin_lat"], r["origin_lon"]),
        axis=1,
    )
    df["dest_dist"] = df.apply(
        lambda r: haversine_km(dest_lat, dest_lon, r["dest_lat"], r["dest_lon"]),
        axis=1,
    )
    df["total_dist"] = df["origin_dist"] + df["dest_dist"]

    # Only consider routes where both stops are within 3km
    candidates = df[(df["origin_dist"] <= 3.0) & (df["dest_dist"] <= 3.0)]

    if candidates.empty:
        return None, None, None

    best = candidates.loc[candidates["total_dist"].idxmin()]
    distance_km = haversine_km(
        best["origin_lat"], best["origin_lon"],
        best["dest_lat"], best["dest_lon"]
    )
    fare = round(best["base_fare_inr"] + (distance_km * best["per_km_fare_inr"]), 1)

    return best["route_number"], best["route_name"], fare


def calculate_cab_fare(
    distance_km: float,
    duration_min: float,
    flood_risk: FloodRiskLevel,
) -> tuple[float, float, bool]:
    """
    Returns (min_fare, max_fare, surge_active).
    Min = mini cab, Max = sedan with surge.
    """
    surge = SURGE_MULTIPLIERS[flood_risk]
    surge_active = surge > 1.0

    mini = CAB_RATES["mini"]
    sedan = CAB_RATES["sedan"]

    mini_fare = max(
        mini["min_fare"],
        (mini["base"] + distance_km * mini["per_km"] + duration_min * mini["per_min"]) * surge
    )
    sedan_fare = max(
        sedan["min_fare"],
        (sedan["base"] + distance_km * sedan["per_km"] + duration_min * sedan["per_min"]) * surge
    )

    return round(mini_fare, 1), round(sedan_fare, 1), surge_active


def calculate_fare(
    origin_lat: float, origin_lon: float,
    dest_lat: float, dest_lon: float,
    distance_km: float,
    flood_risk: FloodRiskLevel = FloodRiskLevel.LOW,
) -> FareData:
    """Main fare calculation entry point."""

    # Estimate duration from distance (Bengaluru avg ~20 km/h in traffic)
    duration_min = (distance_km / 20) * 60

    # Bus fare
    route_num, route_name, bus_fare = find_nearest_bus_route(
        origin_lat, origin_lon, dest_lat, dest_lon
    )
    bus_available = bus_fare is not None

    # Cab fare
    cab_min, cab_max, surge_active = calculate_cab_fare(
        distance_km, duration_min, flood_risk
    )

    # Cab ETA estimate (5–15 min based on risk)
    eta_map = {
        FloodRiskLevel.LOW: 5,
        FloodRiskLevel.MEDIUM: 10,
        FloodRiskLevel.HIGH: 15,
    }
    cab_eta = eta_map[flood_risk]

    note = ""
    if flood_risk == FloodRiskLevel.HIGH:
        note = "⚠️ Surge pricing active due to high flood risk and rain demand."
    elif flood_risk == FloodRiskLevel.MEDIUM:
        note = "🟡 Mild surge pricing due to rain. Bus is the most affordable option."
    else:
        note = "✅ Normal pricing. Bus is cheapest, cab is fastest."

    logger.info(
        f"Fare: bus=₹{bus_fare} cab=₹{cab_min}–₹{cab_max} surge={surge_active}"
    )

    return FareData(
        bus_fare_inr=bus_fare,
        bus_available=bus_available,
        bus_route_name=f"{route_num} – {route_name}" if route_num else None,
        cab_fare_min_inr=cab_min,
        cab_fare_max_inr=cab_max,
        cab_surge_active=surge_active,
        cab_eta_min=cab_eta,
        note=note,
    )