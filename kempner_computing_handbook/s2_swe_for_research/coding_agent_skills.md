# Coding Agent Skills

This chapter turns the other Software Engineering for Research chapters into skills for coding agents such as Claude Code and Codex. A skill is a `SKILL.md` file of instructions that an agent loads when a task matches the skill's description. With these skills installed, your agent follows the practices in this handbook when it works on your code. To learn how skills work, see {doc}`Building Custom Tools and MCP Servers <../s5b_agentic_ai_workflows/building_custom_tools>`.

(coding_agent_skills:install)=
## Install a skill

Claude Code and Codex read the same `SKILL.md` format, the open [Agent Skills](https://agentskills.io/specification) standard, from different folders:

| Agent | For all your projects | For one project |
|---|---|---|
| Claude Code | `~/.claude/skills/<skill-name>/SKILL.md` | `.claude/skills/<skill-name>/SKILL.md` |
| Codex | `~/.agents/skills/<skill-name>/SKILL.md` | `.agents/skills/<skill-name>/SKILL.md` |

For one project, the folder goes in the repository's top folder, and you start the agent there. Commit that folder to give everyone who clones the repository the same skills. On the cluster, your home directory is the same on every node, so a skill you install for all your projects works in every job.

Each skill file is at `https://handbook.eng.kempnerinstitute.harvard.edu/skills/<skill-name>/SKILL.md`. The six skill names are `collaborative-code-development`, `software-design-principles`, `documentation-and-readability`, `testing-and-continuous-integration`, `package-development`, and `reproducible-research`. {ref}`All skills <coding_agent_skills:all_skills>` lists what each one covers.

```{note}
An agent follows a skill's instructions, so read a skill before you install it, as you would any agent configuration; see {ref}`Untrusted repositories <agentic_ai:untrusted_repositories>`. The skills on this page contain instructions only, with no scripts.
```

### Ask your agent

Point the agent at this page, and name the skills you want or ask for all of them. Ask it to download each file with curl, because a web-fetch tool can return a summary instead of the file:

```text
Install the testing-and-continuous-integration and reproducible-research skills
for all my projects. Download each SKILL.md with curl, using the links on this page:
https://handbook.eng.kempnerinstitute.harvard.edu/s2_swe_for_research/coding_agent_skills.html
```

To install the skills for one project only, write "for this project" instead of "for all my projects".

### Install by hand

Set `dest` to a folder from the table, and list the skills you want after `for skill in`. To update the skills when the chapters change, run the loop again.

::::{tab-set}
:::{tab-item} Claude Code
```bash
dest=~/.claude/skills    # for one project: dest=.claude/skills
base=https://handbook.eng.kempnerinstitute.harvard.edu/skills
for skill in testing-and-continuous-integration reproducible-research; do
  mkdir -p $dest/$skill
  curl -fsSL $base/$skill/SKILL.md -o $dest/$skill/SKILL.md || echo "Failed: $skill"
done
```
:::
:::{tab-item} Codex
```bash
dest=~/.agents/skills    # for one project: dest=.agents/skills
base=https://handbook.eng.kempnerinstitute.harvard.edu/skills
for skill in testing-and-continuous-integration reproducible-research; do
  mkdir -p $dest/$skill
  curl -fsSL $base/$skill/SKILL.md -o $dest/$skill/SKILL.md || echo "Failed: $skill"
done
```
:::
::::

(coding_agent_skills:use)=
## Use a skill

| To | Claude Code | Codex |
|---|---|---|
| Use a skill automatically | Ask for a task that matches its description | Ask for a task that matches its description |
| Call a skill by name | Type `/<skill-name>` | Type `$` and choose the skill, or run `/skills` |
| Load a new skill | Nothing to do in a running session. If the skills folder is new, run `/reload-skills`. | Nothing to do. If the skill does not appear, restart Codex. |

Each skill tells the agent to follow your project's own conventions first, such as a CONTRIBUTING file or agent instructions. The skills for Git, packaging, and reproducibility also tell the agent to push, publish, or delete only when you ask.

(coding_agent_skills:skills_by_chapter)=
## Skills by chapter

Open a skill to read it. Each one links to its chapter for the full explanation.

:::{dropdown} Collaborative Code Development
The `collaborative-code-development` skill, from [Collaborative Code Development](collaborative_code_development.md). Download its [SKILL.md](https://handbook.eng.kempnerinstitute.harvard.edu/skills/collaborative-code-development/SKILL.md).

```{literalinclude} ../_extra/skills/collaborative-code-development/SKILL.md
:language: markdown
```
:::

:::{dropdown} Software Design Principles
The `software-design-principles` skill, from [Software Design Principles](software_design_principles.md). Download its [SKILL.md](https://handbook.eng.kempnerinstitute.harvard.edu/skills/software-design-principles/SKILL.md).

```{literalinclude} ../_extra/skills/software-design-principles/SKILL.md
:language: markdown
```
:::

:::{dropdown} Documentation and Readability
The `documentation-and-readability` skill, from [Documentation and Readability](documentation_and_readibility.md). Download its [SKILL.md](https://handbook.eng.kempnerinstitute.harvard.edu/skills/documentation-and-readability/SKILL.md).

```{literalinclude} ../_extra/skills/documentation-and-readability/SKILL.md
:language: markdown
```
:::

:::{dropdown} Testing and Continuous Integration
The `testing-and-continuous-integration` skill, from [Testing and Continuous Integration](testing_and_continuous_integration.md). Download its [SKILL.md](https://handbook.eng.kempnerinstitute.harvard.edu/skills/testing-and-continuous-integration/SKILL.md).

```{literalinclude} ../_extra/skills/testing-and-continuous-integration/SKILL.md
:language: markdown
```
:::

:::{dropdown} Package Development
The `package-development` skill, from [Package Development](package_development.md). Download its [SKILL.md](https://handbook.eng.kempnerinstitute.harvard.edu/skills/package-development/SKILL.md).

```{literalinclude} ../_extra/skills/package-development/SKILL.md
:language: markdown
```
:::

:::{dropdown} Reproducible Research
The `reproducible-research` skill, from [Reproducible Research](reproducible_research.md). Download its [SKILL.md](https://handbook.eng.kempnerinstitute.harvard.edu/skills/reproducible-research/SKILL.md).

```{literalinclude} ../_extra/skills/reproducible-research/SKILL.md
:language: markdown
```
:::

(coding_agent_skills:all_skills)=
## All skills

| Skill | Chapter | Use it to |
|---|---|---|
| [`collaborative-code-development`](https://handbook.eng.kempnerinstitute.harvard.edu/skills/collaborative-code-development/SKILL.md) | [Collaborative Code Development](collaborative_code_development.md) | Branch, commit, review, and resolve conflicts with Git and GitHub |
| [`software-design-principles`](https://handbook.eng.kempnerinstitute.harvard.edu/skills/software-design-principles/SKILL.md) | [Software Design Principles](software_design_principles.md) | Structure, refactor, and review research code |
| [`documentation-and-readability`](https://handbook.eng.kempnerinstitute.harvard.edu/skills/documentation-and-readability/SKILL.md) | [Documentation and Readability](documentation_and_readibility.md) | Write docstrings, comments, READMEs, and citation files |
| [`testing-and-continuous-integration`](https://handbook.eng.kempnerinstitute.harvard.edu/skills/testing-and-continuous-integration/SKILL.md) | [Testing and Continuous Integration](testing_and_continuous_integration.md) | Write tests, measure coverage, and set up CI |
| [`package-development`](https://handbook.eng.kempnerinstitute.harvard.edu/skills/package-development/SKILL.md) | [Package Development](package_development.md) | Package, version, and release Python code |
| [`reproducible-research`](https://handbook.eng.kempnerinstitute.harvard.edu/skills/reproducible-research/SKILL.md) | [Reproducible Research](reproducible_research.md) | Pin environments, seed runs, version data, and archive results |

Each skill file is at `https://handbook.eng.kempnerinstitute.harvard.edu/skills/<skill-name>/SKILL.md`.
