(development_and_runtime_envs:using_conda_env)=
# Conda Environment

In order to use a conda environment on the cluster, you will need to create a conda environment and then activate it on the compute node. FASRC uses `mamba` as a replacement for `conda` to manage conda environments. `mamba` is a drop-in replacement for `conda` that is generally much faster. 

## Building a Conda environment under the default home directory

### What is a conda environment and why should you use it?


A conda environment is a directory that contains a self-contained instance of Python along with a specific set of packages. For instance, you can create a conda environment called `myenv` with numpy version 1.26.4 installed. When executing Python code within that environment, numpy version 1.26.4 will be used. If you need to run code from a different project requiring an older version of numpy, you can use a different conda environment with that older version of numpy installed.


Overall, conda environments allow you to isolate package versions for different projects or repositories, which reduces conflicts and dependency issues. The use of conda environments also ensures reproducibility; you can export your conda environment, allowing others to run your code in precisely the same environment.



(development_and_runtime_envs:using_conda_env:creation)=
### Creating a Conda Environment

- Step 1: See a list of load modules using the `module list` command.

    ```{tip}
    Verifying the loaded modules is a good practice to avoid conflicts between the loaded modules and any upcoming modules.
    ```

- Step 2: Purge the loaded modules using the `module purge` command if you have any loaded modules and you want to start fresh.
- Step 3: Load `python` module using the `module load python` command. This will load the default version of Python.
- Step 5: Create a conda environment using the `mamba create` command. For example, to create a conda environment named `myenv` with Python 3.12 and installing pip and numpy, you can use the following command:

    ```bash
    mamba create --name myenv python=3.12 pip numpy
    ```
    ```{note}
    You can also create the environment from a `yaml` file. Please see the [conda](https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html#creating-an-environment-from-an-environment-yml-file)'s official documentation for more information.

    ```
    ```{tip}
      You can also add a channel to the command if needed:
      
      ```bash
      mamba create --name myenv python=3.12 pip numpy -c conda-forge
      ```     

      You can also specify the list and order of channels to look for the software pacakges. 

      ```bash
      conda config --add channels conda-forge
      conda config --add channels bioconda
      ```

    ```

- Step 6: Check the location of the conda environment using the `mamba info --envs` command. This will show the list of conda environments and their locations. 

    ```bash
    $ mamba info --envs

            mamba version : 1.5.5
    # conda environments:
    #
    myenv                    /n/home10/<username>/.conda/envs/myenv
    base                     /n/sw/Mambaforge-23.11.0-0
    ```


- Step 7: Activate the conda environment using the `mamba activate` command. For example, to activate the `myenv` environment, you can use the following command:

    ```bash
    mamba activate myenv
    ```


```{warning}
Be aware that the size of the new conda environment can occupy several gigabytes, depending on the number of packages being installed. To conserve disk space, it is advisable to delete any outdated environments. Read more [here](https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html#removing-an-environment).
```


(development_and_runtime_envs:using_conda_env:jupyter)=
### Using a Conda Environment with Jupyter
If you plan to use Jupyter notebooks or JupyterLab on the cluster, and would like to use a conda environment, you need to install `ipykernel` within that conda environment:


```bash
mamba activate myenv
pip install ipykernel
```


You should now be able to change the kernel of the notebook to your conda environment. 

```{seealso}
For details on how select a kernel when running a jupyter notebook in VSCode,  please see the section {ref}`development_and_runtime_envs:using_vscode_for_remote_development:jupyter`.
```

### Exporting a Conda Environment
You can export your conda environment into a `yml` file. This means that other users can recreate your exact conda environment using the `yml` file.


To export your conda environment, run


```bash
mamba activate <environment name>
mamba env export > environment.yml
```


With this command, the `environment.yml` file will contain information about every single package in your environment, including low-level ones you did not explicitly install. Since some of these may be operating system-specific, this could mean that the conda environment is not reproducible across operating systems (Mac OS, Windows, Linux). 


