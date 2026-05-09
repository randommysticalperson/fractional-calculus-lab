# Source notes gathered from browsing

## Provided FCAA contents PDF

URL: https://www.math.bas.bg/~fcaa/FCAA-Contents-2011-2021.pdf

The PDF is titled **Fractional Calculus and Applied Analysis (FCAA) Contents, Vol. 14 (2011) – Vol. 24 (2021)**. It lists contents for journal volumes from 2011 through 2021. The extracted first pages show the editor-in-chief as Virginia Kiryakova and publisher transitions from the Institute of Mathematics and Informatics, Bulgarian Academy of Sciences, to De Gruyter/Springer and Walter de Gruyter. Early listed topics include Rudolf Gorenflo’s contribution to fractional calculus, hypersingular equations, inverse problems for fractional diffusion equations, fractional Fokker–Planck–Kolmogorov type equations, nonlinear time-fractional differential equations in combustion science, variable-order fractional derivatives, maximum principles for time-fractional diffusion, generalized-function spaces, and matrix-variate statistical distributions with fractional calculus.

## Official journal page: Springer Nature Link

URL: https://link.springer.com/journal/13540

Springer describes **Fractional Calculus and Applied Analysis** as an international journal dedicated to theory and applications of mathematical analysis where differentiations and integrations may be of arbitrary non-integer order. The page states that the journal publishes original results and surveys related to fractional calculus and applied analysis, emphasizes interdisciplinary and applied work bridging pure and applied mathematics, theoretical physics, and natural/social sciences, and provides a forum for open problems, announcements, and reviews. The journal was founded in 1998 and originally published by the Institute of Mathematics and Informatics, Bulgarian Academy of Sciences. The page lists Virginia Kiryakova as editor-in-chief and gives ISSNs 1311-0454 and 1314-2224.

## Python numerical fractional calculus: differint paper

URL: https://arxiv.org/abs/1912.05303

The arXiv paper **differint: A Python Package for Numerical Fractional Calculus** by Matthew Adams states that fractional calculus is widely studied and applied to physical problems, but numerical algorithms are often implemented ad hoc. The package presents a single repository for numerical algorithms for fractional derivatives and integrals in Python, including Grünwald–Letnikov, improved Grünwald–Letnikov, and Riemann–Liouville algorithms. This supports the website strategy of offering TypeScript-native numerical rules and Python/SciPy/PyScript execution, while making clear that Python fractional calculus may require custom implementations if a browser-compatible dedicated package is unavailable.

## PyScript package loading

URL: https://docs.pyscript.net/2024.11.1/user-guide/configuration/

PyScript configuration supports a **packages** option listing Python packages to install on the Python path. With Pyodide, PyScript uses **micropip** to install packages from PyPI, while MicroPython uses a different package source. The documentation shows packages can be declared in TOML or JSON, for example `packages = ["arrr", "numberwang", "snowballstemmer>=2.2.0"]`. For this project, the website can load PyScript/Pyodide and declare `numpy`, `scipy`, and `sympy` to support browser-side Python computations. Because browser package availability and load time can vary, the UI should include a status indicator and TypeScript fallback.

## TypeScript/browser symbolic library candidates

### Nerdamer

URL: https://nerdamer.com/documentation.html

Nerdamer describes itself as a symbolic math expression evaluator for JavaScript. Its documentation says the library is split into modules including **Algebra**, **Calculus**, **Solve**, and **Special**. It supports parsing expressions, simplification, differentiation via `diff`, integration via `integrate` and `defint`, LaTeX conversion, substitutions, evaluation, solving, limits, Laplace and inverse Laplace functions. This makes it suitable for a browser-side TypeScript symbolic layer, especially for standard calculus rules and expression formatting. Fractional derivatives are not provided directly, so the website should wrap Nerdamer with custom symbolic fractional rules for power functions, constants, exponentials in limited cases, and then fall back to numerical quadrature/difference methods.

### Algebrite

URL: http://algebrite.org/

Algebrite is presented as a self-contained JavaScript computer algebra system with standard JavaScript API access. Its listed features include arbitrary-precision arithmetic, complex quantities, simplification, expansion, substitution, symbolic and numeric roots, matrices/tensors, derivatives/gradients, and integrals/multi-integrals. It is MIT licensed and can be embedded without a server backend. Algebrite is therefore also plausible for symbolic support; however, Nerdamer appears easier to integrate with expression-to-LaTeX and modular browser usage. The implementation should prioritize a small custom symbolic layer plus Nerdamer if package installation works, while preserving a custom fallback so the site remains robust.

