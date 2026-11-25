(agentic_ai:storage_use_by_agents)=
# Storage Use by Agents

An agent reads, lists, and writes files much faster than a person. On shared storage, every file open, file check, and folder listing is a request to a metadata server that all users share. On `holylfs06`, the heaviest agent in one lab made 10,100 metadata operations per second, and the next two made 6,600 and 4,900. Load like this slows storage down for everyone on the cluster.

This page shows where an agent's files belong and how to keep its storage load low. The {ref}`cluster-storage skill <agentic_ai:cluster_storage_skill>` gives the same rules to the agent itself. On this page, netscratch (`$SCRATCH`, which is `/n/netscratch`) is the shared scratch filesystem, and node-local `/scratch` is the disk inside each compute node.

## Why agents load storage

- **Searches and listings.** A search of a large folder checks every file in it. `grep -r`, `find`, `ls -l`, or `du` on a lab folder can make millions of requests.
- **Python starts.** One `import numpy` from a uv environment made about 1,400 file-system calls on this cluster, including the first writes of its `.pyc` files. A job array of 1,000 tasks can make up to 1.4 million calls before any work starts.
- **Many small files.** Each new file costs requests to create, write, and close it. One file for each sample or step multiplies them.
- **Polling.** `ls` or `cat` in a loop checks files again and again. On shared storage, `tail -f` checks its file every second.
- **Parallel agents.** Subagents and parallel jobs repeat the same searches.

## Where files go

| Location | Filesystem | Use it for | Limits |
|---|---|---|---|
| `/n/holylabs/LABS/<lab_name>/Users/$USER` | VAST (NFS) | Code, lock files, environments | 4 TB per lab, not purged |
| `/n/holylfs06/LABS/<lab_name>`, if your lab has one | Lustre | Large files, results you keep | Not for environments, caches, or many-file outputs |
| `$SCRATCH/<lab_name>/Lab/$USER` | VAST (NFS) | Caches, uv environments, job outputs, checkpoints | 50 TB per lab, files older than 60 days are deleted |
| `/n/home<NN>/$USER` | Isilon (NFS) | Settings, skills, small files | 100 GB |
| Node-local `/scratch` and `/tmp` | Local NVMe | Temporary and many-file work in a job | Shared by all jobs on the node |

VAST handles many small files well. Lustre works best with large files, and an agent's searches of many small files cost the most there. When you can, run the agent in a project folder on holylabs. Keep data and environments out of that folder.

Your lab name is usually one of the groups that `id -Gn` lists. To check a path, run `df -hT <path>`. The type `lustre` is Lustre, and an `nfs` mount from `netscratch-data01` is VAST. See {doc}`Storage Options <../s1_high_performance_computing/storage_and_data_transfer/understanding_storage_options>` for the details of each location.

```{warning}
Starting with the December 7, 2026 maintenance, FASRC deletes netscratch files older than 60 days (90 days before that). Never touch, copy, re-extract, or rebuild files on netscratch only to reset their times. FASRC treats this as abuse; see the [FASRC scratch policy](https://docs.rc.fas.harvard.edu/kb/policy-scratch/).
```

- **uv environments.** Keep each environment and the uv cache on the same filesystem, so uv links files instead of copying them. The setup below puts both on netscratch, which has more space. To keep environments on holylabs past the purge, change the `UV_CACHE_DIR` line to a holylabs folder, as in {doc}`uv Environment <../s1_high_performance_computing/development_and_runtime_envs/using_uv_env>`.
- **uv on netscratch.** Linked files keep the times of the cache, so the purge can remove files from an environment you built today. Keep the lock file with the code. When files are missing, rebuild with `uv sync --locked --reinstall`, which also refreshes the cache.
- **conda and mamba environments.** Put the environments and the package cache on holylabs, as in {doc}`Conda Environment <../s1_high_performance_computing/development_and_runtime_envs/using_conda_env>`. conda keeps each package's file times: in a new test environment, `six.py` kept its package's 2025 date, so the netscratch purge could delete it at once.
- **Models and datasets.** Use the {doc}`shared repository <../s1_high_performance_computing/storage_and_data_transfer/shared_data_repository>` first. Download to netscratch only what it does not hold.

## Set up once

Point the tool caches at netscratch, and keep your Hugging Face token in your home folder. Add these lines to `~/.bashrc`. Replace `<lab_name>` with your lab's folder name, and if your folder under `Users` on holylabs does not exist, ask FASRC to create it:

```bash
S=$SCRATCH/<lab_name>/Lab/$USER
export UV_CACHE_DIR=$S/cache/uv
export UV_COMPILE_BYTECODE=1                    # compile .pyc files at install, not in many tasks at once
export UV_PYTHON_INSTALL_DIR=/n/holylabs/LABS/<lab_name>/Users/$USER/uv-python   # uv's Python builds, off home
export PIP_CACHE_DIR=$S/cache/pip
export HF_HOME=$S/cache/huggingface
export HF_TOKEN_PATH=$HOME/.cache/huggingface/token   # the token stays in home
export TORCH_HOME=$S/cache/torch
export TRITON_CACHE_DIR=$S/cache/triton
export WANDB_DIR=$S/wandb
export WANDB_CACHE_DIR=$S/cache/wandb
```

Then load the settings and check them. `uv cache dir` must print a path under `$SCRATCH`. If it prints a temporary folder, remove `UV_NO_CACHE` from your settings. Restart running agents, so they get the new settings.

```bash
source ~/.bashrc
mkdir -p "$S" && uv cache dir
```

