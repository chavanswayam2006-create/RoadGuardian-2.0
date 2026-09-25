import os
import sys
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, HTTPException, Request, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.config import settings
from backend.schemas import (
    HealthResponse,
    DetectRequest,
    DetectResponse,
    DriverStatusRequest,
    DriverStatusResponse,
    RoadContextResponse,
    GaragesResponse,
    EventsResponse,
    ErrorResponse
)
from backend.services import InferenceService

# Setup logger
logging.basicConfig(level=settings.LOG_LEVEL.upper(), format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("roadguardian.backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    # Initialize singleton ML service during boot
    try:
        InferenceService.get_instance()
        logger.info("ML Services and Alert Engine initialized.")
    except Exception as e:
        logger.error(f"Failed to initialize InferenceService: {e}", exc_info=True)
    yield
    logger.info("Shutting down RoadGuardian backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI Traffic Sign Recognition & Driver Safety System Backend",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler - prevents raw Python exceptions from leaking to client
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            success=False,
            error="Internal processing error occurred. Please verify request parameters.",
            code="INTERNAL_SERVER_ERROR",
            timestamp=datetime.now(timezone.utc).isoformat()
        ).model_dump()
    )

@app.get("/health", response_model=HealthResponse, tags=["System"])
async def get_health():
    """
    Returns system status, active ML models, and configuration.
    """
    svc = InferenceService.get_instance()
    return HealthResponse(
        status="healthy" if svc.is_ready else "degraded",
        version=settings.VERSION,
        timestamp=datetime.now(timezone.utc).isoformat(),
        services={
            "traffic_sign_detector": "active",
            "gtsrb_classifier": "active" if svc.pipeline.classifier.is_loaded else "standby",
            "driver_monitor": "active",
            "alert_engine": "active"
        },
        config={
            "device": settings.INFERENCE_DEVICE,
            "confidence_threshold": settings.DEFAULT_CONFIDENCE_THRESHOLD,
            "ear_threshold": settings.DEFAULT_EAR_THRESHOLD,
            "classes_loaded": svc.pipeline.label_manager.num_classes()
        }
    )

@app.post("/detect", response_model=DetectResponse, tags=["Vision"])
async def detect_frame(request: DetectRequest):
    """
    Processes a road frame to detect traffic signs and signals.
    """
    svc = InferenceService.get_instance()
    try:
        img_bgr = svc.decode_base64_image(request.image_base64)
    except Exception as e:
        logger.warning(f"Invalid image input in /detect: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid image input: {str(e)}")

    result = svc.run_detection(
        image_bgr=img_bgr,
        confidence_threshold=request.confidence_threshold,
        frame_id=request.frame_id or 1
    )

    if not result.get("success", False):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=result.get("error", "Detection failed"))

    return DetectResponse(
        success=True,
        frame_id=result["frame_id"],
        timestamp=result["timestamp"],
        inference_time_ms=result["inference_time_ms"],
        timing_breakdown_ms=result.get("timing_breakdown_ms"),
        detections_count=result["detections_count"],
        detections=result["detections"],
        active_alert=result.get("active_alert")
    )

@app.post("/driver-status", response_model=DriverStatusResponse, tags=["Driver Monitoring"])
async def analyze_driver(request: DriverStatusRequest):
    """
    Analyzes driver attention, eye closure, and head pose.
    """
    svc = InferenceService.get_instance()
    img_bgr = None
    if request.image_base64:
        try:
            img_bgr = svc.decode_base64_image(request.image_base64)
        except Exception as e:
            logger.warning(f"Invalid image in /driver-status: {e}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid driver image base64")

    res = svc.run_driver_monitoring(img_bgr)
    return DriverStatusResponse(**res)

@app.get("/road-context", response_model=RoadContextResponse, tags=["Geospatial"])
async def get_road_context(
    lat: float = Query(48.137154, ge=-90.0, le=90.0),
    lon: float = Query(11.576124, ge=-180.0, le=180.0)
):
    """
    Fetches contextual road details. Explicitly labeled as DEMO_DATA.
    """
    svc = InferenceService.get_instance()
    data = svc.get_road_context(lat=lat, lon=lon)
    return RoadContextResponse(**data)

@app.get("/garages", response_model=GaragesResponse, tags=["Geospatial"])
async def get_garages(
    lat: float = Query(48.137154, ge=-90.0, le=90.0),
    lon: float = Query(11.576124, ge=-180.0, le=180.0),
    radius: int = Query(3000, ge=100, le=20000)
):
    """
    Returns nearby automotive repair centers. Explicitly labeled as DEMO_DATA.
    """
    svc = InferenceService.get_instance()
    data = svc.get_nearby_garages(lat=lat, lon=lon, radius=radius)
    return GaragesResponse(**data)

@app.get("/events", response_model=EventsResponse, tags=["History"])
async def get_events(
    limit: int = Query(50, ge=1, le=200),
    category: Optional[str] = None
):
    """
    Retrieves chronological alerts and safety events from memory buffer.
    """
    svc = InferenceService.get_instance()
    events = svc.alert_engine.get_history(limit=limit, category=category)
    return EventsResponse(
        total=len(events),
        limit=limit,
        events=events
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=False)
