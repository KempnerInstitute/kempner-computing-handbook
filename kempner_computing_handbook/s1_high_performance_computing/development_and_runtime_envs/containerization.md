# Containerization

In the section on containerization, it's crucial to emphasize the significance of this technology in ensuring consistent and efficient environments across computing platforms. Containerization allows for the encapsulation of software, along with its dependencies, ensuring that it runs uniformly and reliably on any infrastructure.

[Docker](https://www.docker.com/), a leading containerization platform, has become synonymous with container technology, offering ease of use and widespread adoption. However, it's important to note that Docker is not permitted on High-Performance Computing (HPC) environments due to security concerns and the way it manages system resources.

This leads us to Singularity, a containerization solution specifically designed for HPC and scientific computing. Singularity addresses the security and resource management issues posed by Docker in HPC settings. A significant advantage of Singularity is its ability to convert Docker images to Singularity format, enabling users to leverage Docker's vast repository of containers within HPC environments safely and efficiently.

PyTorch, one of the most popular deep learning frameworks, provides official Docker images in their [Docker Hub](https://hub.docker.com/r/pytorch/pytorch). These images can be converted to Singularity format and used on the FASRC cluster. This is a powerful feature that allows researchers to develop and test their models on local machines using Docker and then deploy them on the cluster using Singularity.

Here is a simple step by step guideline to convert pytorch's official Docker image to Singularity format and use it on the cluster:


1. Log in to the FASRC cluster (on VPN):

```bash
ssh <username>@login.rc.fas.harvard.edu
```
2. Allocate a light interactive session:

```bash
salloc --partition=test --nodes=1 --ntasks-per-node=4 --mem-per-cpu=3200M --time=8:00:00
```

Notes:   
- You may be able to get the image while you are on the login node, which is not recommended. It is better to allocate a light interactive session to avoid any issues.
- You can also get a heavy duty GPU node. However, if you are not familiar with the process, the GPU nodes will left idle and you will be charged for the resources. So it is better to first make sure that you have the right image via a light interactive session.

3. Pull the Docker image from the Docker Hub:

```bash
singularity pull docker://pytorch/pytorch:2.2.1-cuda12.1-cudnn8-devel
```

4. Terminate the light interactive session:

Double-check that you have the image file in your current directory. If you have the image file, you can terminate the session. If you don't have the image file, you can keep the session open and try to pull the image again.

```bash
exit
```

5. Run the Singularity image on the Kempner AI Cluster:

You can run the Singularity image using batch or interactive jobs. Here is an example of running the image on the Kempner AI Cluster using an interactive job:

- First allocate an interactive session with a GPU:

```bash
salloc --partition=kempner --nodes=1 --ntasks-per-node=1 --gres=gpu:1 --mem=32000M --time=8:00:00 --account=<your_account>
```

- Second, run the Singularity image:

```bash
singularity exec --nv pytorch_2.1.2-cuda12.1-cudnn8-devel.sif python mytraining.py
``` 


## Using Shared Singularity Images

Before pulling or building your own image, check whether a suitable one already exists. FASRC maintains a read-only collection of prebuilt Singularity images under `/n/singularity_images/`, shared across the cluster. Reusing one saves you the pull, conversion, and storage steps.

The collection is organized into subdirectories, including `FAS` for general and GPU applications and `informatics` for bioinformatics tools. The `FAS` directory holds images such as PyTorch, TensorFlow (from NVIDIA NGC), JAX, and AlphaFold. Browse what is available with `ls`:

```bash
ls /n/singularity_images/FAS/
ls /n/singularity_images/FAS/pytorch/
```

Run an image directly from its shared path, just as you would your own `.sif` file. Add `--nv` for GPU access inside a GPU job:

```bash
singularity exec --nv /n/singularity_images/FAS/pytorch/pytorch_22.07-py3.sif python mytraining.py
```

```{note}
These images are maintained by FASRC and vary in age, so confirm that an image's framework version fits your needs. The directory is read-only, but you can use a shared image as the base for your own customized image: reference it from a definition file with `Bootstrap: localimage` and `From: /n/singularity_images/FAS/pytorch/pytorch_22.07-py3.sif`, then build it as described below.
```

## Customizing Containers

In many cases the official images are enough, but sometimes you need extra software or libraries in the container. Because Docker itself is not available on the cluster, you have two practical options: build a Docker image on a machine where you have Docker and then convert it, or build directly with Singularity on the cluster.

### Option 1: Build a Docker image locally, then convert

If you already maintain your images with Docker, customize them on your local machine (or in CI) where Docker and root access are available:

1. Write a `Dockerfile` that starts from a base image and adds your dependencies:

```dockerfile
FROM pytorch/pytorch:2.2.1-cuda12.1-cudnn8-devel
RUN pip install --no-cache-dir transformers datasets
```

2. Build the image and push it to a registry such as Docker Hub or the GitHub Container Registry:

```bash
docker build -t <your-user>/custom-pytorch:latest .
docker push <your-user>/custom-pytorch:latest
```

3. On the cluster, pull and convert it to Singularity format, exactly as with any other Docker image:

```bash
singularity pull docker://<your-user>/custom-pytorch:latest
```

This keeps the build on a machine that supports Docker and leaves only the pull and run steps on the cluster.

```{note}
FASRC also provides [Podman](https://docs.rc.fas.harvard.edu/kb/podman/), a rootless, daemonless container engine whose commands mirror Docker. On the cluster the `docker` command runs `podman` under the hood, so you can pull, run, and build OCI (Docker-compatible) images directly, without converting them to Singularity first.
```

### Option 2: Build with Singularity on the cluster

Singularity (now developed as [Apptainer](https://apptainer.org/)) can build images itself, so you do not need Docker. Because installing system packages and assembling an image normally require root, these builds use the `--fakeroot` option. Fakeroot uses Linux user namespaces to map your account to root (UID 0) inside the container, so tools such as `apt` and `pip` behave as though they have root while you hold no extra privileges on the host. You need it both to build from a definition file and to modify a writable sandbox. See the [Apptainer fakeroot documentation](https://apptainer.org/docs/user/main/fakeroot.html).

```{note}
Build on local disk, such as `/tmp` on the compute node, rather than on networked storage. On `/n` home and scratch, sandbox builds are much slower and warn that they cannot preserve file ownership. Build there, then copy the finished `.sif` file to your lab or scratch space. Per FASRC, also avoid running a `--fakeroot` build with your home directory itself as the working directory. See the [FASRC Singularity documentation](https://docs.rc.fas.harvard.edu/kb/singularity-on-the-cluster/).
```

```{important}
On the cluster, the `SINGULARITY_BIND` environment variable is preset to mount SLURM commands, the munge socket, and the host certificates into your containers. Those mount points do not exist in a stock image, and Singularity cannot create them while an image is being written, so a customization step otherwise fails with an error like `FATAL: container creation failed: mount /etc/slurm->/etc/slurm error: ... destination /etc/slurm doesn't exist in container`. Clear the variable for the build or writable step by prefixing the command with `SINGULARITY_BIND=`, as shown below. See *Mounting and certificate issues when customizing* below for the details.
```

**From a definition file (recommended).** A definition file records every customization, so the resulting image is reproducible, and package installs in `%post` run with working certificates. Create `custom.def`:

```text
Bootstrap: docker
From: pytorch/pytorch:2.2.1-cuda12.1-cudnn8-devel

%post
    pip install --no-cache-dir transformers datasets

%environment
    export PYTHONUNBUFFERED=1
```

Then build the image, clearing `SINGULARITY_BIND` for the build:

```bash
SINGULARITY_BIND= singularity build --fakeroot custom.sif custom.def
```

**From a writable sandbox (interactive).** A sandbox is an unpacked, writable directory form of the image, useful for experimenting when you are not yet sure which packages you need. Build a sandbox and shell into it, again clearing `SINGULARITY_BIND` so that `--writable` can start:

```bash
# Create a sandbox directory from a Docker image (build on local /tmp)
singularity build --fakeroot --sandbox custom/ docker://pytorch/pytorch:2.2.1-cuda12.1-cudnn8-devel

# Shell in to experiment. SINGULARITY_BIND= clears the preset binds so that
# --writable can start, and --fakeroot supplies the root that installs need.
SINGULARITY_BIND= singularity shell --fakeroot --writable custom/
```

Once you know which packages you need, record them in a definition file and build a `.sif` from that, rather than converting the sandbox. The definition file is reproducible, and its `%post` step has the certificates that a cleared writable sandbox lacks (see below).

### Mounting and certificate issues when customizing

The preset `SINGULARITY_BIND` is the source of the two problems you are most likely to hit while customizing a container. It lists SLURM tooling (`srun`, `sbatch`, and related commands), the munge socket, and the host certificate directories, so that inside a normal, read-only container you can submit jobs and make TLS connections. Running a finished image is unaffected, because Singularity creates those mount points automatically for a read-only container:

```bash
singularity exec custom.sif python mytraining.py   # binds created automatically
```

**Mounting.** The problem appears only when the image is writable. A `--writable` sandbox, and a definition file's `%post`, cannot create the missing `/etc/slurm` and related mount points, so the step fails with the `destination ... doesn't exist in container` error shown above. Clearing `SINGULARITY_BIND` for that command removes the preset binds and lets it proceed. Skipping them with `--no-mount bind-paths` does not help, because they come from the environment variable rather than from Singularity's configuration file.

**Certificates.** Clearing `SINGULARITY_BIND` also removes the host certificate bind, so a package manager running inside a cleared, writable sandbox no longer sees the host certificates, and an HTTPS download can fail:

```text
error:0A000086:SSL routines:...:certificate verify failed
```

This is why installing packages belongs in a definition file: during `singularity build` the certificates are available, so `pip`, `apt`, and `apk` in `%post` work normally. If you must install inside a writable sandbox and the base image already ships `ca-certificates`, refreshing them can help (for example, `apt-get update && apt-get install -y ca-certificates` on a Debian or Ubuntu base); otherwise, move the step into a definition file.

**Accessing your data.** To make a directory visible inside a container, use `--bind` (or `-B`) with the format `src[:dest[:opts]]`, where `opts` is `ro` or `rw` (read-write is the default):

```bash
singularity exec --bind /n/netscratch/<your_lab>:/data custom.sif ls /data
```

By default, `/n` (your home, lab, and scratch space), your current working directory, and `/tmp` are already available inside the container. See {doc}`Storage Options <../storage_and_data_transfer/understanding_storage_options>` for the cluster storage layout.

```{tip}
For pure Python packages you often do not need to customize the image at all. Because your home directory is bind-mounted read-write, running `pip install --user <package>` from inside a read-only `.sif` installs into `$HOME`, avoiding both issues above, at the cost of keeping those packages outside the image and therefore less reproducible.
```
