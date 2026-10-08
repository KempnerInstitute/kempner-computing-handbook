# Using Agentic AI on the Cluster

This page sets up an agent on the Kempner AI cluster and covers how to run it day to day. The steps use [Claude Code](https://www.anthropic.com/claude-code) as the example; other terminal agents work the same way, and IDE agents connect through VS Code.

(agentic_ai:before_you_start)=
## Before you start

```{warning}
Cloud-based agents send your prompts, and any code or data they can read, to an external provider. FASRC permits generative AI tools on the cluster only for non-sensitive, public data (security Level 1). Do not point a cloud agent at Level 2 or higher data unless your school has arranged a contractual agreement with the provider first. See FASRC's [Anthropic API guidance](https://docs.rc.fas.harvard.edu/kb/anthropic/), {doc}`Agentic AI Tools <agentic_ai_tools>` for approved-tool data levels, and {doc}`Security and Compliance <../s6_security_and_compliance/README>`.
```

You need an account or API key for your tool, and a compute node. Do not run agents on a login node, where their processes would compete with every other user.

## Running a terminal agent

**1. Start an interactive job.** The agent only needs CPU and memory to talk to its model, so a small CPU allocation is enough:

```bash
salloc --partition=test --time=0-02:00 --mem=16G --cpus-per-task=4
```

Request a GPU (for example `--partition=kempner --account=<your_account> --gres=gpu:1`) only when the agent will run GPU code for you; see {doc}`Job Submission Basics <../s1_high_performance_computing/general_hpc_concepts/job_submission_basics>`.

**2. Install Claude Code.**

::::{tab-set}
:::{tab-item} Native installer
```bash
curl -fsSL https://claude.ai/install.sh | bash
claude --version
```

This installs to `~/.local/bin`, which must be on your `PATH`, and updates itself.
:::
:::{tab-item} npm in a conda environment
```bash
conda install -c conda-forge "nodejs>=22"
npm install -g @anthropic-ai/claude-code
```

Claude Code is then on your `PATH` only while that environment is active. See {doc}`Conda Environment <../s1_high_performance_computing/development_and_runtime_envs/using_conda_env>`.
:::
::::

Your home directory is shared by every node, and an update can delete a version that a session on another node is still running, which crashes that session. If you run agents in several jobs at once, add `"env": {"DISABLE_AUTOUPDATER": "1"}` to `~/.claude/settings.json` and run `claude update` yourself when no agent jobs are running.

**3. Sign in.**

::::{tab-set}
:::{tab-item} Subscription
With a paid Claude.ai plan (Pro, Max, Team, or Enterprise), run `claude` and follow the login prompt, or use `/login` inside a session. Over SSH, it gives you a URL to open in your local browser and a code to paste back. The free plan does not include Claude Code.
:::
:::{tab-item} API key
Create a key in the [Claude Console](https://platform.claude.com) and export it:

```bash
export ANTHROPIC_API_KEY="your-key-here"
```

Keep the key out of repositories and shared files; if you store it in a file, `chmod 600` it. PIs can create a lab key billed through a HUIT billing code; see FASRC's [Anthropic API guidance](https://docs.rc.fas.harvard.edu/kb/anthropic/).
:::
::::

**4. Start the agent** from your project directory with `claude`.

(agentic_ai:permission_modes)=
### Permission modes

Permission modes trade oversight for speed. Press `Shift+Tab` in a session to cycle through them, or choose one at startup with `--permission-mode`. New interactive sessions start in auto mode where it is available, and otherwise in manual mode.

| Mode | Value | What it does |
|---|---|---|
| Manual | `default` | Asks before each edit and command. The safest mode while you learn how the agent behaves. |
| Auto-accept edits | `acceptEdits` | Applies file edits and common filesystem commands, including `rm`, without asking. |
| Plan | `plan` | Researches and proposes a plan without editing files. Where auto mode is available, a classifier can still approve shell commands. |
| Auto | `auto` | Runs without routine prompts while a classifier blocks risky actions. Needs a supported model, and an organization can turn it off. |
| Don't ask | `dontAsk` | Refuses anything that would need approval, so the agent only reads, runs read-only commands, and does what your rules allow. For unattended runs; see {ref}`Caps on unattended runs <agentic_ai:run_caps>`. |

```{warning}
Do not use `--dangerously-skip-permissions` (bypass mode) on the cluster. It runs any command without asking, and Anthropic recommends it only in isolated environments without internet access, which compute nodes are not.
```

(agentic_ai:keeping_a_session_alive)=
### Keeping a session alive

A session lives inside your SSH connection, so it ends when your laptop sleeps or the VPN drops. Run it inside `tmux` on the login node:

```bash
hostname                 # note the login node, for example boslogin07.rc.fas.harvard.edu
tmux new -s agent        # then run salloc and claude inside tmux
```

If the connection drops, SSH back to that same login node and reattach:

```bash
ssh <username>@boslogin07.rc.fas.harvard.edu
tmux attach -t agent
```

A tmux session exists only on the node where you started it, and monthly maintenance reboots login nodes; see FASRC's [terminal access guide](https://docs.rc.fas.harvard.edu/kb/terminal-access/) for the login nodes and their limits. tmux does not extend your job: the session still ends at the job's `--time` limit.

To pick up a conversation after a session ends, start Claude Code in the same project directory:

- `claude --continue` reopens the most recent conversation in that directory, but not one started with `claude -p`.
- `claude --resume` lets you choose an earlier conversation, or takes a session ID.

Conversations are saved under `~/.claude/projects/`, which every node can read. Background sessions (`claude --bg`, then `claude attach`) survive a closed terminal but still end with your job, so they do not replace tmux. To check on a session from another device, log in to the cluster and reattach tmux rather than turning on remote control; see {ref}`Remote control <agentic_ai:remote_control>`.

### Long or unattended runs

For long tasks, run the agent in print mode (`claude -p "your task"`) inside a batch job. No one is there to answer prompts, so decide in advance what the agent may do, with permission rules and `--permission-mode dontAsk`, and cap the run with `--max-turns` and `--max-budget-usd`; see {ref}`Caps on unattended runs <agentic_ai:run_caps>`. For a complete example, see {doc}`SLURM Jobs and Cluster Workflows <slurm_jobs_and_cluster_workflows>`.

## Running an IDE agent

1. Connect VS Code to a compute node with Remote-SSH, as described in {doc}`VSCode for Remote Dev <../s1_high_performance_computing/development_and_runtime_envs/using_vscode_for_remote_development>`.
2. Install the agent's extension (for example Claude Code, Codex, or GitHub Copilot) with its **Install in SSH** button, so it runs on the cluster side.
3. Sign in through the extension, or provide an API key.

FASRC also documents editor and notebook extensions, including Jupyter AI in JupyterLab through Open OnDemand; see its [AI extensions guidance](https://docs.rc.fas.harvard.edu/kb/ai-extensions-on-fasrc-clusters/).

## Responsible use on shared infrastructure

- **Stay within your allocation.** Run agents in an interactive or batch job, never on a login node, and do not let an agent submit unbounded jobs or start long-running processes without your review; see {doc}`Understanding SLURM <../s1_high_performance_computing/general_hpc_concepts/understanding_slurm>`.
- **Do not hold GPUs idle.** Use a CPU allocation for reading, planning, and editing, and release sessions you are done with.
- **Review before it acts.** Read the commands an agent proposes, especially anything that deletes files, rewrites history, or moves data.
- **Watch cost and quota.** API usage is billed per token in the Claude Console; a subscription has usage limits, which `/usage` shows. Cluster jobs draw on your fairshare allocation; see {doc}`Fairshare Policy <../s1_high_performance_computing/efficient_use_of_resources/fair_use_and_prioritization_policies>`.
- **Protect secrets and data.** Keep keys out of repositories and shared paths, and block the agent from reading credentials; see {ref}`Agent security <agentic_ai:agent_security>`.

## Common pitfalls

- **The agent tries `sudo` or system installs.** You do not have root on the cluster; keep changes in your own directories and environments.
- **The agent cannot reach the provider's API.** Compute nodes have outbound access, so check your key and environment first; then see {doc}`Support and Troubleshooting <../s8_support/README>`.
- **The session ends with your connection or job.** Run it in tmux and resume the conversation; see {ref}`Keeping a session alive <agentic_ai:keeping_a_session_alive>`.
- **SLURM commands stall inside the agent sandbox.** Exclude them from it and run them as simple calls; see {ref}`Agent sandboxing <agentic_ai:agent_sandboxing>`.

For sign-in problems and `claude: command not found`, see the agentic AI entries in the {doc}`FAQ <../s8_support/faq>`.

```{seealso}
For a hands-on walkthrough, see {doc}`Your First Agentic Workflow on the Cluster <first_agentic_workflow>`. For prompt injection, remote control, scoping, and the agent sandbox, see {doc}`Agent Security and Scoping <agent_security_and_scoping>`. To keep everything on the cluster, see {doc}`HPC Agentic Recipes <hpc_agentic_recipes>`.
```
