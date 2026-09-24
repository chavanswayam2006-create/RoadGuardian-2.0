import os
import sys
import hashlib
from collections import Counter
import pandas as pd
from PIL import Image

def analyze_dataset(data_dir="data/local/GTSRB"):
    data_dir = os.path.abspath(data_dir)
    print(f"=== GTSRB Dataset Forensic Analysis ===")
    print(f"Dataset root: {data_dir}\n")

    train_csv_path = os.path.join(data_dir, "Train.csv")
    test_csv_path = os.path.join(data_dir, "Test.csv")
    meta_csv_path = os.path.join(data_dir, "Meta.csv")

    assert os.path.exists(train_csv_path), "Train.csv missing"
    assert os.path.exists(test_csv_path), "Test.csv missing"
    assert os.path.exists(meta_csv_path), "Meta.csv missing"

    train_df = pd.read_csv(train_csv_path)
    test_df = pd.read_csv(test_csv_path)
    meta_df = pd.read_csv(meta_csv_path)

    print(f"Train.csv rows: {len(train_df)}")
    print(f"Test.csv rows: {len(test_df)}")
    print(f"Meta.csv rows: {len(meta_df)}")

    # Check classes
    classes_train = sorted(train_df["ClassId"].unique())
    classes_test = sorted(test_df["ClassId"].unique())
    print(f"Classes count: {len(classes_train)} in train, {len(classes_test)} in test.")
    assert classes_train == classes_test, "Mismatch between train and test class IDs"

    # Analyze file integrity, format, dimensions, corruptions, duplicates
    def inspect_images(df, split_name):
        print(f"\nScanning {split_name} images ({len(df)} entries)...")
        corrupted = []
        formats = Counter()
        modes = Counter()
        widths = []
        heights = []
        hashes = set()
        exact_duplicates = 0

        for idx, row in df.iterrows():
            rel_path = row["Path"]
            full_path = os.path.join(data_dir, rel_path)
            if not os.path.exists(full_path):
                corrupted.append((rel_path, "FILE_NOT_FOUND"))
                continue
            try:
                with Image.open(full_path) as img:
                    formats[img.format] += 1
                    modes[img.mode] += 1
                    w, h = img.size
                    widths.append(w)
                    heights.append(h)
                    # Verify image decoding
                    img.verify()

                # Hash check for exact duplicate files
                with open(full_path, "rb") as f:
                    file_hash = hashlib.md5(f.read()).hexdigest()
                    if file_hash in hashes:
                        exact_duplicates += 1
                    else:
                        hashes.add(file_hash)
            except Exception as e:
                corrupted.append((rel_path, str(e)))

        return {
            "total": len(df),
            "corrupted": corrupted,
            "formats": dict(formats),
            "modes": dict(modes),
            "min_width": min(widths) if widths else 0,
            "max_width": max(widths) if widths else 0,
            "mean_width": sum(widths) / len(widths) if widths else 0,
            "min_height": min(heights) if heights else 0,
            "max_height": max(heights) if heights else 0,
            "mean_height": sum(heights) / len(heights) if heights else 0,
            "unique_hashes": len(hashes),
            "exact_duplicates": exact_duplicates,
        }

    train_stats = inspect_images(train_df, "Train")
    test_stats = inspect_images(test_df, "Test")

    print("\n--- Train Verification ---")
    print(f"Total: {train_stats['total']}")
    print(f"Corrupted / unreadable: {len(train_stats['corrupted'])}")
    print(f"Formats: {train_stats['formats']}")
    print(f"Color Modes: {train_stats['modes']}")
    print(f"Widths: min={train_stats['min_width']}, max={train_stats['max_width']}, mean={train_stats['mean_width']:.1f}")
    print(f"Heights: min={train_stats['min_height']}, max={train_stats['max_height']}, mean={train_stats['mean_height']:.1f}")
    print(f"Unique MD5s: {train_stats['unique_hashes']}, Exact duplicates: {train_stats['exact_duplicates']}")

    print("\n--- Test Verification ---")
    print(f"Total: {test_stats['total']}")
    print(f"Corrupted / unreadable: {len(test_stats['corrupted'])}")
    print(f"Formats: {test_stats['formats']}")
    print(f"Color Modes: {test_stats['modes']}")
    print(f"Widths: min={test_stats['min_width']}, max={test_stats['max_width']}, mean={test_stats['mean_width']:.1f}")
    print(f"Heights: min={test_stats['min_height']}, max={test_stats['max_height']}, mean={test_stats['mean_height']:.1f}")
    print(f"Unique MD5s: {test_stats['unique_hashes']}, Exact duplicates: {test_stats['exact_duplicates']}")

    # Class distribution & Imbalance
    train_counts = train_df["ClassId"].value_counts().sort_index()
    test_counts = test_df["ClassId"].value_counts().sort_index()

    print("\n--- Class Imbalance Analysis ---")
    print(f"Train - Min class count: {train_counts.min()} (Class {train_counts.idxmin()})")
    print(f"Train - Max class count: {train_counts.max()} (Class {train_counts.idxmax()})")
    print(f"Train - Median class count: {train_counts.median():.0f}")
    print(f"Train - Imbalance ratio (max/min): {train_counts.max() / train_counts.min():.2f}x")

    print(f"\nTest - Min class count: {test_counts.min()} (Class {test_counts.idxmin()})")
    print(f"Test - Max class count: {test_counts.max()} (Class {test_counts.idxmax()})")
    print(f"Test - Median class count: {test_counts.median():.0f}")
    print(f"Test - Imbalance ratio (max/min): {test_counts.max() / test_counts.min():.2f}x")

    # Output class breakdown table
    print("\nClass ID | Train Count | Test Count | Total")
    print("-" * 45)
    for c in range(43):
        tr = train_counts.get(c, 0)
        te = test_counts.get(c, 0)
        print(f"{c:8d} | {tr:11d} | {te:10d} | {tr+te:5d}")

if __name__ == "__main__":
    analyze_dataset()
