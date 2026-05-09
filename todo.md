# Fractional Calculus Lab repair checklist

- [x] Inspect current `client/index.html`, `client/src/lib/pyscriptCode.ts`, and `client/src/pages/Home.tsx` to locate the package-loading failure and best insertion point for the new starter visualization.
- [x] Correct PyScript/Pyodide package loading so NumPy, SciPy, and SymPy are explicitly available before the Python code imports them.
- [x] Add a clear beginner visual for polynomial derivatives, showing `p(x)`, the classical first derivative `p'(x)`, and a fractional derivative curve.
- [x] Mirror the polynomial starter in the Python/PyScript panel using SciPy gamma functions and SymPy symbolic output.
- [x] Run TypeScript and production build checks.
- [x] Preview the page and inspect logs for runtime errors.
- [ ] Save a new checkpoint and deliver the updated website version.