To keep a project's uv environment on netscratch, next to the uv cache, set `UV_PROJECT_ENVIRONMENT` for that project only. Use the full path. For Claude Code, add it to the `env` block of the project's `.claude/settings.local.json`, which holds your own settings and is not shared. JSON does not expand `$USER`, so write your user name:

```json
{
  "env": {
    "UV_PROJECT_ENVIRONMENT": "/n/netscratch/<lab_name>/Lab/<username>/envs/<project>"
  }
}
```

When you run uv yourself in that project, export the same variable in your shell first.

## Agent habits and what to do instead

| Habit | Instead |
|---|---|
| Searching from a lab folder or `$HOME` | Start the agent in the project folder. Keep data and environments out of it, or list them in `.gitignore`. |
| `ls -l` in a large folder | Use `ls --color=never`. Check one file with `ls -l <file>`. |
| `find` or `du` on a large folder | On Lustre, use `lfs find` instead of `find`. Check use with `lfs quota`. List a large folder once and save the list. |
| Many short Python runs | Do the work in one process. |
| A job array that reads the environment in every task | Unpack one packed copy of it into each task's job folder on node-local `/scratch`; see {ref}`One environment archive <agentic_ai:environment_archive>`. Or use an {doc}`Apptainer <../s1_high_performance_computing/development_and_runtime_envs/containerization>` image. See {doc}`Array Jobs <../s1_high_performance_computing/general_hpc_concepts/array_jobs>`. |
| One file for each sample or step | Append records to one JSON Lines file. Store data as Parquet, HDF5, or tar shards. |
| Unpacking archives on Lustre | Unpack on netscratch with `tar -xmf`, which the FASRC policy recommends for new data, or on node-local `/scratch`. |
| Polling output with `ls` or `tail -f` | Use `sbatch --wait`, `squeue`, or `sacct`. Wait at least 60 seconds between checks. |
| Several agents searching the same folder | Search once and share the result. |
| An environment's `lib` folder in `LD_LIBRARY_PATH` in `~/.bashrc` | Every program start searches that folder: in a test, 63 extra file calls for each Python start. Set it only in the job that needs it. |

(agentic_ai:node_local_disk)=
## Node-local disk

Each compute node has a local NVMe disk at `/scratch`, and `/tmp` is a folder on the same disk.

| Nodes | Local disk |
|---|---|
| A100 (`kempner`) | 397 GB |
| H100 (`kempner_h100`, and `kempner_cpu`, which runs on them) | 844 GB |
| H200 (`kempner_h200`) | 844 GB |
| RTX6000 (`kempner_rtx`) | 7 TB |

Every job on a node shares this disk, including jobs of other users on the node's other GPUs. Nothing cleans `/scratch` when a job ends, and `/tmp` keeps unused files for 10 days. Put these lines at the top of your batch script, not in an agent's command: each agent command runs in a new shell, so the trap would remove the folder at once.

```bash
df -h /scratch                                   # free space, shared with other jobs
JOBDIR=/scratch/$USER/${SLURM_JOB_ID:?}          # stops if not in a job
mkdir -p "$JOBDIR" && trap 'rm -rf "$JOBDIR"' EXIT
```

Write results you keep to netscratch or lab storage, not to the job folder. The batch script runs on the first node of a job. In a multi-node job, make and remove the folder in each `srun` task.

(agentic_ai:environment_archive)=
### One environment archive for a job array

Each task of a job array is a separate job. Without an archive, each task reads every file of the environment from shared storage. Pack a uv or venv environment once, before you submit the array:

```bash
cd $SCRATCH/<lab_name>/Lab/$USER/envs
tar -cf <env>.tar <env>
```

In the array's batch script, after the job folder lines above, unpack the archive and run Python from the copy:

```bash
tar -C "$JOBDIR" -xf $SCRATCH/<lab_name>/Lab/$USER/envs/<env>.tar
"$JOBDIR/<env>/bin/python" train.py
```

Each task then reads one archive file instead of the environment's many files. Commands that the environment installs, such as `pytest`, still point to the old path, so run them as `"$JOBDIR/<env>/bin/python" -m pytest`. Pack the archive again after you change the environment. For a conda environment, use [conda-pack](https://conda.github.io/conda-pack/) instead.

## Claude Code settings

- **Start in the project folder.** Claude Code can read everything under the folder where it starts.
- **Ignore large folders.** Claude Code's content search skips paths in `.gitignore`. `grep -r` and `find` in Bash do not, so keep data and environments outside the project when you can.
- **Deny reads of data folders.** A rule such as `"Read(./data/**/*)"` under `permissions.deny` in `.claude/settings.json` keeps the file tools out of a folder; see {ref}`Guardrails <agentic_ai:guardrails>`. A Bash `grep -r` or `find` still walks it.

See [Claude Code in large codebases](https://code.claude.com/docs/en/large-codebases) for more settings.

## Check your use

- **Lustre space and file count.** Run `lfs quota -h -g <lab_name> /n/holylfs06`. The `files` column counts every file and folder your lab holds there.
- **VAST.** `df` on a holylabs or netscratch folder shows the whole filesystem, not your lab's use. Do not run `du` on a lab's folder. Measure only the folder you need.
- **Metadata load.** Kempner staff watch the metadata load of each user and may contact you about an agent that loads storage heavily.

(agentic_ai:cluster_storage_skill)=
## The cluster-storage skill

The `cluster-storage` skill gives an agent the rules on this page. Read a skill before you install it. Install it on the cluster, where the agent runs:

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

See {doc}`Coding Agent Skills <../s2_swe_for_research/coding_agent_skills>` for how to install skills for one project and how to use them.

:::{dropdown} The cluster-storage skill
```{literalinclude} ../_extra/skills/cluster-storage/SKILL.md
:language: markdown
```
:::
