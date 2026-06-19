# Reproducible Research

Reproducibility ensures that research findings can be independently verified and built upon. This section presents core principles and practical strategies for making research code, data, and workflows reproducible.

Why Reproducibility Matters
- Essential for scientific integrity and validation.  
- Enables collaboration and reuse across projects and labs.  
- Required by many journals, conferences, and funding agencies.

(reproducible_research:key_principles)=
## Key Principles of Reproducible Code

Reproducibility means that the same analysis steps run on the same data reliably produce the same result, whether by a collaborator or by your future self. It is worth distinguishing reproducible from replicable: per [The Turing Way](https://book.the-turing-way.org/reproducible-research/overview/overview-definitions), a result is *reproducible* when the same data and the same code give the same answer, while it is *replicable* when the same analysis applied to different data gives a qualitatively similar answer. This chapter focuses on reproducibility, which is the practical foundation everything else builds on.

A handful of principles make code reproducible. The rest of this chapter expands each one in detail.

- **Version control code and configuration.** Track every script, notebook, and config file in version control so any result can be traced to an exact revision.
- **Capture the computational environment.** Pin dependencies and isolate them in a virtual environment or container so the code runs the same way elsewhere.
- **Control randomness with seeds.** Set and record random seeds for any stochastic step so runs are deterministic.
- **Make the workflow runnable end to end.** Automate the path from raw inputs to final outputs so the whole pipeline reproduces with a single command.
- **Track data and its provenance.** Record which dataset, version, and preprocessing produced each input, since code alone does not reproduce a result without the same data.
- **Record what produced each result.** Log the code revision, parameters, environment, and inputs behind every figure, table, or model.

A useful test of the end-to-end principle is whether one command regenerates everything from scratch. A small `Makefile` expresses the dependency chain from raw data to results, and is supported across platforms:

```make
# Regenerate everything with: make all
all: results/figure.png

data/clean.csv: data/raw.csv scripts/clean.py
	python scripts/clean.py data/raw.csv data/clean.csv

results/figure.png: data/clean.csv scripts/analyze.py
	python scripts/analyze.py data/clean.csv results/figure.png

clean:
	rm -f data/clean.csv results/figure.png
```

A plain `run.sh` works too when a dependency graph is overkill:

```bash
#!/usr/bin/env bash
set -euo pipefail              # stop on the first error
python scripts/clean.py data/raw.csv data/clean.csv
python scripts/analyze.py data/clean.csv results/figure.png
```

```{tip}
If you cannot yet reproduce a result with a single command, that gap is usually the highest-value thing to fix first.
```

For broader background, see [The Turing Way guide to reproducible research](https://book.the-turing-way.org/reproducible-research/overview) and the [ACM artifact review and badging definitions](https://www.acm.org/publications/policies/artifact-review-and-badging-current). The principles here connect to good software practices generally, covered in [Software Design Principles](software_design_principles.md).

(reproducible_research:environment_reproducibility)=
## Environment Reproducibility

Code only reproduces if it runs in the same software environment. This section makes the {ref}`capture the computational environment <reproducible_research:key_principles>` principle concrete: record what your code depends on so it behaves the same on a collaborator's laptop, a cluster, or your future self's machine. The options below form a fidelity spectrum, from pinning packages to capturing the whole operating system.

- **Pin exact versions and commit a lock file.** Do not record loose ranges; pin to specific versions so installs are repeatable. With pip, `pip freeze` captures the currently installed versions, or use a resolver such as [pip-tools](https://pip-tools.readthedocs.io) or [uv](https://docs.astral.sh/uv/) to produce a true lock file. With conda, `conda env export` writes the full environment to a file. Commit the result alongside your code.
- **Isolate dependencies in a virtual environment.** Install pinned dependencies into a per-project environment (a `venv` or a conda environment) rather than system-wide, so projects do not interfere and the environment can be rebuilt from scratch.
- **Capture the full environment with a container.** A lock file pins your language packages, but [containers reproduce the whole system](https://book.the-turing-way.org/reproducible-research/renv/renv-containers), including the operating system and system libraries. [Docker](https://docs.docker.com/get-started/) is the general-purpose option; [Apptainer](https://apptainer.org/docs/user/main/introduction.html) (formerly Singularity) is common on HPC clusters because it runs containers without root privileges.
- **Record the Python and key library versions.** Note the interpreter version (for example in your README or lock file) along with the versions of core libraries, since the same code can give different results under a different Python or library release.

A minimal pip workflow, capturing the current environment and rebuilding it elsewhere:

```bash
# Capture: write installed package versions to a file (commit this)
pip freeze > requirements.txt

# Reproduce: fresh virtual environment, then install the pinned set
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

The conda equivalent records the channels and packages in one file:

```bash
conda env export > environment.yml   # capture (commit this)
conda env create -f environment.yml  # reproduce
```

```{tip}
A lock file pins your language dependencies, but only a container also pins the operating system and system libraries. Reach for a container when system-level details (compilers, CUDA, system packages) affect your results.
```

For depth, see [The Turing Way on reproducible environments](https://book.the-turing-way.org/reproducible-research/renv) and the [pip](https://pip.pypa.io/en/stable/reference/requirements-file-format/) and [conda](https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html) environment docs. Day-to-day dependency and environment management is covered in [Package Development](package_development.md).

(reproducible_research:data_versioning_and_management)=
## Data Versioning and Management

A result depends on its data as much as its code, so data must be tracked with the same care. This section makes the {ref}`track data and its provenance <reproducible_research:key_principles>` principle concrete: version data alongside code so any output can be traced to the exact inputs that produced it.

- **Keep raw data immutable and separate from derived data.** Treat source data as read-only and never edit it in place; write cleaned or processed data to a separate location so the original is always recoverable.
- **Do not commit large data to Git.** Git is built for text and handles large or binary files poorly: it bloats history, slows clones, is hard to purge after the fact, and hosts impose file-size limits (for example, 100 MB on GitHub).
- **Version large or binary data with a dedicated tool.** [DVC](https://dvc.org/doc/start/data-management/data-versioning) and [Git LFS](https://git-lfs.com) keep large files out of Git history while still versioning them.
- **Link each data version to a code commit with DVC.** `dvc add` records the data's content hash in a small `.dvc` pointer file and adds the data itself to `.gitignore`. You commit the pointer to Git, so checking out a commit selects the matching data version, while `dvc push` stores the actual bytes in remote storage (for example, S3 or a shared directory).
- **Verify data integrity with checksums.** Record a hash (DVC uses MD5 internally) so you can confirm a file has not been altered or corrupted in transit.
- **Record data provenance.** Note each dataset's source, version, license, and the preprocessing steps that produced any derived files, since the same code on different data gives a different result.

A minimal DVC workflow tracks a file, commits its pointer to Git, and pushes the data to a remote:

```bash
# Track the data: creates data/raw.csv.dvc and adds raw.csv to data/.gitignore
dvc add data/raw.csv

# Commit the small pointer file and the .gitignore rule (not the data itself)
git add data/raw.csv.dvc data/.gitignore
git commit -m "Track raw dataset with DVC"

# Upload the data bytes to the configured remote storage
dvc push
```

Git LFS is an alternative that keeps the familiar Git workflow, replacing tracked files with pointers and storing the contents on a remote:

```bash
git lfs track "*.h5"   # records the pattern in .gitattributes
git add .gitattributes
```

```{tip}
Decide what is raw versus derived early, and regenerate derived data from raw with your pipeline rather than versioning every intermediate file. Version raw inputs and final outputs; rebuild the rest.
```

For depth, see the [DVC data versioning guide](https://dvc.org/doc/start/data-management/data-versioning), the [Git LFS documentation](https://git-lfs.com), and [The Turing Way on version control for data](https://book.the-turing-way.org/reproducible-research/vcs/vcs-data).

(reproducible_research:randomness_and_seeds)=
## Randomness and Seeds

Stochastic steps such as random sampling, weight initialization, data shuffling, and dropout make results vary from run to run unless you control the random number generators (RNGs). This section makes the {ref}`control randomness with seeds <reproducible_research:key_principles>` principle concrete: seed every RNG you use so a stochastic run repeats.

- **Seed every RNG you actually use.** A single library's seed does not cover the others. If your code uses Python's `random`, NumPy, and a framework such as PyTorch, seed each one.
- **Prefer explicit local generators over global state.** A local generator (NumPy `default_rng(seed)` or a `torch.Generator`) carries its own state, so its stream is not perturbed by unrelated library calls and is easy to pass around and reason about.
- **Watch non-obvious sources of nondeterminism.** The `PYTHONHASHSEED` environment variable randomizes `str`/`bytes` hashing and therefore the iteration order of sets and dicts; set it to a fixed integer for stable ordering. Multi-threading and multi-processing reorder work, and some GPU operations (certain CUDA and cuDNN kernels, for example) are not deterministic by default.
- **Enable deterministic algorithms when exact reproducibility matters.** In PyTorch, `torch.use_deterministic_algorithms(True)` (with `torch.backends.cudnn.deterministic = True` and `torch.backends.cudnn.benchmark = False`) opts into deterministic kernels. This can be slower, and even then PyTorch notes that results are not guaranteed to match across releases, platforms, or between CPU and GPU.
- **Record the seed with the results.** Log the seed alongside outputs (see {ref}`record what produced each result <reproducible_research:key_principles>`) so a run can be reproduced later.

```python
import random
import numpy as np

SEED = 42
random.seed(SEED)                 # Python's built-in random
rng = np.random.default_rng(SEED)  # local NumPy generator (preferred)
x = rng.random(3)                  # draw from the local generator, not np.random.*

# If you use PyTorch, also seed it (covers CPU and CUDA):
# import torch
# torch.manual_seed(SEED)
# torch.use_deterministic_algorithms(True)  # optional: exact, but slower
```

```{note}
Seeding makes a run repeatable on the same setup, but it is not a guarantee of identical results across different hardware, library versions, or CPU versus GPU. Treat the seed as one recorded input, not a substitute for pinning your environment.
```

For the exact APIs and caveats, see the [NumPy `default_rng` reference](https://numpy.org/doc/stable/reference/random/generator.html), the [Python `random` docs](https://docs.python.org/3/library/random.html), [`PYTHONHASHSEED`](https://docs.python.org/3/using/cmdline.html#envvar-PYTHONHASHSEED), and the [PyTorch reproducibility note](https://pytorch.org/docs/stable/notes/randomness.html). Recording the seed connects to capturing your full environment, covered in {ref}`reproducible_research:environment_reproducibility`.

(reproducible_research:documentation_of_experiments)=
## Documentation of Experiments

To reproduce or interpret a result months later, you need to recover everything that produced it. This section makes the {ref}`record what produced each result <reproducible_research:key_principles>` principle concrete: capture the full set of inputs behind every run, and keep a record of what you tried and why.

- **Capture every input to a run.** Record the parameters and configuration, the code revision (a Git commit hash), the {ref}`computational environment <reproducible_research:environment_reproducibility>`, the {ref}`data version <reproducible_research:data_versioning_and_management>`, and the random {ref}`seed <reproducible_research:randomness_and_seeds>`. Any one of these can change a result, so all of them belong in the record.
- **Externalize configuration into a config file.** Move parameters out of the code and into a config file (for example YAML or JSON) so the run is fully described by its config, not by edited source. The same script then reproduces a run by reading the same config.
- **Save a per-run record.** Write the resolved config, the commit hash, and the seed into a per-run output directory, or use an experiment tracker. [MLflow](https://mlflow.org/docs/latest/ml/tracking/) and [Weights & Biases](https://docs.wandb.ai/guides/track/) both log parameters, metrics, and artifacts per run, and record the code version (the Git commit).
- **Keep a project README or lab notebook.** Maintain a running note of what was tried, what worked, and why, so the reasoning behind a result is recoverable, not just its numbers. The Turing Way frames this as recording the [provenance](https://book.the-turing-way.org/reproducible-research/rdm/) of a project.

A minimal config-driven pattern: read a YAML config, then save the resolved config, commit, and seed into the run's output folder.

```yaml
# config.yaml: the run is described entirely by this file
seed: 42
learning_rate: 0.001
epochs: 20
data_version: v3
```

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

```{tip}
A quick test: given only a run's output folder, could you rerun it? If the config, commit, and seed are saved alongside the outputs, the answer is yes.
```

For depth, see [The Turing Way on research data management](https://book.the-turing-way.org/reproducible-research/rdm/) and the [MLflow Tracking](https://mlflow.org/docs/latest/ml/tracking/) and [Weights & Biases](https://docs.wandb.ai/guides/track/) docs. Writing clear configs and notes connects to good project documentation, covered in [Documentation and Readability](documentation_and_readibility.md).

(reproducible_research:testing_reproducibility)=
## Testing Reproducibility

Reproducibility is a claim, not an assumption: a pipeline is only reproducible once you have re-run it and confirmed the outputs match. The {ref}`principles above <reproducible_research:key_principles>` make a result *likely* to reproduce; the checks below confirm that it actually does.

- **Re-run and compare, first on the same machine.** Run the pipeline twice from the same inputs and seeds and confirm the outputs agree. This catches uncontrolled randomness and accidental dependence on leftover state or cached files.
- **Then re-run in a clean environment or on a different machine.** Rebuild the {ref}`environment <reproducible_research:environment_reproducibility>` from your lock file in a fresh virtual environment or container, or run on a collaborator's machine. A result that reproduces only on your laptop usually hides an undeclared dependency: an unpinned package, a local data file, or a hard-coded path.
- **Add a regression test against a saved reference.** Save a known-good output once, then have a test re-run the pipeline and compare against it. Such a test (Michael Feathers' *characterization test*) pins current behavior so an unintended change is flagged on sight.
- **Compare floating-point results with a tolerance, not exact equality.** Numerical output rarely matches bit-for-bit across runs, platforms, or library versions, so compare within a tolerance using `numpy.testing.assert_allclose` or `pytest.approx`.
- **Run the pipeline end to end in CI.** Exercise the whole workflow on a small input on every change so reproducibility is checked continuously rather than rediscovered months later. The mechanics of writing tests and configuring CI are covered in [Testing and Continuous Integration](testing_and_continuous_integration.md).

A minimal regression test runs the pipeline on a fixed input and compares to a saved reference within a tolerance:

```python
import numpy as np

def test_pipeline_matches_reference():
    result = run_pipeline("tests/data/small_input.csv")  # the function or pipeline under test
    reference = np.load("tests/data/expected_output.npy")  # saved known-good output
    # Pass if |result - reference| <= atol + rtol * |reference|; relax tolerances as needed
    np.testing.assert_allclose(result, reference, rtol=1e-6, atol=0)
```

```{tip}
When you change behavior on purpose, the regression test will fail because the saved reference is now stale. Inspect the diff, confirm the new output is correct, then regenerate the reference and commit it as a deliberate update.
```

For depth, see [`numpy.testing.assert_allclose`](https://numpy.org/doc/stable/reference/generated/numpy.testing.assert_allclose.html), [`pytest.approx`](https://docs.pytest.org/en/stable/reference/reference.html#pytest-approx), the [characterization test definition](https://en.wikipedia.org/wiki/Characterization_test), and The Turing Way on [testing](https://book.the-turing-way.org/reproducible-research/testing) and [continuous integration](https://book.the-turing-way.org/reproducible-research/ci).

## Output and Artifact Management

## Sharing and Archiving

## Summary Checklist

- [ ] All code is under version control  
- [ ] Dependencies are pinned and documented  
- [ ] Random seeds are set  
- [ ] Environment is isolated (virtual env or container)  
- [ ] Data and config files are versioned  
- [ ] Instructions exist to reproduce full pipeline  
- [ ] Outputs (models, figures) are archived with metadata  
