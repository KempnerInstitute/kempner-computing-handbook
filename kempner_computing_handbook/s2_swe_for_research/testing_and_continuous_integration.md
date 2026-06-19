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

## Testing Tools and Frameworks

## Writing Effective Tests

## Test Coverage

## Continuous Integration (CI)

## Research-Specific Advice

## Summary Checklist

- [ ] All core functionality has unit tests  
- [ ] CI runs on pull requests  
- [ ] Linting and formatting checks automated  
- [ ] Code coverage tracked  
- [ ] Tests are reproducible and deterministic  
