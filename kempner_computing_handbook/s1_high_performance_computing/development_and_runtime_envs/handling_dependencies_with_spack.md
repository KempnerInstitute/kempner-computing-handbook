(development_and_runtime_envs:handling_dependencies_with_spack)=
# Spack Package Manager

Spack is a powerful package management tool designed for supercomputers, clusters, and workstations, simplifying the process of installing, managing, and sharing software across different platforms. It supports flexible dependency resolution, multiple versions and configurations of software, and allows for easy deployment of software stacks. This section will guide you through the basics of using Spack to manage software on the Kempner AI cluster.

## Spack Installation

To install Spack, pick a shared folder on your lab directory on Kempner AI cluster (`holylabs` or other Tier 0 storages such as `holylfs0x` or Tier 1). This allows all lab members to use the packages and avoid saving similar packages multiple times. 

```bash
mkdir /n/holylabs/LABS/<lab_name>/Lab/software
cd /n/holylabs/LABS/<lab_name>/Lab/software
git clone -c feature.manyFiles=true https://github.com/spack/spack.git
cd spack
```

Replace `<lab_name>` with your lab name on the cluster. To activate Spack, you can either run the command in `.../spack/` root directory,

```bash
./share/spack/setup-env.sh
```

or add this line to `~/.bashrc` file to always activate Spack,

```bash
source <spack_path>/share/spack/setup-env.sh
```

Replace `<spack_path>` with the root directory of the Spack (`/n/holylabs/LABS/<lab_name>/Lab/software/spack`).

## Useful Spack Commands

The following tables summarizes the basic commands for managing software packages with Spack, from searching and installation to managing the software environment.

| Spack Command                | Description                                                  |
|------------------------------|--------------------------------------------------------------|
| `spack find`                 | Displays packages installed on the cluster.                  |
| `spack install <package>`    | Installs a new package on the cluster.                       |
| `spack uninstall <package>`  | Removes an installed package from the cluster.               |
| `spack load <package>`       | Makes a package ready for use in the current session.        |
| `spack unload <package>`     | Removes a package from the current session's environment.    |
| `spack list`                 | Lists all packages available for installation on the cluster.|
| `spack list <package>`       | Provides details about a specific package available on the cluster. |
| `spack versions <package>`   | Shows all available versions of a package for installation on the cluster. |

Where `<package>` is the name of package.

## Advanced Topic: Spack Environments

A Spack environment is a key feature of Spack, enabling users to manage software packages, dependencies, and configurations collectively. It ensures the easy replication of software setups across various AI clusters, aiding researchers, developers, and sysadmins in maintaining consistency and avoiding compatibility issues.

A list of useful Spack environment commands, 

| Spack Environment Command       | Description                                    |
|------------------------------|---------------------------------------------------|
| `spack env status`              | Find out the current active Spack environment. |
| `spack env list`                | List all Spack environment.                    |
| `spack env create <env_name>`   | Create a new Spack environment.                |
| `spack env activate <env_name>` | Activate a Spack environment.                  |
| `spack env deactivate`          | Deactivate an environment.                     |
| `spack install --add <package>` | Install a package in the new environment.      |

{*Add more command for exporting Spack environment YAML file and importing in a different system.*}


```{tip}
A complete list of over 5,064 packages in Spack can be found on this [page](https://spack.readthedocs.io/en/v0.16.2/package_list.html). Read more about Spack [here](https://spack.readthedocs.io/en/latest/index.html).
```