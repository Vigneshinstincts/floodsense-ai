from fastapi import APIRouter, Query, HTTPException
from app.services.flood_service import calculate_flood_risk
from app.models.schemas import FloodRiskResponse, ErrorResponse, Coordinates
from app.utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.get(
    "/flood-risk",
    response_model=FloodRiskResponse,
    responses={400: {"model": ErrorResponse}},
    summary="Get flood risk score for a location",
)
async def get_flood_risk(
    lat: float = Query(..., ge=12.7, le=13.3, description="Latitude"),
    lon: float = Query(..., ge=77.3, le=77.9, description="Longitude"),
    rain_mm: float = Query(default=0.0, ge=0, description="Current rainfall in mm"),
):
    """
    Returns flood risk level (Low/Medium/High), score 0–100,
    affected zone names, and a safety advisory.
    """
    try:
        risk = calculate_flood_risk(lat, lon, rain_mm)
        return FloodRiskResponse(
            success=True,
            coordinates=Coordinates(lat=lat, lon=lon),
            risk=risk,
        )
    except Exception as e:
        logger.error(f"Flood risk error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")