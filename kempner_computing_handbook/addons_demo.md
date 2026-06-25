# Add-ons Demo

This scratch page demonstrates the optional Jupyter Book add-ons being trialed on this branch. It is not part of the handbook content and can be removed.

## Tabbed instructions (sphinx-design, already bundled)

`````{tab-set}
````{tab-item} pip
```bash
pip install kempner-tools
```
````

````{tab-item} conda
```bash
conda install -c conda-forge kempner-tools
```
````

````{tab-item} uv
```bash
uv add kempner-tools
```
````
`````

## Card grid (sphinx-design, already bundled)

````{grid} 1 1 2 2
:gutter: 3

```{grid-item-card} High Performance Computing
:link: https://handbook.eng.kempnerinstitute.harvard.edu/
Cluster access, SLURM, storage, and environments.
```

```{grid-item-card} Software Engineering for Research
Collaborative development, testing, packaging, and reproducibility.
```

```{grid-item-card} AI Scaling and Engineering
Parallelism, GPU computing, and experiment management.
```

```{grid-item-card} Workshops
Hands-on training material.
```
````

## Diagram authored in text (Mermaid)

```{mermaid}
flowchart LR
    A[Raw data] --> B[Clean] --> C[Analyze] --> D[Figure or model]
    C --> E[(Saved outputs)]
```

## Site-wide add-ons (no per-page markup)

These apply to every page automatically:

- **Last updated** date in the page footer, taken from git history.
- **OpenGraph** tags in the page head, for rich link previews when shared.
- A **sitemap.xml** generated at the site root, for search engines.
