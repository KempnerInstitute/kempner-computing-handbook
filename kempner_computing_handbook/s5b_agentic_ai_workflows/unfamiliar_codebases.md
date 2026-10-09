# Working with Unfamiliar Research Codebases

Joining a project, inheriting a collaborator's code, or building on a published repository all start with a lot of code you did not write. An agent is good at the first pass: it reads the whole tree, maps how the pieces connect, and points you to the lines that matter. Read before you run, and run small before you run big. This page uses [KempnerForge](https://github.com/KempnerInstitute/KempnerForge), the Kempner Institute's framework for fault-tolerant distributed training of foundation models, as a worked example; for what it does, see {doc}`KempnerForge <../s3_ai_workflows/kempnerforge>`.

```{mermaid}
flowchart LR
    R["Read-only map<br/>with citations"] --> S["Smoke test on a<br/>small allocation"]
    S --> T["Trace one<br/>question"]
    T --> N["Record what you<br/>learned in AGENTS.md"]
    classDef s fill:#14154C,color:#ffffff,stroke:#3D3E82;
    classDef v fill:#A51C30,color:#ffffff,stroke:#A51C30;
    class R,T,N s;
    class S v;
```

## Start read-only

Clone the repository into your lab or scratch space. Before you start an agent in it, read its agent configuration: project instructions (`CLAUDE.md` or `AGENTS.md`), hooks in `.claude/settings.json`, MCP servers in `.mcp.json`, and skills in `.claude/skills/`. Treat these files like code you are about to run, and accept Claude Code's trust prompt only after you have read them; see {ref}`Untrusted repositories <agentic_ai:untrusted_repositories>`.

Then start the agent in plan mode (`--permission-mode plan`, or `Shift+Tab` in a session), so it explores without editing files. Where auto mode is available, a classifier can still approve shell commands during planning. To rule them out, start the agent with `--tools "Read,Grep,Glob"`, which leaves it only the built-in tools that read and search.

If the repository ships its own agent tooling, read it before you use it. KempnerForge, for example, includes a Claude Code plugin with skills for setup, smoke tests, SLURM launches, and an architecture walkthrough, plus a `codebase-map.json` of its source, scripts, and tests. This page does the same steps by hand, so they carry over to repositories without such tooling.

## Map the architecture

Ask for a map with citations, so every claim points to a file you can open:

> Give me a map of this repository: what each top-level directory and package does, the entry points, and how a training run gets from the command line to the training loop. Cite a file path for every claim. Do not change anything.

For KempnerForge, a good map says:

- `scripts/train.py` loads a TOML configuration with `load_config` from `kempnerforge.config.loader` and passes it to `run_training` in `kempnerforge.training`.
- The package is split into `config`, `data`, `model`, `distributed`, `training`, `checkpoint`, `metrics`, `profiling`, and `resilience`.
- Configurations live under `configs/model/`, `configs/train/`, and `configs/cluster/`.
- Tests are grouped into unit, integration, smoke, end-to-end, and distributed suites.

Open two or three cited files and confirm what the agent said. An agent can describe a plausible architecture that is not the one in front of you, and the citations make that checkable.

## Run a smoke test on a small allocation

Once you understand the shape of the code, run its smallest configuration on one GPU. Exit the agent (`/exit`) and the job it ran in, then start a GPU job and resume the conversation in manual mode:

```bash
salloc --partition=kempner_rtx --account=<your_account> --gres=gpu:1 --cpus-per-task=8 --mem=32G --time=01:00:00
cd <clone_dir>
claude --continue --permission-mode default   # same conversation, without plan mode or the --tools limit
```

The agent can now run commands, and it asks before edits and before commands that change things. Build the environment on this node, not on a login node, and keep package caches out of your home directory, which has a 100 GB quota; see {doc}`uv Environment <../s1_high_performance_computing/development_and_runtime_envs/using_uv_env>`.

```bash
export UV_CACHE_DIR=<lab_or_scratch_dir>/.uv-cache   # off home, same filesystem as the clone
uv sync                                                # install the environment
uv run python scripts/check_env.py                     # the repository's preflight check
uv run python scripts/train.py configs/train/debug.toml   # 100 steps of a 20M-parameter model
```

On one RTX6000 GPU, the debug run finished 100 steps in under a minute, at about 395,000 tokens per second, and saved checkpoints at steps 50 and 100. The repository's batch script runs the same configuration on four GPUs. Options on the `sbatch` command line override its placeholder `#SBATCH` lines, so you can run it unedited:

```bash
sbatch --partition=kempner_rtx --account=<your_account> --time=00:20:00 --mem=128G \
  scripts/slurm/singlenode.sh configs/train/debug.toml --checkpoint.dir=checkpoints/debug_4gpu
```

The last argument matters. KempnerForge resumes automatically from checkpoints in its checkpoint directory. The first 4-GPU attempt reused the single-GPU run's directory, found its step-100 checkpoint, and finished at once without training. With its own directory, the second attempt trained all 100 steps on four GPUs. A smoke test that finishes suspiciously fast may have resumed from an earlier run, and an agent reading the code should catch this. Let the agent run these steps with your approval, and compare its account with the logs.

## Trace one question end to end

Narrow questions get better answers than "explain everything", and the best ones come from what you see when you run the code. The smoke test raised two:

::::{tab-set}
:::{tab-item} An unknown GPU warning
```text
WARNING  Unknown GPU: NVIDIA RTX PRO 6000 Blackwell Server Edition (cc 12.0). Using estimated 989.0 bf16 TFLOPS. Add this GPU to _GPU_PEAK_TFLOPS for accuracy.
```

> Where does this warning come from, what does it affect, and what would fixing it involve?

The answer to check: `kempnerforge/metrics/mfu.py` looks the GPU up in a `_GPU_PEAK_TFLOPS` table to compute model FLOPs utilization (MFU). The RTX6000 is not in the table, so the reported MFU rests on an estimate. It affects the MFU number in the logs, not training.
:::
:::{tab-item} A loss that never moves
The debug run logged a loss of 10.4375 at every step.

> The loss never moves from 10.44 in the debug run. Is that a bug?

The answer to check: no. With no dataset configured, the training loop feeds random token IDs (`torch.randint` in `kempnerforge/training/loop.py`), so there is nothing to learn. The loss stays near ln(32000), about 10.37, the value for guessing uniformly among the 32,000 tokens in the vocabulary.
:::
::::

A flat loss sounds like a bug and is expected here; the opposite also happens, when an agent explains a real bug away as expected behavior. Either way, confirm the explanation in the code before you accept it.

## Record what you learned

Have the agent write down what you learned while it is still in context:

> Write a short AGENTS.md for this repository with the install, test, and smoke-test commands that worked on the cluster, a one-paragraph map of the code, and the gotchas we hit. Keep it under 60 lines.

Review it before you commit it. Claude Code reads `AGENTS.md` only when the repository has no `CLAUDE.md`, so if it has one, add the line `@AGENTS.md` to it. The next session, yours or a labmate's, then starts from what you know; see {doc}`Configuring Agents for Your Project <configuring_agents>`.

## Before you rely on your understanding

- Every claim the agent made about the code is backed by a file you opened.
- The smoke test ran on the cluster, and its numbers make sense for the configuration.
- What you still do not know is written down as questions for the authors, not guessed.

```{seealso}
To change the code once you understand it, see {doc}`Refactoring Research Code into Packages <refactoring_into_packages>`. For running and debugging jobs, see {doc}`SLURM Jobs and Cluster Workflows <slurm_jobs_and_cluster_workflows>`.
```
