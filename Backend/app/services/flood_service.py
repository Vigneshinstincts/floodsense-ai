import pandas as pd
from pathlib import Path
from app.models.schemas import FloodRiskData, FloodRiskLevel
from app.utils.helpers import haversine_km
from app.utils.logger import get_logger

logger = get_logger(__name__)

DATA_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "flood_zones.csv"

try:
    FLOOD_ZONES_DF = pd.read_csv(DATA_PATH)
    logger.info(f"Loaded {len(FLOOD_ZONES_DF)} flood zones from CSV")
except Exception as e:
    logger.error(f"Failed to load flood zones CSV: {e}")
    FLOOD_ZONES_DF = pd.DataFrame()


def _default_risk() -> FloodRiskData:
    return FloodRiskData(
        level=FloodRiskLevel.LOW,
        score=0.0,
        affected_zones=[],
        advisory="Risk data temporarily unavailable.",
        color="#22c55e",
    )


def calculate_flood_risk(lat: float, lon: float, rain_mm: float = 0.0) -> FloodRiskData:
    if FLOOD_ZONES_DF.empty:
        return _default_risk()

    df = FLOOD_ZONES_DF.copy()

    df["distance_km"] = df.apply(
        lambda row: haversine_km(lat, lon, row["lat"], row["lon"]), axis=1
    )

    nearby = df[df["distance_km"] <= 3.0].copy()

    if nearby.empty:
        base_score = 10.0
        affected_zones = []
    else:
        nearby["proximity_weight"] = 1 / (nearby["distance_km"] + 0.1)
        nearby["weighted_score"] = nearby["base_risk_score"] * nearby["proximity_weight"]
        total_weight = nearby["proximity_weight"].sum()
        base_score = nearby["weighted_score"].sum() / total_weight
        affected_zones = nearby[nearby["distance_km"] <= 1.0]["area_name"].tolist()

    rain_boost = 0.0
    if rain_mm >= 50:
        rain_boost = 30.0
    elif rain_mm >= 20:
        rain_boost = 20.0
    elif rain_mm >= 10:
        rain_boost = 12.0
    elif rain_mm >= 5:
        rain_boost = 6.0
    elif rain_mm > 0:
        rain_boost = 2.0

    final_score = min(100.0, round(base_score + rain_boost, 1))

    if final_score >= 65:
        level = FloodRiskLevel.HIGH
        color = "#ef4444"
        advisory = (
            "⚠️ High flood risk detected. Avoid low-lying underpasses and lake "
            "areas. Prefer elevated routes. Consider delaying travel if possible."
        )
    elif final_score >= 35:
        level = FloodRiskLevel.MEDIUM
        color = "#f59e0b"
        advisory = (
            "🟡 Moderate flood risk. Stay alert for waterlogging. "
            "Avoid known flood-prone areas like Silk Board and Bellandur."
        )
    else:
        level = FloodRiskLevel.LOW
        color = "#22c55e"
        advisory = (
            "✅ Low flood risk in this area. Normal travel conditions. "
            "Stay updated if rain is forecast."
        )

    logger.info(f"Flood risk for ({lat},{lon}) rain={rain_mm}mm → {level} (score={final_score})")

    return FloodRiskData(
        level=level,
        score=final_score,
        affected_zones=affected_zones,
        advisory=advisory,
        color=color,
    )
