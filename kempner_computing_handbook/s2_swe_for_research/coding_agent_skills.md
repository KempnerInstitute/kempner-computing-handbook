# Coding Agent Skills

This chapter turns the other Software Engineering for Research chapters into skills for coding agents such as Claude Code and Codex. A skill is a `SKILL.md` file of instructions that an agent loads when a task matches the skill's description. With these skills installed, your agent follows the practices in this handbook when it works on your code. To learn how skills work, see {doc}`Building Custom Tools and MCP Servers <../s5b_agentic_ai_workflows/building_custom_tools>`.

Skills are instructions, not limits. For limits that must hold, use the permission rules and hooks in {ref}`Guardrails <agentic_ai:guardrails>`.

(coding_agent_skills:install)=
## Install a skill

Claude Code and Codex read the same `SKILL.md` format, the open [Agent Skills](https://agentskills.io/specification) standard, from different folders. Each skill goes in its own folder there, as `<skill-name>/SKILL.md`.

| Agent | For all your projects | For one project |
|---|---|---|
| Claude Code | `~/.claude/skills` | `.claude/skills` in the repository's top folder |
| Codex | `~/.agents/skills` | `.agents/skills` in the repository's top folder |

Install the skills on the machine where the agent runs, such as your computer or the cluster. On the cluster, your home directory is the same on every node, so skills you install for all your projects work in every job. To share a project's skills with everyone who clones the repository, commit its skills folder.

Each skill file is at `https://handbook.eng.kempnerinstitute.harvard.edu/skills/<skill-name>/SKILL.md`. The six skill names are `collaborative-code-development`, `software-design-principles`, `documentation-and-readability`, `testing-and-continuous-integration`, `package-development`, and `reproducible-research`. {ref}`All skills <coding_agent_skills:all_skills>` lists what each one covers. If you are not sure which to pick, install all six. An agent reads only each skill's name and description until a task needs the rest.

```{note}
An agent follows a skill's instructions, so read a skill before you install it, as you would any agent configuration; see {ref}`Untrusted repositories <agentic_ai:untrusted_repositories>`. The skills on this page contain instructions only, with no scripts.
```

### Ask your agent

Point the agent at this page. Name the skills you want, or ask for all of them. Ask the agent to download each file with curl. A web-fetch tool can return a summary instead of the file.

```text
Install the testing-and-continuous-integration and reproducible-research skills
for all my projects. Download each SKILL.md with curl, using the links on this page:
https://handbook.eng.kempnerinstitute.harvard.edu/s2_swe_for_research/coding_agent_skills.html
```

To install the skills for one project only, write "for this project" instead of "for all my projects". The agent may ask you to approve the downloads. When it finishes, load the skills as described in {ref}`Use a skill <coding_agent_skills:use>`.

If your agent runs in a sandbox, such as the one in {ref}`Agent sandboxing <agentic_ai:agent_sandboxing>`, it may not be able to download the files or write to its skills folder. In that case, install the skills by hand.

### Install by hand

Set `dest` to a folder from the table. The list holds all six skills; delete the lines for skills you do not want. For one project, run the commands from the repository's top folder.

::::{tab-set}
:::{tab-item} Claude Code
```bash
dest=~/.claude/skills    # for one project: dest=.claude/skills
base=https://handbook.eng.kempnerinstitute.harvard.edu/skills
skills=(
  collaborative-code-development
  software-design-principles
  documentation-and-readability
  testing-and-continuous-integration
  package-development
  reproducible-research
)
for skill in "${skills[@]}"; do
  mkdir -p $dest/$skill
  curl -fsSL $base/$skill/SKILL.md -o $dest/$skill/SKILL.md || echo "Failed: $skill"
done
ls $dest/*/SKILL.md
```
:::
:::{tab-item} Codex
```bash
dest=~/.agents/skills    # for one project: dest=.agents/skills
base=https://handbook.eng.kempnerinstitute.harvard.edu/skills
skills=(
  collaborative-code-development
  software-design-principles
  documentation-and-readability
  testing-and-continuous-integration
  package-development
  reproducible-research
)
for skill in "${skills[@]}"; do
  mkdir -p $dest/$skill
  curl -fsSL $base/$skill/SKILL.md -o $dest/$skill/SKILL.md || echo "Failed: $skill"
done
ls $dest/*/SKILL.md
```
:::
::::

The loop prints nothing for a skill that installs, and `ls` then lists each installed `SKILL.md` file. If every skill fails, check your connection. If one skill fails, check the spelling of its name. Then run the commands again. A failed first install leaves an empty folder, which you can delete. To update the skills when the chapters change, run the loop again. It replaces the files, including any edits you made. To remove a skill, delete its folder.

(coding_agent_skills:use)=
## Use a skill

| To | Claude Code | Codex |
|---|---|---|
| List installed skills | Run `/skills` | Run `/skills` |
| Use a skill automatically | Ask for a task that matches its description | Ask for a task that matches its description |
| Call a skill by name | Type `/<skill-name>` | Type `$` and choose the skill |
| Load new skills | Start a new session, or run `/reload-skills` in a running one | Picked up automatically; if a skill does not appear, restart Codex |

In a test on the cluster, Claude Code 2.1.300 and Codex CLI 0.160.0 each loaded all six skills from a repository's skills folder.

Each skill tells the agent to follow your project's own conventions first, such as a CONTRIBUTING file or agent instructions. The skills for Git, packaging, and reproducibility also list actions that the agent takes only when you ask, such as pushing, publishing, deleting, or starting long runs. Project conventions do not override that list, but your own requests count as asking, whether you type them or write them in your agent instructions.

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
| [`collaborative-code-development`](https://handbook.eng.kempnerinstitute.harvard.edu/skills/collaborative-code-development/SKILL.md) | [Collaborative Code Development](collaborative_code_development.md) | Branch, commit, review, and merge with Git and GitHub, and handle secrets and licenses |
| [`software-design-principles`](https://handbook.eng.kempnerinstitute.harvard.edu/skills/software-design-principles/SKILL.md) | [Software Design Principles](software_design_principles.md) | Structure, refactor, and review research code |
| [`documentation-and-readability`](https://handbook.eng.kempnerinstitute.harvard.edu/skills/documentation-and-readability/SKILL.md) | [Documentation and Readability](documentation_and_readibility.md) | Write docstrings, comments, READMEs, and citation files |
| [`testing-and-continuous-integration`](https://handbook.eng.kempnerinstitute.harvard.edu/skills/testing-and-continuous-integration/SKILL.md) | [Testing and Continuous Integration](testing_and_continuous_integration.md) | Write tests, measure coverage, and set up CI |
| [`package-development`](https://handbook.eng.kempnerinstitute.harvard.edu/skills/package-development/SKILL.md) | [Package Development](package_development.md) | Package, version, and release Python code |
| [`reproducible-research`](https://handbook.eng.kempnerinstitute.harvard.edu/skills/reproducible-research/SKILL.md) | [Reproducible Research](reproducible_research.md) | Pin environments, seed runs, version data, and archive results |
