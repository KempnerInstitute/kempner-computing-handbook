(agentic_ai:storage_use_by_agents)=
# Storage Use by Agents

An agent reads, lists, and writes files much faster than a person. On shared storage, every file open, file check, and folder listing is a request to a metadata server that all users share. On `holylfs06`, the heaviest agent in one lab made 10,100 metadata operations per second, and the next two made 6,600 and 4,900. Load like this slows storage down for everyone on the cluster.

This page shows where an agent's files belong and how to keep its storage load low. The {ref}`cluster-storage skill <agentic_ai:cluster_storage_skill>` gives the same rules to the agent itself.

## Why agents load storage

- **Searches and listings.** A search of a large folder checks every file in it. `grep -r`, `find`, `ls -l`, or `du` on a lab folder can make millions of requests.
- **Python starts.** One `import numpy` from a uv environment made about 1,400 file-system calls on this cluster. A job array of 1,000 tasks makes about 1.4 million before any work starts.
- **Many small files.** Each new file costs requests to create, write, and close it. One file for each sample or step multiplies them.
- **Polling.** `ls` or `cat` in a loop checks files again and again. On shared storage, `tail -f` checks its file every second.
- **Parallel agents.** Subagents and parallel jobs repeat the same searches.

## Where files go

| Location | Filesystem | Use it for | Limits |
|---|---|---|---|
| `/n/holylfs06/LABS/<lab_name>` | Lustre | Code, large files, results you keep | Not for environments, caches, or many-file outputs |
| `/n/holylabs/LABS/<lab_name>/Users/<username>` | VAST | Code, lock files, environments | 4 TB per lab, not purged |
| `$SCRATCH/<lab_name>/Lab/<username>` | VAST | Environments, caches, job outputs, checkpoints | 50 TB per lab, files older than 60 days are deleted |
| `/n/home<NN>/<username>` | NFS | Settings, skills, small files | 100 GB |
| `/scratch` and `/tmp` on a compute node | Local NVMe | Temporary and many-file work in a job | Shared by all jobs on the node |

VAST handles many small files well, and Lustre is built for large files. Check a path's type with `df -hT <path>`: `lustre` or `nfs`. See {doc}`Storage Options <../s1_high_performance_computing/storage_and_data_transfer/understanding_storage_options>` for the details of each location.

- **uv environments.** Put them on holylabs or scratch. uv gives installed files the current time, so a new environment on scratch is safe until the purge window passes.
- **conda and mamba environments.** Put them on holylabs. conda keeps each package's file times: in a new test environment, `six.py` kept its package's 2025 date. On scratch, the purge can delete such files from an environment you built today.
- **Lock files.** Keep them with the code on lab storage. Rebuild an environment on scratch with `uv sync --locked` when you need it.
- **Models and datasets.** Use the {doc}`shared repository <../s1_high_performance_computing/storage_and_data_transfer/shared_data_repository>` first, and download to scratch only what it does not hold.

## Set up once

Point package, model, and tool caches at scratch. Add these lines to `~/.bashrc`, with your lab and user name:

```bash
S=$SCRATCH/<lab_name>/Lab/<username>
export UV_CACHE_DIR=$S/cache/uv
export PIP_CACHE_DIR=$S/cache/pip
export CONDA_PKGS_DIRS=$S/cache/conda-pkgs
export HF_HOME=$S/cache/huggingface
export TORCH_HOME=$S/cache/torch
export TRITON_CACHE_DIR=$S/cache/triton
export WANDB_DIR=$S/wandb
export WANDB_CACHE_DIR=$S/cache/wandb
export UV_COMPILE_BYTECODE=1    # write .pyc files once at install, not on the first import of each job
```

For a uv project whose code is on `holylfs06`, also set `UV_PROJECT_ENVIRONMENT=$S/envs/<project>` in the project's own environment file. The environment then lives on scratch next to the uv cache, so uv links package files instead of copying them.

## Agent habits and what to do instead

