from pydantic import BaseModel, Field, field_validator
from typing import Optional
from enum import Enum


# ─── Enums ────────────────────────────────────────────────────────────────────

class FloodRiskLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class TrafficStatus(str, Enum):
    CLEAR = "Clear"
    MODERATE = "Moderate"
    HEAVY = "Heavy"
    STANDSTILL = "Standstill"


# ─── Shared sub-models ────────────────────────────────────────────────────────

class Coordinates(BaseModel):
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lon: float = Field(..., ge=-180, le=180, description="Longitude")


class WeatherData(BaseModel):
    temperature_c: float = Field(..., description="Current temperature in Celsius")
    feels_like_c: float
    humidity_pct: int = Field(..., ge=0, le=100)
    description: str
    icon_code: str
    wind_speed_kmh: float
    rain_1h_mm: float = Field(default=0.0, description="Rainfall in last 1 hour (mm)")
    rain_3h_mm: float = Field(default=0.0, description="Rainfall in last 3 hours (mm)")
    visibility_km: float


class ForecastEntry(BaseModel):
    datetime_utc: str
    temperature_c: float
    description: str
    rain_mm: float
    icon_code: str


class FloodRiskData(BaseModel):
    level: FloodRiskLevel
    score: float = Field(..., ge=0, le=100, description="Numeric risk score 0–100")
    affected_zones: list[str] = Field(default_factory=list)
    advisory: str
    color: str = Field(..., description="Hex color for UI badge")


class RouteStep(BaseModel):
    instruction: str
    distance_m: float
    duration_s: float


class RouteData(BaseModel):
    distance_km: float
    duration_min: float
    traffic_status: TrafficStatus
    geometry: list[list[float]] = Field(
        ..., description="List of [lat, lon] pairs for Leaflet polyline"
    )
    steps: list[RouteStep]
    flood_risk_on_route: FloodRiskLevel
    safety_score: float = Field(..., ge=0, le=100)
    warnings: list[str] = Field(default_factory=list)


class FareData(BaseModel):
    bus_fare_inr: Optional[float] = Field(None, description="Estimated BMTC bus fare in INR")
    bus_available: bool
    bus_route_name: Optional[str] = None
    cab_fare_min_inr: float
    cab_fare_max_inr: float
    cab_surge_active: bool
    cab_eta_min: int = Field(..., description="Estimated cab arrival time in minutes")
    note: str = Field(default="")


# ─── Request models ───────────────────────────────────────────────────────────

class RouteRequest(BaseModel):
    origin_lat: float = Field(..., ge=12.7, le=13.3, description="Bengaluru latitude range")
    origin_lon: float = Field(..., ge=77.3, le=77.9, description="Bengaluru longitude range")
    dest_lat: float = Field(..., ge=12.7, le=13.3)
    dest_lon: float = Field(..., ge=77.3, le=77.9)
    origin_name: str = Field(..., min_length=2, max_length=200)
    dest_name: str = Field(..., min_length=2, max_length=200)

    @field_validator("origin_name", "dest_name")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        return v.strip()


class WeatherRequest(BaseModel):
    lat: float = Field(..., ge=12.7, le=13.3)
    lon: float = Field(..., ge=77.3, le=77.9)


class FloodRiskRequest(BaseModel):
    lat: float = Field(..., ge=12.7, le=13.3)
    lon: float = Field(..., ge=77.3, le=77.9)
    rain_mm: float = Field(default=0.0, ge=0)


class FareRequest(BaseModel):
    origin_lat: float
    origin_lon: float
    dest_lat: float
    dest_lon: float
    distance_km: float = Field(..., gt=0)
    flood_risk: FloodRiskLevel = FloodRiskLevel.LOW


# ─── Response envelopes ───────────────────────────────────────────────────────

class WeatherResponse(BaseModel):
    success: bool = True
    location: str
    coordinates: Coordinates
    current: WeatherData
    forecast: list[ForecastEntry]


class FloodRiskResponse(BaseModel):
    success: bool = True
    coordinates: Coordinates
    risk: FloodRiskData


class RouteResponse(BaseModel):
    success: bool = True
    origin: str
    destination: str
    route: RouteData
    weather: WeatherData
    flood_risk: FloodRiskData
    fare: FareData


class FareResponse(BaseModel):
    success: bool = True
    fare: FareData


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[str] = None