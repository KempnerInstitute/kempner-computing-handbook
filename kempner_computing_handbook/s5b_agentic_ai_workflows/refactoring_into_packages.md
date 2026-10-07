# Refactoring Research Code into Packages

Research code often starts as a few scripts or a notebook that grew. Turning it into a package, with modules, tests, and packaging metadata, makes it reusable and easier to trust, and an agent can do much of the mechanical work. The risk is a refactor that quietly changes a result. The method on this page keeps behavior fixed while the code changes shape: pin what the code does now with tests, restructure in small reviewable steps, then package and automate. For the underlying practices, see {doc}`Software Design Principles <../s2_swe_for_research/software_design_principles>`, {doc}`Testing and Continuous Integration <../s2_swe_for_research/testing_and_continuous_integration>`, and {doc}`Package Development <../s2_swe_for_research/package_development>`.

```{mermaid}
flowchart LR
    A["Pin current behavior<br/>with regression tests"] --> B["Restructure<br/>one small step"]
    B --> C{"Tests pass?"}
    C -->|yes| D["Review the diff<br/>and commit"]
    D -->|next step| B
    C -->|no| E["Revert or fix<br/>the code, not the tests"]
    E --> B
    D -->|done| F["Package and<br/>add CI"]
    classDef s fill:#14154C,color:#ffffff,stroke:#3D3E82;
    classDef v fill:#A51C30,color:#ffffff,stroke:#A51C30;
    class A,B,D,F s;
    class C,E v;
```

## Before you start

- **Work on a branch with a clean git tree.** Every agent change then shows up as a diff you can review, and `git restore` or `git revert` undoes it. Commit before each step; see {ref}`Git as the undo layer <agentic_ai:git_undo>`.
- **Record the environment.** Pin the package versions the current code runs with, so you compare like with like. See {ref}`Environment Reproducibility <reproducible_research:environment_reproducibility>`.
- **Pick a small, representative input.** Choose data that exercises the main code paths and runs in seconds or minutes. If it needs a GPU, run it in a short interactive job rather than on a login node; see {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`.
- **Tell the agent the rules.** Put the test command and the constraints in your project instructions, for example "run `pytest` after every change" and "never edit files under `tests/references/`". Back the second with a deny rule, `Edit(./tests/references/**)`, since an instruction alone does not stop the agent; see {ref}`Permission rules <agentic_ai:permission_rules>`.

## Step 1: Pin current behavior with tests

Before anything moves, have the agent write regression tests that record what the code produces today. These tests are the safety net for every later step, so they come first and the code stays untouched while they are written.

> Before changing any code, write pytest regression tests that run `scripts/preprocess.py` and `scripts/train_small.py` on `tests/data/sample.csv` with seed 0, save their outputs as reference files under `tests/references/`, and compare future outputs against those files with a relative tolerance of 1e-6. Do not modify the scripts.

Review the tests before trusting them:

- **Do they exercise the real code paths?** A test that only checks a file exists proves nothing.
- **Do they fail when they should?** Change a constant in the code and confirm a test fails, then undo the change. A test that never fails is not protecting you.
- **Is randomness controlled?** Seed every random number generator the code uses, including PyTorch's; see {ref}`Randomness and Seeds <reproducible_research:randomness_and_seeds>`.
- **Is the tolerance deliberate?** Exact equality is fragile for floating-point results; a tolerance that is too loose hides real changes. See the regression tests in {ref}`Types of Tests <testing_and_continuous_integration:types_of_tests>`.

Commit the tests and the reference files on their own, before any refactoring, so later diffs make it obvious if anything touches them.

## Step 2: Restructure in small steps

Aim for the layout in {ref}`Package Structure and Layout (Python Example) <package_development:package_structure_and_layout>`: a `src/` package with a `pyproject.toml`. Ask for one change at a time, and after each one have the agent run the tests and show you the diff.

> Move the data-cleaning code from `notebooks/explore.ipynb` into `src/mypkg/cleaning.py` as functions with docstrings. Change only that, and keep the notebook working by importing the new functions. Run `pytest`, then show me the diff and the test results before committing.

Typical steps, each its own commit:

1. Move code out of notebooks and scripts into modules, without changing what it does.
2. Separate computation from file input and output, so the logic becomes plain functions that are easy to test. {doc}`Software Design Principles <../s2_swe_for_research/software_design_principles>` shows this pattern.
3. Replace hard-coded paths and constants with arguments or a configuration file.
4. Remove duplicated code once the tests cover both copies.
5. Turn the old scripts into thin command-line entry points that call the package.

```{warning}
Watch the diff for changes you did not ask for. Agents tend to "improve" code beyond the request: changing a data type, reordering floating-point operations, dropping a code path that looked unused, or switching a random seed. Any of these can shift results. Above all, never accept a refactor that edits the reference files or loosens a tolerance to make tests pass; that hides exactly the change the tests exist to catch. If a test fails, the code goes back, not the test.
```

## Step 3: Package, test, and automate

Once the code lives in the package and the regression tests still pass:

- **Packaging.** Have the agent complete `pyproject.toml` (dependencies, Python version, entry points) and install the package in editable mode. See {ref}`Tools for Building Packages <package_development:tools_for_building_packages>`.
- **Unit tests.** Add focused tests for the new functions alongside the regression tests, and check coverage to find untested code. See {doc}`Testing and Continuous Integration <../s2_swe_for_research/testing_and_continuous_integration>`.
- **Continuous integration.** Add a workflow that runs the tests on every push, so later changes, by you or an agent, are checked automatically.
- **A final full run.** Run the complete pipeline once more on the cluster with the packaged code and compare against the old results.

## Before you trust the refactor

- The tests pass, and the reference files have not changed since you committed them in step 1. `git log -- tests/references` should show only that commit.
- Each commit contains only the change you asked for.
- A representative run with the packaged code matches the old results within your tolerance.
- Someone else can install the package in a fresh environment and reproduce the results; see {doc}`Reproducible Research <../s2_swe_for_research/reproducible_research>`.

```{seealso}
For general checks on agent output, see {doc}`Evaluating and Monitoring Agents <evaluating_and_monitoring_agents>`. To understand a codebase before you change it, see {doc}`Working with Unfamiliar Research Codebases <unfamiliar_codebases>`.
```
