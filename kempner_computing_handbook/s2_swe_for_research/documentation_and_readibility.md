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

(documentation_and_readibility:code_readability_best_practices)=
## Code Readability Best Practices

Readable code is documentation in itself: it lowers the cost of every later read, debug, and change. As [PEP 8](https://peps.python.org/pep-0008/) notes, code is read far more often than it is written, and the [Zen of Python](https://peps.python.org/pep-0020/) puts it plainly: "Readability counts."

- **Use meaningful, descriptive names.** Names should reveal intent so the reader does not have to decode them. Avoid ambiguous abbreviations and single-letter names except for short-lived loop counters.
- **Follow a consistent style guide.** For Python, [PEP 8](https://peps.python.org/pep-0008/) is the common baseline: `snake_case` for functions and variables, `UPPER_CASE` for constants, and lines limited to 79 characters (teams may agree to extend to 99). Consistency within a project matters more than any single rule.
- **Keep functions small and focused.** A function should do one thing. The [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html) suggests reconsidering a function once it grows past roughly 40 lines, since smaller functions are easier to read, test, and reuse.
- **Reduce deep nesting with guard clauses.** "Flat is better than nested" (Zen of Python). Return early on invalid or edge cases so the main logic stays at a shallow indentation level.
- **Let comments explain why, not what.** The code already shows what it does; comments should capture intent and non-obvious reasoning. See {ref}`documentation_and_readibility:types_of_documentation` for the role of inline comments.

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

## Tools and Practices

## Documentation in Research Context

## Mental Models for Readers

## Summary Checklist

- [ ] Docstrings on all public functions/classes  
- [ ] README explains purpose, usage, and setup  
- [ ] Style guide followed consistently  
- [ ] Notebook outputs cleared before commit  
- [ ] All dependencies documented  
