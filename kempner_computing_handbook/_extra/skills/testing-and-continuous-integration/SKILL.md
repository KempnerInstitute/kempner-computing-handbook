---
name: testing-and-continuous-integration
description: Use when writing, running, or reviewing tests, measuring coverage, or setting up CI for a research repository. Covers pytest tests, fixtures, parametrize, mocking and monkeypatch, Hypothesis, coverage with pytest-cov, GitHub Actions workflows, and research checks such as float tolerances, seeded randomness, and regression tests against saved references. From the Kempner Institute Computing Handbook.
---

# Testing and Continuous Integration

Use these practices when you write, run, or review tests, or set up CI, for research code. They summarize the Testing and Continuous Integration chapter of the Kempner Institute Computing Handbook: https://handbook.eng.kempnerinstitute.harvard.edu/s2_swe_for_research/testing_and_continuous_integration.html

If the project has its own conventions, for example in its README, a CONTRIBUTING file, or agent instructions, follow those first. Use the project's existing test framework; for a new project, use pytest.

## What to test

- Write many fast unit tests, fewer integration tests, and a few end-to-end tests (the test pyramid). Test each behavior at the lowest level that can check it.
- Unit-test the building blocks, such as a normalization function, a distance metric, or a data parser.
- When you fix a bug, add a regression test that fails on the old behavior and passes on the new one.
- Test data loading and preprocessing on small fixtures, including missing values and malformed rows.
- Cover edge cases and failure modes: empty input, boundary values, and invalid arguments. Use `pytest.raises` to check that an error is raised.

## How to write tests

- Structure each test as Arrange, Act, Assert, and check one behavior per test.
- Name each test for the behavior it checks, for example `test_normalize_scales_values_to_sum_to_one`.
- Keep tests independent and deterministic: no shared mutable state, no dependence on run order, seeded randomness, and fixed timestamps instead of the wall clock.
- Replace network calls, databases, and slow models with stand-ins, using `unittest.mock` (`Mock`, `patch`) or the pytest `monkeypatch` fixture.
- Use `@pytest.fixture` for reusable setup, and `@pytest.mark.parametrize` instead of copying a test to change its inputs.
- Use Hypothesis (`@given` with strategies) for invariants that must hold for all inputs, such as an output shape, a valid range, or a conserved quantity.
- Test behavior through the public interface, not implementation details.

## Research-specific checks

- Compare floats with a tolerance, never `==`. Use `pytest.approx` for single numbers (defaults: relative 1e-6, absolute 1e-12) and `numpy.testing.assert_allclose` for arrays (defaults: `rtol=1e-7`, `atol=0`). Set `atol` explicitly when expected values can be zero.
- Seed generators, for example `numpy.random.default_rng(seed)`, and assert on properties that hold for any draw, such as shape, range, or a mean within bounds, rather than on exact random values.
- Prefer small inputs whose answers you can work out by hand or analytically.
- For computations too large to check by hand, save a known-good output once and compare later runs against it with a tolerance.

```python
import numpy as np
from numpy.testing import assert_allclose

def softmax(x):
    e = np.exp(x - np.max(x))  # subtract max for numerical stability
    return e / e.sum()

def test_softmax_matches_known_values():
    result = softmax(np.array([0.0, 0.0]))
    assert_allclose(result, [0.5, 0.5])   # tolerance-based, not ==
    assert_allclose(result.sum(), 1.0)    # probabilities sum to one
```

## Coverage

- Measure coverage with pytest-cov: `pytest --cov=mypackage --cov-report=term-missing`. Add `--cov-branch` for branch coverage.
- Use the report to find untested code that matters, such as error handlers and rarely hit branches. Do not chase 100%: coverage measures what ran, not whether the results were checked.

## Continuous integration

- Run the tests on every push and pull request with a GitHub Actions workflow in `.github/workflows/ci.yml`.
- Use a matrix for the Python versions the project supports, and cache pip downloads.
- Run quick checks, such as linting and unit tests, before slower ones, and keep CI fast.
- Suggest branch protection that makes the CI check required before a merge.

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest]
        python-version: ["3.11", "3.12", "3.13"]
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-python@v7
        with:
          python-version: ${{ matrix.python-version }}
          cache: pip
      - run: pip install -e ".[test]"
      - run: pytest
```

The workflow installs a `test` extra. Declare it in `pyproject.toml`, for example `test = ["pytest", "pytest-cov"]` under `[project.optional-dependencies]`, or change the install step to match the project.

## Before you finish

- Run the test suite and report the result.
- On the Kempner AI cluster, run tests on a compute node in a SLURM job, never on a login node. Ask before you start a long or GPU test run.
- New or changed behavior has tests, including edge cases.
- Tests are deterministic and pass when run alone or in any order.
