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

## Testability and Maintainability

## Reusability and Extensibility

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
