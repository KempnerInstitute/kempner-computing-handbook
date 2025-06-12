# Contributing to the handbook

We welcome contributions to the Kempner Institute HPC User Guide! Whether you are a researcher, student, or HPC enthusiast, your contributions are valuable to the community. This guide is designed to be a comprehensive resource for leveraging High-Performance Computing (HPC) for advanced computational research, and we encourage you to help us improve it.


> [!IMPORTANT]  
> **Note on Responsible Contribution in the Era of Generative AI**
> In today’s landscape of generative AI, fair collaboration and proper  attribution have become more important than ever.
> If you are contributing material to this handbook:
> - Always credit original sources clearly and fully if your content is based on or adapted from external material.
> - If you use generative AI tools to assist in your writing or coding, you must meticulously review and verify the content to ensure it is technically accurate and appropriate for our context.
> - Please be aware that every character of your contribution is traceable via Git version control. As such, you are fully responsible for the correctness and originality of your contributions.
> - In cases of controversial or questionable contributions, please note that the core maintainers reserve full discretion to accept, modify, or reject any pull request.
> 
> By contributing, you acknowledge that you are submitting content to the best of your knowledge and in accordance with principles of transparency, accountability, and collaborative integrity.  Our priority is to maintain the handbook’s quality, integrity, and usefulness for the broader community.



To contribute to the handbook, please follow these steps:


### Step 1: Decide what to contribute

