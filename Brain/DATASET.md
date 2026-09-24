# Dataset Documentation: GTSRB
**German Traffic Sign Recognition Benchmark**

## 1. Dataset Overview
- **Dataset Name**: GTSRB (German Traffic Sign Recognition Benchmark)
- **Expected Purpose**: Traffic-sign classification (identifying specific road sign types).
- **Dataset Status**: **NOT PROVIDED YET**
  *(Note: An uninspected `archive.zip` file exists in the workspace root, but its interior contents, classes, and annotations have NOT been unzipped, verified, or analyzed yet).*
- **Storage Location**: Local-only path `data/local/GTSRB/`
- **Configuration Variable**: `GTSRB_DATASET_PATH` (configured via `.env`)

---

## 2. Strict Privacy and Storage Rules
- The dataset is **strictly private and local** to the developer's workstation.
- **NEVER** commit dataset images, annotations, CSVs, or extracted frames to Git.
- **NEVER** push dataset files to GitHub.
- Root `.gitignore` enforces exclusion of:
  - `data/local/`
  - `*.zip`, `*.tar`, `*.tar.gz`
  - Extracted frame and image caches.

---

## 3. Dataset Inspection & Classification vs. Detection Limitation

> [!IMPORTANT]
> **CRITICAL GTSRB RULE**: Do **NOT** assume GTSRB is an object-detection dataset.
> GTSRB is historically a traffic-sign *classification* benchmark consisting of cropped traffic-sign images rather than full driving scenes with multi-class bounding box annotations.
> Detection capability must **NOT** be claimed solely because GTSRB exists.

When the dataset is extracted and inspected in a future task, the following must be verified:
1. **Actual Directory Structure**: `UNKNOWN — REQUIRES VERIFICATION`
2. **Total Classes & Class Mapping**: `UNKNOWN — REQUIRES VERIFICATION`
3. **Number of Training/Testing Samples**: `UNKNOWN — REQUIRES VERIFICATION`
4. **Image Formats and Resolutions**: `UNKNOWN — REQUIRES VERIFICATION`
5. **Annotations & Bounding Boxes**: `UNKNOWN — REQUIRES VERIFICATION` (Determine whether bounding boxes exist in meta files or if crops are pre-segmented).
6. **Suitability**: Determine whether the dataset supports direct classification only, or if an additional upstream object detection model (e.g. YOLO trained on generic traffic signs) is required.

---

## 4. Potential Processing Architecture (Hypothesis)

If GTSRB is determined to be a classification-only dataset of cropped signs, the processing pipeline may take the form of a two-stage system:

```
Camera Frame
  └──> Object Detection (Locate generic traffic sign candidate)
        └──> Sign Bounding Box
              └──> Crop Sign Region
                    └──> GTSRB Classifier (Categorize specific sign class)
                          └──> Sign Class & Confidence
                                └──> Alert Engine
```

*Status: **HYPOTHESIS ONLY** — DO NOT implement or assume this architecture until the dataset and project requirements are formally inspected and verified.*

---

## 5. Dataset Metrics & Statistics
- Total Images: `UNKNOWN — REQUIRES VERIFICATION`
- Train / Val / Test Split: `UNKNOWN — REQUIRES VERIFICATION`
- Class Names / IDs: `UNKNOWN — REQUIRES VERIFICATION`
- Image Dimensions: `UNKNOWN — REQUIRES VERIFICATION`
- Color Space: `UNKNOWN — REQUIRES VERIFICATION`
