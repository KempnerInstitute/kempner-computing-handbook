# Collaborative Code Development

Collaborative code development promotes reproducible, maintainable, and scalable research software. This section provides an overview of the tools and practices, from version control and branching strategies to continuous integration, dependency management, and secure automation, that enable research teams to work together efficiently.

(collaborative_code_development:version_control_systems)=
## Version Control Systems (VCS)

Version control systems are essential tools for managing code changes, enabling collaboration, and maintaining project history in research software development. Some common VCS types are Git and Mercurial, both of which are distributed version control systems. There are also Subversion (SVN) and Perforce (centralized version control systems). This section covers Git fundamentals and best practices for collaborative development.

```{note}
**Git** is the version control software that runs locally on your computer while **GitHub** is a cloud-based hosting service for Git repositories. Other Git hosting platforms include GitLab, Bitbucket, and SourceForge.
```

**Git fundamentals**

- **Repository structure.** Git tracks your work across four places: the *working directory* where you edit files, the *staging area* (index) where you prepare a commit, the local *repository* that stores the project history, and a *remote* (for example on GitHub) that shares it with others.
- **Basic workflow.** Day to day you check what changed, stage it, commit it with a message, and push to the remote.

```bash
git status                           # see what has changed
git add <file>                       # stage a file (git add . stages everything)
git commit -m "Descriptive message"  # record staged changes in the local repository
git push origin main                 # publish commits to the remote
```

```{figure} figures/png/git_operations.png
---
width: 75%
name: git-operations
---
How common Git commands move content between the working files, staging area, local repository, and remote. (*Credit: [Daniel Kinzler / Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Git_operations.svg), CC BY 3.0*)
```

- **Branching.** A branch is an isolated workspace for a feature or experiment, so `main` stays stable until the work is ready.

```bash
git checkout -b feature/new-analysis   # create and switch to a branch
git checkout main                      # switch back to main
git branch -d feature/new-analysis     # delete the branch once it is merged
```

- **Merging vs rebasing.** `git merge` combines branches and preserves the full history, showing where features were integrated, at the cost of a busier history graph. `git rebase` replays your commits onto another branch for a linear history but rewrites them. Merge on shared branches; rebase only to tidy a local branch before merging, never one that others have already pulled.
- **Resolving conflicts.** When the same lines change on both sides, Git marks the clash in the file with `<<<<<<<`, `=======`, and `>>>>>>>`. Edit the file to the result you want, delete the markers, `git add` it, then finish with `git commit` (or `git rebase --continue`).

**Working with remotes and pull requests**

- **Repository visibility.** Keep unpublished research in a **private** repository; make it **public** once the work has been disseminated or published.
- **Clone or fork.** Clone a repository you have write access to and work on an issue branch; *fork* one you do not, then propose your changes back (the fork-and-pull model in {ref}`Branching & Collaboration Models <collaborative_code_development:branching_collaboration_models>`). Follow the original project's licence and credit it.
- **Track work with issues.** Open a GitHub issue before starting a feature, with a descriptive title and labels such as `bug` or `enhancement`, so the plan and progress stay visible to collaborators.
- **Propose changes with pull requests.** Route every change, even a one-line fix, through a pull request so it is reviewed before reaching `main`. Branch from an up-to-date `main`, push, open the pull request early, and link the issue it closes.

```bash
git checkout main && git pull origin main   # start from an up-to-date main
git checkout -b iss23_new_feature_js         # work on an issue branch
git push -u origin iss23_new_feature_js      # publish, then open a PR that says "Closes #23"
```

**Commit and review conventions**

- **Write clear commit messages.** Use an imperative subject that completes "If applied, this commit will …" (for example, "Fix data loading error with empty CSV files"), capitalised and without a trailing period. Add a body that explains what changed and why, keep one logical change per commit, and reference the issue it addresses.
- **Review constructively.** Keep pull requests focused (under about 400 lines where possible) and respond within a day or two. Look for correctness, readability, and maintainability rather than style alone, and suggest improvements instead of only flagging problems.
- **Organise the repository.** Include a `README` (purpose, setup, usage), a dependency spec (`requirements.txt` or `environment.yml`), a `.gitignore`, a `CONTRIBUTING.md`, and a `LICENSE`.

