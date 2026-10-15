---
name: documentation-and-readability
description: Use when writing or reviewing docstrings, comments, a README, or project documentation, or when making research code easier to read. Covers READMEs, PEP 257 docstrings in Google or NumPy style, comments that explain why, PEP 8 naming, small functions and guard clauses, type hints, doctest, Sphinx and MkDocs, data dictionaries, and CITATION.cff files. From the Kempner Institute Computing Handbook.
---

# Documentation and Readability

Use these practices when you write or review code, comments, or documentation in a research project. They summarize the Documentation and Readability chapter of the Kempner Institute Computing Handbook: https://handbook.eng.kempnerinstitute.harvard.edu/s2_swe_for_research/documentation_and_readibility.html

If the project has its own conventions, for example in its README, a CONTRIBUTING file, or agent instructions, follow those first. Keep the docstring style the project already uses.

## Readable code

- Use descriptive names that reveal intent. Avoid ambiguous abbreviations and single-letter names, except for short loop counters.
- Follow PEP 8: `snake_case` for functions and variables, `UPPER_CASE` for constants, and lines of at most 79 characters, or the limit the team agreed on, such as 99.
- Keep functions small and focused on one thing. Reconsider a function once it grows past about 40 lines.
- Return early on invalid input and edge cases (guard clauses), so the main logic is not deeply nested.
- Replace magic numbers with named constants, for example `DISCOUNT_RATE = 0.9`.
- Make behavior match the name. A function named like a lookup, such as `get_user`, must not write files or change its input.
- Let formatters and linters enforce the style guide.

## Comments and docstrings

- Write comments that explain why: intent, assumptions, and non-obvious reasoning. Do not repeat what the code says.
- Give each public module, function, class, and method a docstring as its first statement (PEP 257).
- Use one structured docstring style across the project, Google style or NumPy style, and document parameters, return values, and raised exceptions.
- Add type hints (PEP 484) to public interfaces. They document types for static checkers, but Python does not enforce them at runtime.
- Add a short `>>>` example where it helps, and check it with `python -m doctest example.py`.

## README and project docs

- Make the README the front door: a one-sentence description, installation, a minimal runnable example, and how to reuse and cite the work. Keep it short and link out for depth.
- Start with what the code is for and why, then the common case. Put options and edge cases later.
- Write for a reader who does not share your context, and state your assumptions.
- For larger docs, separate the four Diátaxis types: tutorials, how-to guides, reference, and explanation.
- Build API reference from docstrings with Sphinx (autodoc, plus napoleon for Google or NumPy style), or with MkDocs and mkdocstrings. Read the Docs can build and host the docs on each push.

## Research documentation

- Record the method, parameter values and ranges, random seeds, software versions, and assumptions behind each result.
- Document each dataset with a README or data dictionary that lists every variable with its meaning, units, allowed values, and provenance. Aim for FAIR data: Findable, Accessible, Interoperable, and Reusable.
- Add a `CITATION.cff` file at the repository root, and update its `version` and `doi` for each archived release. Add a `doi` only after Zenodo or another archive mints one. Never invent a DOI.

```yaml
cff-version: 1.2.0
message: "If you use this software, please cite it as below."
title: "Example Analysis Toolkit"
authors:
  - family-names: Smith
    given-names: Jane
version: 1.0.0
doi: 10.5281/zenodo.1234567   # the DOI the archive minted for this release
```

## Before you finish

- New and changed public functions and classes have docstrings.
- The README still matches any setup or usage you changed.
- New dependencies are documented.
- Suggest clearing notebook outputs before a commit, but do not clear them without asking.
