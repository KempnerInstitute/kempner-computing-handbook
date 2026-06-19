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

(package_development:testing_the_package)=
## Testing the Package

Test your package as it will be installed, not just the files sitting in your checkout, so you catch packaging mistakes such as missing modules or data files, dependency gaps, and version incompatibilities. This section is about exercising the package as a package; for how to write and run tests, see [Testing and Continuous Integration](testing_and_continuous_integration.md).

- **Editable install, then run pytest.** Install the project with `pip install -e .` and run `pytest` from the project root. With the {ref}`src layout <package_development:package_structure_and_layout>`, your importable code is not on the default import path, so pytest exercises the installed copy rather than loose files in the working directory. See the {ref}`editable install <package_development:tools_for_building_packages>` for background.
- **Test in clean, isolated environments across Python versions.** Tools like [tox](https://tox.wiki/) and [nox](https://nox.thea.codes/) build and install your package into fresh virtual environments and run the tests there, across the Python versions you target. As the pytest docs note, this runs tests "against the installed package and not against your source code checkout, helping to detect packaging glitches" that a local run hides.
- **Run it in CI.** Wire the same command into continuous integration so every push tests the installed package in a clean environment. See [Testing and Continuous Integration](testing_and_continuous_integration.md).

```ini
# tox.ini: build and install the package in fresh envs, then run pytest
[tox]
env_list = py310, py311   # one isolated environment per Python version

[testenv]
deps = pytest             # test-time dependencies for each environment
commands = pytest         # tox installs the package, then runs the tests
```

```{tip}
Running your suite under tox or nox before you publish is the surest way to catch a "works in my checkout" bug: if a module or data file is missing from the built package, the tests fail in the clean environment even when they pass locally.
```

For details, see pytest's [Good Integration Practices](https://docs.pytest.org/en/stable/explanation/goodpractices.html), the [tox](https://tox.wiki/en/stable/) and [nox](https://nox.thea.codes/en/stable/) documentation, and the [Python Packaging User Guide](https://packaging.python.org/).

(package_development:installing_and_distributing)=
## Installing & Distributing

Distributing your package means making it installable by others. The usual route is the [Python Package Index (PyPI)](https://pypi.org/), the public repository that `pip install name` reads from, so anyone can install your project with a single command.

- **Installing a package.** Users install the published release from PyPI, a local checkout, or a Git URL directly:
  - From PyPI by name: `pip install SomePackage`.
  - From a local source tree (the project in the current directory): `pip install .`.
  - From a Git repository, without cloning first: `pip install "git+https://github.com/owner/repo.git"`.
- **Publishing to PyPI.** First {ref}`build the sdist and wheel <package_development:tools_for_building_packages>` into `dist/`, then upload them with [twine](https://twine.readthedocs.io/en/stable/). Authenticate with an [API token](https://pypi.org/help/#apitoken) rather than your account password: when twine prompts for credentials, use `__token__` as the username and the token value (including its `pypi-` prefix) as the password.
- **Test on TestPyPI first.** [TestPyPI](https://packaging.python.org/en/latest/guides/using-testpypi/) is a separate instance of the index for trying out the upload process without touching the real PyPI. It uses its own accounts and tokens, so register there separately.
- **Installing CLI tools.** For packages that provide a command-line tool, [pipx](https://pipx.pypa.io/stable/) installs each application into its own isolated environment and exposes its commands on your `PATH`, which avoids dependency conflicts between tools: `pipx install SomePackage`.

```bash
# Build the distribution artifacts into ./dist/ (see Tools for Building Packages)
python -m build

# Upload to TestPyPI first and verify the install works
python -m twine upload --repository testpypi dist/*
pip install --index-url https://test.pypi.org/simple/ --no-deps SomePackage

# When you are satisfied, upload to the real PyPI
python -m twine upload dist/*
```

```{tip}
A released version cannot be reused on PyPI: deleted files cannot be re-uploaded, even after deleting and recreating the project. To ship a fix, bump the version number and build fresh artifacts.
```

For details, see the Python Packaging User Guide's [Packaging Python Projects tutorial](https://packaging.python.org/en/latest/tutorials/packaging-projects/) (its "Uploading the distribution archives" section), the [twine documentation](https://twine.readthedocs.io/en/stable/), and pip's [pip install reference](https://pip.pypa.io/en/stable/cli/pip_install/).

(package_development:documentation)=
## Documentation

A package needs documentation so others (and your future self) can install and use it without reading the source. The `README` you place at the project root doubles as the package's landing page on PyPI, so packaging treats it as first-class metadata. For how to write and build docs (types, docstring styles, Sphinx, MkDocs), see [Documentation and Readability](documentation_and_readibility.md); this section covers only how documentation connects to packaging.

- **The README as the PyPI front page.** Point the `readme` field in the `[project]` table of your {ref}`pyproject.toml <package_development:package_structure_and_layout>` at your README file. Its contents become the long description displayed on your project's PyPI page, so a `README.md` or `README.rst` that states what the package is and how to install it is what visitors see first. The format is inferred from the file extension.
- **API reference from docstrings, hosted.** Fuller documentation, such as an API reference built from your docstrings, is best published online so users can browse it without checking out the code. [Read the Docs](https://docs.readthedocs.io/) builds and hosts documentation from your Git repository automatically and supports common tools like Sphinx and MkDocs. See [Documentation and Readability](documentation_and_readibility.md) for how to author and build those docs.
- **Documentation links in the metadata.** Add a `[project.urls]` table so links such as `Documentation` and `Source` travel with the package and appear in the sidebar of your PyPI project page, making your docs easy to find from the listing.

```toml
[project]
readme = "README.md"          # long description shown on the PyPI project page

[project.urls]
Documentation = "https://my-package.readthedocs.io/"   # hosted docs
Source = "https://github.com/owner/my-package"          # source repository
```

```{tip}
Keep the README short and install-focused: a one-line description, an install command, and a minimal usage example, then a link to the full documentation. It is the first thing visitors read on PyPI.
```

For details, see the Python Packaging User Guide's [Writing your pyproject.toml](https://packaging.python.org/en/latest/guides/writing-pyproject-toml/) guide (the `readme` field and the `[project.urls]` table), its [Making a PyPI-friendly README](https://packaging.python.org/en/latest/guides/making-a-pypi-friendly-readme/) guide, and the [Read the Docs documentation](https://docs.readthedocs.io/).

(package_development:research_specific_tips)=
## Research-Specific Tips

Package research code once it is reused across projects or shipped alongside a paper, and keep it small and focused: a single installable package beats a folder of loose scripts, but resist over-engineering.

- **Package when reused or shared, and keep it focused.** A simple, installable package that others can `pip install` is far more useful than scattered scripts, yet not every analysis needs to become a library. [The Turing Way](https://book.the-turing-way.org/reproducible-research/code-reuse/code-reuse-overview/) suggests promoting code into a package only after the reusable parts are factored out and validated, matching the effort to how the software will be reused.
- **Make it citable.** Add a [`CITATION.cff`](https://citation-file-format.github.io/) file at the project root so others cite the software correctly, and mint a DOI by archiving a release. The citation file and DOI workflow are covered in [Documentation and Readability](documentation_and_readibility.md) and [Reproducible Research](reproducible_research.md); link them from your {ref}`pyproject.toml <package_development:documentation>` metadata.
- **Use optional-dependency extras for heavy or optional deps.** Declare an extra in the `[project.optional-dependencies]` table of your {ref}`pyproject.toml <package_development:package_structure_and_layout>` so a basic install stays light and users opt in to heavy dependencies (for example a `gpu` or `viz` extra).
- **Ship data files inside the package.** Bundle small data files (lookup tables, example inputs) within the package and read them with [`importlib.resources`](https://docs.python.org/3/library/importlib.resources.html) rather than hard-coded paths, which break once the package is installed elsewhere. Removing hardcoded paths is a core reuse practice in [The Turing Way](https://book.the-turing-way.org/reproducible-research/code-reuse/code-reuse-overview/).
- **Declare and pin dependencies for reproducibility.** List dependencies in your `pyproject.toml`, and for reproducible analyses record exact versions of the full environment. See [Reproducible Research](reproducible_research.md).

```toml
# pyproject.toml: an optional "viz" extra
[project.optional-dependencies]
viz = ["matplotlib"]   # installed only on request
```

```bash
# Install the package with the optional extra
pip install "mypkg[viz]"
```

```python
# Read a packaged data file, not a hard-coded path
from importlib.resources import files

content = files("mypkg").joinpath("data.csv").read_text(encoding="utf-8")
```

```{tip}
Keep the default install minimal and move large or platform-specific dependencies into extras, so users who do not need plotting or GPU support are not forced to install them.
```

For details, see the Python Packaging User Guide's [Writing your pyproject.toml](https://packaging.python.org/en/latest/guides/writing-pyproject-toml/) guide (the `[project.optional-dependencies]` table), the [`importlib.resources` documentation](https://docs.python.org/3/library/importlib.resources.html), and the [Citation File Format](https://citation-file-format.github.io/).

(package_development:versioning_and_releases)=
## Versioning & Releases

A version number communicates what changed between releases; a release is a tagged, published snapshot that people can install and cite. Picking a clear scheme and a repeatable release process makes your software easy to depend on and to reproduce.

- **Use semantic versioning.** Number releases `MAJOR.MINOR.PATCH` and, following [Semantic Versioning](https://semver.org/), increment the MAJOR version for incompatible (breaking) API changes, the MINOR version when you add functionality in a backward-compatible way, and the PATCH version for backward-compatible bug fixes. This lets users tell at a glance whether an upgrade is safe.
- **Single-source the version.** Define the version in one place rather than duplicating it. The simplest option is the `version` field of the `[project]` table in your {ref}`pyproject.toml <package_development:package_structure_and_layout>`. Alternatively, set `dynamic = ["version"]` and let your {ref}`build backend <package_development:tools_for_building_packages>` derive it from a source file or a Git tag, as described in the Python Packaging User Guide's [Single-sourcing the Project Version](https://packaging.python.org/en/latest/discussions/single-source-version/).
- **Tag releases in Git.** Mark each release with an annotated tag (`git tag -a vX.Y.Z`), which records the tagger, date, and a message as a full object in the repository. See [Git Basics: Tagging](https://git-scm.com/book/en/v2/Git-Basics-Tagging).
- **Keep a CHANGELOG.** Maintain a human-readable `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/): group entries under headings such as Added, Changed, Deprecated, Removed, Fixed, and Security, and collect upcoming changes under an "Unreleased" heading. A curated changelog is far more useful than a raw commit log.
- **Cut the release.** Create a [GitHub release](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository) from the tag with notes drawn from the changelog. Optionally {ref}`publish the release to PyPI <package_development:installing_and_distributing>` and archive it to mint a DOI so the version is citable (see {ref}`Research-Specific Tips <package_development:research_specific_tips>`).

```bash
# Set the version (in pyproject.toml's [project] version), then tag and push
git commit -am "Release 1.2.0"
git tag -a v1.2.0 -m "Release 1.2.0"   # annotated tag for the release
git push origin v1.2.0                 # tags are not pushed by default
```

```{tip}
Bump the version, update the CHANGELOG's "Unreleased" section into a dated entry, and create the tag in the same commit history, so the published version, its tag, and its changelog entry always agree.
```

## Licensing

## Summary Checklist

- [ ] Package is installable via `pip` in case of a Python package.
- [ ] Code is modular and documented  
- [ ] Tests are included and pass in CI  
- [ ] `README.md` explains usage and purpose  
- [ ] Versioned and ready for sharing or publication  
