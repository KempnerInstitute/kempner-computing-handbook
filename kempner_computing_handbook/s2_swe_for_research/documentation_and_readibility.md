# Documentation and Readability

This section focuses on best practices and tools that improve documentation and code clarity in research software.

Why Does Documentation Matter?
- Clear documentation ensures reproducibility, collaboration, and long-term usability.  
- Readable code is easier to debug, extend, and validate - critical for research integrity.

(documentation_and_readibility:types_of_documentation)=
## Types of Documentation

Documentation is not a single thing: different types serve different reader needs, and matching the type to the need is what keeps docs useful. A widely used way to organize these needs is the [Diataxis](https://diataxis.fr/) framework, which separates documentation into four kinds:

- **Tutorials (learning-oriented):** lessons that take a newcomer through a hands-on experience to build basic competence.
- **How-to guides (task-oriented):** practical, step-by-step directions that help an already-competent user accomplish a specific goal.
- **Reference (information-oriented):** accurate, lookup-friendly descriptions of the machinery, such as APIs, parameters, and configuration.
- **Explanation (understanding-oriented):** background and discussion that clarifies concepts and answers "why" questions.

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

## Code Readability Best Practices

## Tools and Practices

## Documentation in Research Context

## Mental Models for Readers

## Summary Checklist

- [ ] Docstrings on all public functions/classes  
- [ ] README explains purpose, usage, and setup  
- [ ] Style guide followed consistently  
- [ ] Notebook outputs cleared before commit  
- [ ] All dependencies documented  
