# Hugging Face Models
In this section, we list best practices for working with Hugging Face models, from downloading them on the AI Cluster to converting their formats.

## Downloading Hugging Face Models on AI Cluster
To directly download the Hugging Face models on the AI cluster, you can use the following SLURM submission script using the `huggingface-cli` command.

```bash
#!/bin/bash

#SBATCH -J hf-download             # job name
#SBATCH -p <partition-name>        # CPU-only SLURM partitions (e.g., shared or sapphire)
#SBATCH -N 1                       # number of nodes
#SBATCH -n 8                       # number of cores
#SBATCH --mem 32G                  # memory pool per node
#SBATCH -t 03-00:00                # time (D-HH:MM)
#SBATCH --export=ALL               # export all environment variables
#SBATCH -o job.%N.%j.out           # STDOUT
#SBATCH -e job.%N.%j.err           # STDERR

set -euo pipefail 

# Set HF model path (https://huggingface.co/deepseek-ai/DeepSeek-R1-0528-Qwen3-8B)
HF_Model_Path="deepseek-ai/DeepSeek-R1-0528-Qwen3-8B"

# Load shared conda environment (no need to install on Kempner AI cluster)
module load python/3.10.13-fasrc01
conda deactivate
conda activate /n/holylfs06/LABS/kempner_shared/Everyone/common_envs/hf_hub
echo "Running Python from conda environment: $(which python)"

# Set HF home & cache dir
export HF_HOME="<PATH/TO/SAVE/HF/MODELS>"
export HF_HUB_CACHE="$HF_HOME"
echo "HF_HUB_CACHE set to: $HF_HUB_CACHE"

# Download HF model
export HF_HUB_ENABLE_HF_TRANSFER=1

huggingface-cli download $HF_Model_Path \
    --local-dir "$HF_HUB_CACHE/$(basename $HF_Model_Path)" \
    --local-dir-use-symlinks False
```

Below is an explanation of the script and the parameters you need to configure:

1. SLURM Directives

These lines (starting with `#SBATCH`) configure your job's resources, such as partition, number of nodes, cores, memory, and output files. You must set:  

- `<partition-name>`: Replace with the appropriate SLURM partition (CPU only - `shared` or `sapphire`) for your job.

2. Model Path

```bash
HF_Model_Path="deepseek-ai/DeepSeek-R1-0528"
```

You need to set: 

- `HF_Model_Path`: Replace with the Hugging Face model repository you want to download (e.g., `deepseek-ai/DeepSeek-R1-0528`).

3. Conda Environment

```bash
module load python/3.10.13-fasrc01
conda deactivate
conda activate /n/holylfs06/LABS/kempner_shared/Everyone/common_envs/hf_hub
```

- Loads the shared Python and conda environment.
- No changes are needed on Kempner AI cluster unless you want to use a different environment.

4. Hugging Face Cache Directory

```bash
export HF_HOME="<PATH/TO/SAVE/HF/MODELS>"
export HF_HUB_CACHE="$HF_HOME"
```

You need to set:

- `<PATH/TO/SAVE/HF/MODELS>`: Replace with the directory where you want to store the downloaded model files.

5. Download Command

```bash
huggingface-cli download $HF_Model_Path \
    --local-dir "$HF_HUB_CACHE/$(basename $HF_Model_Path)" \
    --local-dir-use-symlinks False
```

This downloads the specified model to your chosen directory. The `--local-dir-use-symlinks False` option ensures files are copied, not symlinked.


### Summary of Parameters to Set
| Parameter                  | Description                               | Example Value                             |
|----------------------------|-------------------------------------------|-------------------------------------------|
| `<partition-name>`         | SLURM partition name                      | `shared`, `sapphire`, etc.                |
| `HF_Model_Path`            | Hugging Face model repository path        | `"deepseek-ai/DeepSeek-R1"`               |
| `<PATH/TO/SAVE/HF/MODELS>` | Directory to store downloaded model files | `/n/holylfs06/LABS/<lab-name>/<hf-path>`  |

**Notes:**
- The script is resumable: if the download is interrupted, rerunning it will skip files that have already been downloaded.
- Make sure you have write permissions to the target directory.
- You can find more details about the `huggingface-cli` download command by running:

```bash
huggingface-cli download --help
```
