# Kempner Institute Computing Handbook

<p align="center">
<a href="https://github.com/KempnerInstitute/kempner-computing-handbook/actions/workflows/check_build.yml"><img src="https://github.com/KempnerInstitute/kempner-computing-handbook/actions/workflows/check_build.yml/badge.svg" alt="Build Status"/></a>
<a href="https://github.com/KempnerInstitute/kempner-computing-handbook/actions/workflows/deploy_action.yml"><img src="https://github.com/KempnerInstitute/kempner-computing-handbook/actions/workflows/deploy_action.yml/badge.svg" alt="Deploy Status"/></a>
<a href="LICENSE"><img src="https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-lightgrey.svg" alt="License: CC BY-NC-ND 4.0"/></a>
<a href="https://handbook.eng.kempnerinstitute.harvard.edu/"><img src="https://img.shields.io/badge/site-handbook.eng.kempnerinstitute.harvard.edu-blue" alt="Live Site"/></a>
</p>


Welcome to the Kempner Institute Computing Handbook, a comprehensive resource designed to empower researchers and students with the knowledge and tools necessary to leverage High-Performance Computing (HPC) for advanced computational research. This guide covers everything from the basics of getting started on the Kempner AI cluster, understanding its architecture, and navigating its environment, to more advanced topics such as job scheduling with SLURM, optimizing computational workflows, and harnessing the power of GPU computing. Through detailed sections on development and runtime environments, scalability, data management, and performance monitoring, users are equipped to efficiently manage resources, develop and run sophisticated applications, and analyze performance to ensure optimal outcomes. Whether you are new to HPC or looking to enhance your computational research projects, this guide provides the foundational knowledge and practical insights to effectively utilize the HPC resources available at the Kempner Institute.


## How to build the handbook

### Using `uv` (recommended)

Install [uv](https://docs.astral.sh/uv/), then from the repo root:

```bash
make build        # build into kempner_computing_handbook/_build/html/
make build-live   # build, then serve at http://localhost:8000 (Ctrl-C to stop)
make clean        # remove _build/
```

`uv` reads `pyproject.toml` + `uv.lock` and manages Python (≥3.12) and `jupyter-book<2` automatically. The venv lands in `.venv/` and is gitignored.

### Using plain `pip`

```bash
pip install "jupyter-book<2"
jupyter-book build kempner_computing_handbook
```

## How to contribute to the handbook

Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for instructions on how to contribute to the handbook.

