# Your First Agentic Workflow on the Cluster

This walkthrough runs one small agentic task end to end, so you can see the whole loop before trusting an agent with real work. It uses Claude Code as the example, but the shape is the same for any terminal agent.

```{mermaid}
flowchart LR
    A["Start a session<br/>and launch the agent"] --> B["Point it at<br/>your work"]
    B --> C["Give it one<br/>scoped task"]
    C --> D["Review<br/>before it acts"]
    D --> E["Verify<br/>the result"]
    E -->|refine| C
    classDef s fill:#14154C,color:#ffffff,stroke:#3D3E82;
    classDef v fill:#A51C30,color:#ffffff,stroke:#A51C30;
    class A,B,C,D s;
    class E v;
```

## Start a session and launch the agent

Before your first run, install and authenticate the agent, and read how to size an allocation, in {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`.

Start a tmux session on the login node, so a dropped connection does not end your work. Inside it, start an interactive session on a compute node, not the login node, move into your project directory, and launch the agent. A small CPU allocation is enough for a first run:

```bash
hostname                       # note the login node, to come back to it
tmux new -s agent
salloc --partition=test --time=0-02:00 --mem=16G --cpus-per-task=4
cd /path/to/your/project
source .venv/bin/activate      # an environment with what the task needs
claude
```

New sessions usually start in auto mode, where a classifier approves routine actions for you. For a first run, press `Shift+Tab` until the status bar shows `manual mode on`, so the agent asks before each action.

```{tip}
If your connection drops, SSH back to the same login node and run `tmux attach -t agent`. If the session itself has ended, run `claude --continue` in the same directory to pick the conversation back up; see {ref}`Keeping a session alive <agentic_ai:keeping_a_session_alive>`.
```

## Point the agent at your work

The agent works in the directory you launched it from and reads the files there. If the project has a `CLAUDE.md`, or an `AGENTS.md` and no `CLAUDE.md`, the agent picks up your conventions from it; see {doc}`Configuring Agents for Your Project <configuring_agents>`.

## Give it one scoped task

Start with a single, checkable task rather than a whole project, pointed at a file you actually have. For example, with a CSV in your project:

> Summarize `data/measurements.csv`, then save a histogram of the `temperature` column to `figures/temperature_hist.png`.

The agent's commands inherit the environment of the shell you start it from, so the environment you activated before running `claude` needs what the task needs, here Python with pandas and matplotlib. A narrow task is easy to review and easy to verify, and it shows you how the agent behaves before you hand it anything larger.

## Review before it acts

In manual mode the agent proposes edits and commands and waits for your approval. Read them before approving, especially anything that deletes files, moves data, or installs software. This is also your defense against an agent acting on untrusted content; see {ref}`Permission modes <agentic_ai:permission_modes>` and {ref}`Agent security <agentic_ai:agent_security>`.

## Verify the result

Check the output yourself: open the figure, read the numbers, and run any tests. An agent's result is a lead to confirm, not a finding to trust. When you want to measure quality more systematically, see {doc}`Evaluating and Monitoring Agents <evaluating_and_monitoring_agents>`.

Once the task is right, refine it or move on to the next one. When you are done, type `/exit` to leave Claude Code, then `exit` to end the interactive job and release its resources, and `exit` once more to close tmux.

```{seealso}
For the tool landscape, see {doc}`Agentic AI Tools <agentic_ai_tools>`; to configure an agent for your project, see {doc}`Configuring Agents for Your Project <configuring_agents>`; to keep everything on the cluster, see {doc}`HPC Agentic Recipes <hpc_agentic_recipes>`; and for using agents across the research process, see {doc}`Agentic AI in Research <agentic_ai_in_research>`.
```
