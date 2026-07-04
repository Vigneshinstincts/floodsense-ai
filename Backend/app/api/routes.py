from fastapi import APIRouter, HTTPException, Request
from sqlalchemy.orm import Session
from fastapi import Depends

from app.models.schemas import RouteRequest, RouteResponse, ErrorResponse
from app.models.db_models import RouteAuditLog
from app.services.route_service import get_route
from app.services.weather_service import get_weather_data
from app.services.flood_service import calculate_flood_risk
from app.services.fare_service import calculate_fare
from app.database import get_db
from app.utils.logger import get_logger
from app.main import limiter

router = APIRouter()
logger = get_logger(__name__)


@router.post(
    "/route",
    response_model=RouteResponse,
    responses={400: {"model": ErrorResponse}, 503: {"model": ErrorResponse}},
    summary="Get safest route with weather, flood risk, and fare",
)
@limiter.limit("10/minute")
async def get_safe_route(
    request: Request,
    payload: RouteRequest,
    db: Session = Depends(get_db),
):
    try:
        try:
            weather, forecast, location_name = await get_weather_data(
                payload.origin_lat, payload.origin_lon
            )
            rain_mm = weather.rain_1h_mm or weather.rain_3h_mm
        except Exception as e:
            logger.warning(f"Weather fetch failed, using defaults: {e}")
            from app.models.schemas import WeatherData
            weather = WeatherData(
                temperature_c=28.0,
                feels_like_c=30.0,
                humidity_pct=75,
                description="Weather data unavailable",
                icon_code="01d",
                wind_speed_kmh=10.0,
                rain_1h_mm=0.0,
                rain_3h_mm=0.0,
                visibility_km=10.0,
            )
            rain_mm = 0.0

        route = await get_route(
            payload.origin_lat, payload.origin_lon,
            payload.dest_lat, payload.dest_lon,
            rain_mm=rain_mm,
        )

        flood_risk = calculate_flood_risk(
            payload.origin_lat, payload.origin_lon, rain_mm
        )

        fare = calculate_fare(
            payload.origin_lat, payload.origin_lon,
            payload.dest_lat, payload.dest_lon,
            route.distance_km,
            flood_risk.level,
        )

        try:
            log = RouteAuditLog(
                origin_name=payload.origin_name,
                dest_name=payload.dest_name,
                origin_lat=payload.origin_lat,
                origin_lon=payload.origin_lon,
                dest_lat=payload.dest_lat,
                dest_lon=payload.dest_lon,
                distance_km=route.distance_km,
                duration_min=route.duration_min,
                flood_risk_level=flood_risk.level.value,
                weather_description=weather.description,
                rain_mm=rain_mm,
                cab_fare_min=fare.cab_fare_min_inr,
                cab_fare_max=fare.cab_fare_max_inr,
                bus_fare=fare.bus_fare_inr,
            )
            db.add(log)
            db.commit()
        except Exception as e:
            logger.warning(f"Audit log failed (non-critical): {e}")
            db.rollback()

        return RouteResponse(
            success=True,
            origin=payload.origin_name,
            destination=payload.dest_name,
            route=route,
            weather=weather,
            flood_risk=flood_risk,
            fare=fare,
        )

    except ValueError as e:
        logger.warning(f"Route request failed: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected route error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")