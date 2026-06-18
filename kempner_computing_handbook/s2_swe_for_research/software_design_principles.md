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

(software_design_principles:design_patterns)=
## Design Patterns (Introductory Level)

A [design pattern](https://refactoring.guru/design-patterns/what-is-pattern) is a named, reusable solution to a commonly recurring design problem. The idea was popularized by the "Gang of Four" (Erich Gamma, Richard Helm, Ralph Johnson, and John Vlissides) in their 1994 book *Design Patterns: Elements of Reusable Object-Oriented Software*, which sorts patterns into three families. You do not need to memorize the catalog; a few patterns are genuinely useful for keeping analysis code flexible.

- **Patterns are shared vocabulary:** Naming a recurring structure lets you describe a design in a word or two ("pass in a strategy", "use a factory") instead of re-explaining the mechanics, which helps when reading code or discussing it with collaborators.
- **The three families:** [Creational](https://refactoring.guru/design-patterns/creational-patterns) patterns concern how objects are made, [structural](https://refactoring.guru/design-patterns/structural-patterns) patterns concern how objects and classes are composed, and [behavioral](https://refactoring.guru/design-patterns/behavioral-patterns) patterns concern how objects collaborate and divide responsibility.
- **Strategy (behavioral):** You have already seen this one. Passing an interchangeable function so an algorithm can vary independently of the code that uses it is the [Strategy pattern](https://refactoring.guru/design-patterns/strategy), shown in {ref}`Reusability and Extensibility <software_design_principles:reusability_and_extensibility>`.
- **Factory (creational):** A [factory](https://refactoring.guru/design-patterns/factory-method) is code whose job is to construct the right object, often selected by a name or a config value. Centralizing construction in one place replaces conditionals scattered across the codebase and gives callers one thing to call.
- **Patterns are tools, not goals:** Reach for a pattern when it removes real, present pain, not to make code look sophisticated. Forcing a pattern adds indirection you must read and maintain, which works against KISS and YAGNI from {ref}`Fundamental Design Principles <software_design_principles:fundamental_design_principles>`. In Python, first-class functions often make a plain function the simplest "factory" you need.

The example below uses a small factory to build a model from a name. Callers ask for a model by string, so the choice can come from a config file or a command-line argument, and adding a model means extending one mapping rather than editing every call site.

```python
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor

# A factory: one place that maps a name to the object to construct.
_MODELS = {
    "linear": LinearRegression,
    "ridge": Ridge,
    "forest": RandomForestRegressor,
}

def make_model(name, **kwargs):
    """Return a fresh model instance selected by name.

    Centralizing construction here replaces 'if name == ...' chains
    scattered through the code with a single, extensible mapping.
    """
    try:
        model_cls = _MODELS[name]
    except KeyError:
        raise ValueError(f"unknown model {name!r}; choose from {sorted(_MODELS)}")
    return model_cls(**kwargs)

# The caller picks a model by name, e.g. from a config or CLI argument.
model = make_model("ridge", alpha=1.0)
```

```{tip}
Learn patterns mainly for the vocabulary and the design ideas behind them. When a pattern fits, name it so others recognize it; when it does not, the simpler code is the better code.
```

For concise references, see refactoring.guru on [what a design pattern is](https://refactoring.guru/design-patterns/what-is-pattern), the [Factory Method](https://refactoring.guru/design-patterns/factory-method), and [Strategy](https://refactoring.guru/design-patterns/strategy); Wikipedia's [Software design pattern](https://en.wikipedia.org/wiki/Software_design_pattern) and [Factory method pattern](https://en.wikipedia.org/wiki/Factory_method_pattern); and Brandon Rhodes's [Python Patterns Guide](https://python-patterns.guide/) for Pythonic guidance, including why first-class functions make some classic patterns unnecessary.

(software_design_principles:dependency_management_and_isolation)=
## Dependency Management and Isolation

Dependency management here is a design concern: how your own components depend on one another, and how you keep external dependencies (third-party libraries, files, networks, databases, and services) from leaking into your core logic. This is distinct from installing packages, pinning versions, or managing virtual environments, which the [Collaborative Code Development](collaborative_code_development.md), [Package Development](package_development.md), and [Reproducible Research](reproducible_research.md) pages cover.

- **Mind the direction of dependencies (Dependency Inversion Principle):** High-level logic should not depend on low-level details; both should depend on an abstraction, and details should depend on the abstraction rather than the reverse. This is the [Dependency Inversion Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle), the "D" in SOLID, formulated by Robert C. Martin. Concretely, your analysis code should depend on an interface you define, not on a specific client or file format.
- **Isolate volatile dependencies behind a thin wrapper:** Wrap an external library or service behind your own small interface, so the rest of the code talks to your wrapper instead of the third party. This is the [Adapter pattern](https://refactoring.guru/design-patterns/adapter): when you swap a backend or weather an API change or outage, the edit touches one file rather than every call site.
- **Isolation aids testing:** Once the core depends on your interface, a test can pass in a simple fake in place of a real database or network call. This is the same substitution idea behind {ref}`Testability and Maintainability <software_design_principles:testability_and_maintainability>`: depending on an abstraction lets you supply a stand-in.
- **Keep third-party specifics at the edges:** Confine library-specific calls and types to the wrapper, not threaded through the core, which connects to the boundary thinking in {ref}`Modularity and Abstraction <software_design_principles:modularity_and_abstraction>`. The pattern of pushing external systems to the boundary is also the idea behind [ports and adapters (hexagonal) architecture](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)).

In the example below, the core `summarize_run` depends only on the small `Storage` interface, so a cloud client, a local file, or an in-memory fake can all be used interchangeably.

```python
from typing import Protocol

class Storage(Protocol):
    """Our own minimal interface: the core depends on this, not on a library."""
    def read_text(self, key: str) -> str: ...

class S3Storage:
    """Adapter: wraps a third-party client behind the Storage interface."""
    def __init__(self, client, bucket):
        self._client = client          # library-specific details stay here
        self._bucket = bucket

    def read_text(self, key):
        obj = self._client.get_object(Bucket=self._bucket, Key=key)
        return obj["Body"].read().decode()

def summarize_run(store: Storage, key: str) -> int:
    """Core logic depends on the abstraction, so any Storage works here."""
    return len(store.read_text(key).splitlines())

# A test can substitute a fake with no network or library required.
class FakeStorage:
    def read_text(self, key): return "line 1\nline 2"

assert summarize_run(FakeStorage(), "run.log") == 2
```

```{tip}
A useful signal: if importing or changing one third-party library forces edits across many files, that dependency is not isolated. Funnel it through a single wrapper so the rest of the code depends on your interface instead.
```

For more depth, see Wikipedia on the [Dependency inversion principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle) and the [Adapter pattern](https://en.wikipedia.org/wiki/Adapter_pattern), refactoring.guru's [Adapter](https://refactoring.guru/design-patterns/adapter), and Martin Fowler's [Inversion of Control Containers and the Dependency Injection pattern](https://martinfowler.com/articles/injection.html).

(software_design_principles:documentation_as_part_of_design)=
## Documentation as Part of Design

Documentation is part of designing software, not a chore bolted on at the end. Describing an interface in words is itself a design step: it forces you to decide what a component promises before you commit to how it works. This section is about that design angle; for documentation types, tools, and readability practices, see the [Documentation and Readability](documentation_and_readibility.md) page.

- **A docstring is the contract for an interface:** Per [PEP 257](https://peps.python.org/pep-0257/), a function or method docstring should summarize its behavior and document its arguments, return values, side effects, exceptions raised, and any restrictions on when it can be called. That set of promises is what callers depend on, which is the interface idea from {ref}`Modularity and Abstraction <software_design_principles:modularity_and_abstraction>`.
- **Write the interface and its docstring first:** Stating the contract before the body clarifies the design while it is still cheap to change. If you cannot describe the inputs, outputs, and failure modes cleanly, the boundary is not yet settled and the implementation is premature.
- **Hard-to-document code is a design smell:** If a clear explanation needs many caveats or special cases, the unit is usually doing too much or leaking its internals. Treat that friction as a prompt to simplify or split, recalling KISS from {ref}`Fundamental Design Principles <software_design_principles:fundamental_design_principles>`.
- **Record significant design decisions:** Capture the reasoning behind architecturally significant choices so the "why" survives as the project evolves. An [Architecture Decision Record (ADR)](https://adr.github.io/) is a short document, popularized by Michael Nygard, that records one decision with its [context, decision, and consequences](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions); a sequence of them becomes a decision log future readers can follow.

The docstring below defines the contract for `split_dataset`: what it returns, what it expects, and when it raises. A caller can rely on it without reading the body.

```python
def split_dataset(data, fraction):
    """Split rows into train and test sets.

    Args:
        data: A sequence of samples to split.
        fraction: Test-set share, a float in the open interval (0, 1).

    Returns:
        A (train, test) tuple of lists.

    Raises:
        ValueError: If 'fraction' is not strictly between 0 and 1.
    """
    if not 0 < fraction < 1:
        raise ValueError(f"fraction must be in (0, 1), got {fraction!r}")
    cut = int(len(data) * (1 - fraction))
    return list(data[:cut]), list(data[cut:])
```

```{tip}
Try writing the docstring before the implementation. If stating the inputs, outputs, and errors is awkward, redesign the interface now, while it is just text, rather than after the code is written.
```

For conventions, see [PEP 257](https://peps.python.org/pep-0257/) on docstrings and the [ADR](https://adr.github.io/) resources on recording decisions. For documentation practices and tooling, see the [Documentation and Readability](documentation_and_readibility.md) page.

(software_design_principles:iterative_design_and_refactoring)=
## Iterative Design & Refactoring

Good design is rarely reached in one attempt: it emerges as your understanding of the problem grows, which suits research, where requirements shift as the science develops. Refactoring is the disciplined way to improve a design after the fact, by changing the internal structure of code while leaving its behavior intact.

- **Design iteratively:** Start with the simplest thing that works (recall KISS and YAGNI in {ref}`Fundamental Design Principles <software_design_principles:fundamental_design_principles>`) and let the structure evolve as the code grows, rather than trying to anticipate the final design up front.
- **Refactoring preserves external behavior:** Martin Fowler defines it as "a change made to the internal structure of software to make it easier to understand and cheaper to modify without changing its observable behavior." Clarity improves; results do not.
- **Tests are the safety net:** Refactoring is only safe when you can confirm behavior is unchanged, so run tests after each step. This is where {ref}`Testability and Maintainability <software_design_principles:testability_and_maintainability>` pays off; for frameworks and mechanics, see the [Testing and Continuous Integration](testing_and_continuous_integration.md) page.
- **Let code smells trigger refactoring:** A [code smell](https://martinfowler.com/bliki/CodeSmell.html) is a surface hint of a deeper problem. Common ones are duplicated code, long functions, and unclear names. Treat them as prompts to look for an improvement, not as proof of a defect.
- **Work in small, separate steps:** Make one small change at a time, and keep pure refactoring commits separate from commits that change behavior, so a regression is easy to locate and review. See [Collaborative Code Development](collaborative_code_development.md) for commit practices.

A frequent first refactoring is Extract Function: pull a block or a dense expression into a well-named function so the intent is clear and the logic can be reused. The behavior is unchanged.

```python
# Before: the discount rule is an inline expression whose intent is unclear.
def final_price(item):
    return item.price - (item.price * 0.1 if item.price > 100 else 0)

# After: the rule is extracted into a named function. Same result, clearer code.
def discount(price):
    """Return the discount: 10% on amounts over 100, otherwise none."""
    return price * 0.1 if price > 100 else 0

def final_price(item):
    return item.price - discount(item.price)
```

```{tip}
Refactor in the green: change structure only while your tests pass, commit, then move on. If a test breaks mid-refactor, the last small step is the suspect.
```

For more depth, see refactoring.guru on [what refactoring is](https://refactoring.guru/refactoring), its [code smells catalog](https://refactoring.guru/refactoring/smells) and [Extract Method](https://refactoring.guru/extract-method), Martin Fowler's [refactoring definition](https://refactoring.com/) and [Code Smell](https://martinfowler.com/bliki/CodeSmell.html), and Wikipedia's [Code refactoring](https://en.wikipedia.org/wiki/Code_refactoring) and [Code smell](https://en.wikipedia.org/wiki/Code_smell).

(software_design_principles:designing_for_reproducibility)=
## Designing for Reproducibility

A result is reproducible when the same analysis steps on the same data produce the same answer ([The Turing Way](https://book.the-turing-way.org/reproducible-research/overview/overview-definitions)). Several design choices make that achievable in the first place; for the full treatment of environments, data versioning, and archiving, see the [Reproducible Research](reproducible_research.md) page.

- **Make computations deterministic:** Control sources of randomness explicitly by seeding them, and avoid logic whose output depends on iteration order or accumulated state. A run that quietly depends on dictionary order, wall-clock time, or an unseeded generator cannot be repeated reliably.
- **Separate configuration from code:** Pass parameters as arguments or read them from a config file rather than burying magic numbers in the body of a function. This is the parameterization habit from {ref}`Reusability and Extensibility <software_design_principles:reusability_and_extensibility>`, and it lets you rerun the same code under a different setting without editing it.
- **Keep inputs and outputs explicit:** Functions that read or write hidden global state behave differently depending on what ran before them, so the same call may not give the same result twice. Passing inputs in and returning outputs out is the no-hidden-state idea from {ref}`Testability and Maintainability <software_design_principles:testability_and_maintainability>`.
- **Record the configuration that produced a result:** Save the parameters, seed, and code version alongside each output so a run can be traced and repeated later. Provenance is what turns "it worked once" into "anyone can rerun it."

The example below draws random numbers from a local NumPy [`Generator`](https://numpy.org/doc/stable/reference/random/generator.html) created with [`numpy.random.default_rng(seed)`](https://numpy.org/doc/stable/reference/random/generated/numpy.random.default_rng.html), the recommended constructor. Passing the seed in as a parameter keeps configuration out of the code, and using a local generator avoids the shared global state of the legacy `numpy.random.seed`.

```python
import numpy as np

def sample_means(n_samples, seed):
    """Return two sample means, reproducible for a given seed.

    The seed is a parameter (not hard-coded), and the Generator is local,
    so the same seed yields the same result on every run.
    """
    rng = np.random.default_rng(seed)     # local Generator, no global state
    return rng.normal(size=n_samples).mean(), rng.normal(size=n_samples).mean()

# Same seed in -> same numbers out, here and on any machine.
assert sample_means(1000, seed=42) == sample_means(1000, seed=42)
```

```{tip}
Pass the seed in rather than fixing it inside a function, and log it with the run's other parameters. A result you cannot tie back to its seed and configuration is hard to reproduce, even when the code is deterministic.
```

For depth, see [The Turing Way](https://book.the-turing-way.org/reproducible-research/reproducible-research)'s reproducible research guide, NumPy's [random Generator](https://numpy.org/doc/stable/reference/random/generator.html) documentation, and the [Notes on Reproducibility](https://docs.python.org/3/library/random.html#notes-on-reproducibility) in Python's `random` module. The [Reproducible Research](reproducible_research.md) page covers environments, data versioning, and archiving.

(software_design_principles:functional_vs_object_oriented_design)=
## Functional vs. Object-Oriented Design

Functional and object-oriented styles are two common ways to organize code, and neither is universally better: choose by fit, not fashion. Python is a [multi-paradigm language](https://docs.python.org/3/howto/functional.html), so you can write procedural, functional, or object-oriented code and freely mix them in one project.

- **Functional style:** Build behavior from functions that transform data, ideally taking inputs and returning outputs with no internal state. The cleanest case is a [pure function](https://en.wikipedia.org/wiki/Pure_function), which returns the same output for the same input and has no side effects. Such functions are easy to test and to compose, the testability point from {ref}`Testability and Maintainability <software_design_principles:testability_and_maintainability>`. Functional style also favors [immutability](https://en.wikipedia.org/wiki/Immutable_object): not mutating data in place, so a value cannot change underneath you.
- **Object-oriented style:** Bundle related data with the operations that act on it into objects, using [encapsulation](https://en.wikipedia.org/wiki/Object-oriented_programming) to hide internal details and sometimes inheritance to share behavior. This fits well when an entity has identity, a lifecycle, or many operations over the same shared state, for example a stateful connection or a model that is configured, trained, then queried.
- **Mixing is normal:** Most real Python code is a blend: plain functions for transformations, a few classes where state and behavior genuinely belong together. You do not have to pick one paradigm for a whole project.
- **A practical default for research:** Reach first for functions plus simple data containers, such as a [`dataclass`](https://docs.python.org/3/library/dataclasses.html). Elaborate class hierarchies are often over-engineering: deep inheritance is hard to follow and rarely pays off in analysis code. Recall KISS and YAGNI from {ref}`Fundamental Design Principles <software_design_principles:fundamental_design_principles>` and add a class only when shared state or identity makes it the simpler description.

The example below contrasts the two for the same small task. The functional version is a pure function over a config object; the object-oriented version folds the same data and computation into a class.

```python
from dataclasses import dataclass

@dataclass
class Params:
    """A simple data container: @dataclass writes __init__, __repr__, __eq__."""
    learning_rate: float
    n_steps: int = 100

# Functional: a pure function transforms the data and returns a result.
def total_decay(params: Params) -> float:
    """Same input -> same output, no side effects."""
    return params.learning_rate * params.n_steps

cost = total_decay(Params(learning_rate=0.01))

# Object-oriented: the data and the operation live together on one object.
class Schedule:
    def __init__(self, learning_rate: float, n_steps: int = 100):
        self.learning_rate = learning_rate
        self.n_steps = n_steps

    def total_decay(self) -> float:
        return self.learning_rate * self.n_steps

cost = Schedule(learning_rate=0.01).total_decay()
```

```{tip}
If a class has only an `__init__` plus one method you call once, a plain function (perhaps taking a `dataclass`) is usually clearer. Reach for a class when several operations share and update the same state.
```

For more depth, see Python's [Functional Programming HOWTO](https://docs.python.org/3/howto/functional.html) and [`dataclasses`](https://docs.python.org/3/library/dataclasses.html) documentation, and Wikipedia on [Functional programming](https://en.wikipedia.org/wiki/Functional_programming), [Object-oriented programming](https://en.wikipedia.org/wiki/Object-oriented_programming), and [Pure function](https://en.wikipedia.org/wiki/Pure_function).

(software_design_principles:designing_apis_and_clis)=
## Designing APIs and CLIs for Research Tools

How others use your tool, including your future self, depends on the interface you expose. There are two common kinds: an API, the functions and classes a library offers to be imported, and a CLI, a command-line interface for running a tool from the shell. Both are contracts, so the {ref}`Modularity and Abstraction <software_design_principles:modularity_and_abstraction>` idea of a small, stable interface that hides its internals applies to each.

- **Name things clearly and consistently:** Use predictable, descriptive names and a consistent style across an API, so callers can guess the next name from the last one. Names are part of the contract, so changing one breaks callers.
- **Keep the public surface small:** Expose only what users need and give it sensible defaults, so the common call is short and the rare options are still reachable. A smaller surface is easier to document, test, and keep stable.
- **Mark internals private and keep the public part stable:** Per [PEP 8](https://peps.python.org/pep-0008/#public-and-internal-interfaces), prefix non-public names with a single leading underscore, and declare a module's public API with [`__all__`](https://docs.python.org/3/tutorial/modules.html#importing-from-a-package). This frees you to change internals without breaking callers, the information-hiding point from earlier.
- **Fail with clear errors:** Validate inputs and raise specific exceptions with messages that say what was wrong and how to fix it, rather than failing deep inside with an obscure traceback.
- **Use a real argument parser for a CLI:** Reach for the standard-library [`argparse`](https://docs.python.org/3/library/argparse.html) rather than reading `sys.argv` by hand. It validates input and generates a `--help` message for free; [Click](https://click.palletsprojects.com/) and [Typer](https://typer.tiangolo.com/) are popular third-party alternatives for larger tools.
- **Provide help, sane defaults, and predictable exit codes:** Document each argument with `help` text (the docstring habit from {ref}`Documentation as Part of Design <software_design_principles:documentation_as_part_of_design>`), supply defaults so a basic run is short, and exit `0` on success and non-zero on failure so scripts and schedulers can detect errors.
- **Log the arguments that were used:** Record the parsed arguments with each run so a result can be traced and repeated, the provenance point from {ref}`Designing for Reproducibility <software_design_principles:designing_for_reproducibility>`.

The CLI below defines a parser, adds two arguments with defaults and help text, parses them, and delegates to a separate function so the logic stays testable and importable as an API.

```python
import argparse

def run(input_path, threshold):
    """Core logic, kept out of the CLI so it can be imported and tested."""
    print(f"processing {input_path!r} with threshold={threshold}")

def main():
    parser = argparse.ArgumentParser(description="Filter records above a threshold.")
    parser.add_argument("input_path", help="path to the input file")
    parser.add_argument(
        "--threshold", type=float, default=0.5, help="cutoff value (default: 0.5)"
    )
    args = parser.parse_args()        # -h/--help is added automatically
    print(f"args: {vars(args)}")      # log the chosen arguments for reproducibility
    run(args.input_path, args.threshold)

if __name__ == "__main__":
    main()
```

```{tip}
Keep CLI parsing thin: have it gather arguments and call a normal function that does the work. The logic stays importable as an API and unit-testable, while the CLI is just one entry point into it.
```

For depth, see Python's [`argparse`](https://docs.python.org/3/library/argparse.html) reference and its [argparse tutorial](https://docs.python.org/3/howto/argparse.html), [PEP 8 on public and internal interfaces](https://peps.python.org/pep-0008/#public-and-internal-interfaces), and the [Click](https://click.palletsprojects.com/) and [Typer](https://typer.tiangolo.com/) documentation. Packaging a CLI for installation is covered on the [Package Development](package_development.md) page.

(software_design_principles:layered_architecture)=
## Layered Architecture in Scientific Computing Software

A [layered architecture](https://en.wikipedia.org/wiki/Multitier_architecture) organizes a larger tool into layers that each have a distinct responsibility, with dependencies that run one way. It applies {ref}`Modularity and Abstraction <software_design_principles:modularity_and_abstraction>` and {ref}`Dependency Management and Isolation <software_design_principles:dependency_management_and_isolation>` at the scale of a whole program, so the scientific core stays independent of how a run is launched and where its data lives.

- **Typical layers for scientific software:** A useful split has four roles. An **entry/interface** layer (a CLI, notebook, or API call) takes input and reports results. An **orchestration/workflow** layer ties a run together by sequencing the pipeline steps. A **core science** layer holds the actual work: models, numerical methods, and algorithms. An **infrastructure/data** layer handles file and network I/O, storage, and external services. This mirrors the presentation, domain, and data-source layers Martin Fowler describes in [Presentation Domain Data Layering](https://martinfowler.com/bliki/PresentationDomainDataLayering.html).
- **Dependencies point one way, toward the stable core:** In a strict layering, each layer depends on the layer below it and can run without the layers above it ([Multitier architecture](https://en.wikipedia.org/wiki/Multitier_architecture)). Equivalently, lower layers should be agnostic of who calls them. To keep the core from depending on infrastructure, apply the Dependency Inversion idea from {ref}`Dependency Management and Isolation <software_design_principles:dependency_management_and_isolation>`: have the core define an interface, and let the I/O layer implement it.
- **Keep the scientific core free of I/O and UI:** The model and numerical code should take data in and return results out, with no file paths, network calls, argument parsing, or printing inside. A core like this is testable in isolation, reusable across a CLI and a notebook, and portable between machines, which is the same payoff as in {ref}`Testability and Maintainability <software_design_principles:testability_and_maintainability>`.
- **Do not over-layer a small script:** Layers earn their keep on tools that grow and gain more than one entry point or data source. A short analysis script needs no ceremony: recall KISS and YAGNI from {ref}`Fundamental Design Principles <software_design_principles:fundamental_design_principles>`, and add layers only as complexity makes the separation pay off.

The layout below assigns each file one role. The interface and infrastructure files may import the core, but `core/model.py` imports neither, so the science can be tested and reused on its own.

```text
project/
    cli.py            # entry/interface: parse arguments, call the pipeline, report results
    pipeline.py       # orchestration: load -> compute -> save, the steps of one run
    core/
        model.py      # core science: pure functions and models, no I/O or UI
    storage.py        # infrastructure/data: read inputs, write outputs, talk to services
```

The orchestration function makes the one-way flow concrete: it pulls data in through the infrastructure layer, hands plain values to the core, and sends results back out, so the core never touches I/O.

```python
from core.model import fit            # core science: takes data, returns a result
from storage import load_dataset, save_result   # infrastructure: file and network I/O

def run(input_path, output_path, seed):
    """Orchestration: sequence one run; depend on lower layers, not the reverse."""
    data = load_dataset(input_path)   # infrastructure in
    result = fit(data, seed=seed)     # core science, free of I/O and UI
    save_result(result, output_path)  # infrastructure out
```

```{tip}
A quick test of the layering: can you import and run the core science in a notebook or a unit test without any files, network, or command-line arguments? If not, some I/O or interface code has leaked into the core and belongs in a lower layer.
```

For more depth, see Wikipedia on [Multitier architecture](https://en.wikipedia.org/wiki/Multitier_architecture) and [Separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns), Martin Fowler's [Presentation Domain Data Layering](https://martinfowler.com/bliki/PresentationDomainDataLayering.html) and [Layering Principles](https://martinfowler.com/bliki/LayeringPrinciples.html), and The Turing Way's [Research Compendia](https://book.the-turing-way.org/reproducible-research/compendia/), which recommends keeping data, methods, and output clearly separated. The [Package Development](package_development.md) and [Reproducible Research](reproducible_research.md) pages cover related structure.

## Summary Checklist

- [ ] Follow core principles (KISS, DRY, SRP)  
- [ ] Use modular, loosely coupled design  
- [ ] Design for testability and reuse  
- [ ] Document key design decisions  
- [ ] Enable reproducibility (configs, versioning)  
- [ ] Refactor and iterate regularly  
