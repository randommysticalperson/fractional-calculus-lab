# Continued runtime verification notes

The updated page preview shows the derivative starter with polynomial coefficient sliders for constant, x, x², and x³ terms, plus comparison presets for ordinary derivative, Riemann–Liouville derivative, and Caputo derivative. The navigation and extracted page markdown identify the Python section as “Python / Pyodide SciPy plate,” stating that it uses a direct Pyodide loader and explicitly loads numpy, scipy, and sympy. Manual scrolling brought the derivative starter and operator bench into view, but the iframe runtime output itself has not yet been visually confirmed in the viewport. Next inspection will use targeted page navigation or programmatic viewport movement to locate the iframe and inspect browser console logs for Pyodide/package-loading errors.

## Additional preview check

Reopened the preview at `#python-lab` and used the navigation item for “PyScript SciPy.” The page still required manual scrolling and the visible screenshot landed around the operator bench controls rather than the Python iframe. The page markdown confirms the direct Pyodide section text and the new derivative starter controls, but iframe runtime text is still not visible in the extracted markdown. The next check should rely on logs and a targeted fallback rather than repeated scrolling.

## Main-page Pyodide verification after targeted replacement

The updated preview at `#python-lab` now shows the Python panel in a successful state: **“Python plate ready — computed in browser with Pyodide.”** The visible output confirms that NumPy, SciPy, and SymPy loaded and that the fractional power-law computation plus the polynomial derivative starter executed. The page now displays Riemann–Liouville derivative and integral values, a SymPy formula, NumPy samples, and polynomial starter results including `p(x)`, `p'(x)`, and `D^αp(x)`.
