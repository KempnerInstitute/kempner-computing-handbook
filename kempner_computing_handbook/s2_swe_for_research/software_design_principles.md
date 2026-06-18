# Software Design Principles

Sound software design is essential for building research tools that are maintainable, testable, extensible, and reproducible. This section outlines key principles and strategies that guide the structure and evolution of well-architected research codebases.

(software_design_principles:fundamental_design_principles)=
## Fundamental Design Principles

A handful of broadly applicable principles help keep research code correct and easy to change as a project grows from a quick script into a shared codebase. They are not rigid rules: treat them as defaults that bias you toward clarity, and apply judgment when they conflict.

- **KISS (Keep It Simple):** Prefer the simplest design that solves the problem at hand. Plain, readable code is easier to debug and verify than clever code, which matters when results must be trusted. See [KISS principle](https://en.wikipedia.org/wiki/KISS_principle).
- **DRY (Don't Repeat Yourself):** Every piece of knowledge should have a single, authoritative representation. When the same logic appears in several places, a fix or a change has to be made everywhere, which invites bugs. See [Don't repeat yourself](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) and The Turing Way's [Reusable Code](https://book.the-turing-way.org/reproducible-research/code-reuse/).
- **YAGNI (You Aren't Gonna Need It):** Build only what your current analysis requires, not features you merely anticipate. Speculative generality adds code to maintain and test for no present benefit. See [You aren't gonna need it](https://en.wikipedia.org/wiki/You_aren%27t_gonna_need_it).
- **Separation of concerns:** Divide a problem into distinct parts (for example data loading, computation, and plotting) so each can be understood and changed on its own. See [Separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns).
- **Single responsibility (SRP):** Give each function, class, or module one clear job, so it has only one reason to change. See [Single-responsibility principle](https://en.wikipedia.org/wiki/Single-responsibility_principle).

DRY in practice: when the same computation is copied across an analysis, extract it into one reusable function so there is a single place to read, test, and fix.

```python
# Repetitive: the same normalization is duplicated and easy to get out of sync
train = (train - train.mean()) / train.std()
test = (test - test.mean()) / test.std()

# DRY: one definition, reused for every dataset
def standardize(x):
    """Center to zero mean and scale to unit standard deviation."""
    return (x - x.mean()) / x.std()

train = standardize(train)
test = standardize(test)
```

```{tip}
Favor clarity over cleverness. If a simpler version is a little longer but obviously correct, prefer it: code is read far more often than it is written.
```

The rest of this page builds on these ideas, covering modularity and abstraction, dependency management, refactoring, and reproducibility in more depth. Related practices live on the [Collaborative Code Development](collaborative_code_development.md) and [Reproducible Research](reproducible_research.md) pages.

(software_design_principles:modularity_and_abstraction)=
## Modularity and Abstraction

Modularity and abstraction are two sides of the same idea: split a system into self-contained modules, and let each module expose a small, stable interface that hides how it works inside. This builds directly on {ref}`Fundamental Design Principles <software_design_principles:fundamental_design_principles>`, since separation of concerns and single responsibility are what give a module a clear boundary and one job.

- **Modularity and high cohesion:** Decompose a program into [modules](https://en.wikipedia.org/wiki/Modular_programming) (functions, classes, or files) that each handle one logically related task, for example data loading, model training, or plotting. A module has high [cohesion](https://en.wikipedia.org/wiki/Cohesion_(computer_science)) when its parts genuinely belong together and work toward a single purpose, which makes it easier to read, test, and reuse.
- **Low coupling:** [Coupling](https://en.wikipedia.org/wiki/Coupling_(computer_programming)) measures how much modules depend on each other. Keep it low by having modules interact through simple, stable interfaces rather than reaching into each other's internals, so a change in one place does not ripple through the rest of the code. High cohesion and low coupling tend to go together.
- **Abstraction and information hiding:** [Abstraction](https://en.wikipedia.org/wiki/Abstraction_(computer_science)) means exposing *what* a component does and hiding *how* it does it. Callers depend on the interface (a function signature or a class's public methods), not on the implementation, so you can change or swap the internals without breaking them. This is [information hiding](https://en.wikipedia.org/wiki/Information_hiding), also called encapsulation.
- **Choosing good module boundaries:** A useful guideline from David Parnas is to draw module boundaries around the design decisions most likely to change, such as a file format, a storage backend, or a numerical method, and hide each decision behind an interface. That way an expected change stays contained within one module.

The example below hides the details of loading data behind a single function. Callers only rely on `load_dataset(path)`, so the internals can change without affecting them.

```python
def load_dataset(path):
    """Return a feature matrix and labels from a dataset file.

    Callers depend only on this signature, not on how the data is read,
    so the body could switch from CSV to Parquet without breaking them.
    """
    import pandas as pd
    df = pd.read_csv(path)            # implementation detail, hidden from callers
    return df.drop(columns="label"), df["label"]

# The caller works at the level of the interface, not the file format.
features, labels = load_dataset("experiment.csv")
```

```{tip}
A good test of a module boundary: can you describe what the module does in one sentence without mentioning how it works? If not, it may be doing too much or leaking its internals.
```

For more depth, see [Modular programming](https://en.wikipedia.org/wiki/Modular_programming), [Abstraction](https://en.wikipedia.org/wiki/Abstraction_(computer_science)), [Information hiding](https://en.wikipedia.org/wiki/Information_hiding), and refactoring.guru's [Couplers](https://refactoring.guru/refactoring/smells/couplers) on the smells that signal too-tight coupling. Modularity also underpins team workflows on the [Collaborative Code Development](collaborative_code_development.md) page.

(software_design_principles:testability_and_maintainability)=
## Testability and Maintainability

Testable code and maintainable code grow from the same habits: build small, decoupled, predictable units. [Testability](https://en.wikipedia.org/wiki/Software_testability) is the degree to which code supports testing, and code with weak cohesion, tight coupling, or hidden state is hard to test; the same traits also make it hard to maintain, where [maintainability](https://en.wikipedia.org/wiki/Maintainability) is the ease of changing code safely over time. Designing for both connects directly to {ref}`Fundamental Design Principles <software_design_principles:fundamental_design_principles>` and {ref}`Modularity and Abstraction <software_design_principles:modularity_and_abstraction>`.

- **Prefer pure functions and determinism:** A [pure function](https://en.wikipedia.org/wiki/Pure_function) returns the same output for the same input and has no side effects. Such functions are the easiest things to test, because a test is just an input and an expected output, with no setup or teardown.
- **Separate computation from I/O and side effects:** Keep file access, network calls, randomness, and printing in thin wrappers, and put the real logic in pure functions that take data in and return a result. You can then test the logic without touching the filesystem or network.
- **Inject dependencies instead of hard-coding them:** With [dependency injection](https://en.wikipedia.org/wiki/Dependency_injection), a function or object receives its collaborators from the outside rather than constructing them internally. This lets a test pass in a simple stand-in (a [test double](https://martinfowler.com/bliki/TestDouble.html)) in place of a database, model, or clock.
- **Avoid hidden global mutable state:** Functions that read or write module-level globals behave differently depending on what ran before them, which makes results order-dependent and tests flaky. Pass state in as arguments instead.
- **Keep units small and readable:** Short functions with one clear job (see single responsibility) are easier to read, change, and trust. Maintainability comes from code that is obvious rather than clever, so the next reader (often you) can follow it.

The refactor below splits a function that both reads a file and computes into a thin I/O wrapper plus a pure function. The pure function is trivially testable: pass in numbers, check the result, no file required.

```python
# Before: reading and computing are tangled, so a test needs a real file on disk.
def mean_from_file(path):
    with open(path) as f:
        values = [float(line) for line in f]
    return sum(values) / len(values)

# After: a pure function holds the logic, and a thin wrapper does the I/O.
def mean(values):
    """Return the arithmetic mean. Pure: same input -> same output, no side effects."""
    return sum(values) / len(values)

def mean_from_file(path):
    """Thin I/O wrapper: read the file, then delegate to the pure function."""
    with open(path) as f:
        values = [float(line) for line in f]
    return mean(values)

# The logic is now testable without any file:
assert mean([1.0, 2.0, 3.0]) == 2.0
```

```{tip}
A quick check: if testing a function requires creating files, network access, or a specific global state first, that is a hint to extract the core logic into a pure function and push the side effects to the edges.
```

For the mechanics of writing and running tests, including frameworks and test doubles, see the [Testing and Continuous Integration](testing_and_continuous_integration.md) page and The Turing Way's [Code Testing](https://book.the-turing-way.org/reproducible-research/testing) guide. Martin Fowler's [Inversion of Control Containers and the Dependency Injection pattern](https://martinfowler.com/articles/injection.html) covers dependency injection in more depth.

(software_design_principles:reusability_and_extensibility)=
## Reusability and Extensibility

Reusability and extensibility are about designing a piece of code once and then adapting it to new situations without rewriting what already works. Reusability builds on the DRY and modularity habits from {ref}`Fundamental Design Principles <software_design_principles:fundamental_design_principles>` and {ref}`Modularity and Abstraction <software_design_principles:modularity_and_abstraction>`: general, well-bounded code can serve more than one analysis.

- **Parameterize instead of hard-coding:** A one-off script with a baked-in path, threshold, or constant works only once. Pass those values in as arguments so the same function serves many datasets and settings. Reusable code tends to be modular, loosely coupled, and free of hidden state. See [Code reuse](https://en.wikipedia.org/wiki/Code_reuse).
- **Package genuinely reusable code:** When a function or module proves useful across projects, move it into an installable package so others can import it rather than copy it. See the [Package Development](package_development.md) page and The Turing Way's [Reusable Code](https://book.the-turing-way.org/reproducible-research/code-reuse) guide.
- **Design for extension with the Open/Closed Principle:** Software entities should be "open for extension, but closed for modification" (Bertrand Meyer, later popularized by Robert C. Martin). New behavior should be addable without editing tested, working code. See [Open-closed principle](https://en.wikipedia.org/wiki/Open%E2%80%93closed_principle).
- **Add behavior by passing in a function or strategy:** Instead of growing an `if`/`elif` chain in your core loop each time you need a new metric or model, accept the variable behavior as a parameter. This lightweight [Strategy pattern](https://en.wikipedia.org/wiki/Strategy_pattern) lets the algorithm vary independently of the code that uses it. Configuration files serve the same goal for choosing options without code changes.

In the example below, `evaluate` takes the metric as a parameter, so a new metric can be added without touching `evaluate` itself.

```python
def mse(y_true, y_pred):
    """Mean squared error."""
    return ((y_true - y_pred) ** 2).mean()

def evaluate(y_true, y_pred, metric):
    """Score predictions with any metric(y_true, y_pred) -> float.

    'metric' is passed in, so evaluate is closed for modification:
    a new metric is a new function, not an edit here.
    """
    return metric(y_true, y_pred)

score = evaluate(y_true, y_pred, mse)

# A new metric is added without changing evaluate.
def mae(y_true, y_pred):
    """Mean absolute error."""
    return (y_true - y_pred).abs().mean()

score = evaluate(y_true, y_pred, mae)
```

```{tip}
Do not over-generalize. Adding extension points you do not yet need is speculative complexity (recall YAGNI). Build the flexible version when a second real use case appears, not before.
```

## Design Patterns (Introductory Level)

## Dependency Management and Isolation

## Documentation as Part of Design

## Iterative Design & Refactoring

## Designing for Reproducibility

## Functional vs. Object-Oriented Design

## Designing APIs and CLIs for Research Tools

## Layered Architecture in Scientific Computing Software

## Summary Checklist

- [ ] Follow core principles (KISS, DRY, SRP)  
- [ ] Use modular, loosely coupled design  
- [ ] Design for testability and reuse  
- [ ] Document key design decisions  
- [ ] Enable reproducibility (configs, versioning)  
- [ ] Refactor and iterate regularly  
