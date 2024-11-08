(getting_started:accessing_and_navigating_the_cluster)=
# Accessing and Navigating the Cluster

There are two methods for accessing the Kempner Institute HPC cluster: 

- [SSH Access](#ssh_access)
- [Open OnDemand](#ondemand_access)


To utilize the resources, one may need to install [OpenAuth](https://docs.rc.fas.harvard.edu/kb/openauth/) two-factor authentication. A [VPN](https://docs.rc.fas.harvard.edu/kb/vpn-setup/) connection is required to use Open OnDemand.

## Access Requirements

### Installing OpenAuth 2FA

FASRC  uses its own two-factor authentication tool, [OpenAuth](https://docs.rc.fas.harvard.edu/kb/openauth/), which is different than Harvard Key.

To use OpenAuth, follow these steps:

1. **Request OpenAuth**: Click [here](https://two-factor.rc.fas.harvard.edu/) to request OpenAuth instructions and installation links from FASRC.
Use the following credentials:
     - **username**: your [FASRC account username](https://docs.rc.fas.harvard.edu/kb/about-usernames/)
    - **password**: your [FASRC account password](https://docs.rc.fas.harvard.edu/kb/quickstart-guide/#2_Set_a_password_and_setup_OpenAuth_for_two-factor_authentication)


2. **Install 2FA Tool**: 
    - **Open the Email from FASRC**: After submitting a request for OpenAuth, FASRC will send a message to the email address on record. (Since FASRC uses email verification for authentication, users must have an email address on record with FASRC.)

        The email will contain: 
        - Installation instructions
        - Download links (valid for 24 hours) 
        - A personalized token

    - **Select and Install 2FA Tool**: Choose among these options:
        - **Smart phone app**: uses a QR code for use in Google Authenticator ([Android](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&pli=1) or [IOS](https://apps.apple.com/us/app/google-authenticator/id388497605))
        - **Duo Mobile**: tokens are separate from Harvard Key tokens
        - **Java Desktop App**: 
            - Java runtime is required.  Installation instructions are [here](https://www.java.com/en/download/help/index_installing.html)
            - Double-click the Jauth.jar file to start the Java applet.  Alternatively, use one of the installation scripts for Windows (.bat) and Linux (.sh).

Credit for OpenAuth instructions: [FASRC OpenAuth site](https://docs.rc.fas.harvard.edu/kb/openauth/).

### Setting Up a VPN Connection

To set up a VPN connection, follow these steps:

*Skip Steps 1 and 2 if you have the Cisco AnyConnect VPN Client already installed on your local machine.*

1. **Download the VPN Client**: Download the VPN client from the [https://vpn.rc.fas.harvard.edu](https://vpn.rc.fas.harvard.edu). Use username + @ + `fasrc` (e.g., `jharvard@fasrc`) for `USERNAME` field. 
2. **Install the VPN Client**: Install the VPN client on your local machine.
3. **Connect to the VPN**: Open the VPN client and enter `vpn.rc.fas.harvard.edu` and click on the connect button. 
4. **Enter your credentials**: 
    - **username**: username + @ + `fasrc` (e.g., `jharvard@fasrc`)
    - **password**: your FASRC password (reset your password [here](https://portal.rc.fas.harvard.edu/p3/pwreset/))
    - **OpenAuth 2FA code**: your OpenAuth 2FA code (See [Installing OpenAuth 2FA](../getting_started/accessing_and_navigating_the_cluster.md))

```{note}
For detailed instructions and additional information, please read more about the VPN at [VPN setup guide](https://docs.rc.fas.harvard.edu/kb/vpn-setup/) on FASRC Documentation.
```


(ssh_access)=
## SSH Access 

You can access the cluster using an SSH client. Use the following command to connect to the cluster:

```bash
ssh <username>@login.rc.fas.harvard.edu
```

Replace `<username>` with your username on the cluster. This command will prompt you to enter your password and an OpenAuth 2FA code. After entering your password and a 2FA code, you will be connected to one of the login nodes of the cluster.

```{note}
Please do not use the login node for computationally intensive tasks, as these operations demand considerable computational resources and can severely impact the system's performance for all users. The login node is intended for *file management*, *job submission*, and other *lightweight tasks* only.
```

(ondemand_access)=
## Open OnDemand

Open OnDemand is a web-based interface that allows users to access the cluster through a web browser. You can use Open onDemand to start a Remote Desktop session, launch Jupyter notebooks / JupyterLab, RStudio, or other available interactive applications and submit jobs to the cluster.

To access the cluster using Open OnDemand, follow these steps:

- Connect to the VPN
- Open a web browser and navigate to the following URL: [http://vdi.rc.fas.harvard.edu/](http://vdi.rc.fas.harvard.edu/).
- Enter your username and password to log in to the Open OnDemand interface.

Refer to the dedicated [Open OnDemand section](../resource_management/open_ondemand.md) to learn more.
