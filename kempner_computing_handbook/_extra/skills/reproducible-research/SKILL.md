---
name: reproducible-research
description: Reproducibility practices for research code from the Kempner Institute Computing Handbook. Covers one-command pipelines, pinned environments and containers, data versioning with DVC or Git LFS, seeds and deterministic settings, per-run records of config, commit, and seed, regression tests against saved references, output management, and archiving with a DOI. Use when setting up an analysis or experiment, adding randomness, saving results or models, or preparing code and data to share with a paper.
---

# Reproducible Research

Use these practices when you set up, run, or share a research analysis, so the same code and data give the same result. They summarize the Reproducible Research chapter of the Kempner Institute Computing Handbook: https://handbook.eng.kempnerinstitute.harvard.edu/s2_swe_for_research/reproducible_research.html

If the project has its own conventions, for example in its README, a CONTRIBUTING file, or agent instructions, follow those first.

## Ask first

- Never edit or delete raw data. Ask before you delete outputs or run commands that remove files.
- Make a repository public, upload data, or archive a release only when the user asks.

## Principles

- Keep every script, notebook, and config file under version control.
- Pin dependencies and isolate them in an environment.
- Seed every random step.
- Make the pipeline run end to end with one command, such as `make all` or a `run.sh` that starts with `set -euo pipefail`.
- Track which data version produced each input.
- Record what produced each result: the code revision, parameters, environment, inputs, and seed.

## Environment

- Pin exact versions and commit the file: `pip freeze > requirements.txt`, a lock file from pip-tools or uv, or `conda env export > environment.yml`.
- Install into a per-project virtual environment or conda environment, not system-wide.
- Record the Python version and the versions of key libraries.
- Use a container when system details, such as compilers, CUDA, or system packages, affect results. Apptainer is common on HPC clusters because it runs without root.

## Data

- Treat raw data as read-only, and write derived data to a separate location.
- Do not commit large or binary data to Git; GitHub, for example, limits files to 100 MB. Version it with DVC or Git LFS.
- With DVC, run `dvc add data/raw.csv`, commit the `.dvc` pointer file and the `.gitignore` rule, then run `dvc push`.
- Record each dataset's source, version, license, and preprocessing steps.
- Regenerate derived data from raw data with the pipeline, rather than versioning every intermediate file.

## Randomness

- Seed every random number generator in use: Python's `random`, NumPy, and the framework, for example `torch.manual_seed(seed)`.
- Prefer local generators, such as `numpy.random.default_rng(seed)` or a `torch.Generator`, over global state.
- Set `PYTHONHASHSEED` to a fixed integer when the order of sets or dicts matters.
- When exact reproducibility matters in PyTorch, call `torch.use_deterministic_algorithms(True)` and set `torch.backends.cudnn.deterministic = True` and `torch.backends.cudnn.benchmark = False`. This can be slower, and results can still differ across releases, platforms, and CPU versus GPU.
- Log the seed with the results.

## Experiment records

- Put parameters in a config file, such as YAML or JSON, rather than editing the source for each run.
- For each run, save the resolved config, the Git commit hash, and the seed in the run's output folder, or log them with MLflow or Weights & Biases.
- Keep a project README or lab notebook of what was tried, what worked, and why.

```python
import subprocess, shutil, json, yaml
from pathlib import Path

cfg = yaml.safe_load(open("config.yaml"))           # all parameters come from the config
commit = subprocess.check_output(                   # the exact code revision
    ["git", "rev-parse", "HEAD"], text=True).strip()

out = Path("runs") / commit[:8]                      # one folder per run
out.mkdir(parents=True, exist_ok=True)
shutil.copy("config.yaml", out / "config.yaml")      # save the resolved config
(out / "run_meta.json").write_text(                  # plus commit and seed
    json.dumps({"commit": commit, "seed": cfg["seed"]}, indent=2))
```

## Outputs

- Treat models, figures, and tables as outputs you regenerate from code, data, and config. Do not edit them by hand.
- Keep generated outputs out of Git, for example with `outputs/` in `.gitignore`. Version large artifacts with DVC or object storage.
- Use one output folder per run, with machine-readable names that include a version or an ISO 8601 date (`YYYY-MM-DD`).
- Save a metadata file next to each artifact with the commit, data version, and seed.

## Check reproducibility

- Re-run the pipeline twice on the same machine and compare the outputs. Then re-run it in a clean environment rebuilt from the lock file.
- Add a regression test that runs the pipeline on a small input and compares the result with a saved reference, using `numpy.testing.assert_allclose` or `pytest.approx` rather than exact equality.
- When you change behavior on purpose, inspect the difference, confirm the new output is correct, then regenerate the reference and commit it as a deliberate update.
- Run the pipeline end to end on a small input in CI.

## Share and archive

- Publish the code in a public repository with a `LICENSE` file once the work is ready to share.
- Archive a tagged GitHub release on Zenodo to get a DOI, and cite that release's DOI in the paper.
- Deposit data in a repository that gives it a DOI, such as Zenodo, Figshare, Dryad, Dataverse, or a domain repository found through re3data. Follow the FAIR principles.
- Bundle a research compendium: `README.md`, `LICENSE`, `CITATION.cff`, `environment.yml`, `data/`, `analysis/`, and `outputs/`.
