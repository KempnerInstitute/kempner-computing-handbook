# Testing and Continuous Integration

Reliable testing and Continuous Integration (CI) are foundational for ensuring software correctness, especially in collaborative and evolving research environments. This section outlines different types of tests, tools for writing and maintaining them, and how to integrate testing into automated workflows.

Why Testing and Continuous Integration Matters  
- Prevents regressions and errors as projects grow.  
- Encourages modular, maintainable code.  
- Enables safe collaboration through automated checks.

(testing_and_continuous_integration:types_of_tests)=
## Types of Tests

Tests differ mainly by their scope: how much of your code each one exercises at once. A healthy suite mixes several levels, since each catches different problems and gives feedback at a different speed.

- **Unit tests** check a single unit (one function, method, or small component) in isolation to confirm it behaves as intended. They are small and fast, so you can run many of them constantly. For research code, this means testing the building blocks: a normalization function, a distance metric, or a data parser.
- **Integration tests** check that several units work together correctly, focusing on the interactions and data passed between them rather than each piece alone. A typical example is one stage of an analysis pipeline: loading a file, transforming it, and writing the result.
- **End-to-end (system) tests** run the complete, integrated workflow from input to output to verify it meets its requirements. For a research project this might run the whole analysis on a small fixed dataset and compare the final numbers or figures.
- **Regression tests** lock in a previously fixed bug or a known-good result so it cannot silently break again. When you fix a bug, add a test that fails on the old behavior and passes on the new one; when an output is verified correct, save it as a reference to compare against later.
- **The test pyramid** captures a useful balance: write many fast unit tests at the base, fewer integration tests in the middle, and fewer end-to-end tests at the top. Lower-level tests run quickly and pinpoint exactly where a failure is, while end-to-end tests are slower and only tell you that something, somewhere, broke.

A minimal unit test pairs a function with a `test_` function that asserts the expected result:

```python
# code under test
def normalize(values):
    total = sum(values)
    return [v / total for v in values]  # scale values to sum to 1

# unit test: checks this one function in isolation
def test_normalize():
    assert normalize([1, 1, 2]) == [0.25, 0.25, 0.5]
```

An integration test, by contrast, would call `normalize` as part of a larger pipeline (for example, load a file, normalize it, then write the result) and check the combined output.

```{tip}
When a test fails, lower-level tests make the cause easier to find. Push tests as far down the pyramid as you can, and reach for an integration or end-to-end test only when the behavior you care about genuinely spans multiple units.
```