```bash
# Imperative subject, a blank line, then the why
Fix data loading error with empty CSV files

Empty files used to crash the loader; it now returns an empty
result and logs a warning. Closes #23
```

```{tip}
Commit early and often on a branch, push so others can see your work, and open the pull request before the work feels "finished". Small, frequent, well-described commits are far easier to review, and to roll back, than one large change.
```

For more depth, see the [Pro Git book](https://git-scm.com/book/en/v2), Atlassian's [Git tutorials](https://www.atlassian.com/git/tutorials), and GitHub's [documentation](https://docs.github.com/en). Branching strategies and collaboration models are covered in {ref}`Branching & Collaboration Models <collaborative_code_development:branching_collaboration_models>`, and pull-request review and continuous integration in {ref}`Code Review & Continuous Integration <collaborative_code_development:code_review_ci>`.

(collaborative_code_development:branching_collaboration_models)=
## Branching & Collaboration Models

A *branching model* defines how a team organizes parallel work, while a *collaboration model* defines how contributors access the shared repository. Agreeing on both keeps `main` stable and makes integration predictable. The mechanics of creating, switching, and merging branches are covered above under {ref}`Version Control Systems <collaborative_code_development:version_control_systems>`; this section is about choosing a team-wide strategy.

**Branching strategies**

- **GitHub Flow** *(recommended for most research teams)*: branch off `main` for each issue, open a pull request, and merge after review. Simple and well suited to continuous, paper-driven work.
- **Git Flow**: maintains long-lived `develop`, `release`, and `hotfix` branches. Useful when you ship versioned releases, but heavier than most labs need.
- **Trunk-based**: very short-lived branches merged into `main` many times a day. Best once you have strong automated tests and CI.

**Collaboration models**

- **Shared repository**: team members have write access and collaborate on branches in the same repo. This is the default for a lab or project repository.
- **Fork and pull**: contributors work in a personal fork and open pull requests. Use this for external or open-source contributors who should not have direct write access.

```{tip}
A practical default for most research teams is to use **issue branches in a shared repository** for internal work and **fork-and-pull** for external collaborators. Name branches after the issue and keep them short-lived.
```

```bash
# Start from an up-to-date main
git checkout main
git pull origin main

# Create a short-lived issue branch (issue 42, author initials "js")
git checkout -b iss42_add_data_loader_js

# Commit your work, then publish the branch and open a pull request
git push -u origin iss42_add_data_loader_js
```

```{figure} figures/png/git_branching_workflow.png
---
width: 95%
name: git-branching-workflow
---
A basic branching workflow: cut a branch from `main`, develop on it via a merge (pull) request, then merge back and delete the branch. (*Credit: [TheresNoTime / Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Basic_git_branching_workflow_%28GitLab%29.svg), CC BY-SA 4.0*)
```

For a side-by-side comparison of these strategies, see Atlassian's [Comparing Git workflows](https://www.atlassian.com/git/tutorials/comparing-workflows) and GitHub's [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow).

(collaborative_code_development:code_review_ci)=
## Code Review & Continuous Integration (CI)

Code review and continuous integration are complementary: review applies human judgment to design, correctness, and clarity, while CI runs mechanical checks (tests, linting, builds) automatically on every change. Together they keep `main` releasable. Pull-request and review conventions are described above under {ref}`Version Control Systems <collaborative_code_development:version_control_systems>`; this section focuses on the automation layer.

**What to look for in review**

- Correctness and edge cases, not just style.
- Readability and clear naming, so the next person can follow the logic.
- Reproducibility: pinned dependencies, seeds set, and no hard-coded local paths.

**Continuous integration**

CI automatically builds and tests your code whenever you push or open a pull request, so problems surface before they reach `main`. On GitHub, add a workflow file under `.github/workflows/`:

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-python@v6
        with:
          python-version: "3.12"
      - run: pip install -e ".[dev]"
      - run: ruff check .      # lint
      - run: pytest            # run the test suite
```

Each pull request then shows a green check when tests and linting pass and a red one when they fail, so reviewers know the change is safe before merging.

```{tip}
Start small: a workflow that only runs your test suite on pull requests already prevents most regressions. Add linting, type checks, and coverage as the project grows.
```

For details, see GitHub's [GitHub Actions documentation](https://docs.github.com/en/actions), and the [Testing and Continuous Integration](testing_and_continuous_integration.md) chapter for guidance on writing the tests CI runs.

(collaborative_code_development:merge_conflicts)=
## Merge Conflicts & Resolution Strategies

Merge conflicts happen when two branches change the same lines, or when one branch edits a file another deletes, and Git cannot decide which version to keep. The conflict markers and the basic edit-then-stage workflow are covered under {ref}`Version Control Systems <collaborative_code_development:version_control_systems>`; this section focuses on strategies to prevent conflicts and resolve them with less friction.

**Preventing conflicts**

- **Integrate in small, frequent steps.** Commit often and pull or fetch the latest `main` before you start work and before you push, so divergence stays small and easy to reconcile.
- **Communicate about overlapping work.** Coordinate with teammates when you expect to touch the same files, and agree on a shared branching workflow (see {ref}`Branching & Collaboration Models <collaborative_code_development:branching_collaboration_models>`).
- **Establish clear module ownership.** Keeping features in well-separated files or modules means two people rarely edit the same lines at once.

**Resolving conflicts**

- **Use a merge or diff tool.** Run `git mergetool` to open conflicts side by side in a three-way merge view instead of editing markers by hand.
- **Choose merge or rebase deliberately.** Both can raise conflicts; pick based on the tradeoffs described under {ref}`Version Control Systems <collaborative_code_development:version_control_systems>`, and avoid rebasing branches others have already pulled.
- **Reuse recorded resolutions.** Enable `git rerere` so Git remembers how you resolved a conflict and replays that resolution automatically the next time the same conflict appears, which helps on long-lived branches and repeated rebases.

```bash
# Configure a merge tool once, then launch it on conflicted files
git config --global merge.tool meld   # or kdiff3, vimdiff, etc.
git mergetool

# Remember conflict resolutions and reuse them automatically
git config --global rerere.enabled true
```

**Aborting safely**

If a merge or rebase goes wrong, you can back out and return to the pre-operation state:

```bash
git merge --abort     # cancel a conflicted merge, restore pre-merge state
git rebase --abort    # cancel a rebase, reset HEAD to the original branch
```

```{tip}
Commit or stash your work before starting a merge or rebase. With a clean working tree, `git merge --abort` and `git rebase --abort` can reliably restore your previous state.
```

For deeper guidance, see GitHub's [Resolving a merge conflict using the command line](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-using-the-command-line), Atlassian's [merge conflicts tutorial](https://www.atlassian.com/git/tutorials/using-branches/merge-conflicts), and the Pro Git book's [Rerere](https://git-scm.com/book/en/v2/Git-Tools-Rerere) chapter.

## Real‑Time Collaboration Tools

The pull-request workflow described above is *asynchronous*: each person works on their own branch and integrates later through review. Real-time (synchronous) collaboration is the complement: two or more people edit the same file or notebook at once and see each other's cursors and changes live, which suits pair programming, debugging together, and walking a collaborator through code.

**Common tools for researchers**

- **VS Code Live Share**: a Visual Studio Code extension that lets you co-edit and co-debug a shared session in real time; guests join from a link and keep their own editor settings and cursor.
- **JupyterLab real-time collaboration**: the `jupyter-collaboration` server extension adds live multi-user editing to JupyterLab notebooks, with each collaborator shown as a colored cursor.
- **Google Colab**: hosted notebooks shared like a Google Doc through the **Share** button, with Viewer, Commenter, and Editor roles and simultaneous editing.
- **GitHub Codespaces**: a cloud-hosted development environment you open in the browser or in VS Code; you can start a Live Share session from within a codespace to collaborate on it.

For JupyterLab, real-time editing is off by default. Install the extension, then launch JupyterLab as usual:

```bash
# Requires JupyterLab 4+
pip install jupyter-collaboration
jupyter lab   # collaborative editing is now enabled
```

```{note}
Real-time editing does not replace version control. Treat a live session like a shared scratchpad: once the work settles, still commit it and integrate it through the normal review workflow described under {ref}`Version Control Systems <collaborative_code_development:version_control_systems>` and {ref}`Branching & Collaboration Models <collaborative_code_development:branching_collaboration_models>`.
```

For setup and usage details, see the official docs: [VS Code Live Share](https://learn.microsoft.com/en-us/visualstudio/liveshare/), [JupyterLab real-time collaboration](https://jupyterlab.readthedocs.io/en/stable/user/rtc.html), [Google Colab](https://research.google.com/colaboratory/faq.html), and [collaborating in a GitHub codespace](https://docs.github.com/en/codespaces/developing-in-a-codespace/working-collaboratively-in-a-codespace).

## Modular Design

Splitting a project into modules with clear interfaces is one of the most effective ways to make collaboration smooth: when each part has a well-defined boundary, teammates can work on different modules in parallel and rarely touch the same lines, which means fewer merge conflicts and clearer ownership.

**Separate concerns into modules with clear interfaces.** Group related logic into short, single-purpose functions and modules, and let other code depend on what a module *does* (its function signatures) rather than how it does it. This lets a collaborator change a module's internals without breaking everyone else's code.

**Keep modules loosely coupled.** When modules communicate only through small, explicit interfaces, a change usually stays local to one file. Pass data in through parameters instead of relying on shared global state, so behavior is predictable when several people edit the codebase at once.

**Align module boundaries with how the team divides work.** Map files and modules to the way responsibilities are split (for example, data loading, modeling, and plotting in separate modules). Keeping each person's work in well-separated files is also a practical way to reduce conflicts, as noted under {ref}`Merge Conflicts & Resolution Strategies <collaborative_code_development:merge_conflicts>`.

For example, refactor a single monolithic script into a small package so each concern lives in its own importable module:

```text
myproject/
├── __init__.py        # marks the directory as a package
├── data.py            # data loading and cleaning
├── model.py           # model definition and training
└── plot.py            # figures and reporting
```

Code then depends on a clear, stable interface rather than copied-and-pasted blocks:

```python
# analysis.py
from myproject.data import load_dataset   # import one function from a module
from myproject.model import train

dataset = load_dataset("experiment.csv")
results = train(dataset, epochs=10)        # interact only through public functions
```

```{tip}
Let the module interface (the set of functions a module exposes) be the contract between collaborators. Agree on function names and arguments early, and changes to a module's internals stay invisible to the rest of the team.
```

This page covers modularity only as it supports collaboration. For the underlying design theory, including abstraction and how to decide module boundaries, see [Software Design Principles](software_design_principles.md), and for laying out and distributing a package, see [Package Development](package_development.md). For authoritative guidance, see the Python tutorial on [Modules and packages](https://docs.python.org/3/tutorial/modules.html), the Carpentries' [Good Enough Practices in Scientific Computing](https://carpentries-lab.github.io/good-enough-practices/03-software.html), and The Turing Way's [Code Quality](https://book.the-turing-way.org/reproducible-research/code-quality.html) chapter.

## Feature Flags & Controlled Integration

A *feature flag* (or feature toggle) is a switch, usually read from a config file or environment variable, that turns a code path on or off without changing the code. It lets you merge incomplete or experimental work into `main` while it stays off by default, so the default analysis or pipeline is unaffected and collaborators avoid long-lived branches. This is the idea of *controlled integration*: integrate continuously, but enable deliberately.

- **Integrate behind a flag to keep `main` releasable.** A teammate can merge a new experimental code path while it is dormant, which keeps branches short-lived and pairs naturally with {ref}`trunk-based development <collaborative_code_development:branching_collaboration_models>`.
- **Default to off until ready.** The flag stays off so the standard pipeline behaves exactly as before; you flip it on for yourself to test, then for everyone once the work is validated.
- **Combine with CI so all paths are tested.** Run your test suite with the flag both off and on so neither path silently breaks (see {ref}`Code Review & Continuous Integration (CI) <collaborative_code_development:code_review_ci>`).
- **Remove stale flags.** Each flag is inventory with a carrying cost: once a feature is permanent, delete the flag and the dead branch so the code does not accumulate forgotten toggles.

```python
import os

# Read a flag from the environment; default to the safe, existing behavior.
USE_NEW_SAMPLER = os.environ.get("USE_NEW_SAMPLER", "false").lower() == "true"

if USE_NEW_SAMPLER:
    results = run_experimental_sampler(dataset)   # off by default
else:
    results = run_default_sampler(dataset)         # unchanged pipeline
```

```bash
# Opt in to the new path for a single run, without editing any code
USE_NEW_SAMPLER=true python analysis.py
```

```{tip}
Keep flags simple and short-lived. Each one adds a code path to test and reason about, so prefer a single boolean read from config, and schedule a "review for delete" date so toggles do not outlive the feature they guarded.
```

For terminology and patterns, see Martin Fowler's [Feature Toggles (aka Feature Flags)](https://martinfowler.com/articles/feature-toggles.html), the [Feature Flags](https://trunkbaseddevelopment.com/feature-flags/) page on trunkbaseddevelopment.com, and GitHub's [How we ship code faster and safer with feature flags](https://github.blog/engineering/infrastructure/ship-code-faster-safer-feature-flags/).

## Testing Ecosystem

A shared, automated test suite is the safety net that makes collaboration safe: when everyone's changes are checked against the same tests, contributors can refactor and extend a codebase that others depend on without fear of silently breaking it. This section is a quick map of the common Python testing tools; for how to write effective tests, measure coverage, and wire them into CI, see the dedicated [Testing and Continuous Integration](testing_and_continuous_integration.md) chapter.

**The ecosystem at a glance**

- **pytest**: a popular third-party framework for writing small, readable tests with plain `assert` statements.
- **unittest**: the standard library's built-in testing framework, available without installing anything.
- **coverage.py**: measures which lines of code your tests actually exercise, highlighting untested paths.
- **tox**: automates running your tests across multiple Python versions and environments.
- **nox**: a similar multi-environment test runner that uses a Python (`noxfile.py`) configuration instead of a config file.
- **Hypothesis**: property-based testing that generates many inputs to find edge cases you would not think to write by hand.

A minimal pytest test is just a `test_` function with an `assert`:

```python
# test_math.py
def add(a, b):
    return a + b

def test_add():          # pytest discovers functions named test_*
    assert add(2, 3) == 5
```

```bash
pytest   # discovers and runs every test_* function, then reports pass/fail
```

The shared suite is what lets CI vouch for each pull request: see {ref}`Code Review & Continuous Integration (CI) <collaborative_code_development:code_review_ci>` for how it runs automatically on every change.

```{tip}
Pick one framework for the project (pytest is a common default) so the whole team writes and runs tests the same way. A test that passes on your machine but is skipped by everyone else is no safety net at all.
```

For details, see the official docs: [pytest](https://docs.pytest.org/en/stable/), [unittest](https://docs.python.org/3/library/unittest.html), [coverage.py](https://coverage.readthedocs.io/), [tox](https://tox.wiki/en/stable/), [nox](https://nox.thea.codes/en/stable/), and [Hypothesis](https://hypothesis.readthedocs.io/en/latest/).

## Dependency & Environment Management

Collaborators, CI, and future-you should all run the same dependencies in the same kind of environment, so code behaves identically everywhere and you avoid "works on my machine." The practical way to get there is to share and pin the environment in the repository rather than rely on whatever each person happens to have installed.

**Core practices**

- **Use an isolated environment per project.** A dedicated virtual environment keeps each project's dependencies separate, so upgrading one project never breaks another.
- **Pin versions and commit the spec.** Record exact versions (for example `numpy==2.1.0`) in a spec or lock file and commit it, so everyone resolves the same packages.
- **Pick one tool for the project.** Agree on a single workflow so the whole team creates and updates the environment the same way.
- **Regenerate from the committed spec.** Build the environment from the checked-in file rather than ad hoc installs, and update the file when dependencies change.

**Common options**

- **pip + `requirements.txt` with `venv`**: the standard-library virtual environment plus a pinned requirements file; simple and universally available.
- **conda/mamba with `environment.yml`**: manages Python and non-Python dependencies together, which suits scientific stacks; mamba is a faster drop-in resolver.
- **uv or Poetry**: modern all-in-one project managers that create the environment, resolve dependencies, and write a lock file (`uv.lock`, `poetry.lock`); restore with `uv sync` or `poetry install`.

A minimal pip + `venv` workflow that pins what you install:

```bash
python -m venv .venv             # create an isolated environment
source .venv/bin/activate        # activate it (Unix/macOS)
pip install -r requirements.txt  # install the pinned dependencies
pip freeze > requirements.txt    # record exact versions to commit
```

```{tip}
Commit the lock or spec file so collaborators reproduce the exact environment, and so {ref}`CI <collaborative_code_development:code_review_ci>` installs the same pinned dependencies it tests against.
```

This section is a quick reference for sharing a team environment. For environment reproducibility in depth, including capturing the full computational environment, see the [Reproducible Research](reproducible_research.md) chapter; for declaring a package's own dependencies, see [Package Development](package_development.md). For command details, see the official docs: [venv](https://docs.python.org/3/library/venv.html), [pip requirements files](https://pip.pypa.io/en/stable/reference/requirements-file-format/), [conda environments](https://docs.conda.io/projects/conda/en/stable/user-guide/tasks/manage-environments.html), [uv](https://docs.astral.sh/uv/), and [Poetry](https://python-poetry.org/docs/basic-usage/).

## Code Consistency Tools

When everyone formats and lints code the same way, diffs stay small and reviews focus on substance instead of style. Automate consistency so it is not a manual chore, and let tooling, not reviewers, enforce the rules.

**The toolbox at a glance**

- **Formatters** apply a uniform style automatically so layout never appears in a diff: [Black](https://black.readthedocs.io/en/stable/) is a widely used opinionated formatter, and [Ruff](https://docs.astral.sh/ruff/) ships a fast, Black-compatible formatter as well.
- **Import sorters** order and group imports consistently: [isort](https://isort.readthedocs.io/en/latest/) sorts them alphabetically and into sections (Ruff can do this too).
- **Linters** catch likely bugs and style issues before review: [Ruff](https://docs.astral.sh/ruff/linter/), [flake8](https://flake8.pycqa.org/en/latest/), and [pylint](https://pylint.readthedocs.io/en/stable/) all flag problems statically.
- **[EditorConfig](https://editorconfig.org/)** keeps whitespace, indentation, and line endings consistent across editors and IDEs via a shared `.editorconfig` file.
- **[pre-commit](https://pre-commit.com/)** runs all of the above automatically on staged files before each commit, so unformatted code never lands.

The simplest entry point is to run a formatter and a linter directly:

```bash
ruff format .   # auto-format every file in the current directory
ruff check .    # lint for likely errors and style issues
```

To run them automatically on every commit, add a `.pre-commit-config.yaml` and install the hook with `pre-commit install`:

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.15.17            # pin to a released Ruff version
    hooks:
      - id: ruff-check       # lint (add args: [--fix] to auto-fix)
      - id: ruff-format      # format
```

Run these checks both locally through pre-commit and in CI so nothing slips through if someone commits without the hook installed. The {ref}`Code Review & Continuous Integration (CI) <collaborative_code_development:code_review_ci>` section already runs `ruff check` in a workflow; pointing CI and pre-commit at the same config keeps local and remote results identical. For readability principles beyond tool mechanics, see [Documentation and Readability](documentation_and_readibility.md).

```{tip}
Agree on one formatter and commit its config (for example a `[tool.ruff]` table in `pyproject.toml`) so the whole team matches automatically. Reformatting an existing codebase once, in a single dedicated commit, keeps that noise out of later reviews.
```

## Security, Licensing & Code Compliance

Code that is shared or published needs more care than a private scratch script: a leaked credential, an unclear license, or an overlooked policy can expose secrets, block reuse, or violate funder rules. This section is a quick checklist; {ref}`Version Control Systems <collaborative_code_development:version_control_systems>` already covers keeping repos private by default and following upstream licenses.

**Security**

- **Never commit secrets** (API keys, tokens, passwords). Keep them out of the repo with `.gitignore` and load them at runtime from environment variables or a secrets manager.
- **Scan for leaked secrets.** Enable [GitHub secret scanning and push protection](https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning), which can block a push that contains a credential, or run [gitleaks](https://github.com/gitleaks/gitleaks) locally and in CI.
- **Scan dependencies for known vulnerabilities** using [GitHub Dependabot](https://docs.github.com/en/code-security/dependabot/dependabot-alerts/about-dependabot-alerts) or [pip-audit](https://pypi.org/project/pip-audit/) for Python.

```bash
# .gitignore: keep secret files out of version control
.env
*.key
secrets.yaml
```

```bash
pip-audit                    # audit the current environment for vulnerable packages
pip-audit -r requirements.txt   # or audit a pinned requirements file
gitleaks git .               # scan the repo history for committed secrets
```

```{note}
A secret that was ever committed must be treated as compromised: it stays in Git history even after you delete it, so rotate or revoke it rather than just removing the line.
```

**Licensing**

- **Add a `LICENSE` file** so others know how they may use, modify, and redistribute your code; code with no license is "all rights reserved" by default.
- **Know the two broad families**: permissive licenses (MIT, BSD, Apache-2.0) allow almost any reuse including in closed-source software, while copyleft licenses (GPL) require derivative works to stay open under the same terms.
- **Stay compatible with your dependencies and any reused code**, and attribute code you adapt (see the attribution note under {ref}`Version Control Systems <collaborative_code_development:version_control_systems>`).

**Compliance**

- **Follow your institution's and funders' data-use and security policies**, especially for sensitive, restricted, or human-subjects data; these can govern where code and data may live and who may access them.
- **Check that dependency licenses are compatible** with how you intend to release: a GPL dependency, for example, constrains a permissively licensed project.

To pick a license, use [choosealicense.com](https://choosealicense.com/), and for standardized license identifiers see the [SPDX License List](https://spdx.org/licenses/).

## Integrations

Integrations connect your repository to external services, usually through your Git host (for example via GitHub Apps and the GitHub Marketplace), that automate parts of the collaborative workflow: testing, documentation, coverage, archiving, and notifications. Wiring these up once means each push or release triggers the right service automatically.

**Research-relevant integrations**

- **Continuous integration**: GitHub Actions runs your tests, linters, and builds on every push and pull request. This is the automation backbone and is covered above under {ref}`Code Review & Continuous Integration (CI) <collaborative_code_development:code_review_ci>`.
- **Zenodo for citable DOIs** *(especially important for research software)*: link a repository on Zenodo's GitHub settings page, and Zenodo archives a snapshot and mints a new DOI each time you publish a GitHub release. The DOI is a persistent identifier you can cite in papers, so collaborators reference a fixed archived version rather than a moving branch. The repository must be public and include a license.
- **Documentation hosting**: Read the Docs builds and hosts your documentation. After you import a project, it adds a webhook so the docs rebuild automatically when you push.
- **Code coverage reporting**: Codecov and Coveralls receive the coverage data your CI uploads, then post coverage changes as a pull-request comment and expose a coverage badge.
- **Status badges**: small images in your `README` that surface build, coverage, and DOI status at a glance, so anyone landing on the repo can see its health and how to cite it.

A few badges near the top of `README.md`:

```markdown
<!-- Build status from a GitHub Actions workflow -->
![CI](https://github.com/your-org/your-repo/actions/workflows/ci.yml/badge.svg)
<!-- Coverage from Codecov -->
[![codecov](https://codecov.io/gh/your-org/your-repo/branch/main/graph/badge.svg)](https://app.codecov.io/gh/your-org/your-repo)
<!-- Citable DOI from Zenodo (replace with the DOI Zenodo issues) -->
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.0000000.svg)](https://doi.org/10.5281/zenodo.0000000)
```

```{tip}
For research software, archive a tagged release on Zenodo and cite the resulting DOI in both your paper and your `README` so others reproduce and credit the exact version you used.
```

For setup, see the official docs: GitHub's [referencing and citing content with Zenodo](https://docs.github.com/en/repositories/archiving-a-github-repository/referencing-and-citing-content), [Read the Docs](https://docs.readthedocs.io/en/stable/), [Codecov](https://docs.codecov.com/docs/quick-start), and GitHub's [Actions documentation](https://docs.github.com/en/actions). The [Testing and Continuous Integration](testing_and_continuous_integration.md) chapter covers producing the coverage reports these services consume.

## Summary Checklist

- [ ] Overview of version control and workflows  
- [ ] Branching models & conflict mitigation  
- [ ] Review workflows + CI integration  
- [ ] Real‑time collaborative tooling  
- [ ] Environment, dependency, and style standardization  
- [ ] Security/compliance + automation integrations