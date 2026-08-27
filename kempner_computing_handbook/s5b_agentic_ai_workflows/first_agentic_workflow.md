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

On a compute node, not a login node, start an interactive session, move into your project directory, and launch the agent. A small CPU allocation is enough for a first run:

```bash
salloc --partition=test --time=0-02:00 --mem=16G --cpus-per-task=4
cd /path/to/your/project
claude
```

For a first run, press `Shift+Tab` until the session shows manual mode, so the agent asks before each action. Pro, Max, and Team sessions start in Auto mode, where a classifier approves routine actions for you.

## Point the agent at your work

The agent works in the directory you launched it from and reads the files there. If the project has a `CLAUDE.md`, it picks up your conventions from it; if you keep conventions in an `AGENTS.md`, bridge it to `CLAUDE.md` as described in {doc}`Configuring Agents for Your Project <configuring_agents>`.

## Give it one scoped task

Start with a single, checkable task rather than a whole project, pointed at a file you actually have. For example, with a CSV in your project:

> Summarize `data/measurements.csv`, then save a histogram of the `temperature` column to `figures/temperature_hist.png`.

Make sure the environment the agent runs in has what the task needs, here Python with pandas and matplotlib. A narrow task is easy to review and easy to verify, and it shows you how the agent behaves before you hand it anything larger.

## Review before it acts

In manual mode the agent proposes edits and commands and waits for your approval. Read them before approving, especially anything that deletes files, moves data, or installs software. This is also your defense against an agent acting on untrusted content; see the permission modes and Agent security guidance in {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`.

## Verify the result

Check the output yourself: open the figure, read the numbers, and run any tests. An agent's result is a lead to confirm, not a finding to trust. When you want to measure quality more systematically, see {doc}`Evaluating and Monitoring Agents <evaluating_and_monitoring_agents>`.

Once the task is right, refine it or move on to the next one.

```{seealso}
For the tool landscape, see {doc}`Agentic AI Tools <agentic_ai_tools>`; to configure an agent for your project, see {doc}`Configuring Agents for Your Project <configuring_agents>`; to keep everything on the cluster, see {doc}`HPC Agentic Recipes <hpc_agentic_recipes>`; and for using agents across the research process, see {doc}`Agentic AI in Research <agentic_ai_in_research>`.
```
