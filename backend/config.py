import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

# Repository root (one level above backend/). All relative paths in settings are
# resolved against this so the backend can be started from any working directory.
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def _resolve_project_path(path: str) -> str:
    """Return an absolute path; relative paths are anchored at the repo root."""
    if not path:
        return path
    return path if os.path.isabs(path) else os.path.normpath(os.path.join(REPO_ROOT, path))

# Origins allowed for local development (Vite dev server) plus the known
# production frontend. Additional origins can be supplied via the
# CORS_ORIGINS environment variable as a comma-separated list.
DEFAULT_CORS_ORIGINS = (
    "http://localhost:5173,"          # Vite dev server (local)
    "http://127.0.0.1:5173,"          # Vite dev server (loopback IP)
    "http://localhost:4173,"          # Vite preview (production build check)
    "http://127.0.0.1:4173,"          # Vite preview (loopback IP)
    "http://localhost:3000,"          # alternate dev port
    "https://frontend-mu-tan-79.vercel.app"  # deployed RoadGuardian frontend
)

class Settings(BaseSettings):
    PROJECT_NAME: str = "RoadGuardian 2.0"
    VERSION: str = "2.0.0"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    LOG_LEVEL: str = "info"
    # Comma-separated list of allowed browser origins (see DEFAULT_CORS_ORIGINS).
    CORS_ORIGINS: str = DEFAULT_CORS_ORIGINS
    # Regex for Vercel preview deployments. Explicit origins above always win;
    # this regex only admits https://*.vercel.app hosts.
    CORS_ORIGIN_REGEX: str = r"^https://([a-z0-9-]+\.)*vercel\.app$"

    # Model & Data Paths (relative paths are anchored at the repository root)
    GTSRB_DATASET_PATH: str = "./data/local/GTSRB"
    MODEL_WEIGHTS_PATH: str = "./ml/models/gtsrb_baseline.pt"
    CASCADES_DIR: str = "./ml/models/cascades"
    INFERENCE_DEVICE: str = "cpu"
    DEFAULT_CONFIDENCE_THRESHOLD: float = 0.50
    DEFAULT_EAR_THRESHOLD: float = 0.20

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> List[str]:
        """Parsed allow-list of browser origins (comma-separated env supported)."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def gtsrb_dataset_abspath(self) -> str:
        return _resolve_project_path(self.GTSRB_DATASET_PATH)

    @property
    def model_weights_abspath(self) -> str:
        return _resolve_project_path(self.MODEL_WEIGHTS_PATH)

    @property
    def cascades_abspath(self) -> str:
        return _resolve_project_path(self.CASCADES_DIR)

settings = Settings()

