---
name: package-development
description: Python packaging practices for research code from the Kempner Institute Computing Handbook. Covers the src layout, pyproject.toml metadata, build backends, python -m build, editable installs, testing the installed package with tox or nox, publishing with twine through TestPyPI, optional dependency extras, package data with importlib.resources, semantic versioning, Git tags, changelogs, and SPDX license fields. Use when turning research code into an installable package, editing pyproject.toml, or preparing a release.
---

# Package Development

Use these practices when you turn research code into an installable Python package, change its packaging, or prepare a release. They summarize the Package Development chapter of the Kempner Institute Computing Handbook: https://handbook.eng.kempnerinstitute.harvard.edu/s2_swe_for_research/package_development.html

If the project has its own conventions, for example in its README, a CONTRIBUTING file, or agent instructions, follow those first. Keep the project's build backend and layout unless the user asks you to change them.

## Ask first

- Upload to TestPyPI or PyPI, push tags, or create a GitHub release only when the user asks.
- Do not ask for, print, or write a PyPI API token into a file. Let the user enter it when twine prompts.

## When to package

- Package code once it is reused across projects or shared with a paper. Keep the package small and focused; not every analysis needs to become a library.

## Layout and metadata

- Use the src layout: importable code in `src/<package_name>/` with an `__init__.py`, tests in a top-level `tests/` directory, and `pyproject.toml`, `README.md`, and `LICENSE` at the root.
- In `pyproject.toml`, declare the build backend in `[build-system]` (for example setuptools, hatchling, flit-core, or pdm-backend) and the metadata in `[project]`: `name` (required, and never dynamic), `version`, and `dependencies`.
- Set `readme` to the README file, which becomes the PyPI project page, and add `[project.urls]` links such as Documentation and Source.
- Put heavy or optional dependencies in `[project.optional-dependencies]` extras, such as `gpu` or `viz`, so the default install stays light.
- Ship small data files inside the package, and read them with `importlib.resources` instead of hard-coded paths.

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "my-package"
version = "0.1.0"
readme = "README.md"
license = "MIT"
license-files = ["LICENSE"]
dependencies = ["numpy", "requests>=2.0"]

[project.optional-dependencies]
viz = ["matplotlib"]

[project.urls]
Documentation = "https://my-package.readthedocs.io/"
Source = "https://github.com/owner/my-package"
```

```python
from importlib.resources import files

content = files("mypkg").joinpath("data.csv").read_text(encoding="utf-8")
```

## Build and test

- For development, install the project in editable mode with `pip install -e .`, and run `pytest` from the project root.
- Build the sdist and wheel with `python -m build` only when the package is ready to share.
- Test the installed package in clean environments, across the Python versions you target, with tox or nox. Run the same check in CI.

## Publish

- Upload to TestPyPI first and check that the package installs, then upload to PyPI: `python -m twine upload --repository testpypi dist/*`, then `python -m twine upload dist/*`.
- Authenticate with an API token, not a password: the username is `__token__`, and the password is the token, including its `pypi-` prefix. TestPyPI needs its own account and token.
- A released version cannot be reused on PyPI. To ship a fix, bump the version and build fresh artifacts.
- For a package that provides a command-line tool, users can install it with `pipx install`.

## Versions and releases

- Use semantic versioning, `MAJOR.MINOR.PATCH`: MAJOR for breaking API changes, MINOR for backward-compatible features, and PATCH for backward-compatible fixes.
- Keep the version in one place: the `version` field in `[project]`, or `dynamic = ["version"]` with the build backend reading it from a file or Git tag.
- Keep a `CHANGELOG.md` in the Keep a Changelog format, with an Unreleased section and headings such as Added, Changed, Deprecated, Removed, Fixed, and Security.
- To release: bump the version, turn the Unreleased section into a dated entry, commit, create an annotated tag with `git tag -a v1.2.0 -m "Release 1.2.0"`, and push it with `git push origin v1.2.0`. Then create a GitHub release with notes from the changelog.
- Archive the release on Zenodo for a DOI, and add a `CITATION.cff` file so others cite the software correctly.

## License

- Add a `LICENSE` file at the root, and declare it in `[project]` as an SPDX expression with `license = "MIT"` and `license-files = ["LICENSE"]` (PEP 639). Do not use the deprecated table form, such as `license = {text = ...}`. If an older build backend rejects the SPDX string, check its documentation.
- Permissive licenses (MIT, BSD, Apache-2.0) usually make research software easiest to reuse, but follow institution and funder policies. Check that dependency licenses are compatible.
