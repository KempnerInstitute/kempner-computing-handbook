(development_and_runtime_envs:using_uv_env)=
# Python Environments with `uv`

[`uv`](https://docs.astral.sh/uv/) is a fast Python package and project manager. It can create a virtual environment, install Python packages, record direct dependencies in a `pyproject.toml` file, and lock exact dependency versions in a `uv.lock` file. This makes it useful for maintaining a separate, reproducible environment for each research project.

`uv` manages Python packages. It does not replace the cluster's software modules when your work needs system software such as CUDA, compilers, MPI, or other non-Python libraries. Load those modules separately before creating the environment and when running the project.

## Installing `uv`

First check whether `uv` is already available:

```bash
uv --version
```

If the command is not found, install `uv` with its official standalone installer:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Start a new shell and check the installation:

```bash
uv --version
```

If the command is still not found, add the standard user binary directory to your `PATH` and add the same line to `~/.bashrc`:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

```{note}
The standalone installation of `uv` does not require Conda or an existing Python installation. See the [`uv` installation documentation](https://docs.astral.sh/uv/getting-started/installation/) for alternative installation and upgrade methods.
```

(development_and_runtime_envs:using_uv_env:project)=
## Creating an Environment for a Project

The recommended `uv` workflow keeps the dependency declarations and lockfile in the project directory. The virtual environment is stored in a `.venv` directory by default.

- Step 1: Enter an interactive compute session if required by cluster policy, then inspect the currently loaded modules:

  ```bash
  module list
  ```

- Step 2: If you want to begin with a clean module environment, purge the loaded modules and load any modules required by the project. For example:

  ```bash
  module purge
  module load python
  ```

- Step 3: Create a new project and enter its directory:

  ```bash
  uv init myproject
  cd myproject
  ```

  If you are working in an existing project that already contains `pyproject.toml`, enter that directory and do not run `uv init`.

- Step 4: Select the Python version for the project:

  ```bash
  uv python pin 3.12
  ```

  `uv` records this choice in `.python-version`. If a suitable Python installation is not available, `uv` downloads a managed Python build by default. To require a Python installation already provided by the cluster, create the environment with the loaded interpreter instead:

  ```bash
  uv venv --python "$(which python)" --no-managed-python
  ```

- Step 5: Add the packages required by the project:

  ```bash
  uv add numpy pandas matplotlib
  ```

  This command updates `pyproject.toml` and `uv.lock`, creates `.venv` if necessary, and installs the resolved packages.

- Step 6: Run code in the project environment:

  ```bash
  uv run python analysis.py
  ```

  `uv run` checks that the environment agrees with the project files before running the command. You do not need to activate the environment.

To use the environment in the same way as a conventional Python virtual environment, activate it with:

```bash
source .venv/bin/activate
```

When finished, deactivate it with:

```bash
deactivate
```

```{tip}
Prefer `uv add <package>` for project dependencies. Unlike `uv pip install <package>`, it records the dependency in `pyproject.toml` and updates `uv.lock`, allowing collaborators and batch jobs to reproduce the environment.
```

### Managing Packages

Add a runtime dependency, optionally with a version constraint:

```bash
uv add scipy
uv add "numpy>=2.0,<3"
```

Add a development-only dependency:

```bash
uv add --dev pytest ruff
```

Remove a dependency:

```bash
uv remove scipy
```

Inspect the resolved dependency tree:

```bash
uv tree
```

Upgrade all dependencies within the constraints in `pyproject.toml`, or upgrade one package:

```bash
uv lock --upgrade
uv lock --upgrade-package numpy
uv sync
```

`uv` also provides a pip-compatible interface for an existing virtual environment. This can be useful for a project that only supplies a `requirements.txt` file:

```bash
uv venv
uv pip install -r requirements.txt
```

This pip-compatible workflow does not add dependencies to `pyproject.toml`. For a project you maintain, import the requirements into the project metadata instead:

```bash
uv add --requirements requirements.txt
```

(development_and_runtime_envs:using_uv_env:reproduce)=
## Reproducing and Sharing the Environment

Commit both `pyproject.toml` and `uv.lock` to version control. Do not commit `.venv`; it can be recreated from the project files.

After cloning the project, recreate the environment with:

```bash
uv sync --locked
```

The `--locked` option fails instead of changing `uv.lock` if the lockfile and project metadata disagree. This is useful in batch jobs and other reproducible workflows.

If another tool requires a `requirements.txt` file, export one from the lockfile:

```bash
uv export --format requirements.txt --output-file requirements.txt
```

```{note}
The `uv.lock` file is the authoritative lockfile for a `uv` project. An exported `requirements.txt` file is mainly intended for interoperability with tools that do not understand `uv.lock`.
```

(development_and_runtime_envs:using_uv_env:slurm)=
## Using the Environment in a Slurm Job

Create and test the environment before submitting a long-running job. In the job script, load the same non-Python modules used when the environment was created, enter the project directory, and use `uv run`:

```bash
#!/bin/bash
#SBATCH --job-name=uv-example
#SBATCH --time=00:30:00
#SBATCH --mem=4G

module purge
module load python
export PATH="$HOME/.local/bin:$PATH"

cd /path/to/myproject
uv run --locked python analysis.py
```

If the environment has already been synchronized and compute nodes cannot access the package index, prevent `uv` from accessing the network:

```bash
uv run --locked --offline python analysis.py
```

```{warning}
The offline command succeeds only when the required Python installation, environment, and packages are already available. Run `uv sync --locked` in the project directory before submitting the job.
```

(development_and_runtime_envs:using_uv_env:jupyter)=
## Using a `uv` Environment with Jupyter

Add `ipykernel` as a development dependency:

```bash
uv add --dev ipykernel
```

VSCode can use the interpreter at `.venv/bin/python` directly. To register a named kernel for Jupyter, run:

```bash
uv run ipython kernel install --user \
  --env VIRTUAL_ENV "$(pwd)/.venv" \
  --name myproject \
  --display-name "Python (myproject)"
```

You can then select **Python (myproject)** as the notebook kernel. To launch JupyterLab without adding it as a project dependency, use:

```bash
uv run --with jupyter jupyter lab
```

```{seealso}
For details on selecting a notebook kernel in VSCode, see {ref}`development_and_runtime_envs:using_vscode_for_remote_development:jupyter` and the official [`uv` Jupyter guide](https://docs.astral.sh/uv/guides/integration/jupyter/).
```

## Storing Environments and the Cache Outside the Home Directory

By default, the project environment is located at `<project>/.venv`, and the shared cache is located under `~/.cache/uv`. Environments and cached packages can consume substantial storage and many inodes. For large projects, keep the project and its `.venv` in an appropriate lab directory and move the cache to that filesystem as well:

```bash
mkdir -p /n/holylabs/LABS/<lab_name>/Users/<username>/.cache/uv
export UV_CACHE_DIR=/n/holylabs/LABS/<lab_name>/Users/<username>/.cache/uv
```

Add the `UV_CACHE_DIR` setting to `~/.bashrc` if you want it to apply in future shells, and verify it with:

```bash
uv cache dir
```

Keeping the cache and virtual environment on the same filesystem gives `uv` the best chance to use links instead of copying package files. You can remove cache data that is no longer needed with:

```bash
uv cache prune
```

```{warning}
Scratch storage is periodically purged. It can be suitable for a disposable cache, but do not rely on it as the only location for project source code or lockfiles. If `.venv` is purged, recreate it with `uv sync --locked`.
```

## Troubleshooting

### Confirm Which Python and Environment Are Being Used

```bash
uv run which python
uv run python --version
uv run python -c "import sys; print(sys.executable)"
```

The executable should normally be `<project>/.venv/bin/python`.

### Recreate a Broken Environment

Because `.venv` is generated from the project files, it can be removed and recreated. From the project directory, move the existing environment out of the way and synchronize again:

```bash
mv .venv .venv.old
uv sync --locked
```

After confirming that the new environment works, delete `.venv.old`.

### Packages Requiring CUDA, MPI, or Compilers

Load the required cluster modules before running `uv add`, `uv sync`, or the project. Some Python packages do not publish a compatible pre-built wheel and must be compiled locally; their builds may require compiler and system-library modules. If a package depends heavily on non-Python libraries, a Conda environment, a container, or the cluster's software modules may be more appropriate than a `uv`-only environment.

````{seealso}
See the official [`uv` project guide](https://docs.astral.sh/uv/guides/projects/) and [command reference](https://docs.astral.sh/uv/reference/cli/) for additional options.
````
