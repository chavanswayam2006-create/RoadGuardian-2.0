import os
import sys
import time
import json
import argparse
import pandas as pd
import numpy as np
import torch
import torch.nn.functional as F
from torch.utils.data import DataLoader
from sklearn.metrics import classification_report, accuracy_score, top_k_accuracy_score

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from ml.models.baseline_cnn import GTSRBBaselineCNN
from ml.training.dataset import GTSRBDataset, get_gtsrb_transforms
from ml.inference.label_manager import LabelManager

def evaluate(
    model_path: str = "ml/models/gtsrb_baseline.pt",
    data_dir: str = "data/local/GTSRB",
    batch_size: int = 64,
    output_path: str = "ml/models/test_evaluation_metrics.json"
):
    print("==================================================")
    print("EVALUATING GTSRB MODEL ON OFFICIAL TEST SET")
    print("==================================================")

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model checkpoint not found at {model_path}")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")

    # Load model checkpoint
    checkpoint = torch.load(model_path, map_location=device, weights_only=False)
    model = GTSRBBaselineCNN(num_classes=43)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(device)
    model.eval()

    label_mgr = LabelManager.get_instance()

    # Load Test dataset
    test_csv_path = os.path.join(data_dir, "Test.csv")
    test_df = pd.read_csv(test_csv_path)
    print(f"Test samples: {len(test_df)}")

    _, eval_transform = get_gtsrb_transforms(input_size=(48, 48))
    test_dataset = GTSRBDataset(test_df, root_dir=data_dir, transform=eval_transform, crop_roi=True)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    all_preds = []
    all_targets = []
    all_probs = []
    latencies = []

    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            t0 = time.perf_counter()
            outputs = model(images)
            t1 = time.perf_counter()
            latencies.append((t1 - t0) / images.size(0))

            probs = F.softmax(outputs, dim=1).cpu().numpy()
            preds = np.argmax(probs, axis=1)

            all_preds.extend(preds)
            all_targets.extend(labels.numpy())
            all_probs.append(probs)

    all_probs = np.vstack(all_probs)
    all_preds = np.array(all_preds)
    all_targets = np.array(all_targets)

    # Compute metrics
    top1_acc = accuracy_score(all_targets, all_preds)
    top5_acc = top_k_accuracy_score(all_targets, all_probs, k=5, labels=np.arange(43))
    avg_latency_ms = float(np.mean(latencies) * 1000)

    class_names = [label_mgr.get_label(i) for i in range(43)]
    report = classification_report(all_targets, all_preds, target_names=class_names, output_dict=True, zero_division=0)

    print("\n--- Evaluation Results ---")
    print(f"Top-1 Accuracy: {top1_acc * 100:.2f}%")
    print(f"Top-5 Accuracy: {top5_acc * 100:.2f}%")
    print(f"Average Inference Latency per Crop: {avg_latency_ms:.3f} ms")
    print(f"Macro F1-Score: {report['macro avg']['f1-score']:.4f}")
    print(f"Weighted F1-Score: {report['weighted avg']['f1-score']:.4f}")

    results = {
        "model_path": model_path,
        "evaluation_dataset": "GTSRB Test.csv",
        "total_test_samples": len(test_df),
        "top1_accuracy": float(top1_acc),
        "top5_accuracy": float(top5_acc),
        "average_latency_ms": avg_latency_ms,
        "macro_avg_f1": float(report["macro avg"]["f1-score"]),
        "weighted_avg_f1": float(report["weighted avg"]["f1-score"]),
        "classification_report": report
    }

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print(f"Detailed metrics saved to: {output_path}")
    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model_path", type=str, default="ml/models/gtsrb_baseline.pt")
    parser.add_argument("--data_dir", type=str, default="data/local/GTSRB")
    parser.add_argument("--batch_size", type=int, default=64)
    parser.add_argument("--output_path", type=str, default="ml/models/test_evaluation_metrics.json")
    args = parser.parse_args()

    evaluate(
        model_path=args.model_path,
        data_dir=args.data_dir,
        batch_size=args.batch_size,
        output_path=args.output_path
    )
