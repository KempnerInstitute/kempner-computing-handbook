# Containerization

In the section on containerization, it's crucial to emphasize the significance of this technology in ensuring consistent and efficient environments across computing platforms. Containerization allows for the encapsulation of software, along with its dependencies, ensuring that it runs uniformly and reliably on any infrastructure.

[Docker](https://www.docker.com/), a leading containerization platform, has become synonymous with container technology, offering ease of use and widespread adoption. However, it's important to note that Docker is not permitted on High-Performance Computing (HPC) environments due to security concerns and the way it manages system resources.

This leads us to Singularity, a containerization solution specifically designed for HPC and scientific computing. Singularity addresses the security and resource management issues posed by Docker in HPC settings. A significant advantage of Singularity is its ability to convert Docker images to Singularity format, enabling users to leverage Docker's vast repository of containers within HPC environments safely and efficiently.

PyTorch, one of the most popular deep learning frameworks, provide official Docker images in their [Docker Hub](https://hub.docker.com/r/pytorch/pytorch). These images can be converted to Singularity format and used on HPC clusters. This is a powerful feature that allows researchers to develop and test their models on local machines using Docker and then deploy them on HPC clusters using Singularity.

Here is a simple step by step guideline to convert pytorch's official Docker image to Singularity format and use it on HPC clusters:


1. Login to the HPC cluster (on VPN):

```bash
ssh <username>@login.rc.fas.harvard.edu
```
2. Allocate a light interactive session:

```bash
salloc --partition=test --account=kempner_grads --nodes=1 --ntasks-per-node=4 --mem-per-cpu=3200M --time=8:00:00
```

Notes:   
- You may be able to get the image while you are on the login node, which is not recommended. It is better to allocate a light interactive session to avoid any issues.
- You can also get a heavy duty GPU node. However, if you are not familiar with the process, the GPU nodes will left idle and you will be charged for the resources. So it is better to first make sure that you have the right image via a light interactive session.

3. Pull the Docker image from the Docker Hub:

```bash
singularity pull docker://pytorch/pytorch:2.2.1-cuda12.1-cudnn8-devel
```

4. Terminate the light interactive session:

Doublecheck that you have the image file in your current directory. If you have the image file, you can terminate the session. If you don't have the image file, you can keep the session open and try to pull the image again.

```bash
exit
```

5. Run the Singularity image on the HPC cluster:

You can run the Singularity image on the HPC cluster using batch or interactive jobs. Here is an example of running the image on the HPC cluster using an interactive job:

- First allocate an interactive session with a GPU:

```bash
salloc --partition=kempner --nodes=1 --ntasks-per-node=1 --gres=gpu:1 --mem=32000M --time=8:00:00  --account=kempner_dev
```

- Second, run the Singularity image:

```bash
singularity exec --nv pytorch_2.1.2-cuda12.1-cudnn8-devel.sif python mytraining.py
``` 


## Customizing Docker Images

In some cases, you may need to customize the Docker image to include additional software or libraries. You can do this by creating a `Dockerfile` and building a new image using the `docker build` command ... [TBD, will add more details after having a github account that handles the team's Docker images lifecycle]