# Scalable Vision Workflows 

This section covers efficient and scalable vision model training, an effort focused on enabling fast and effective training of deep learning vision models at scale. Built with PyTorch's Distributed Data-Parallel (DDP) and optimized for SLURM-managed compute environments, this section provides ready-to-use training workflows for commonly used vision architectures like [ResNet](https://arxiv.org/abs/1512.03385) and [AlexNet](https://papers.nips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf).

Rather than locking users into a single dataset or model, this project is designed to be flexible and modular. You can easily plug in your own models or datasets, making it an ideal foundation for experimentation, benchmarking, or production-scale training.

These workflows are tailored for high-performance computing environments like the Kempner AI cluster and emphasize:

- Native SLURM integration
- Distributed training best practices
- Efficient data loading and job scheduling
- Reproducible configuration setups

## Available Vision Workflows

| Workflow                                                                                                                     | Model     | Dataset     | Max Tested GPUs  | Tags          |
| -----------------------------------------------------------------------------------------------------------------------------|-----------| ----------- | -----------------|---------------|
| [imagenet1k_resnet50](https://github.com/KempnerInstitute/scalable-vision-workflows/tree/main/imagenet1k_resnet50) | ResNet-50 | ImageNet-1k | 64               | `A100`, `DDP` |
| [imagenet1k_alexnet](https://github.com/KempnerInstitute/scalable-vision-workflows/tree/main/imagenet1k_alexnet)   | AlexNet   | ImageNet-1k | 4                | `A100`, `DDP` |

These examples demonstrate scalable and reproducible model training setups that can be extended or customized for your research.

## GitHub Repository

For full source code, documentation, and additional details, visit the GitHub repository.

GitHub Repository: [KempnerInstitute/scalable-vision-workflows](https://github.com/KempnerInstitute/scalable-vision-workflows)