| Habit | Instead |
|---|---|
| Searching from a lab folder or `$HOME` | Start the agent in the project folder. Keep data and environments out of the repository, or list them in `.gitignore`. |
| `ls -l`, `du`, or `find` on a large folder | Use `ls`, and `lfs find` on Lustre. Check use with `lfs quota`. List a large folder once and save the list. |
| Many short Python runs | Do the work in one process. For job arrays, put the environment on node-local `/scratch` or use an Apptainer image. |
| One file for each sample or step | Append to one JSON Lines file, or use Parquet, HDF5, or tar shards. |
| Unpacking archives on Lustre | Unpack on scratch with `tar -xmf`, so files get the current time, or on node-local `/scratch`. |
| Polling output with `ls` or `tail -f` | Use `sbatch --wait`, `squeue`, or `sacct`, or wait at least 60 seconds between checks. |
| Several agents searching the same folder | Search once and share the result. |

(agentic_ai:node_local_disk)=
## Node-local disk

Each GPU node has a local NVMe disk at `/scratch`, and `/tmp` is a folder on the same disk.

| GPU nodes | Local disk |
|---|---|
| A100 (`kempner`) | 397 GB |
| H100 (`kempner_h100`, `kempner_cpu`) | 844 GB |
| H200 (`kempner_h200`) | 844 GB |
| RTX6000 (`kempner_rtx`) | 7 TB |

Every job on a node shares this disk, including jobs of other users on the node's other GPUs. Nothing cleans `/scratch` when a job ends, and `/tmp` keeps unused files for 10 days. Check the free space, make one folder for your job, and remove it when the job ends:

```bash
df -h /scratch                                   # free space, shared with other jobs
JOBDIR=/scratch/$USER/$SLURM_JOB_ID
mkdir -p "$JOBDIR" && trap 'rm -rf "$JOBDIR"' EXIT
```

Copy results you keep to scratch or lab storage before the job ends.

## Claude Code settings

- **Start in the project folder.** Claude Code can read everything under the folder where it starts.
- **Ignore large folders.** Claude Code's content search skips paths in `.gitignore`. `grep -r` and `find` in Bash do not, so keep data and environments outside the project when you can.
- **Deny reads of data folders.** Rules such as `"Read(./data/**/*)"` under `permissions.deny` in `.claude/settings.json` keep the file tools out of a folder; see {ref}`Guardrails <agentic_ai:guardrails>`. A Bash `grep -r` or `find` still walks it.

See [Claude Code in large codebases](https://code.claude.com/docs/en/large-codebases) for more settings.

## Check your use

- **Lustre space and file count.** Run `lfs quota -h -g <lab_group> /n/holylfs06`. The `files` column counts every file and folder your lab holds there.
- **Scratch.** Do not run `du` on a lab's scratch folder. Measure only the folder you need.
- **Metadata load.** Kempner staff watch the metadata load of each user and may contact you about an agent that loads storage heavily.

(agentic_ai:cluster_storage_skill)=
## The cluster-storage skill

The `cluster-storage` skill gives an agent the rules on this page. Install it on the cluster, where the agent runs:

::::{tab-set}
:::{tab-item} Claude Code
```bash
mkdir -p ~/.claude/skills/cluster-storage
curl -fsSL https://handbook.eng.kempnerinstitute.harvard.edu/skills/cluster-storage/SKILL.md \
  -o ~/.claude/skills/cluster-storage/SKILL.md
```
:::
:::{tab-item} Codex
```bash
mkdir -p ~/.agents/skills/cluster-storage
curl -fsSL https://handbook.eng.kempnerinstitute.harvard.edu/skills/cluster-storage/SKILL.md \
  -o ~/.agents/skills/cluster-storage/SKILL.md
```
:::
::::

Read a skill before you install it. See {doc}`Coding Agent Skills <../s2_swe_for_research/coding_agent_skills>` for how to install skills for one project and how to use them.

:::{dropdown} The cluster-storage skill
```{literalinclude} ../_extra/skills/cluster-storage/SKILL.md
:language: markdown
```
:::
