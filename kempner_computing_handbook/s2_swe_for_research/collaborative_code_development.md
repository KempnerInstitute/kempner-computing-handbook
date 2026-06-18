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

## Merge Conflicts & Resolution Strategies

## Real‑Time Collaboration Tools

## Modular Design

## Feature Flags & Controlled Integration

## Testing Ecosystem

## Dependency & Environment Management

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