from sqlalchemy import (
    Column, Integer, Float, String, Text,
    Boolean, DateTime, Enum as SAEnum, func
)
from app.database import Base
from app.models.schemas import FloodRiskLevel


class FloodZone(Base):
    """Known flood-prone areas in Bengaluru with risk metadata."""
    __tablename__ = "flood_zones"

    id = Column(Integer, primary_key=True, autoincrement=True)
    area_name = Column(String(200), nullable=False, index=True)
    locality = Column(String(200), nullable=True)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    radius_km = Column(Float, default=0.5, comment="Affected radius in km")
    base_risk_score = Column(Float, default=50.0, comment="Baseline risk 0–100")
    risk_level = Column(
        SAEnum(FloodRiskLevel),
        default=FloodRiskLevel.MEDIUM,
        nullable=False,
    )
    drainage_quality = Column(
        String(20), default="poor",
        comment="poor | moderate | good"
    )
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<FloodZone {self.area_name} [{self.risk_level}]>"


class BusRoute(Base):
    """BMTC bus routes serving Bengaluru with fare data."""
    __tablename__ = "bus_routes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    route_number = Column(String(20), nullable=False, index=True)
    route_name = Column(String(300), nullable=False)
    origin_stop = Column(String(200), nullable=False)
    dest_stop = Column(String(200), nullable=False)
    origin_lat = Column(Float, nullable=False)
    origin_lon = Column(Float, nullable=False)
    dest_lat = Column(Float, nullable=False)
    dest_lon = Column(Float, nullable=False)
    base_fare_inr = Column(Float, nullable=False, default=5.0)
    per_km_fare_inr = Column(Float, default=1.5)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<BusRoute {self.route_number}: {self.origin_stop} → {self.dest_stop}>"


class FareConfig(Base):
    """Configurable fare parameters for cab estimation."""
    __tablename__ = "fare_config"

    id = Column(Integer, primary_key=True, autoincrement=True)
    cab_type = Column(String(50), nullable=False, comment="auto | mini | sedan | suv")
    base_fare_inr = Column(Float, nullable=False)
    per_km_inr = Column(Float, nullable=False)
    per_min_inr = Column(Float, nullable=False)
    surge_low_multiplier = Column(Float, default=1.0)
    surge_medium_multiplier = Column(Float, default=1.3)
    surge_high_multiplier = Column(Float, default=1.8)
    min_fare_inr = Column(Float, default=30.0)
    is_active = Column(Boolean, default=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<FareConfig {self.cab_type} ₹{self.base_fare_inr} base>"


class RouteAuditLog(Base):
    """Audit log for every route request — useful for analytics."""
    __tablename__ = "route_audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    origin_name = Column(String(200), nullable=False)
    dest_name = Column(String(200), nullable=False)
    origin_lat = Column(Float)
    origin_lon = Column(Float)
    dest_lat = Column(Float)
    dest_lon = Column(Float)
    distance_km = Column(Float)
    duration_min = Column(Float)
    flood_risk_level = Column(String(20))
    weather_description = Column(String(100))
    rain_mm = Column(Float, default=0.0)
    cab_fare_min = Column(Float)
    cab_fare_max = Column(Float)
    bus_fare = Column(Float, nullable=True)
    requested_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<RouteLog {self.origin_name} → {self.dest_name} @ {self.requested_at}>"