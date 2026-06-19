# Package Development

Packaging your code turns scripts into reusable, shareable tools that support collaboration and long-term maintenance. This section outlines the essential steps for developing, testing, and distributing research software as a package.

Why Package Your Code?
- Encourages modularity, reusability, and distribution.  
- Makes it easier to share code within your group or publish with a paper.  
- Enables versioning and reproducibility across projects.

(package_development:package_structure_and_layout)=
## Package Structure and Layout (Python Example)

A Python package is importable code (modules grouped in a directory) plus metadata that makes it installable and shareable. Following a consistent, standard layout means others can install your project, run its tests, and find documentation without guesswork.

- **src layout vs flat layout.** In the *src layout*, your importable code lives under a top-level `src/` directory; in the simpler *flat layout* it sits directly at the project root. The [Python Packaging Authority](https://packaging.python.org/en/latest/discussions/src-layout-vs-flat-layout/) recommends the src layout because the interpreter puts the current working directory first on the import path. Keeping code in `src/` forces you to install the package (often in editable mode) before importing it, so your tests exercise the installed copy rather than accidentally importing loose files from the project root.
- **`pyproject.toml`.** This single file at the project root holds your project metadata and build configuration. The `[build-system]` table declares which build backend to use, and the `[project]` table (defined by [PEP 621](https://peps.python.org/pep-0621/)) declares the metadata: `name` is required and is the only field that cannot be dynamic, `version` is required, and `dependencies` lists other packages as version specifier strings.
- **The package directory and `__init__.py`.** The importable package is a directory (matching the project name) containing an `__init__.py` file, which marks the directory as a package. Modules (`.py` files) go inside it.
- **`tests/`.** Keep tests in a separate top-level `tests/` directory rather than inside the package, so test code is not shipped as part of the importable package.
- **`README` and `LICENSE`.** Place a `README` (usage and purpose) and a `LICENSE` (terms of use) at the project root, where users and packaging tools expect them.

```text
my_project/
├── pyproject.toml          # project metadata and build configuration
├── README.md               # what the project is and how to use it
├── LICENSE                 # terms of use
├── src/
│   └── my_package/         # importable package (matches the project name)
│       ├── __init__.py     # marks the directory as a package
│       └── example.py      # a module
└── tests/                  # tests live outside the package
    └── test_example.py
```

```toml
# Minimal pyproject.toml (src layout)
[build-system]
requires = ["hatchling"]      # the build backend to install
build-backend = "hatchling.build"

[project]
name = "my-package"           # required; cannot be dynamic
version = "0.1.0"             # required
dependencies = [              # other packages this project needs
    "numpy",
    "requests>=2.0",
]
```

```{tip}
You can start with the flat layout for a quick personal script, but adopting the src layout early avoids a common class of "works in my checkout, breaks once installed" bugs.
```

For a step-by-step walkthrough, see the Python Packaging User Guide's [Packaging Python Projects tutorial](https://packaging.python.org/en/latest/tutorials/packaging-projects/) and the [Writing your pyproject.toml](https://packaging.python.org/en/latest/guides/writing-pyproject-toml/) guide.

(package_development:tools_for_building_packages)=
## Tools for Building Packages

"Building" a package turns your source tree into installable artifacts that others (and your future self) can install with `pip`. You declare a build backend once, then run a build frontend to produce the artifacts.

- **Build backend.** The tool that actually assembles the artifacts. You choose one and declare it in the `[build-system]` table of your `pyproject.toml`, as shown in {ref}`package_development:package_structure_and_layout`. Common backends include [setuptools](https://setuptools.pypa.io/), [hatchling](https://hatch.pypa.io/latest/), [flit-core](https://flit.pypa.io/), and [pdm-backend](https://backend.pdm-project.org/). They are interchangeable: pick whichever fits your project, since the resulting artifacts install the same way.
- **Build frontend.** The command you run, which reads `[build-system]` and invokes your backend in an isolated environment. The standard frontend is [pypa `build`](https://build.pypa.io/), run as `python -m build`.
- **sdist vs wheel.** A *source distribution* (sdist) is a `.tar.gz` of your raw source plus metadata. A *wheel* is a pre-built `.whl` archive that pip copies into place with no build step at install time, so it installs faster. `python -m build` produces both by default.
- **Editable installs.** For day-to-day development, install your project in editable mode with `pip install -e .` so that edits to your source take effect without reinstalling.

```bash
# Build the sdist and wheel into ./dist/
python -m build
# dist/my_package-0.1.0.tar.gz          (sdist)
# dist/my_package-0.1.0-py3-none-any.whl (wheel)

# During development, install in editable mode instead
pip install -e .
```

```{note}
You do not need to build artifacts just to work on your code: an editable install is enough. Building sdists and wheels matters when you are ready to share or publish your package.
```

For details, see the Python Packaging User Guide's [Packaging Python Projects tutorial](https://packaging.python.org/en/latest/tutorials/packaging-projects/), its [overview of package formats](https://packaging.python.org/en/latest/discussions/package-formats/), and the [pypa `build` documentation](https://build.pypa.io/en/stable/).

## Testing the Package

## Installing & Distributing

## Documentation

## Research-Specific Tips

## Versioning & Releases

## Licensing

## Summary Checklist

- [ ] Package is installable via `pip` in case of a Python package.
- [ ] Code is modular and documented  
- [ ] Tests are included and pass in CI  
- [ ] `README.md` explains usage and purpose  
- [ ] Versioned and ready for sharing or publication  
