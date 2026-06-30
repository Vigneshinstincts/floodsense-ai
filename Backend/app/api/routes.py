from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from fastapi import Depends

from app.models.schemas import (
    RouteRequest, RouteResponse, ErrorResponse
)
from app.models.db_models import RouteAuditLog
from app.services.route_service import get_route
from app.services.weather_service import get_weather_data
from app.services.flood_service import calculate_flood_risk
from app.services.fare_service import calculate_fare
from app.database import get_db
from app.utils.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)


@router.post(
    "/route",
    response_model=RouteResponse,
    responses={400: {"model": ErrorResponse}, 503: {"model": ErrorResponse}},
    summary="Get safest route with weather, flood risk, and fare",
)
async def get_safe_route(
    payload: RouteRequest,
    db: Session = Depends(get_db),
):
    """
    Core endpoint — returns the safest route from origin to destination
    with live weather, flood risk, traffic status, and fare estimates.
    """
    try:
        # 1. Fetch weather at origin
        weather, forecast, location_name = await get_weather_data(
            payload.origin_lat, payload.origin_lon
        )
        rain_mm = weather.rain_1h_mm or weather.rain_3h_mm

        # 2. Get route with flood/traffic analysis
        route = await get_route(
            payload.origin_lat, payload.origin_lon,
            payload.dest_lat, payload.dest_lon,
            rain_mm=rain_mm,
        )

        # 3. Get flood risk at origin
        flood_risk = calculate_flood_risk(
            payload.origin_lat, payload.origin_lon, rain_mm
        )

        # 4. Calculate fare
        fare = calculate_fare(
            payload.origin_lat, payload.origin_lon,
            payload.dest_lat, payload.dest_lon,
            route.distance_km,
            flood_risk.level,
        )

        # 5. Save audit log
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