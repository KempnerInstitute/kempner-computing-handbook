(development_and_runtime_envs:software_module_and_environment_management)=
# Software Modules

HPC comes with a wide variety of software packages and libraries. These software packages are managed using a module system. A module is a software package that can be loaded and unloaded on the cluster. The module system allows users to manage their software dependencies and environments.

## Available Modules

Use the `module avail` command to list all the software modules available on the cluster. The output will show the available software modules and their versions. 

```{note}
See a list of software modules available on the FASRC HPC clusters [here](https://docs.rc.fas.harvard.edu/kb/all-modules/).
```

## Managing Software Modules

The following commands are used to manage software modules:


| Command                       | Description                          | 
|-------------------------------|--------------------------------------|
| `module avail`                | List all available software modules. |
| `module load <module_name>`   | Load a software module.              |
| `module unload <module_name>` | Unload a software module.            |
| `module list`                 |  List all loaded software modules.   |
| `module purge`                | Unload all loaded software modules.  |




