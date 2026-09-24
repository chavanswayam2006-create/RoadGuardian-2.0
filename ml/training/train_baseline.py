import os
import sys
import time
import json
import argparse
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from ml.models.baseline_cnn import GTSRBBaselineCNN
from ml.training.dataset import GTSRBDataset, get_gtsrb_transforms, build_deterministic_splits

def train_baseline(
    data_dir: str = "data/local/GTSRB",
    epochs: int = 5,
    batch_size: int = 64,
    lr: float = 0.001,
    save_path: str = "ml/models/gtsrb_baseline.pt",
    metrics_path: str = "ml/models/baseline_training_metrics.json",
    seed: int = 42
):
    print("==================================================")
    print("TRAINING GTSRB BASELINE CLASSIFIER")
    print("==================================================")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")

    # Build deterministic splits
    print("Splitting dataset deterministically by sign tracks...")
    train_df, val_df, _ = build_deterministic_splits(data_dir=data_dir, val_ratio=0.2, seed=seed)
    print(f"Train samples: {len(train_df)}, Validation samples: {len(val_df)}")

    train_transform, eval_transform = get_gtsrb_transforms(input_size=(48, 48))

    train_dataset = GTSRBDataset(train_df, root_dir=data_dir, transform=train_transform, crop_roi=True)
    val_dataset = GTSRBDataset(val_df, root_dir=data_dir, transform=eval_transform, crop_roi=True)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    model = GTSRBBaselineCNN(num_classes=43).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="max", factor=0.5, patience=2)

    best_val_acc = 0.0
    history = []

    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    for epoch in range(1, epochs + 1):
        start_time = time.time()
        model.train()
        running_loss = 0.0
        correct_train = 0
        total_train = 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            total_train += labels.size(0)
            correct_train += predicted.eq(labels).sum().item()

        epoch_loss = running_loss / total_train
        train_acc = correct_train / total_train

        # Validation
        model.eval()
        val_loss = 0.0
        correct_val = 0
        total_val = 0

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)

                val_loss += loss.item() * images.size(0)
                _, predicted = outputs.max(1)
                total_val += labels.size(0)
                correct_val += predicted.eq(labels).sum().item()

        epoch_val_loss = val_loss / total_val
        val_acc = correct_val / total_val
        scheduler.step(val_acc)
        elapsed = time.time() - start_time

        print(
            f"Epoch [{epoch:02d}/{epochs:02d}] "
            f"Train Loss: {epoch_loss:.4f} | Train Acc: {train_acc*100:.2f}% | "
            f"Val Loss: {epoch_val_loss:.4f} | Val Acc: {val_acc*100:.2f}% | "
            f"Time: {elapsed:.1f}s"
        )

        epoch_stats = {
            "epoch": epoch,
            "train_loss": epoch_loss,
            "train_acc": train_acc,
            "val_loss": epoch_val_loss,
            "val_acc": val_acc,
            "epoch_time_s": elapsed
        }
        history.append(epoch_stats)

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "val_acc": val_acc,
                "architecture": "GTSRBBaselineCNN",
                "input_resolution": [3, 48, 48],
                "num_classes": 43
            }, save_path)
            print(f"  -> Saved best model checkpoint to {save_path} (Val Acc: {val_acc*100:.2f}%)")

    # Save metrics log
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump({
            "model_architecture": "GTSRBBaselineCNN",
            "input_resolution": [3, 48, 48],
            "num_classes": 43,
            "epochs": epochs,
            "batch_size": batch_size,
            "learning_rate": lr,
            "best_val_accuracy": best_val_acc,
            "history": history
        }, f, indent=2)

    print(f"\nTraining completed! Best Validation Accuracy: {best_val_acc*100:.2f}%")
    return best_val_acc

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=5)
    parser.add_argument("--batch_size", type=int, default=64)
    parser.add_argument("--lr", type=float, default=0.001)
    parser.add_argument("--data_dir", type=str, default="data/local/GTSRB")
    parser.add_argument("--save_path", type=str, default="ml/models/gtsrb_baseline.pt")
    args = parser.parse_args()

    train_baseline(
        data_dir=args.data_dir,
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        save_path=args.save_path
    )
