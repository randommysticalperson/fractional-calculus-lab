# Fractional Calculus Lab repair checklist

- [x] Inspect current `client/index.html`, `client/src/lib/pyscriptCode.ts`, and `client/src/pages/Home.tsx` to locate the package-loading failure and best insertion point for the new starter visualization.
- [x] Correct PyScript/Pyodide package loading so NumPy, SciPy, and SymPy are explicitly available before the Python code imports them.
- [x] Add a clear beginner visual for polynomial derivatives, showing `p(x)`, the classical first derivative `p'(x)`, and a fractional derivative curve.
- [x] Mirror the polynomial starter in the Python/PyScript panel using SciPy gamma functions and SymPy symbolic output.
- [x] Run TypeScript and production build checks.
- [x] Preview the page and inspect logs for runtime errors.
- [x] Save a new checkpoint and deliver the updated website version.

# Follow-up: robust Python panel and beginner controls

- [x] Inspect the current iframe/PyScript implementation and confirm why the panel remains at the initialization message.
- [x] Replace the fragile PyScript execution path with a direct Pyodide loader that explicitly loads NumPy, SciPy, and SymPy before executing Python code.
- [x] Add visible status transitions in the Python panel: loading packages, running computation, success, and error fallback.
- [x] Add polynomial coefficient sliders to the derivative starter so users can change the cubic polynomial interactively.
- [x] Add operator comparison presets for ordinary derivative, Riemann–Liouville derivative, and Caputo derivative.
- [x] Run TypeScript/build checks and inspect browser logs for Python runtime errors.
- [ ] Save a new checkpoint and deliver the updated version.

# Continued verification after user request

- [x] Bring the direct Pyodide panel into view and verify whether it reaches a success state instead of remaining at the loading message.
- [x] Inspect recent browser console logs for direct Pyodide, package-loading, iframe, or Python execution errors.
- [x] If runtime still fails, apply a targeted fallback that either loads packages through `loadPackage` reliably or shows a clear Python-source fallback instead of hanging.
- [x] Re-run TypeScript and production build checks after any targeted fix.
- [ ] Save a new checkpoint and deliver the updated version.