Before making any changes to the handbook, it is important to decide what you would like to contribute. One way to contribute is picking an existing issue from the [issue tracker](https://github.com/KempnerInstitute/kempner-computing-handbook/issues) and working on it. If you have an idea for a new section or topic that is not covered in the handbook, you can create a new issue to discuss it with the maintainers. Please note that random contributions without discussing them with the maintainers may not be accepted or may take longer to be reviewed.


### Step 2: Fork the repository

To contribute to the Kempner Institute's handbook, membership in the Institute is not a prerequisite. Anyone with a GitHub account can participate in the documentation process. This is done by forking the handbook's repository, applying your modifications to this fork, and then submitting a pull request to merge your contributions with the main repository.

If you have already forked the repository, make sure that your fork is up to date with the main repository before making any changes. You can do this by following the instructions in the [Fork a repository](https://docs.github.com/en/get-started/quickstart/fork-a-repo#keep-your-fork-synced) from Github's documentation. 


### Step 3: Make changes to the handbook

Once you have forked the repository, you can make changes to the handbook by editing the Markdown files in the `kempner_computing_handbook` directory. You can use a text editor or a Markdown editor to make changes to the files. If you are not familiar with Markdown, you can refer to the [Markdown Guide](https://www.markdownguide.org/) for a quick introduction.


### Step 4: Build the handbook

- **Local build**:

Before submitting your changes, it is recommended to build the handbook locally to ensure that your changes are displayed correctly. You can build the handbook (while being at the root directory) using the following command:

```bash
jupyter-book build kempner_computing_handbook
```

- **Docker build**:

The handbook can also be built using Docker. This is useful if you do not want to install the required dependencies on your local machine. To build the handbook using Docker, you can run the following command in the terminal:

```bash
docker run --rm -v $PWD:/usr/src/app kempnerinstitute/computing_handbook_jb:<version> jupyter-book build kempner_computing_handbook
```

__Note__: Replace `<version>` with the version of the Docker image you want to use. For example, `1.0-240312-d1189501`. You can find the available versions on the [Docker Hub](https://hub.docker.com/r/kempnerinstitute/computing_handbook_jb/tags).


After building the handbook, you can view the changes by opening the `kempner_computing_handbook/_build/html/index.html` file in a web browser.

### Step 5: Stage, commit, and push your changes

After making changes to the handbook, you can add and commit your changes to your forked repository. You can do this by running the following commands in the terminal:

- Stage the files you changed:
```bash
git add [list of files you changed]
```

- Commit the changes:
```bash
git commit -m "Add a short description of the changes you made"
```

- Push the changes to your forked repository:

```bash
git push origin main[or any other branch you are working on]
```

### Step 6: Merge kempner-hpc-handbook/main branch into your current branch

Before submitting a pull request, it is recommended to merge the `main` branch of the main repository into your current branch to ensure that your changes are compatible with the latest version of the handbook. You can do this by running the following commands in the terminal:

- Fetch the latest changes from the main repository:

```bash
git fetch --all
```

- Merge the `main` branch into your current branch:

```bash
git merge kempner-computing-handbook/main
```

- Push the changes to your forked repository:

```bash
git push origin main[or any other branch you are working on]
```

### Step 7: Submit a pull request

After pushing the changes to your forked repository, you can submit a pull request to merge your changes with the main repository. You can do this by following these steps:

- Navigate to your forked repository on GitHub.
- Click on the "New pull request" button.
- Select the `main` branch of the main repository as the base branch.
- Select the branch with your changes as the compare branch.
- Add a title and description for your pull request.
- Click on the "Create pull request" button to submit your pull request.

Notes:
- Please make sure to describe your changes in the pull request, so that the maintainers can understand the purpose of your contribution.
- If your pull request is related to an existing issue, please mention the issue number in the description of the pull request.
- If you are working on a large contribution, please open an issue to discuss the changes with the maintainers before submitting a pull request.
- If your work is still in progress, you can submit a draft pull request to get feedback from the maintainers and other contributors. To do this add "[WIP]: " to the title of the pull request. This will indicate that the pull request is a work in progress and not ready to be merged. You can remove the "[WIP]: " prefix when your work is complete and ready for review.
- After submitting the pull request, the maintainers will review your changes and provide feedback. You may need to make additional changes based on the feedback before your pull request is accepted.
- Depending on the nature and complexity of your contribution, it may take some time for the maintainers to review and merge your pull request. Please be patient and responsive to the feedback provided by the maintainers. During this time, it is your responsiblity to address any conflicts that might happen due to changes in the main repository. So, please make sure to keep your forked repository up to date with the main repository.

Done!


## Notes on contributing figures

If you are contributing figures to the handbook, please make sure to follow these guidelines:

- Each chapter, has a folder in the `kempner_computing_handbook` directory. Inside each chapter folder, there is a `figures` folder with subfolder for each figure type (e.g., `ai`, `png`, `svg`, `pdf`, etc.). Please make sure to place your figures in the appropriate folder.
- We require the use of vector graphics (e.g., SVG, PDF) for figures, as they are scalable without loss of quality and facilitate easy editing. If, due to specific constraints, you must include raster graphics (e.g., PNG, JPG), please provide a detailed explanation in your pull request justifying their necessity. Ensure that any raster images are of high resolution (minimum 300 dpi) to maintain visual clarity in the handbook.
- If you are annotating a figure, please include both the original and the annotated figures. If you are using Adobe Illustrator to annotate figures (recommended), please include the `.ai` file. This will facilitate the change of the figure's annotation style to make it uniform in the handbook.  
- Please avoid using copyrighted images or figures that are not licensed for reuse. If you are using figures from external sources, make sure to provide proper attribution and licensing information in the figure caption or in the text. As a contributor, you are solely responsible for ensuring that your submission does not violate any copyright laws.

### Style and formatting guidelines for figures

If you are creating new figures, please make sure to follow the style and formatting guidelines of the handbook to ensure consistency across the chapters.

**Font**:

- **Font Type**: Use Arial for all text within figures. 
- **Font Size**: Set the font size to 12 pt for standard text. 

**Color Palette**:

- **Primary Colors**: TBD
- **Secondary Colors**:TBD
- **Accent Colors**: TBD

**Figure Size and Aspect Ratio**:

- **Size**: Design figures with a width of `800` pixels and a height of `600` pixels. 
- **Aspect Ratio**: Maintain a `4:3` aspect ratio to ensure uniformity throughout the handbook. 

**Figure Caption**:

- **Placement**: DO NOT include figure caption in the figure itself.
- **Content**: Figure caption should be consize, informative, and self-sufficient. Readers should be able to understand the figure without referring to the text.

**Background Color**: 

- Use transparent background for figures to ensure that they blend seamlessly with the handbook's design. 


## Conributing a Workshop Session

If you are contributing a workshop session to the handbook, please make sure to follow these guidelines:

- The workshop should be related to the topics covered in the handbook and should provide hands-on training or practical exercises for the readers.  
- Open an issue to discuss the workshop session with the maintainers before starting the work. 
- Inside the workshop folder (`s8_workshops_and_trainings`), create a new folder for the workshop session. The folder name should start in the following format `semesterYYMM_workshop_title`. For example, `spring2403_intro_to_hpc`.
- In the landing page of the workshop `s8_workshops_and_trainings/README.md`, add  
- Each workshop session has a folder in the `kempner_computing_handbook/s8_workshops_and_trainings` directory. Inside each workshop session folder, there is a `notebooks` folder with the Jupyter notebooks for the session. Please make sure to place your notebooks in the appropriate folder.



## Notes on Docker images

The handbook has one Docker image for building the handbook. We are not deploying any other Docker images through this repository. If you are contributing to the handbook and you need to use other libraries or tools, and you want to update the docker image based on those tools, please follow these steps:

- Discuss this with the maintainers (by opening an issue).
- Create a new branch for your changes.
- Update the `Dockerfile` and the `requirements.txt` file to include the new libraries or tools.
- Build the Docker image locally to ensure that it works as expected.
- Push the changes to your forked repository.
- Submit a pull request to merge your changes with the main repository.  

The maintainers will review your changes and provide feedback. If your changes are accepted, the maintainers will merge your pull request and an updated Docker image will be deployed on the Docker Hub.