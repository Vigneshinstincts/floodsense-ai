import httpx
from app.config import get_settings
from app.utils.logger import get_logger
from app.models.schemas import WeatherData, ForecastEntry

settings = get_settings()
logger = get_logger(__name__)

OWM_BASE = "https://api.openweathermap.org/data/2.5"


async def fetch_current_weather(lat: float, lon: float) -> dict:
    """Fetch current weather from OpenWeatherMap."""
    url = f"{OWM_BASE}/weather"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": settings.OWM_API_KEY,
        "units": "metric",
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()


async def fetch_forecast(lat: float, lon: float) -> dict:
    """Fetch 5-day / 3-hour forecast from OpenWeatherMap."""
    url = f"{OWM_BASE}/forecast"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": settings.OWM_API_KEY,
        "units": "metric",
        "cnt": 8,  # next 24 hours (8 x 3hr slots)
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()


def parse_current_weather(data: dict) -> WeatherData:
    """Parse OWM current weather response into WeatherData schema."""
    rain = data.get("rain", {})
    wind_speed_ms = data.get("wind", {}).get("speed", 0)

    return WeatherData(
        temperature_c=round(data["main"]["temp"], 1),
        feels_like_c=round(data["main"]["feels_like"], 1),
        humidity_pct=data["main"]["humidity"],
        description=data["weather"][0]["description"].title(),
        icon_code=data["weather"][0]["icon"],
        wind_speed_kmh=round(wind_speed_ms * 3.6, 1),
        rain_1h_mm=rain.get("1h", 0.0),
        rain_3h_mm=rain.get("3h", 0.0),
        visibility_km=round(data.get("visibility", 10000) / 1000, 1),
    )


def parse_forecast(data: dict) -> list[ForecastEntry]:
    """Parse OWM forecast response into list of ForecastEntry."""
    entries = []
    for item in data.get("list", []):
        rain = item.get("rain", {})
        entries.append(
            ForecastEntry(
                datetime_utc=item["dt_txt"],
                temperature_c=round(item["main"]["temp"], 1),
                description=item["weather"][0]["description"].title(),
                rain_mm=rain.get("3h", 0.0),
                icon_code=item["weather"][0]["icon"],
            )
        )
    return entries


async def get_weather_data(lat: float, lon: float) -> tuple[WeatherData, list[ForecastEntry], str]:
    """
    Main entry point for weather service.
    Returns (WeatherData, forecast_list, location_name).
    """
    try:
        current_raw = await fetch_current_weather(lat, lon)
        forecast_raw = await fetch_forecast(lat, lon)

        current = parse_current_weather(current_raw)
        forecast = parse_forecast(forecast_raw)
        location_name = current_raw.get("name", "Bengaluru")

        logger.info(f"Weather fetched for ({lat},{lon}): {current.description}, {current.temperature_c}°C")
        return current, forecast, location_name

    except httpx.HTTPStatusError as e:
        logger.error(f"OWM API error {e.response.status_code}: {e.response.text}")
        raise ValueError(f"Weather API error: {e.response.status_code}")
    except httpx.RequestError as e:
        logger.error(f"OWM network error: {e}")
        raise ValueError("Weather service unavailable. Check network connection.")