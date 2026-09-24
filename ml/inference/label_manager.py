import json
import os
from typing import Dict, Any, Optional

_CLASS_MAPPING_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "class_mapping.json")

class LabelManager:
    """
    Single source of truth for GTSRB 43 class metadata.
    Avoids hardcoding class names across backend and ML modules.
    """
    _instance: Optional["LabelManager"] = None
    _mapping: Dict[int, Dict[str, Any]] = {}

    def __init__(self, mapping_path: str = _CLASS_MAPPING_FILE):
        if not os.path.exists(mapping_path):
            raise FileNotFoundError(f"Class mapping file not found at: {mapping_path}")
        with open(mapping_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            classes_dict = data.get("classes", {})
            self._mapping = {int(k): v for k, v in classes_dict.items()}

    @classmethod
    def get_instance(cls) -> "LabelManager":
        if cls._instance is None:
            cls._instance = LabelManager()
        return cls._instance

    def get_class_info(self, class_id: int) -> Dict[str, Any]:
        return self._mapping.get(class_id, {
            "id": class_id,
            "sign_name": f"Unknown Sign ({class_id})",
            "label": f"UNKNOWN_{class_id}",
            "category": "UNKNOWN",
            "speed_limit_kmh": None,
            "severity": "INFO"
        })

    def get_display_name(self, class_id: int) -> str:
        return self.get_class_info(class_id).get("sign_name", f"Sign {class_id}")

    def get_label(self, class_id: int) -> str:
        return self.get_class_info(class_id).get("label", f"CLASS_{class_id}")

    def get_category(self, class_id: int) -> str:
        return self.get_class_info(class_id).get("category", "UNKNOWN")

    def get_speed_limit(self, class_id: int) -> Optional[int]:
        return self.get_class_info(class_id).get("speed_limit_kmh")

    def get_severity(self, class_id: int) -> str:
        return self.get_class_info(class_id).get("severity", "INFO")

    def num_classes(self) -> int:
        return len(self._mapping)
