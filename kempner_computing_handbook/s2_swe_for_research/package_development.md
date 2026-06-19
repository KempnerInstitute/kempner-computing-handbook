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

## Tools for Building Packages

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
