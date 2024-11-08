# Shared Data/Model Repository

We host several popular ML datasets and models on the Kempner HPC cluster. This approach reduces the need for multiple transfers of the same data/model by researchers and provides a central, read-only repository for all Kempner Institute users to access for their ML workflows. Only the admin team has write access, but users can submit requests for popular data/models. After a careful review, we may place a copy in the shared data/model repository. The current path on the cluster is:

```bash
DATA_PATH=/n/holylfs06/LABS/kempner_shared/Lab/data
MODEL_PATH=/n/holylfs06/LABS/kempner_shared/Lab/model
```

```{note}
We will develop a web interface later for data and model discovery.
```


## The current list of ML models 

- **CodeLlama**
    - Path: `$MODEL_PATH/models--codellama--CodeLlama-7b-hf` (see on [HuggingFace]( https://huggingface.co/codellama/CodeLlama-7b-hf))
        - Size: 16 G
--- 

- **EleutherAI**
    - Path: `$MODEL_PATH/models--EleutherAI--pythia-160m-deduped` (see on [HuggingFace](https://huggingface.co/EleutherAI/pythia-160m-deduped)
        - Size: 435 M
    - Path: `$MODEL_PATH/models--EleutherAI--pythia-70m-deduped` (see on [HuggingFace](https://huggingface.co/EleutherAI/pythia-70m-deduped)
        - Size: 195 M 

---

- **OpenAI**
    - Path: `$MODEL_PATH/models--gpt2` (see on [HuggingFace](https://huggingface.co/gpt2))
        - Size: 4.5 M

--- 

- **Google**
    - Path: `$MODEL_PATH/models--t5-base` (see on [HuggingFace](https://huggingface.co/t5-base))
        - Size: 3.4 M

## The current list of ML datasets


- **c4_original**
  - Path: `$DATA_PATH/c4_original`
    - Subfolders: 
      - `preprocessed` (434 M)
      - `raw` (157 G)
    - Description: The original version of the "Colossal Clean Crawled Corpus" (C4) dataset, designed for training natural language processing models.

---

- **dolma**
  - Path: `$DATA_PATH/dolma`
    - Subfolders: 
      - `preprocessed` (6.8 T)
      - `raw` (5.9 T)
    - Description: Dolma is a dataset of 3 trillion tokens from a diverse mix of web content, academic publications, code, books, and encyclopedic materials.

---

- **imagenet_winter21_whole**
  - Path: `$DATA_PATH/imagenet_winter21_whole`
      - Subfolders:
        - `winter21_whole.tar.gz` (1.3 T)
      - Description: An updated version of the ImageNet dataset, containing a wide variety of annotated images for visual object recognition, collected during the winter of 2021.