To help ensure your environment is reproducible across operating systems, you can instead run:
```bash
mamba activate <environment name>
mamba env export --from-history > environment.yml
```
The `--from-history` argument ensures that only packages you specifically chose to install are exported. Note however, that if you did not specify the versions of packages when installing them, the versions will not be included in the `yml` file when using the `from-history` flag.


The `--from-history` flag will also result in a `yml` file that does not include information on packages you installed with pip. To include packages you installed using pip, you can run


```bash
pip freeze > requirements.txt
```


Then manually add the following lines to your `environment.yml` file:


```bash
 - pip
 - pip:
   - -r file:requirements.txt
```


A user can recreate your conda this `yml` file can recreate your conda environment by running:


```bash
mamba env create --file environment.yml
```


They will need both the `environment.yml` file and the `requirements.txt` file.


````{seealso}
The [Conda documentation](https://conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html) may be useful for further information.
````


## Building a Conda environment in a user-defined directory

The Conda environment and cache directory for installed packages can easily exceed tens of gigabytes. It is recommended to create the Conda environment in the lab directory instead of the home directory. In this section, we assume you prefer not to have a Conda environment in the default home directory, and that your default Conda environment is located in the lab directory. The lab directory (under your username) does not have the 100 GB space limitation, providing you with more room to create Conda environments.

```{warning}
- Please note that this is a major change to the default behavior of Conda. If you are unsure about this change, please consult with the FAS Research Computing.

- Also be aware that creating numerous Conda environments can exhaust the file system's inodes, as Conda generates a large number of files. To avoid this, use the `$SCRATCH` space for your Conda environments. You can learn more about the Scratch space policy on the [FASRC website](https://docs.rc.fas.harvard.edu/kb/policy-scratch/).
```



Here are the steps to create a Conda environment in the lab directory:

- Step 1: Locate your lab directory

The labs are located at the following path: `/n/holylabs/LABS` (or other filesystems such as `holylfs04`, `holylfs05`, `holylfs06`). Inside the LABS directory, you will find directories for individual labs. Within each lab directory, there is a `Users` folder. Inside this folder, there should be a folder with your username. If such a folder does not exist, request the FASRC help desk to create one for you. This folder will serve as your personal directory under your affiliated lab.


- Step 2: Create the following directories in your lab directory:

    - `.conda`: This directory will be your default Conda directory.
    - `.conda/envs`: This directory will store the conda environments.
    - `.conda/pkgs`: This directory will store the cached packages.

- Step 3: Set the following environment variables in your `~/.bashrc` file:

    ```bash
    export CONDA_ENVS=/n/holylabs/LABS/<lab_name>/<username>/.conda/envs
    export CONDA_PKGS_DIRS=/n/holylabs/LABS/<lab_name>/<username>/.conda/pkgs
    export PATH="/n/holylabs/LABS/<lab_name>/<username>/.conda:$PATH"
    ```


    Replace `<lab_name>` with the name of your lab and `<username>` with your username. The `CONDA_ENVS` environment variable specifies the directory where the Conda environments will be stored, and the `CONDA_PKGS_DIRS` environment variable specifies the directory where the cached packages will be stored.

    Run the following command to apply the changes:

    ```bash
    source ~/.bashrc
    ```

- Step 4: Add these default directories to your `.condarc` file:

    ```bash
    envs_dirs:
    - /n/holylabs/LABS/<lab_name>/<username>/.conda/envs

    pkgs_dirs:
    - /n/holylabs/LABS/<lab_name>/<username>/.conda/pkgs
    ```

    Replace `<lab_name>` with the name of your lab and `<username>` with your username.


- Step 5: Create a Conda environment in the lab directory using the `conda create` command. For example, to create a Conda environment named `myenv` with Python 3.12 and installing pip and numpy, you can use the following command:

    ```bash
    module load python/3.10.12-fasrc01
    conda create --name myenv python=3.12 pip numpy
    ```

- Step 6: Check if the Conda environment is created successfully in the lab directory using the following command:

    ```bash
    conda env list
    ```

    This command will list all the Conda environments, including the one you just created.

- Done! You have successfully created a Conda environment in the lab directory.

