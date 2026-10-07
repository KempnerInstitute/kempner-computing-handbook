# Working with Unfamiliar Research Codebases

Joining a project, inheriting a collaborator's code, and building on a published repository all start the same way: with a lot of code you did not write. An agent is good at the first pass. It can read the whole tree, map how the pieces connect, and point you to the lines that matter, much faster than you can by reading alone. The rule for this stage is to read before you run, and run small before you run big. This page uses KempnerForge, the Kempner Institute's PyTorch-native framework for fault-tolerant distributed training of foundation models, as a worked example; for what KempnerForge does, see {doc}`KempnerForge <../s3_ai_workflows/kempnerforge>`.

```{mermaid}
flowchart LR
    R["Read-only map<br/>with citations"] --> T["Trace one<br/>question"]
    T --> S["Smoke test on a<br/>small allocation"]
    S --> N["Record what you<br/>learned in AGENTS.md"]
    classDef s fill:#14154C,color:#ffffff,stroke:#3D3E82;
    classDef v fill:#A51C30,color:#ffffff,stroke:#A51C30;
    class R,T,N s;
    class S v;
```

## Start read-only

Clone the repository into your lab or scratch space, then start the agent in plan mode (`Shift+Tab`, or `--permission-mode plan`), so it researches without editing files while it explores. Where auto mode is available, a classifier can still approve shell commands during planning, so watch what it runs, or start it with `--tools "Read,Grep,Glob"` to allow only reading and searching.

Before you start an agent inside a repository you did not write, read its agent configuration. A repository can ship project instructions (`CLAUDE.md` or `AGENTS.md`), hooks in `.claude/settings.json`, MCP servers in `.mcp.json`, and skills in `.claude/skills/`. Instructions load into every session, and in print mode Claude Code runs the hooks and starts the servers without asking, unless you add `--setting-sources user`. Treat these files like any other code you are about to execute.

If the repository ships its own agent tooling, use it. KempnerForge includes a Claude Code plugin whose skills drive first-run setup, smoke tests, SLURM launches, and an architecture walkthrough, each gated on a shared preflight check, plus a machine-readable `codebase-map.json` of its source, scripts, and tests. Its `docs/claude-ready.md` explains how to install the plugin. This page does the same steps by hand, so they carry over to repositories without such tooling.

## Map the architecture

Ask for a map with citations, so every claim points at a file you can open:

> Give me a map of this repository: what each top-level directory and package does, the entry points, and how a training run gets from the command line to the training loop. Cite a file path for every claim. Do not change anything.

For KempnerForge, a good map says that `scripts/train.py` loads a TOML configuration with `load_config` from `kempnerforge.config.loader` and hands it to `run_training` in `kempnerforge.training`, that the package is split into `config`, `data`, `model`, `distributed`, `training`, `checkpoint`, `metrics`, `profiling`, and `resilience`, that configurations live under `configs/model/`, `configs/train/`, and `configs/cluster/`, and that tests are grouped into unit, integration, smoke, end-to-end, and distributed suites. Open two or three of the cited files and confirm what the agent said. An agent can describe a plausible architecture that is not the one in front of you, and the citations are what make that checkable.

## Trace one question end to end

Narrow questions get better answers than "explain everything". Good questions come from what you actually see when you run the code. The single-GPU smoke test below printed this warning:

```text
WARNING  Unknown GPU: NVIDIA RTX PRO 6000 Blackwell Server Edition (cc 12.0). Using estimated 989.0 bf16 TFLOPS. Add this GPU to _GPU_PEAK_TFLOPS for accuracy.
```

> Where does this warning come from, what does it affect, and what would fixing it involve?

The answer to check: `kempnerforge/metrics/mfu.py` looks the GPU up in a `_GPU_PEAK_TFLOPS` table to compute model FLOPs utilization (MFU), the RTX6000 is not in the table, so the reported MFU rests on an estimate. It affects the MFU number in the logs, not training itself.

The same run logged a loss of 10.4375 at every step:

> The loss never moves from 10.44 in the debug run. Is that a bug?

The answer to check: no. With no dataset configured, the training loop feeds random token IDs (`torch.randint` in `kempnerforge/training/loop.py`), so there is nothing to learn, and the loss stays near ln(32000), about 10.37, the value for guessing uniformly among the 32,000 tokens in the vocabulary. A flat loss sounds like a bug and here is expected; the opposite also happens, where an agent explains a real bug away as expected behavior. Either way, confirm the explanation in the code before you accept it.

## Run a smoke test on a small allocation

Once you understand the shape of the code, run its smallest configuration on the cluster, in an interactive job with one GPU. Build the environment there rather than on a login node, and keep package caches out of your home directory, which has a 100 GB quota; see {doc}`uv Environment <../s1_high_performance_computing/development_and_runtime_envs/using_uv_env>`.

```bash
export UV_CACHE_DIR=<lab_or_scratch_dir>/.uv-cache   # off home, same filesystem as the clone
uv sync                                                # install the environment
uv run python scripts/check_env.py                     # the repository's preflight check
uv run python scripts/train.py configs/train/debug.toml   # 100 steps of a 20M-parameter model
```

On one RTX6000 GPU, the debug run finished 100 steps in under a minute, at about 395,000 tokens per second, and saved checkpoints at steps 50 and 100. The repository's batch script runs the same configuration on four GPUs. Its `#SBATCH` lines hold placeholders for the partition and account, and options on the `sbatch` command line override them, so you can run it unedited:

```bash
sbatch --partition=kempner --account=<your_account> --time=00:20:00 --mem=128G \
  scripts/slurm/singlenode.sh configs/train/debug.toml --checkpoint.dir=checkpoints/debug_4gpu
```

The last argument matters, and it is the kind of detail an agent should catch while reading the code. KempnerForge resumes automatically from checkpoints in its configured directory. The first 4-GPU attempt reused the single-GPU run's directory, found its step-100 checkpoint, and finished at once without training a single step. With its own checkpoint directory, the second attempt trained all 100 steps across four GPUs. A smoke test that finishes suspiciously fast may have resumed from an earlier run.

Let the agent run these steps for you with your approval, and compare its account of what happened against the logs.

## Record what you learned

Finish by having the agent write down what you learned while it is still in context:

> Write a short AGENTS.md for this repository with the install, test, and smoke-test commands that worked on the cluster, a one-paragraph map of the code, and the gotchas we hit. Keep it under 60 lines.

Review it before you commit it. Claude Code reads `AGENTS.md` only when the repository has no `CLAUDE.md`, so if it has one, add the line `@AGENTS.md` to it. The next session, yours or a labmate's, then starts from what you already know; see {doc}`Configuring Agents for Your Project <configuring_agents>`.

## Before you rely on your understanding

- Every claim the agent made about the code is backed by a file you opened.
- The smoke test ran on the cluster, and its numbers make sense for the configuration.
- What you still do not know is written down as questions for the authors rather than guessed.

```{seealso}
To change the code once you understand it, see {doc}`Refactoring Research Code into Packages <refactoring_into_packages>`. For running and debugging jobs with an agent, see {doc}`SLURM Jobs and Cluster Workflows <slurm_jobs_and_cluster_workflows>`.
```
