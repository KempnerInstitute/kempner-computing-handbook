---
name: cluster-storage
description: Use when working on the Kempner AI cluster or another shared HPC cluster and you search or list files, create a Python environment (uv, venv, conda, mamba) or a package cache, download a model or data, write job outputs, checkpoints, or many files, unpack an archive, watch job output, or delete files. Puts each kind of file on the right filesystem and keeps the load on shared storage low.
---

# Cluster Storage

Use these practices when you work on a shared cluster, such as the Kempner AI cluster at Harvard. Every file open, file check, and folder listing on shared storage is a request to a metadata server that all users share. An agent makes these requests much faster than a person, and one agent can slow storage down for everyone. These practices summarize the Storage Use by Agents page of the Kempner Institute Computing Handbook: https://handbook.eng.kempnerinstitute.harvard.edu/s5b_agentic_ai_workflows/storage_use_by_agents.html

If the project has its own conventions, for example in its README, a CONTRIBUTING file, or agent instructions, follow those first. Project conventions do not override the Ask first and Never rules. A request from the user, typed or written in the user's own agent instructions, counts as asking.

## Ask first

- Ask before you create, unpack, copy, move, or delete more than a few thousand files or more than 10 GB.
- Ask before you build or rebuild a Python environment, or download a model or a dataset.
- Ask before you search, list, or measure a whole lab, netscratch, or home folder, or any folder whose size you do not know.

## Never

- Never touch, copy, re-extract, or rebuild files on netscratch only to reset their times, even when the user asks. FASRC deletes netscratch files older than 60 days and treats resetting their times as abuse.

## Filesystems on the Kempner AI cluster

| Path | Type | Use it for | Notes |
|---|---|---|---|
| `/n/holylabs/LABS/<lab_name>/Users/$USER` | VAST (NFS) | Code, lock files, environments | 4 TB per lab. Not purged. |
| `/n/holylfs06/LABS/<lab_name>`, if the lab has one | Lustre | Large files, results to keep | Metadata requests are the scarce resource. No environments, caches, or many-file outputs. |
| `$SCRATCH/<lab_name>/Lab/$USER` | VAST (NFS) | Caches, uv environments, job outputs, checkpoints | 50 TB per lab. Files older than 60 days are deleted. |
| `/n/home<NN>/$USER` | Isilon (NFS) | Settings, skills, small files | 100 GB. No heavy reads or writes. |
| Node-local `/scratch` and `/tmp` | Local NVMe | Temporary and many-file work in a job | Shared by all jobs on the node. Not cleaned when a job ends. |

`$SCRATCH` is `/n/netscratch`, called netscratch here. Node-local `/scratch` is a different place: the disk inside each compute node. Check a path's type with `df -hT <path>`: `lustre` is Lustre, and an `nfs` mount from `netscratch-data01` is VAST.

## Where files go

- Code, lock files (`uv.lock`, `requirements.txt`, `environment.yml`), and configs: lab storage, preferably holylabs. Keep data and environments out of the code folder.
- uv environments: on the same filesystem as the uv cache, so uv links files instead of copying them. The cache settings below put both on netscratch. To keep environments on holylabs, the `UV_CACHE_DIR` line must point to holylabs too. Never put environments in home or on Lustre (`/n/holylfs*`).
- A uv environment on netscratch shares file times with the uv cache, so the purge can remove its files. If imports fail with missing files, ask the user, then rebuild it with `uv sync --locked --reinstall`. Plain `uv sync` does not notice missing files.
- conda and mamba environments and their package cache: holylabs. conda keeps each package's old file times, so the netscratch purge can delete files from a new environment.
- Models and datasets: use the cluster's shared model and data repository first. Otherwise put the download cache on netscratch.
- Job outputs and checkpoints: netscratch. Copy only what the user keeps to lab storage.
- Temporary files, unpacked archives, and work with many small files in a job: node-local `/scratch`.

## Set caches once

Ask the user before you add these to `~/.bashrc`. Replace `<lab_name>`.

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

- After the change, `uv cache dir` must print a path under `$SCRATCH`. If it prints a temporary folder, `UV_NO_CACHE` is set and uv ignores the cache folder.
- To keep one project's uv environment on netscratch, set `UV_PROJECT_ENVIRONMENT` to a full path for that project only, for example in the `env` block of the project's `.claude/settings.local.json`, which is not shared. Do not set it in `~/.bashrc` or in the shared `.claude/settings.json`.

