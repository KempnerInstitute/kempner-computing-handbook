# Collaborative Code Development

Collaborative code development promotes reproducible, maintainable, and scalable research software. This section provides an overview of the tools and practices, from version control and branching strategies to continuous integration, dependency management, and secure automation, that enable research teams to work together efficiently.

(collaborative_code_development:version_control_systems)=
## Version Control Systems (VCS)

Version control systems are essential tools for managing code changes, enabling collaboration, and maintaining project history in research software development. Some common VCS types are Git and Mercurial, both of which are distributed version control systems. There are also Subversion (SVN) and Perforce (centralized version control systems). This section covers Git fundamentals and best practices for collaborative development at the Kempner Institute.

```{note}
**Git** is the version control software that runs locally on your computer while **GitHub** is a cloud-based hosting service for Git repositories. Other Git hosting platforms include GitLab, Bitbucket, and SourceForge.
```

### Git Fundamentals

**Repository Structure**
- Working directory: where you edit files
- Staging area (index): where changes are prepared for commit
- Repository: where Git stores project history and metadata
- Remote repositories: shared versions hosted on platforms like GitHub

**Basic Workflow**
```bash
# Check status of working directory
git status

# Stage changes for commit
git add <file>
git add .  # stage all changes

# Commit staged changes
git commit -m "Descriptive commit message"

# Push changes to remote repository
git push origin main
```

**Branching**

Git branches let you work on different features or experiments in parallel without affecting the main code. Think of them as separate workspaces where you can make changes safely before merging them back.

```bash
# Create and switch to new branch
git checkout -b feature/new-analysis

# Switch between branches
git checkout main
git checkout feature/new-analysis

# List all branches
git branch -a

# Delete a branch (after merging)
git branch -d feature/new-analysis
```

**Merging vs Rebasing**

*Merge*: Combines branches while preserving history
```bash
git checkout main                 # Switch to target branch
git merge feature/new-analysis    # Merge feature branch into main
```
- Pros: Preserves complete history, shows when features were integrated
- Cons: Can create complex history graphs with many merge commits

*Rebase*: Replays commits from one branch onto another
```bash
git checkout feature/new-analysis    # Switch to feature branch
git rebase main                      # Replay feature commits on top of main
```
- Pros: Creates linear, clean history
- Cons: Rewrites commit history, can be dangerous on shared branches

*When to Use Each*
- Use merge for: shared branches, preserving collaboration context
- Use rebase for: cleaning up local feature branches before merging  

**Resolving Conflicts**

Git marks conflicts in files with special markers:
```
<<<<<<< HEAD
Current branch content
=======
Incoming branch content
>>>>>>> feature-branch
```

*Resolution Process*
1. Open conflicted files in your editor
2. Choose which changes to keep (or combine them)
3. Remove conflict markers
4. Stage resolved files: `git add <file>`
5. Complete merge/rebase: `git commit` or `git rebase --continue`

### Remote Workflows with GitHub

**Repository Setup and Access Control**

*Repository Visibility*
- **Private**: Default for unpublished research work
- **Public**: Only after work has been disseminated or published

*External Repository Management*
- **Cloning**: You can clone a repository locally and start making changes on it
  ```bash
  # Clone the external repository
  git clone https://github.com/external-org/research-repo.git
  cd research-repo
  
  # Make some changes (preferably on an issue branch instead of main)

  # Push to the remote repository
  git push -u origin <branch_name>
  ```
- **Forking**: For public collaborative work. See [GitHub's forking guide](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) for detailed instructions.
- **Licensing**: Always follow original codebase licensing conditions
- **Attribution**: Credit original repository in README, preserve .git folder for contribution history

**Issues and Project Management**

Issues are GitHub's way to track bugs, request features, and organize work on your project. Create issues for new features before starting work to document what you're building and track progress. Use specific, descriptive titles and apply appropriate labels like `bug` or `enhancement` to help organize your work. For bugs, include reproduction steps and screenshots to help others understand the problem. Assign issues to yourself when working on them. Comment on issues regularly to communicate progress and keep collaborators informed.

**Pull Requests**

All code contributions require pull requests, even single-character changes. Pull requests let you propose changes to a repository and have others review your code before it gets merged into the main branch. Reference issue numbers in PRs like "Closes #23" to automatically link your work to the relevant issue.

1. **Preparation**
   ```bash
   # Ensure branch is up-to-date
   git checkout main
   git pull origin main
   git checkout iss23_new_feature_js
   git rebase main
   ```
   For an extensive guide on how to create a pull request, click [here](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request?tool=cli)

2. **PR Guidelines**
   - Submit PRs to `develop` branch (or `main` if no develop branch)
   - Open PRs early for visibility and feedback
   - Add `[WIP]` prefix for work-in-progress PRs
   - Review changed files count matches expectations

3. **Review and Merge Process**
   - Author submits PR
   - Maintainer reviews and provides feedback
   - Author addresses feedback promptly
   - Maintainer approves
   - **Author merges their own PR** (gives final responsibility)

### Best Practices

**Commit Message Conventions**

*Structure and Rules*
- Subject line answers: "If applied, this commit will [subject line]"
- Write as imperative ("Fix bug" not "Fixed bug")
- Start with capital letter, no period
- Wrap at 72 characters
- Answer what/why, not necessarily how

*Examples*
```bash
# Good
Fix data loading error with empty CSV files

Program was crashing when CSV files had no data rows.
Now handles empty files and shows helpful error message.

Closes #23

# Bad  
Fix bug
```

*Required Elements*
- One logical change per commit
- Don't mix whitespace and functional changes
- Subject line should stand alone
- Include explanations for significant changes
- Reference issues with explanation, not just numbers

*Co-authorship*
When adapting others' code:
```bash
Add feature X based on code by Alice

Co-authored-by: Alice <alice@example.com>
```

**Review Processes**

*For Authors*
- Keep PRs focused and reasonably sized (< 400 lines when possible)
- Write clear, descriptive commit messages following best practices
- Include tests for new functionality
- Respond to reviews promptly and professionally
- Merge your own approved PRs in a timely manner

*For Reviewers*
- Review code within 24-48 hours
- Focus on correctness, readability, and maintainability
- Suggest improvements, don't just point out problems
- Approve when ready, even if minor suggestions remain
- Use "Request Changes" sparingly, for significant issues only

**Repository Organization**

*Essential Files*
- `README.md`: Project description, setup instructions, usage examples
- `requirements.txt` or `environment.yml`: Dependency specifications
- `.gitignore`: Exclude build artifacts, IDE files, sensitive data
- `CONTRIBUTING.md`: Guidelines for contributors
- `LICENSE`: MIT license recommended for uncertainty


*Review Checklist*
- [ ] Code follows style guidelines
- [ ] Logic is correct and handles edge cases
- [ ] Tests are comprehensive and meaningful
- [ ] Documentation updated
- [ ] No sensitive data or credentials exposed
- [ ] Issue references are descriptive, not just numbers
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
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
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

## Security, Licensing & Code Compliance

## Integrations

## Summary Checklist

- [ ] Overview of version control and workflows  
- [ ] Branching models & conflict mitigation  
- [ ] Review workflows + CI integration  
- [ ] Real‑time collaborative tooling  
- [ ] Environment, dependency, and style standardization  
- [ ] Security/compliance + automation integrations