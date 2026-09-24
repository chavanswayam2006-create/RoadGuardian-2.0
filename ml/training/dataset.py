import os
import random
from typing import Optional, Callable, Tuple, List, Dict
import pandas as pd
from PIL import Image
import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms

class GTSRBDataset(Dataset):
    """
    GTSRB PyTorch Dataset supporting ROI cropping, transforms, and image validation.
    Preserves original dataset non-destructively.
    """
    def __init__(
        self,
        df: pd.DataFrame,
        root_dir: str,
        transform: Optional[Callable] = None,
        crop_roi: bool = True
    ):
        self.df = df.reset_index(drop=True)
        self.root_dir = os.path.abspath(root_dir)
        self.transform = transform
        self.crop_roi = crop_roi

    def __len__(self) -> int:
        return len(self.df)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        row = self.df.iloc[idx]
        img_rel_path = row["Path"]
        full_path = os.path.join(self.root_dir, img_rel_path)

        if not os.path.exists(full_path):
            raise FileNotFoundError(f"GTSRB image file not found: {full_path}")

        image = Image.open(full_path).convert("RGB")

        if self.crop_roi and "Roi.X1" in row:
            x1, y1, x2, y2 = int(row["Roi.X1"]), int(row["Roi.Y1"]), int(row["Roi.X2"]), int(row["Roi.Y2"])
            if x2 > x1 and y2 > y1:
                image = image.crop((x1, y1, x2, y2))

        if self.transform:
            image = self.transform(image)

        label = int(row["ClassId"])
        return image, label


def get_gtsrb_transforms(input_size: Tuple[int, int] = (48, 48)):
    """
    Returns deterministic transforms for GTSRB training, validation, and inference.
    Standardized to 48x48 pixels with ImageNet or standard normalization.
    """
    train_transform = transforms.Compose([
        transforms.Resize(input_size),
        transforms.RandomRotation(degrees=10),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.3403, 0.3121, 0.3214], std=[0.2724, 0.2608, 0.2669])
    ])

    eval_transform = transforms.Compose([
        transforms.Resize(input_size),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.3403, 0.3121, 0.3214], std=[0.2724, 0.2608, 0.2669])
    ])

    return train_transform, eval_transform


def build_deterministic_splits(
    data_dir: str = "data/local/GTSRB",
    val_ratio: float = 0.2,
    seed: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Creates deterministic track-aware train/val split from Train.csv, preventing track leakage.
    Leaves Test.csv untouched.
    """
    train_csv_path = os.path.join(data_dir, "Train.csv")
    test_csv_path = os.path.join(data_dir, "Test.csv")

    if not os.path.exists(train_csv_path):
        raise FileNotFoundError(f"Missing Train.csv at {train_csv_path}")
    if not os.path.exists(test_csv_path):
        raise FileNotFoundError(f"Missing Test.csv at {test_csv_path}")

    train_df = pd.read_csv(train_csv_path)
    test_df = pd.read_csv(test_csv_path)

    # In GTSRB Train, Path format is Train/<ClassId>/<track_id>_<frame_id>.png
    # Extract track id from path
    def extract_track_id(path_str: str) -> str:
        base = os.path.basename(path_str)
        parts = base.split("_")
        if len(parts) >= 2:
            return f"{parts[0]}_{parts[1]}"
        return base

    train_df["TrackId"] = train_df["Path"].apply(extract_track_id)

    # Group by ClassId and split tracks deterministically
    random.seed(seed)
    train_indices = []
    val_indices = []

    for class_id, group in train_df.groupby("ClassId"):
        tracks = list(group["TrackId"].unique())
        random.shuffle(tracks)
        num_val = max(1, int(round(len(tracks) * val_ratio)))
        val_tracks = set(tracks[:num_val])
        train_tracks = set(tracks[num_val:])

        for idx, row in group.iterrows():
            if row["TrackId"] in val_tracks:
                val_indices.append(idx)
            else:
                train_indices.append(idx)

    train_split_df = train_df.loc[train_indices].drop(columns=["TrackId"]).reset_index(drop=True)
    val_split_df = train_df.loc[val_indices].drop(columns=["TrackId"]).reset_index(drop=True)

    return train_split_df, val_split_df, test_df
