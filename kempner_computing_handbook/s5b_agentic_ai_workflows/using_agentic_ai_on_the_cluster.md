# Using Agentic AI on the Cluster

This page sets up an agent on the Kempner AI cluster and covers how to run it day to day. The steps use [Claude Code](https://www.anthropic.com/claude-code) as the example; other terminal agents work the same way, and IDE agents connect through VS Code.

(agentic_ai:before_you_start)=
## Before you start

```{warning}
Cloud-based agents send your prompts, and any code or data they can read, to an external provider. FASRC permits generative AI tools on the cluster only for non-sensitive, public data (security Level 1). Do not point a cloud agent at Level 2 or higher data unless your school has arranged a contractual agreement with the provider first. See FASRC's [AI Agents guidance](https://docs.rc.fas.harvard.edu/kb/ai-agents/) and [Anthropic guidance](https://docs.rc.fas.harvard.edu/kb/anthropic/), {doc}`Agentic AI Tools <agentic_ai_tools>` for approved-tool data levels, and {doc}`Security and Compliance <../s6_security_and_compliance/README>`.
```

In practice, Level 1 means public material, such as public repositories and datasets, or made-up data. Most unpublished research code, data, and results are Level 2; see {ref}`Data classification and what the cluster can host <security_and_compliance:data_classification>`. Before you point a cloud agent at them, check with your school whether your account is covered at that level.

You also need the Claude or ChatGPT access Harvard provides (see the sign-in step below), and a compute node. Do not run agents on a login node, where their processes would compete with every other user.

(agentic_ai:running_a_terminal_agent)=
## Running a terminal agent

**1. Start tmux and an interactive job.** Start tmux on the login node, so a dropped connection does not end your session (see {ref}`Keeping a session alive <agentic_ai:keeping_a_session_alive>`). Inside it, request a job. The agent only needs CPU and memory to talk to its model, so a small CPU allocation is enough:

```bash
tmux new -s agent
salloc --partition=test --time=0-02:00 --mem=16G --cpus-per-task=4
```

Request a GPU only when the agent will run GPU code for you. For short GPU checks, the `kempner_interactive` partition offers small GPU slices; see {doc}`Understanding SLURM <../s1_high_performance_computing/general_hpc_concepts/understanding_slurm>`.

**2. Install Claude Code.**

::::{tab-set}
:::{tab-item} Native installer
```bash
curl -fsSL https://claude.ai/install.sh | bash
claude --version
```

This installs to `~/.local/bin`, which must be on your `PATH`, and updates itself. If `claude` is not found, see the {doc}`FAQ <../s8_support/faq>`.
:::
:::{tab-item} npm in a conda environment
```bash
module load python
mamba create -n claude -c conda-forge "nodejs>=22"
source activate claude
npm install -g @anthropic-ai/claude-code
```

Claude Code is then on your `PATH` only while that environment is active. See {doc}`Conda Environment <../s1_high_performance_computing/development_and_runtime_envs/using_conda_env>`.
:::
::::

If you run agents in several jobs at once, turn off automatic updates, because your home directory is shared and an update in one job can delete the version another job is running. Add this to `~/.claude/settings.json`, and run `claude update` yourself when no agent jobs are running:

```json
{
  "env": {
    "DISABLE_AUTOUPDATER": "1"
  }
}
```

A settings file holds one JSON object. When later pages add settings, merge them into that object rather than pasting a second one.

**3. Sign in with your Harvard account.** FASRC states that using personal accounts or API keys for work on the cluster is not in accordance with Harvard policy; see its [AI Agents guidance](https://docs.rc.fas.harvard.edu/kb/ai-agents/). Use the Claude or ChatGPT access that HUIT provides through Harvard SSO instead.

::::{tab-set}
:::{tab-item} Claude Code
Run `claude`, or `/login` inside a session, and log in with your Claude account. Over SSH, it prints a URL: open it in your local browser, sign in with Harvard SSO, and paste the code it shows back into the terminal. Run `/status` to check that the organization is Harvard's, not a personal one. The login is saved in your home directory, so it works on every node and in batch jobs.
:::
:::{tab-item} Codex
Run `codex login --device-auth`, open the link it prints in your local browser, sign in to ChatGPT with Harvard SSO, and enter the one-time code. Device code login is in beta, and for a workspace account such as ChatGPT Edu, the workspace admin must turn it on first. See the Codex [authentication documentation](https://learn.chatgpt.com/docs/auth).
:::
::::

Leave `ANTHROPIC_API_KEY` unset. If it is set, for example in `~/.bashrc`, Claude Code can use it instead of your Harvard login, and print mode (`claude -p`) always does.

**4. Start the agent** from your project directory. For your first sessions, use manual mode, which asks before edits and before commands that change things: `claude --permission-mode default`.

(agentic_ai:permission_modes)=
### Permission modes

Permission modes trade oversight for speed. Press `Shift+Tab` in a session to cycle through them, or choose one at startup with `--permission-mode`. New interactive sessions start in auto mode where it is available, and otherwise in manual mode.

| Mode | Value | What it does |
|---|---|---|
| Manual | `default` | Asks before file edits and commands that change things; reads and read-only commands such as `ls`, `cat`, and `grep` run without asking. The safest mode while you learn. |
| Auto-accept edits | `acceptEdits` | Applies file edits and common filesystem commands, including `rm`, inside the project without asking. |
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

A tmux session exists only on the node where you started it, and monthly maintenance reboots login nodes; see FASRC's [terminal access guide](https://docs.rc.fas.harvard.edu/kb/terminal-access/) for the login nodes and their limits. tmux does not extend your job: the session still ends at the job's `--time` limit. FASRC also ends a command-line interactive session after an hour without input. For long work you will not watch, run the agent in a batch job instead; for long interactive work, use {doc}`Open OnDemand <../s1_high_performance_computing/general_hpc_concepts/open_ondemand>`.

To pick up a conversation after your job ends, start a new job, `cd` to the same project directory, and start Claude Code there:

- `claude --continue` reopens the most recent conversation in that directory, but not one started with `claude -p`.
- `claude --resume` lets you choose an earlier conversation, or takes a session ID.

Conversations are saved under `~/.claude/projects/`, so you can resume them from any node. Background sessions (`claude --bg`) run without a terminal, but they still end when your job does, so they do not replace tmux. To check on a session from another device, reattach tmux rather than turn on remote control; see {ref}`Remote control <agentic_ai:remote_control>`.

### Long or unattended runs

For long tasks, run the agent in print mode (`claude -p`) in a batch job, with the limits in {ref}`Caps on unattended runs <agentic_ai:run_caps>`; for a complete example, see {doc}`SLURM Jobs and Cluster Workflows <slurm_jobs_and_cluster_workflows>`.

## Running an IDE agent

1. Connect VS Code to a compute node with Remote-SSH, as described in {doc}`VS Code for Remote Dev <../s1_high_performance_computing/development_and_runtime_envs/using_vscode_for_remote_development>`.
2. Install the agent's extension (for example Claude Code or Codex) with its **Install in SSH** button, so it runs on the cluster side.
3. Sign in through the extension with your Harvard account, as in {ref}`Running a terminal agent <agentic_ai:running_a_terminal_agent>`.

FASRC also documents editor and notebook extensions, including Jupyter AI in JupyterLab through {doc}`Open OnDemand <../s1_high_performance_computing/general_hpc_concepts/open_ondemand>`; see its [AI extensions guidance](https://docs.rc.fas.harvard.edu/kb/ai-extensions-on-fasrc-clusters/).

## Responsible use on shared infrastructure

- **Stay within your allocation.** Run agents in an interactive or batch job, never on a login node, and do not let an agent submit unbounded jobs or start long-running processes without your review; see {doc}`Understanding SLURM <../s1_high_performance_computing/general_hpc_concepts/understanding_slurm>`.
- **Do not hold GPUs idle.** Use a CPU allocation for reading, planning, and editing, and release sessions you are done with.
- **Review before it acts.** Read the commands an agent proposes, especially anything that deletes files, rewrites history, or moves data.
- **Watch cost and quota.** Track your account's usage limits and your fairshare; see {ref}`Watch cost and context <agentic_ai:watch_cost>`.
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
