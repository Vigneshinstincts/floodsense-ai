from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.database import verify_connection
from app.utils.logger import get_logger
from app.api import routes, weather, flood, fare

settings = get_settings()
logger = get_logger(__name__)

# Rate limiter — 30 requests per minute per IP
limiter = Limiter(key_func=get_remote_address, default_limits=["30/minute"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting FloodSense AI [{settings.APP_ENV}]")
    verify_connection()
    yield
    logger.info("Shutting down FloodSense AI")


app = FastAPI(
    title="FloodSense AI API",
    description="Bengaluru Smart Commute Assistant",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Attach rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router, prefix="/api", tags=["routes"])
app.include_router(weather.router, prefix="/api", tags=["weather"])
app.include_router(flood.router, prefix="/api", tags=["flood"])
app.include_router(fare.router, prefix="/api", tags=["fare"])


@app.get("/", tags=["health"])
async def health_check():
    return {
        "status": "ok",
        "service": "FloodSense AI",
        "version": "1.0.0",
        "environment": settings.APP_ENV,
    }