For deeper background, see Martin Fowler on [The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html) and the [Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html), the Wikipedia articles on [unit testing](https://en.wikipedia.org/wiki/Unit_testing), [integration testing](https://en.wikipedia.org/wiki/Integration_testing), [system testing](https://en.wikipedia.org/wiki/System_testing), and [regression testing](https://en.wikipedia.org/wiki/Regression_testing), and [The Turing Way on code testing](https://book.the-turing-way.org/reproducible-research/testing.html).

(testing_and_continuous_integration:testing_tools_and_frameworks)=
## Testing Tools and Frameworks

A small set of tools covers most research testing needs. The core choice is a test runner that finds and executes your tests; the rest help you write the {ref}`tests <testing_and_continuous_integration:types_of_tests>` themselves.

- **pytest** is the most widely used Python testing framework. Tests are plain functions named `test_*` that use Python's built-in `assert`, and pytest reports rich, detailed output on failure (for example, the actual and expected values). Two features make it especially useful:
  - **Fixtures** provide reusable setup (sample data, a temporary directory, a configured object). Define one with `@pytest.fixture` and a test receives it by listing its name as an argument.
  - **Parametrize** runs one test over many input/expected pairs, so you cover several cases without duplicating code.
- **unittest** is the standard library framework, so it needs no installation. Tests are methods on a class that subclasses `unittest.TestCase`, using assertion methods such as `assertEqual` and `assertRaises`. pytest can also discover and run `unittest`-style tests.
- **Mocking** replaces a real dependency (a network call, a database, a slow model) with a stand-in so a test stays fast and deterministic. `unittest.mock` provides `Mock` objects and `patch` to swap out attributes during a test, while pytest's built-in `monkeypatch` fixture can set or delete attributes, dictionary items, and environment variables, then undo the change automatically afterward.
- **Hypothesis** adds property-based testing: instead of fixed examples, you state a property that should hold for all inputs in a range and Hypothesis generates many cases, including edge cases you might not think of. You describe inputs with strategies and apply them via the `@given` decorator.

A parametrized pytest test checks one function against several cases at once:

```python
import pytest

def clip(x, lo, hi):
    return max(lo, min(x, hi))  # constrain x to the range [lo, hi]

@pytest.mark.parametrize("x,expected", [(-1, 0), (0, 0), (5, 5), (12, 10)])
def test_clip(x, expected):
    assert clip(x, 0, 10) == expected
```

```{tip}
Reach for parametrize whenever you find yourself copying a test and changing only the inputs. Each case is reported separately, so a failure points straight to the input that broke.
```

For details, see the [pytest documentation](https://docs.pytest.org/en/stable/), including [fixtures](https://docs.pytest.org/en/stable/how-to/fixtures.html), [parametrize](https://docs.pytest.org/en/stable/how-to/parametrize.html), and [monkeypatch](https://docs.pytest.org/en/stable/how-to/monkeypatch.html); the Python docs for [unittest](https://docs.python.org/3/library/unittest.html) and [unittest.mock](https://docs.python.org/3/library/unittest.mock.html); and the [Hypothesis documentation](https://hypothesis.readthedocs.io/en/latest/).

(testing_and_continuous_integration:writing_effective_tests)=
## Writing Effective Tests

The value of a test depends on how it is written. Good tests are clear about what they check, focused on one thing, and trustworthy enough that a failure always means something is genuinely wrong. The habits below keep a suite readable and low-maintenance as your code grows.

- **Arrange-Act-Assert.** Structure each test in three steps: *Arrange* the inputs and any setup, *Act* by calling the code under test once, then *Assert* on the result. Keeping these phases visually separate makes a test easy to read and pinpoints where it fails.
- **One behavior per test, with a descriptive name.** A test should check a single behavior so that a failure has one clear cause. Name it for the behavior it verifies (for example, `test_normalize_scales_values_to_sum_to_one`) so the report reads like a specification.
- **Independent and deterministic.** Tests should not share mutable state or depend on running in a particular order, so each can run alone or in parallel. They should also produce the same result every time: seed random number generators, inject fixed timestamps instead of reading the wall clock, and replace network or database calls with stand-ins (see {ref}`mocking and monkeypatch <testing_and_continuous_integration:testing_tools_and_frameworks>`).
- **Test edge cases and failure modes.** Beyond the typical case, cover empty input, boundary values, and invalid arguments. Assert that errors are raised when they should be: `pytest.raises` is a context manager that passes only if the wrapped code raises the expected exception.
- **Test behavior, not implementation.** Check observable results through the public interface rather than internal details. Tests bound to implementation break on harmless refactors; tests bound to behavior keep passing as long as the contract holds.

```python
import pytest

def normalize(values):
    total = sum(values)
    if total == 0:
        raise ValueError("cannot normalize values that sum to zero")
    return [v / total for v in values]  # scale values to sum to 1

def test_normalize_scales_values_to_sum_to_one():
    weights = [1, 1, 2]                  # Arrange
    result = normalize(weights)          # Act
    assert result == [0.25, 0.25, 0.5]  # Assert

def test_normalize_rejects_zero_sum():
    # the body must raise ValueError, or the test fails
    with pytest.raises(ValueError):
        normalize([0, 0])
```

```{tip}
A useful shorthand for these habits is **FIRST**: tests should be Fast, Independent, Repeatable, Self-validating (they assert pass or fail with no manual checking), and Timely (written close to the code they cover). Writing for testability also helps; see [Software Design Principles](software_design_principles.md).
```

For more, see Bill Wake on [Arrange-Act-Assert](https://xp123.com/articles/3a-arrange-act-assert/), the pytest guide to [asserting expected exceptions](https://docs.pytest.org/en/stable/how-to/assert.html#assertions-about-expected-exceptions), the Google Testing Blog on [testing behavior, not implementation](https://testing.googleblog.com/2013/08/testing-on-toilet-test-behavior-not.html), and Robert C. Martin's [FIRST principles](https://medium.com/@tasdikrahman/f-i-r-s-t-principles-of-testing-1a497acda8d6).

## Test Coverage

## Continuous Integration (CI)

## Research-Specific Advice

## Summary Checklist

- [ ] All core functionality has unit tests  
- [ ] CI runs on pull requests  
- [ ] Linting and formatting checks automated  
- [ ] Code coverage tracked  
- [ ] Tests are reproducible and deterministic  
