---
name: software-design-principles
description: Design guidance for research code from the Kempner Institute Computing Handbook. Covers KISS, DRY, YAGNI, separation of concerns, modules with small interfaces, pure functions, dependency injection, the strategy and factory patterns, adapters for external libraries, deterministic design, APIs and CLIs, and layered architecture. Use when designing, writing, refactoring, or reviewing the structure of research code, or when turning a script into reusable modules.
---

# Software Design Principles

Use these principles when you design, write, refactor, or review research code. They summarize the Software Design Principles chapter of the Kempner Institute Computing Handbook: https://handbook.eng.kempnerinstitute.harvard.edu/s2_swe_for_research/software_design_principles.html

If the project has its own conventions, for example in its README, a CONTRIBUTING file, or agent instructions, follow those first. Treat these principles as defaults, not rigid rules.

## Core principles

- Keep it simple (KISS). Prefer the simplest design that solves the current problem. Clear code that is a little longer beats clever code.
- Do not repeat yourself (DRY). When the same logic appears in several places, extract one function and reuse it.
- Build only what the current analysis needs (YAGNI). Add an extension point when a second real use case appears, not before.
- Separate concerns, such as data loading, computation, and plotting, and give each function, class, or module one job.

## Modules and interfaces

- Group related logic into cohesive modules that talk to each other only through small, stable interfaces.
- Hide implementation details, so callers depend on what a function does, not on how it does it.
- Draw module boundaries around the decisions most likely to change, such as a file format, a storage backend, or a numerical method.
- Check each boundary: you should be able to say what the module does in one sentence without saying how it works.

## Testable code

- Put the core logic in pure, deterministic functions: same input, same output, no side effects.
- Keep file access, network calls, randomness, and printing in thin wrappers at the edges.
- Pass collaborators in, such as a client, a model, or a clock, instead of creating them inside a function, so a test can pass a stand-in.
- Avoid hidden global mutable state. Pass state in as arguments.
- Keep functions short, with one clear job.

## Reuse and extension

- Pass paths, thresholds, and constants in as parameters instead of hard-coding them.
- Add behavior by passing in a function (the strategy pattern) instead of growing an `if`/`elif` chain.
- Use a small factory when a config value or CLI argument picks the object to build. Map each name to a class in a dictionary, and raise a clear `ValueError` for an unknown name.
- Use a design pattern only when it removes real, present pain. In Python, a plain function is often enough.
- Move code that several projects reuse into an installable package.

## External dependencies

- Make the core logic depend on an interface you define, for example a `typing.Protocol`, not on a specific library client or file format.
- Wrap each external library or service in one thin adapter, so swapping a backend changes one file.
- In tests, pass a simple fake that implements the same interface.

## Reproducible design

- Seed randomness explicitly with a local generator, `numpy.random.default_rng(seed)`, not the legacy global `numpy.random.seed`.
- Pass the seed and other settings in as parameters or read them from a config file. Do not bury magic numbers in function bodies.
- Avoid logic whose output depends on iteration order, wall-clock time, or accumulated state.
- Save the parameters, seed, and code version with each result.

## Documentation as design

- Write the signature and docstring before the body. Per PEP 257, the docstring is the contract: behavior, arguments, return values, side effects, exceptions raised, and restrictions on when to call it.
- If a unit is hard to document without many caveats, simplify or split it.
- Record significant design decisions in a short Architecture Decision Record: context, decision, and consequences.

## APIs and CLIs

- Use clear, consistent names, and keep the public surface small, with sensible defaults.
- Prefix internal names with one underscore, and declare the public API with `__all__`.
- Validate inputs, and raise specific exceptions with messages that say what was wrong and how to fix it.
- Build CLIs with `argparse`, or Click or Typer for larger tools. Give every argument help text, and give options defaults so a basic run is short.
- Keep CLI parsing thin: parse the arguments, log them, then call a normal function that does the work.
- Exit with 0 on success and a non-zero code on failure.

## Code style and layers

- Default to functions plus simple data containers such as a `dataclass`. Add a class when several operations share and update the same state. Avoid deep inheritance.
- For larger tools, use four layers:
  - Interface: a CLI, notebook, or API call.
  - Orchestration: the steps of a run.
  - Core science: models and numerical methods.
  - Infrastructure: files, storage, and services.
- Keep the core science free of I/O and UI: no file paths, network calls, argument parsing, or printing. The core imports neither the interface nor the infrastructure layer.
- Do not add layers to a short script.

## Refactoring

- Refactor in small steps that keep behavior unchanged, and run the tests after each step.
- Keep refactoring commits separate from commits that change behavior.
- Treat code smells, such as duplicated code, long functions, and unclear names, as prompts to look for an improvement.
