import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "RoadGuardian 2.0"
    VERSION: str = "2.0.0"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    LOG_LEVEL: str = "info"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://frontend-mu-tan-79.vercel.app",
        "https://*.vercel.app",
    ]

    # Model & Data Paths
    GTSRB_DATASET_PATH: str = "./data/local/GTSRB"
    MODEL_WEIGHTS_PATH: str = "./ml/models/gtsrb_baseline.pt"
    CASCADES_DIR: str = "./ml/models/cascades"
    INFERENCE_DEVICE: str = "cpu"
    DEFAULT_CONFIDENCE_THRESHOLD: float = 0.50
    DEFAULT_EAR_THRESHOLD: float = 0.20

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
