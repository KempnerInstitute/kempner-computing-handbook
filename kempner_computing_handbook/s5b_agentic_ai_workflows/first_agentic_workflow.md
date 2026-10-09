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

Before your first run, install and sign in to the agent, and read how to size an allocation, in {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`.

Start a tmux session on the login node, so a dropped connection does not end your work. Inside it, start an interactive job on a compute node, set up a practice folder, and launch the agent. A small CPU allocation is enough. When Claude Code first starts in a folder, it asks whether you trust it. Trust only folders whose agent configuration you know, such as your own projects; see {ref}`Untrusted repositories <agentic_ai:untrusted_repositories>`.

```bash
hostname                          # note the login node, to come back to it
tmux new -s agent
salloc --partition=test --time=0-02:00 --mem=16G --cpus-per-task=4
mkdir -p ~/agent_practice && cd ~/agent_practice
git init                          # git shows what the agent changed
module load python
python -m venv .venv && source .venv/bin/activate
pip install pandas matplotlib     # the packages the practice task needs
claude --permission-mode default  # manual mode: asks before it changes anything
```

Without `--permission-mode default`, new sessions start in auto mode where it is available, and a classifier approves routine actions for you. For a first run, manual mode lets you see each request; see {ref}`Permission modes <agentic_ai:permission_modes>`.

```{tip}
If your connection drops, SSH back to the same login node and run `tmux attach -t agent`. If the job has ended, start a new one with `salloc` and `cd` to the same folder. Load the environment again (`module load python`, then `source .venv/bin/activate`), and run `claude --continue --permission-mode default` to pick the conversation back up in manual mode; see {ref}`Keeping a session alive <agentic_ai:keeping_a_session_alive>`.
```

## Point the agent at your work

The agent works in the folder you start it in. It reads files without asking, and what it reads goes to the provider, so this first run uses a new folder and made-up data. In your own projects, commit your work before you start the agent, so you can undo its changes; see {ref}`Git as the undo layer <agentic_ai:git_undo>`. An instructions file such as `CLAUDE.md` tells the agent your conventions; see {doc}`Configuring Agents for Your Project <configuring_agents>`.

## Give it one scoped task

Start with a single, checkable task rather than a whole project:

> Create `data/measurements.csv` with 200 rows of made-up hourly temperature readings, print summary statistics, and save a histogram of the `temperature` column to `figures/temperature_hist.png`.

The agent's commands use the environment you activated before starting it. A narrow task is easy to review and to verify, and it shows you how the agent behaves before you give it anything larger.

## Review before it acts

In manual mode, the agent asks before it edits files or runs commands that change things. Read each request before you approve it, especially anything that deletes files, moves data, or installs software.

- **Stop.** Press Esc to stop the agent at any point.
- **Approve.** Choose **Yes** to approve one action. For a shell command, **Yes, and don't ask again** saves a rule that allows it from then on in this project, so avoid it while you learn.

This review is also your defense against untrusted content; see {ref}`Agent security <agentic_ai:agent_security>`.

## Verify the result

Check the output yourself: open the figure, read the numbers, and run any tests. In a test on the cluster, the agent made the file, the statistics, and a correct histogram, but named the column `temperature_c`, though the prompt asked for `temperature`. Small departures like this are what your check is for. An agent's result is a lead to confirm, not a finding to trust. When you want to measure quality more systematically, see {doc}`Evaluating and Monitoring Agents <evaluating_and_monitoring_agents>`.

Once the task is right, refine it or move on to the next one. When you are done, type `/exit` to leave Claude Code, then `exit` to end the interactive job and release its resources, and `exit` once more to close tmux.

```{seealso}
For the tool landscape, see {doc}`Agentic AI Tools <agentic_ai_tools>`; to configure an agent for your project, see {doc}`Configuring Agents for Your Project <configuring_agents>`; to keep everything on the cluster, see {doc}`HPC Agentic Recipes <hpc_agentic_recipes>`; and for using agents across the research process, see {doc}`Agentic AI in Research <agentic_ai_in_research>`.
```
