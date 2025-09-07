(development_and_runtime_envs:software_module_and_environment_management)=
# Software Modules

HPC comes with a wide variety of software packages and libraries. These software packages are managed using a module system. A module is a software package that can be loaded and unloaded on the cluster. The module system allows users to manage their software dependencies and environments.

## Available Modules

Use the `module avail` command to list all the software modules available on the cluster. The output will show the available software modules and their versions. You can also use `module avail <pattern>` to search for `<pattern>` in the module name.

```{note}
See a list of software modules available on the FASRC Cannon cluster [here](https://docs.rc.fas.harvard.edu/kb/all-modules/).
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

You can also type `ml` as a shortcut for `module`.

## How do modules work?

Each module is defined by a script that runs when the module is loaded.
This script modifies environment variables such as `PATH`, `LD_LIBRARY_PATH`, etc. to make the software accessible from your terminal session.
You can use `module show <module_name>` to show a module's script.

These changes to the terminal environment will persist until `module unload` is called.
They act independently of other modifications to environment variables, namely virtual environments.

You can read more about modules at the [Lmod documentation](https://lmod.readthedocs.io/).
