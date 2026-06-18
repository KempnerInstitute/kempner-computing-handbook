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

## Modularity and Abstraction

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
