# Dataset Specification & Privacy Policy: RoadGuardian 2.0
**German Traffic Sign Recognition Benchmark (GTSRB)**

---

## 1. Strict Privacy & Local Isolation Policy

> **CRITICAL RULE**: The GTSRB dataset contains large-scale external image data and **MUST NEVER** be committed to Git or pushed to GitHub repositories.

### Enforcement Mechanism
- **Git Ignore**: Root `.gitignore` explicitly isolates:
  - `data/local/` (all uncompressed images, crops, CSV files)
  - `*.zip`, `*.tar`, `*.tar.gz` (raw archive files such as `archive.zip`)
  - `ml/models/*.pt` (trained neural network weights)
  - `.env` and `.env.local` (local configuration and paths)
- **Zero Absolute Paths**: All scripts resolve data paths via the `GTSRB_DATASET_PATH` environment variable defaulting to `./data/local/GTSRB`.

---

## 2. Dataset Overview

- **Source**: German Traffic Sign Recognition Benchmark (INP / Ruhr-Universität Bochum).
- **Format**: Single-track image sequences stored in PPM/PNG format with companion CSV annotations.
- **Classes**: 43 distinct classes representing European/German road signs.

### Dataset Split & Verified Sample Counts
| Partition | File Count / Rows | Format | Storage Location |
| :--- | :--- | :--- | :--- |
| **Training Set** | 39,209 samples across 43 class folders (`0` to `42`) | PNG / CSV | `data/local/GTSRB/Train/` (`Train.csv`) |
| **Testing Set** | 12,630 samples with ground truth annotations | PNG / CSV | `data/local/GTSRB/Test/` (`Test.csv`) |
| **Meta Information**| 43 canonical sign templates | PNG / CSV | `data/local/GTSRB/Meta/` (`Meta.csv`) |

---

## 3. GTSRB Class Mapping (43 Classes)

The system maps the 43 numerical IDs to standard semantic labels:

| Class Range | Functional Category | Examples | Target Action |
| :--- | :--- | :--- | :--- |
| **0 – 8** | Speed Limits | 20, 30, 50, 60, 70, 80, 100, 120 km/h | Speed limit advisory; overspeed check |
| **9 – 10** | Passing Restrictions | No passing, No passing for vehicles > 3.5t | Overtaking warning |
| **11 – 14** | Priority & Right-of-Way | Priority road, Yield, Stop | Critical junction alert; stop prep |
| **15 – 17** | Prohibitory | No entry, Vehicles prohibited | Wrong-way critical warning |
| **18 – 31** | Danger & Warning | General danger, Pedestrians, Children, Road work | Advisory hazard notice |
| **32 – 40** | Mandatory Direction | Turn right, Keep left, Roundabout mandatory | Directional guidance |
| **41 – 42** | Derestriction | End of speed limit, End of no passing | Restores default road speed |

---

## 4. Ground Truth vs Simulation Declarations

- **GTSRB Dataset & Evaluation**: **REAL IMPLEMENTATION** (Extracted locally in `data/local/GTSRB/` from `archive.zip`; full test evaluation completed).
- **Live Video Traffic Sign Streams**: **REAL IMPLEMENTATION** (Frame grabber processes webcam or uploaded video).
- **Synthetic Test Bench**: **SIMULATED DATA** (Interactive speed adjustments and simulated driver states for demo safety).
