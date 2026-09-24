# Data Storage Guidelines

## STRICT PRIVACY AND STORAGE ENFORCEMENT
All raw datasets, video recordings, extracted frame batches, and archives located in this directory (especially under `data/local/`) are **strictly confidential and local-only**.

- Under NO circumstance should any dataset files inside `data/local/` be committed to Git or pushed to remote repositories.
- The `.gitignore` at the repository root explicitly ignores `data/local/` and all dataset archive formats (`*.zip`, `*.tar`, `*.tar.gz`, `*.7z`).
- To configure dataset paths in code, use the environment variable `GTSRB_DATASET_PATH` (see `.env.example`).
