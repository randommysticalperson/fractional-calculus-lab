# Fractional Calculus Lab — Implementation Plan

Author: **Manus AI**

## Design commitment

The site will use the **Neo-Brutalist Scientific Atlas** direction selected in `ideas.md`. The interface should resemble a tactile research folio rather than a generic dashboard: warm paper, carbon ink, oxide-red warnings, spectral-blue numerical traces, graph-paper plot panels, numbered operator plates, and visible computational provenance. Every CSS, page, and component file edited for the site must begin with a comment reminding future edits to preserve this design philosophy.

## Source grounding

The reference explorer will be grounded in the supplied FCAA contents PDF, which lists **Fractional Calculus and Applied Analysis** contents for Vol. 14 (2011) through Vol. 24 (2021). The official Springer page defines the journal as an international journal for theory and applications of mathematical analysis where differentiations and integrations can be of arbitrary non-integer order.[1] The provided PDF provides the historical contents structure and topics across the 2011–2021 period.[2]

> Springer describes FCAA as dedicated to mathematical analysis where differentiations and integrations may be of arbitrary non-integer order, with an interdisciplinary scope spanning pure and applied mathematics, theoretical physics, and other sciences.[1]

## Product structure

| Area | Purpose | Implementation details |
|---|---|---|
| Hero atlas | Establish the scientific-atlas identity and explain the site | Use generated hero background with high-contrast dark text overlays and operator badges. |
| Operator bench | Let users compare Riemann–Liouville, Caputo, and Grünwald–Letnikov derivatives/integrals | Implement custom TypeScript symbolic rules first; use numerical fallback when symbolic matching fails. |
| TypeScript engine | Provide fast browser-native computation | Custom formulas for constants and powers, numeric gamma/Lanczos approximation, Grünwald–Letnikov weights, fractional integral quadrature. Add optional symbolic formatting and provenance. |
| Python/PyScript engine | Demonstrate SciPy/SymPy support in-browser | Load PyScript/Pyodide with `numpy`, `scipy`, and `sympy`; expose a Python code cell and prebuilt script for power-function fractional derivatives and quadrature approximation. |
| Plot studio | Visualize function, fractional derivative, kernel, and memory weights | Use Recharts already present in the template to avoid adding heavy plotting dependencies. |
| Reference ledger | Provide a searchable FCAA topic explorer | Use extracted/curated JSON from the FCAA contents, with topic tags such as diffusion, differential equations, numerical methods, special functions, stochastic models, and generalized operators. |
| Method notes | Explain assumptions, singularities, and fallback behavior | Present concise mathematical definitions and stability notes in framed theorem panels. |

## Computational strategy

The TypeScript engine should attempt a symbolic route before numerical computation. The first supported symbolic class will be the power law `f(x)=x^β`, where common Riemann–Liouville/Caputo formulas can be displayed as gamma-function ratios. Constants and zero-order cases should be handled explicitly. If the user chooses a generic expression or parameter combination outside the supported symbolic rules, the UI should switch to numerical mode and make that switch visible.

| Operator | Symbolic rule target | Numerical fallback | UI warning |
|---|---|---|---|
| Riemann–Liouville derivative | `D^α x^β = Γ(β+1)/Γ(β-α+1) x^(β-α)` where valid | Grünwald–Letnikov finite difference weights | Warn near `x=0` and gamma poles. |
| Caputo derivative | Same as power rule for β sufficiently above derivative order; constants map to zero | Finite-memory convolution with derivative samples | Warn about initial-condition sensitivity. |
| Riemann–Liouville integral | `I^α x^β = Γ(β+1)/Γ(β+α+1) x^(β+α)` | Left-sided quadrature over kernel `(x-t)^(α-1)` | Warn about integrable singular kernels. |
| Grünwald–Letnikov derivative | Discrete symbolic weight display | Direct weighted finite-difference sum | Warn about step size and memory truncation. |

The Python/PyScript panel should not pretend that SciPy directly provides fractional derivatives as a single canonical API. Instead, it should use **SciPy special functions** such as `gamma`, **NumPy** arrays for sampled grids, and **SymPy** for symbolic display. The PyScript configuration should request `numpy`, `scipy`, and `sympy`, consistent with PyScript’s documented package configuration mechanism.[3]

## Technical architecture

| File | Responsibility |
|---|---|
| `client/index.html` | Include Google Fonts and PyScript CSS/JS assets. |
| `client/src/index.css` | Global Neo-Brutalist Scientific Atlas theme, CSS variables in OKLCH, atlas textures, graph-paper utilities, print-like animation tokens. |
| `client/src/pages/Home.tsx` | Main atlas page, state orchestration, sections, PyScript code block, calculators, plots, reference ledger. |
| `client/src/lib/fractional.ts` | TypeScript fractional calculus math utilities: gamma approximation, generalized binomial coefficients, symbolic-rule selection, numerical samples. |
| `client/src/data/fcaaReferences.json` | Extracted/curated FCAA reference entries and topic summaries. |

## References

[1]: https://link.springer.com/journal/13540 "Fractional Calculus and Applied Analysis — Springer Nature Link"
[2]: https://www.math.bas.bg/~fcaa/FCAA-Contents-2011-2021.pdf "FCAA Contents, Vol. 14 (2011) – Vol. 24 (2021)"
[3]: https://docs.pyscript.net/2024.11.1/user-guide/configuration/ "PyScript configuration — packages option"
