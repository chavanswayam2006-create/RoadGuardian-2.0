import os
import torch
import torch.nn.functional as F
import numpy as np
from PIL import Image
from typing import Dict, Any, List, Optional, Tuple
from torchvision import transforms

from ml.models.baseline_cnn import GTSRBBaselineCNN
from ml.inference.label_manager import LabelManager

class GTSRBClassifier:
    """
    Stage 2 Classifier: Classifies cropped traffic sign regions into 43 GTSRB categories.
    Follows singleton pattern to keep weights in memory.
    """
    _instance: Optional["GTSRBClassifier"] = None

    def __init__(self, model_path: str = "ml/models/gtsrb_baseline.pt", device: Optional[str] = None):
        self.device = torch.device(device if device else ("cuda" if torch.cuda.is_available() else "cpu"))
        self.model_path = os.path.abspath(model_path)
        self.label_manager = LabelManager.get_instance()

        self.transform = transforms.Compose([
            transforms.Resize((48, 48)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.3403, 0.3121, 0.3214], std=[0.2724, 0.2608, 0.2669])
        ])

        self.model = GTSRBBaselineCNN(num_classes=43)
        self.is_loaded = False

        if os.path.exists(self.model_path):
            self._load_weights()
        else:
            print(f"Warning: Model weights not found at {self.model_path}. Classifier initialized in standby mode.")

    def _load_weights(self):
        try:
            checkpoint = torch.load(self.model_path, map_location=self.device, weights_only=False)
            state_dict = checkpoint["model_state_dict"] if "model_state_dict" in checkpoint else checkpoint
            self.model.load_state_dict(state_dict)
            self.model.to(self.device)
            self.model.eval()
            self.is_loaded = True
            print(f"GTSRB Classifier loaded successfully from {self.model_path} onto {self.device}.")
        except Exception as e:
            print(f"Error loading model weights: {e}")
            self.is_loaded = False

    @classmethod
    def get_instance(cls, model_path: str = "ml/models/gtsrb_baseline.pt") -> "GTSRBClassifier":
        if cls._instance is None:
            cls._instance = GTSRBClassifier(model_path=model_path)
        return cls._instance

    def classify_crop(self, crop_bgr: np.ndarray) -> Dict[str, Any]:
        """
        Classifies a single cropped BGR sign image.
        Returns predicted class metadata and confidence.
        """
        if not self.is_loaded:
            # Fallback if weights not yet saved
            return {
                "class_id": -1,
                "label": "MODEL_STANDBY",
                "display_name": "Classifier in Standby",
                "category": "UNKNOWN",
                "confidence": 0.0,
                "severity": "INFO",
                "speed_limit_kmh": None
            }

        # Convert BGR -> RGB
        crop_rgb = Image.fromarray(cv2_bgr_to_rgb(crop_bgr))
        tensor = self.transform(crop_rgb).unsqueeze(0).to(self.device)

        with torch.no_grad():
            logits = self.model(tensor)
            probs = F.softmax(logits, dim=1)[0]
            top_prob, top_idx = torch.max(probs, dim=0)
            class_id = int(top_idx.item())
            confidence = float(top_prob.item())

        meta = self.label_manager.get_class_info(class_id)
        return {
            "class_id": class_id,
            "label": meta["label"],
            "display_name": meta["sign_name"],
            "category": meta["category"],
            "confidence": round(confidence, 4),
            "severity": meta["severity"],
            "speed_limit_kmh": meta["speed_limit_kmh"]
        }


def cv2_bgr_to_rgb(bgr_array: np.ndarray) -> np.ndarray:
    if len(bgr_array.shape) == 3 and bgr_array.shape[2] == 3:
        return bgr_array[:, :, ::-1].copy()
    return bgr_array
