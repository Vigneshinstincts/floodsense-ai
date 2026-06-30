from fastapi import APIRouter, Query, HTTPException
from app.services.weather_service import get_weather_data
from app.models.schemas import WeatherResponse, ErrorResponse, Coordinates
from app.utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.get(
    "/weather",
    response_model=WeatherResponse,
    responses={400: {"model": ErrorResponse}, 503: {"model": ErrorResponse}},
    summary="Get current weather and 24hr forecast",
)
async def get_weather(
    lat: float = Query(..., ge=12.7, le=13.3, description="Latitude (Bengaluru range)"),
    lon: float = Query(..., ge=77.3, le=77.9, description="Longitude (Bengaluru range)"),
):
    """
    Returns current weather conditions and next 24-hour forecast
    for the given coordinates within Bengaluru.
    """
    try:
        current, forecast, location_name = await get_weather_data(lat, lon)

        return WeatherResponse(
            success=True,
            location=location_name,
            coordinates=Coordinates(lat=lat, lon=lon),
            current=current,
            forecast=forecast,
        )

    except ValueError as e:
        logger.warning(f"Weather request failed: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected weather error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")