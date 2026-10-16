---
name: collaborative-code-development
description: Use when committing, branching, resolving a merge conflict, preparing or reviewing a pull request, or setting up a shared research repository with Git and GitHub. Covers branches, commit messages, pull requests, code review, merge conflicts, CI, shared environments, formatting and linting, secrets, licenses, and integrations such as Zenodo. From the Kempner Institute Computing Handbook.
---

# Collaborative Code Development

Use these practices when you work with Git and GitHub on research code. They summarize the Collaborative Code Development chapter of the Kempner Institute Computing Handbook: https://handbook.eng.kempnerinstitute.harvard.edu/s2_swe_for_research/collaborative_code_development.html

If the project has its own conventions, for example in its README, a CONTRIBUTING file, or agent instructions, follow those first. Project conventions do not override the Ask first rules. A request from the user, typed or written in the user's own agent instructions, counts as asking.

## Ask first

- Commit, push, open issues or pull requests, merge, create tags or releases, change a repository's visibility, or rewrite history only when the user asks.
- Never rebase or force-push a branch that others have already pulled.
- Ask the user which license to use. Do not choose one.

## Branches

- Start from an up-to-date `main`: `git checkout main && git pull origin main`.
- Work on a short-lived branch named after its issue and the author's initials, so `main` stays stable. For example, `iss42_add_data_loader_js` is for issue 42 by an author with the initials js.
- Default to GitHub Flow: one branch per issue, a pull request, review, then merge. External contributors without write access use fork and pull.
- Merge on shared branches. Rebase only to tidy a local branch before you merge it.

## Commits

- Write the subject in the imperative mood, so it completes "If applied, this commit will ...". Capitalize it and leave off the trailing period, for example `Fix data loading error with empty CSV files`.
- Add a body that explains what changed and why, and reference the issue, for example `Closes #23`.
- Keep one logical change per commit.
- When a commit includes work by other people, add a `Co-authored-by: Name <email>` trailer for each person, after a blank line at the end of the message.

## Pull requests and review

- Send every change, even a one-line fix, through a pull request.
- When the user asks for a pull request, keep it focused, under about 400 lines where possible, and link the issue it closes.
- In review, check correctness and edge cases, readability and naming, and reproducibility: pinned dependencies, seeds set, and no hard-coded local paths. Suggest improvements rather than only flagging problems.

## Merge conflicts

- Fetch or pull the latest `main` before you start and before you push, so branches stay close.
- Keep features in separate files or modules with clear interfaces, so two people rarely edit the same lines.
- Commit or stash work before a merge or rebase. A clean working tree lets `git merge --abort` or `git rebase --abort` restore the previous state.

To resolve a conflict:

1. Edit the file to the intended result.
2. Delete the `<<<<<<<`, `=======`, and `>>>>>>>` markers.
3. Run `git add` on the file.
4. Finish with `git commit` or `git rebase --continue`.

## Environment and style

- Use one isolated environment per project, and one environment tool for the team: pip with `venv`, conda or mamba, uv, or Poetry.
- Pin exact versions in a committed spec or lock file (`requirements.txt`, `environment.yml`, `uv.lock`, or `poetry.lock`), and rebuild the environment from it.
- Use one formatter and one linter with a committed config, for example `ruff format .` and `ruff check .` with a `[tool.ruff]` table in `pyproject.toml`. Run the same checks in pre-commit and in CI.
- Reformat an existing codebase once, in its own commit, to keep that noise out of later reviews.
- Use one test framework for the project; pytest is a common default.

## CI and feature flags

- Add a GitHub Actions workflow under `.github/workflows/` that installs the project and runs the tests on every push and pull request. Add linting, type checks, and coverage as the project grows.
- Merge unfinished work behind a feature flag that is off by default, for example one read from an environment variable. Test with the flag both off and on, and delete the flag once the feature is permanent.

## Repository basics

- Include a README (purpose, setup, usage), a dependency spec, a `.gitignore`, a `CONTRIBUTING.md`, and a `LICENSE`.
- Keep unpublished research in a private repository. Suggest making it public once the work is published or disseminated.

## Security and licensing

- Never commit secrets such as API keys, tokens, or passwords. List secret files in `.gitignore`, and load secrets at runtime from environment variables or a secrets manager.
- Scan for leaked secrets with GitHub secret scanning or `gitleaks git .`, and scan dependencies with Dependabot or `pip-audit`.
- Treat a secret that was ever committed as compromised, because it stays in Git history. Tell the user to rotate or revoke it.
- Check that the licenses of dependencies and reused code are compatible with the project's license, and credit code you adapt.
- Follow institutional and funder policies for sensitive, restricted, or human-subjects data.

## Live collaboration

- Do not host a VS Code Live Share or JupyterLab collaboration session on the Kempner AI cluster, because guests could run code under the host's cluster account. Host it on a personal computer, or share the code through Git.
- Commit work from a live session and send it through the normal pull request workflow.

## Integrations

- For a citable DOI, connect a public, licensed repository to Zenodo. Zenodo archives each GitHub release and mints a DOI for it.
- Read the Docs builds and hosts documentation, and Codecov or Coveralls reports coverage from CI. Status badges in the README show build, coverage, and DOI status.
