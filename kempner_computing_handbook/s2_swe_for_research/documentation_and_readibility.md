# Documentation and Readability

This section focuses on best practices and tools that improve documentation and code clarity in research software.

**Why does documentation matter?**
- Clear documentation ensures reproducibility, collaboration, and long-term usability.  
- Readable code is easier to debug, extend, and validate, which is critical for research integrity.

(documentation_and_readibility:types_of_documentation)=
## Types of Documentation

Documentation is not a single thing: different types serve different reader needs, and matching the type to the need is what keeps docs useful. A widely used way to organize these needs is the [Diátaxis](https://diataxis.fr/) framework, which separates documentation into four kinds:

- **Tutorials (learning-oriented):** lessons that take a newcomer through a hands-on experience to build basic competence.
- **How-to guides (task-oriented):** practical, step-by-step directions that help an already-competent user accomplish a specific goal.
- **Reference (information-oriented):** accurate, lookup-friendly descriptions of the machinery, such as APIs, parameters, and configuration.
- **Explanation (understanding-oriented):** background and discussion that clarifies concepts and answers "why" questions.

```{figure} figures/png/diataxis_map.png
---
width: 85%
name: diataxis-map
---
The Diátaxis map organizes the four documentation types along two axes: action versus cognition, and acquiring versus applying skill. (*Credit: [Daniele Procida / diataxis.fr](https://diataxis.fr/), CC BY-SA 4.0*)
```

Most research projects do not need all four as separate manuals, but they usually combine a few concrete artifacts:

- **README (the front door):** the first file a reader opens. It should state what the project is, how to install it, and a minimal usage example, then point to anything deeper.
- **Docstrings and API reference:** per [PEP 257](https://peps.python.org/pep-0257/), a docstring is a string literal placed as the first statement in a module, function, class, or method. Docstrings on public functions and classes are the source of reference documentation and are accessible at runtime via `__doc__`.
- **Inline comments:** explain *why*, not *what*. The code already shows what it does; comments should capture intent, assumptions, and non-obvious reasoning.
- **Runnable examples and tutorials:** small scripts or notebooks a reader can execute to see the project work end to end.

A minimal README outline that covers the essentials:

```markdown
# Project Name
One-sentence description of what it does and why.

## Installation
How to set up the environment and install dependencies.

## Usage
A minimal, runnable example.

## License / Citation
How to reuse and how to cite.
```

```{tip}
Keep the README short and link out for depth. For broader guidance on documenting research software, see [The Turing Way](https://book.the-turing-way.org/) and [Write the Docs](https://www.writethedocs.org/).
```

(documentation_and_readibility:code_readability_best_practices)=
## Code Readability Best Practices

Readable code is documentation in itself: it lowers the cost of every later read, debug, and change. As [PEP 8](https://peps.python.org/pep-0008/) notes, code is read far more often than it is written, and the [Zen of Python](https://peps.python.org/pep-0020/) puts it plainly: "Readability counts."

- **Use meaningful, descriptive names.** Names should reveal intent so the reader does not have to decode them. Avoid ambiguous abbreviations and single-letter names except for short-lived loop counters.
- **Follow a consistent style guide.** For Python, [PEP 8](https://peps.python.org/pep-0008/) is the common baseline: `snake_case` for functions and variables, `UPPER_CASE` for constants, and lines limited to 79 characters (teams may agree to extend to 99). Consistency within a project matters more than any single rule.
- **Keep functions small and focused.** A function should do one thing. The [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html) suggests reconsidering a function once it grows past roughly 40 lines, since smaller functions are easier to read, test, and reuse.
- **Reduce deep nesting with guard clauses.** "Flat is better than nested" (Zen of Python). Return early on invalid or edge cases so the main logic stays at a shallow indentation level.
- **Let comments explain why, not what.** The code already shows what it does; comments should capture intent and non-obvious reasoning. See {ref}`Types of Documentation <documentation_and_readibility:types_of_documentation>` for the role of inline comments.

A small refactor that applies clear names plus an early-return guard clause:

```python
# Before: cryptic names and deep nesting
def p(d):
    if d:
        if d > 0:
            return d * 0.9  # what is 0.9?
    return None

# After: descriptive names and a guard clause
DISCOUNT_RATE = 0.9  # 10% loyalty discount

def apply_discount(price):
    if price is None or price <= 0:
        return None
    return price * DISCOUNT_RATE
```

```{tip}
You do not have to apply a style guide by hand. Automated formatters and linters can enforce these conventions for you; they are covered in the next section.
```

(documentation_and_readibility:tools_and_practices)=
## Tools and Practices

A small toolchain turns the docstrings described in {ref}`Types of Documentation <documentation_and_readibility:types_of_documentation>` into browsable, searchable documentation, and keeps the examples inside them honest as the code changes.

- **Pick a docstring style and stay consistent.** [PEP 257](https://peps.python.org/pep-0257/) defines what a docstring is and the basic one-line and multi-line conventions, but not how to lay out arguments and return values. The two common structured styles are [Google style](https://google.github.io/styleguide/pyguide.html#38-comments-and-docstrings) and [NumPy style](https://numpydoc.readthedocs.io/en/latest/format.html). Either works; the goal is to use one consistently across a project.
- **Generate docs from docstrings.** [Sphinx](https://www.sphinx-doc.org/) builds documentation directly from your code: the [autodoc](https://www.sphinx-doc.org/en/master/usage/extensions/autodoc.html) extension pulls in docstrings, and the [napoleon](https://www.sphinx-doc.org/en/master/usage/extensions/napoleon.html) extension lets autodoc understand Google- and NumPy-style docstrings. If your project documents in Markdown, [MkDocs](https://www.mkdocs.org/) with the [mkdocstrings](https://mkdocstrings.github.io/) plugin does the same job.
- **Test the examples with doctest.** Python's [doctest](https://docs.python.org/3/library/doctest.html) module finds `>>>` examples in docstrings, runs them, and checks the output against what you wrote, so examples cannot silently drift out of date.
- **Add type hints as checked interface documentation.** [PEP 484](https://peps.python.org/pep-0484/) annotations record the expected argument and return types in a form that a static checker can verify, documenting the interface without separate prose. Note that these are not enforced at runtime.
- **Host the built docs.** [Read the Docs](https://docs.readthedocs.io/) builds and hosts Sphinx or MkDocs sites automatically from your Git repository, rebuilding on each push so the published docs track the code.

A NumPy-style docstring with type hints and an embedded doctest:

```python
def normalize(values: list[float]) -> list[float]:
    """Scale values so they sum to 1.

    Parameters
    ----------
    values : list[float]
        Non-empty list of non-negative numbers.

    Returns
    -------
    list[float]
        The input values divided by their total.

    Examples
    --------
    >>> normalize([1.0, 1.0, 2.0])
    [0.25, 0.25, 0.5]
    """
    total = sum(values)
    return [v / total for v in values]
```

```bash
# Run the embedded examples; no output means every example passed.
python -m doctest example.py
```

```{tip}
Keeping a `>>> ` example in the docstring means the same snippet documents the function and serves as a regression test. Writing readable code in the first place (see {ref}`Code Readability Best Practices <documentation_and_readibility:code_readability_best_practices>`) makes that documentation shorter and clearer.
```

(documentation_and_readibility:documentation_in_research_context)=
## Documentation in Research Context

Research code carries documentation needs beyond general software: the documentation must let others, and your future self, understand the work, reproduce a result, and cite it correctly.

- **Document methods, parameters, and assumptions.** Record the method, the parameter values and ranges, random seeds, software versions, and any assumptions a result depends on, so the result can be regenerated rather than guessed at. This is the heart of reproducibility; for the full treatment see the [Reproducible Research](reproducible_research.md) chapter.
- **Document the data.** Ship a dataset README or a data dictionary (also called a codebook) that lists each variable with its meaning, units, allowed values, and provenance. The [Turing Way](https://book.the-turing-way.org/reproducible-research/rdm/rdm-metadata/) calls a data dictionary one of the most important pieces of documentation in a study. At a high level, aim for [FAIR](https://www.go-fair.org/fair-principles/) data: Findable, Accessible, Interoperable, and Reusable.
- **Make the work citable.** Add a [`CITATION.cff`](https://citation-file-format.github.io/) file to the repository root. It is a small YAML file that tools can read, and GitHub uses it to add a "Cite this repository" link and to offer APA and BibTeX citations (see GitHub's [about-citation-files](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-citation-files)). To get a citable, versioned DOI, archive a release with a service such as Zenodo, then record that DOI in the file.

```{figure} figures/png/fair_principles.png
---
width: 90%
name: fair-principles
---
The FAIR guiding principles for research data: Findable, Accessible, Interoperable, and Reusable. (*Credit: [SangyaPundir / Wikimedia Commons](https://commons.wikimedia.org/wiki/File:FAIR_data_principles.svg), CC BY-SA 4.0*)
```

A minimal, valid `CITATION.cff`:

```yaml
cff-version: 1.2.0
message: "If you use this software, please cite it as below."
title: "Example Analysis Toolkit"
authors:
  - family-names: Smith
    given-names: Jane
version: 1.0.0
doi: 10.5281/zenodo.1234567   # DOI for the archived release
```

```{tip}
Update the `version` and `doi` each time you archive a new release, so a citation points to the exact version that produced a result.
```

(documentation_and_readibility:mental_models_for_readers)=
## Mental Models for Readers

As someone reads your code or docs, they build a [mental model](https://www.nngroup.com/articles/mental-models/) of how it works: an internal picture of the moving parts and how they fit together. Your job is to help them build an accurate one quickly. Clear code and docs do this for you; surprising or unexplained code forces the reader to reverse-engineer your intent.

- **Beware the curse of knowledge.** The [curse of knowledge](https://en.wikipedia.org/wiki/Curse_of_knowledge) is the bias that, once you know something, you assume others share that context. What is obvious to you as the author is not obvious to a newcomer or to your future self, so write for a reader who lacks your background and spell out the assumptions you take for granted.
- **Follow the principle of least astonishment.** A component should [behave the way most readers expect](https://en.wikipedia.org/wiki/Principle_of_least_astonishment), so names and behavior should match conventions and hold no hidden surprises. A function named like a pure lookup should not quietly write a file or mutate its input. See {ref}`Code Readability Best Practices <documentation_and_readibility:code_readability_best_practices>` for naming that reveals intent.
- **Use progressive disclosure.** [Progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/) means leading with the few most important things and deferring the rest. Put the common case and a high-level overview first, and push details, options, and edge cases lower so a reader is not flooded before they have the big picture.
- **Lead with the why.** Before the mechanics, give a short conceptual overview of what the code is for and why it exists. This is the explanation type from {ref}`Types of Documentation <documentation_and_readibility:types_of_documentation>`, and it is the context a reader needs to interpret everything that follows.

A name that matches behavior keeps the reader's mental model accurate:

```python
# Astonishing: the name implies a read-only lookup, but it mutates input
def get_user(users, index):
    users.sort()           # surprising side effect hidden behind a "get"
    return users[index]

# Unsurprising: the name matches what the function actually does
def find_user(users, index):
    return users[index]    # pure lookup, no side effects
```

```{tip}
A quick check: skim your README or module top-down and ask whether a reader who has never seen the project would, after the first few lines, know what it does and why. If not, add a short overview before the details.
```

## Summary Checklist

- [ ] Docstrings on all public functions/classes  
- [ ] README explains purpose, usage, and setup  
- [ ] Style guide followed consistently  
- [ ] Notebook outputs cleared before commit  
- [ ] All dependencies documented  
