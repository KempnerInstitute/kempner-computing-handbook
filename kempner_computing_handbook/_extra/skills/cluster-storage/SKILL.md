---
name: cluster-storage
description: Use when working on the Kempner AI cluster or another shared HPC cluster and you search or list files, create a Python environment (uv, venv, conda, mamba) or a package cache, download a model or data, write job outputs, checkpoints, or many files, unpack an archive, watch job output, or delete files. Puts each kind of file on the right filesystem and keeps the load on shared storage low.
---

# Cluster Storage

Use these practices when you work on a shared cluster, such as the Kempner AI cluster at Harvard. Every file open, file check, and folder listing on shared storage is a request to a metadata server that all users share. An agent makes these requests much faster than a person, and one agent can slow storage down for everyone. These practices summarize the Storage Use by Agents page of the Kempner Institute Computing Handbook: https://handbook.eng.kempnerinstitute.harvard.edu/s5b_agentic_ai_workflows/storage_use_by_agents.html

If the project has its own conventions, for example in its README, a CONTRIBUTING file, or agent instructions, follow those first. Project conventions do not override the Ask first rules. A request from the user, typed or written in the user's own agent instructions, counts as asking.

## Ask first

- Ask before you create, unpack, copy, move, or delete more than a few thousand files or more than 10 GB.
- Ask before you build or rebuild a Python environment, or download a model or a dataset.
- Ask before you search, list, or measure a whole lab, scratch, or home folder, or any folder whose size you do not know.
- Never change file times (`touch`) on scratch to keep old files from the purge. FASRC treats this as abuse.

## Filesystems on the Kempner AI cluster

| Path | Type | Use it for | Notes |
|---|---|---|---|
| `/n/holylfs06/LABS/<lab_name>` | Lustre | Code, large files, results to keep | Metadata requests are the scarce resource. No environments, caches, or many-file outputs. |
| `/n/holylabs/LABS/<lab_name>/Users/<username>` | VAST | Code, lock files, environments | 4 TB per lab. Not purged. |
| `$SCRATCH/<lab_name>/Lab/<username>` | VAST | Environments, caches, job outputs, checkpoints | 50 TB per lab. Files older than 60 days are deleted. |
| `/n/home<NN>/<username>` | NFS | Settings, skills, small files | 100 GB. No heavy reads or writes. |
| `/scratch` and `/tmp` on a compute node | Local NVMe | Temporary and many-file work in a job | Shared by all jobs on the node. Not cleaned when a job ends. |

`$SCRATCH` is `/n/netscratch`. Check a path's type with `df -hT <path>`: `lustre` or `nfs`.

## Where files go

- Code, lock files (`uv.lock`, `requirements.txt`, `environment.yml`), configs, and results the user keeps: lab storage.
- Python environments and package caches: VAST, never home or Lustre (`/n/holylfs*`). uv environments can go on holylabs or scratch. Put conda and mamba environments on holylabs: conda keeps each package's old file times, so the scratch purge can delete files from a new environment.
- An environment on scratch is disposable. Rebuild it from the lock file, for example with `uv sync --locked`.
- Models and datasets: use the cluster's shared model and data repository first. Otherwise put the download cache on scratch.
- Job outputs and checkpoints: scratch. Copy only what the user keeps to lab storage.
- Temporary files, unpacked archives, and work with many small files in a job: node-local `/scratch`.

## Set caches once

Ask the user before you add these to `~/.bashrc` or to the project's environment file. Replace `<lab_name>` and `<username>`.

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
```

- Keep the uv cache and the environment on the same filesystem, so uv links files instead of copying them.
- To keep a uv project's code on Lustre but its environment on scratch, set `UV_PROJECT_ENVIRONMENT=$S/envs/<project>` in the project's environment file, not in `~/.bashrc`.
- Set `UV_COMPILE_BYTECODE=1`, so uv writes the `.pyc` files once at install time instead of on the first import of each job.

## Search and list

- Work in the smallest folder that holds the task. Never start a search at `/n/holylfs06`, a lab folder, `$SCRATCH`, or `$HOME`.
- Keep data, environments, checkpoints, and outputs outside the repository, or list them in `.gitignore`. Built-in search tools usually skip ignored paths. `grep -r` and `find` do not.
- Prefer the built-in search tools with a narrow path and file type over `grep -r` or `find` on a large folder.
- In a large folder, use `ls` without `-l`. On Lustre, `-l` costs extra requests for every file. To check one file, use `ls -l <file>` or `stat <file>`.
- On Lustre, use `lfs find` instead of `find`, and limit it with `-maxdepth`, `-name`, or `-type`.
- To measure use, never run `du` or `find` over a lab or scratch folder. On Lustre, `lfs quota -h -g <lab_group> /n/holylfs06` shows the space and the file count.
- List a large folder once, save the list to a file in the work folder, and reuse it.

## Python environments and imports

- Each Python start opens and checks many files in its environment. One `import numpy` from a uv environment made about 1,400 file-system calls on this cluster.
- Do not start Python many times in a loop. Do the work in one process, or batch it in one script.
- For job arrays and multi-node jobs, build or copy the environment to node-local `/scratch` at the start of each job, or use an Apptainer image, which shared storage sees as one file.
- If imports fail with missing files after a scratch purge, rebuild the environment from the lock file.

## Write outputs

- Write fewer, larger files. Append records to one log or JSON Lines file. Store data and results as Parquet, HDF5, Zarr with large chunks, or tar shards, not one file for each sample, step, or item.
- Keep each folder to a few thousand files. Split larger sets into subfolders.
- Write many small files to node-local `/scratch` first, then pack them with `tar` and copy the archive once.
- Buffer writes and flush at intervals. Do not open and close a file for every line.
- Do not write logs, caches, or temporary files into a code folder on Lustre.

## Node-local disk in a job

- `/scratch` and `/tmp` are on the same local disk, shared by every job on the node. It holds about 400 GB on A100 nodes, 840 GB on H100 and H200 nodes, and 7 TB on RTX6000 nodes.
- Check free space with `df -h /scratch` before you stage data. Stage only what fits, and leave room for the other jobs.
- Make one folder for the job, and remove it when the job ends:

```bash
JOBDIR=/scratch/$USER/$SLURM_JOB_ID
mkdir -p "$JOBDIR" && trap 'rm -rf "$JOBDIR"' EXIT
```

- Nothing cleans `/scratch` when a job ends, and `/tmp` keeps unused files for 10 days. Copy results out before the job ends.

## Unpack and delete

- Unpack archives on scratch or node-local `/scratch`, not on Lustre.
- On scratch, unpack with `tar -xmf`, so the files get the current time. Archive times can put new files in the next purge.
- To delete many files on Lustre, ask first. Then use `lfs find <folder> -type f -print0 | xargs -0 rm -f` instead of `rm -rf` on a large tree.

## Watch jobs

- Do not poll files in a loop with `ls`, `cat`, `stat`, or `tail -f`. On shared storage, `tail -f` checks the file every second.
- Use `sbatch --wait`, `squeue`, or `sacct`. They ask the scheduler, not the filesystem.
- If you must read a job's output, wait at least 60 seconds between checks, and read only the end of one file, for example `tail -n 20 <file>`.

## Parallel agents and subagents

- Do not let several agents or subagents search or list the same large folder. Search once, save the result to a file, and share it.
- Limit how many jobs or tasks write to the same folder at once.

## Before you finish

- No environment, cache, or many-file output is on Lustre or in home.
- No job folder is left on node-local `/scratch`.
- Temporary files are deleted, and the results the user keeps are on lab storage.
