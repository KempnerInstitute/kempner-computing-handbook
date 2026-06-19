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

## Data Versioning and Management

## Randomness and Seeds

## Documentation of Experiments

## Testing Reproducibility

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