## Search and list

- Work in the smallest folder that holds the task. Never start a search at `/n/holylfs06`, a lab folder, `$SCRATCH`, or `$HOME`.
- Keep data, environments, checkpoints, and outputs outside the repository, or list them in `.gitignore`. Built-in search tools usually skip ignored paths. `grep -r` and `find` do not.
- Prefer the built-in search tools with a narrow path and file type over `grep -r` or `find` on a large folder.
- In a large folder, use `ls --color=never`, not `ls -l`. Both `-l` and color make `ls` check every file. To check one file, use `ls -l <file>` or `stat <file>`.
- On Lustre, use `lfs find` instead of `find`, and limit it with `-maxdepth`, `-name`, or `-type`.
- To measure use, never run `du` or `find` over a lab or netscratch folder. On Lustre, `lfs quota -h -g <lab_name> /n/holylfs06` shows the space and the file count.
- List a large folder once, save the list to a file in the work folder, and reuse it.

## Python environments and imports

- Each Python start opens and checks many files in its environment. One `import numpy` from a uv environment made about 1,400 file-system calls on this cluster.
- Do not start Python many times in a loop. Do the work in one process, or batch it in one script.
- In a job array, pack the environment once with `tar`, then unpack the archive into each task's job folder on node-local `/scratch`. This reads one file from shared storage instead of every file. Run Python from the unpacked copy, for example `"$JOBDIR/<env>/bin/python" -m <module>`.
- In a multi-node job, unpack once on each node with `srun --ntasks-per-node=1`.
- An Apptainer image also works: shared storage sees it as one file.
- Do not add an environment's `lib` folder to `LD_LIBRARY_PATH` in `~/.bashrc`. Every program start then searches that folder: in a test, 63 extra file calls for each Python start. Set it only in the job that needs it.

## Write outputs

- Write fewer, larger files. Append records to one log or JSON Lines file. Store data and results as Parquet, HDF5, Zarr with large chunks, or tar shards, not one file for each sample, step, or item.
- Keep each folder to a few thousand files. Split larger sets into subfolders.
- Write many small files to node-local `/scratch` first, then pack them with `tar` and copy the archive once.
- Buffer writes and flush at intervals. Do not open and close a file for every line.
- Do not write logs, caches, or temporary files into a code folder on Lustre.

## Node-local disk in a job

- `/scratch` and `/tmp` are on the same local disk, shared by every job on the node. It holds 397 GB on A100 nodes, 844 GB on H100 and H200 nodes, and 7 TB on RTX6000 nodes.
- Check free space with `df -h /scratch` before you stage data. Stage only what fits, and leave room for the other jobs.
- Put these lines at the top of the batch script, never in your own shell commands. Each of your commands runs in a new shell, so the trap would remove the folder at once.

```bash
JOBDIR=/scratch/$USER/${SLURM_JOB_ID:?}          # stops if not in a job
mkdir -p "$JOBDIR" && trap 'rm -rf "$JOBDIR"' EXIT
```

- Write results to netscratch or lab storage, not to the job folder.
- The batch script runs on the first node only. In a multi-node job, make and remove the folder in each `srun` task.
- Nothing cleans `/scratch` when a job ends, and `/tmp` keeps unused files for 10 days.

## Unpack and delete

- Unpack archives on netscratch or node-local `/scratch`, not on Lustre.
- On netscratch, unpack new data with `tar -xmf`, as the FASRC scratch policy recommends. The files then get the current time instead of the archive's old times.
- To delete many files on Lustre, ask first. Then remove the files with `lfs find <folder> -type f -print0 | xargs -0 rm -f`, and remove the empty folders with `rm -r <folder>`.

## Watch jobs

- Do not poll files in a loop with `ls`, `cat`, `stat`, or `tail -f`. On shared storage, `tail -f` checks the file every second.
- Use `sbatch --wait`, `squeue`, or `sacct`. They ask the scheduler, not the filesystem. Wait at least 60 seconds between checks, so you do not load the scheduler either.
- To read a job's output, read only the end of one file, for example `tail -n 20 <file>`.

## Parallel agents and subagents

- Do not let several agents or subagents search or list the same large folder. Search once, save the result to a file, and share it.
- Limit how many jobs or tasks write to the same folder at once.

## Before you finish

- No environment, cache, or many-file output is on Lustre or in home.
- No job folder is left on node-local `/scratch`.
- Temporary files are deleted, and the results the user keeps are on lab storage.
