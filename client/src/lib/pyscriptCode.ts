/*
Neo-Brutalist Scientific Atlas reminder: this PyScript code is displayed as a transparent laboratory plate. Keep SciPy/SymPy package usage explicit and reproducible.
*/

export const pyscriptFractionalDemo = String.raw`from pyscript import display
try:
    import numpy as np
    from scipy.special import gamma
    import sympy as sp
except ModuleNotFoundError:
    import micropip
    await micropip.install(["numpy", "scipy", "sympy"])
    import numpy as np
    from scipy.special import gamma
    import sympy as sp

alpha = 0.63
beta = 2.40
x = 2.00

rl_derivative = gamma(beta + 1) / gamma(beta - alpha + 1) * x ** (beta - alpha)
rl_integral = gamma(beta + 1) / gamma(beta + alpha + 1) * x ** (beta + alpha)

s_alpha, s_beta, s_x = sp.symbols("alpha beta x", positive=True)
symbolic = sp.gamma(s_beta + 1) / sp.gamma(s_beta - s_alpha + 1) * s_x ** (s_beta - s_alpha)

xs = np.linspace(0.2, 4.0, 8)
trace = gamma(beta + 1) / gamma(beta - alpha + 1) * xs ** (beta - alpha)

# Starter polynomial: p(x)=0.18x^3 - 0.85x^2 + 1.65x + 0.45.
coeffs = np.array([0.45, 1.65, -0.85, 0.18])
px = sum(coeffs[n] * x ** n for n in range(len(coeffs)))
classical_px = coeffs[1] + 2 * coeffs[2] * x + 3 * coeffs[3] * x ** 2
fractional_px = sum(
    coeffs[n] * gamma(n + 1) / gamma(n + 1 - alpha) * x ** (n - alpha)
    for n in range(len(coeffs))
)
poly_samples = []
for sample_x in np.linspace(0.5, 3.0, 6):
    frac_value = sum(
        coeffs[n] * gamma(n + 1) / gamma(n + 1 - alpha) * sample_x ** (n - alpha)
        for n in range(len(coeffs))
    )
    poly_samples.append(frac_value)

sx = sp.symbols("x", positive=True)
poly_symbolic = sp.Rational(18, 100) * sx**3 - sp.Rational(85, 100) * sx**2 + sp.Rational(165, 100) * sx + sp.Rational(45, 100)
classical_symbolic = sp.diff(poly_symbolic, sx)
frac_symbolic = sum(
    sp.Rational(str(coeffs[n])) * sp.gamma(n + 1) / sp.gamma(n + 1 - s_alpha) * sx ** (n - s_alpha)
    for n in range(len(coeffs))
)

message = f"""
SciPy/SymPy fractional power plate

α = {alpha:.2f}, β = {beta:.2f}, x = {x:.2f}
Riemann–Liouville D^α x^β = {rl_derivative:.8f}
Riemann–Liouville I^α x^β = {rl_integral:.8f}
SymPy formula: {sp.sstr(symbolic)}
NumPy sample: {np.array2string(trace, precision=4)}

Polynomial derivative starter
p(x) = {sp.sstr(poly_symbolic)}
p'(x) = {sp.sstr(classical_symbolic)}
D^α p(x) formula = {sp.sstr(frac_symbolic)}
At x = {x:.2f}: p(x) = {px:.6f}, p'(x) = {classical_px:.6f}, D^αp(x) = {fractional_px:.6f}
SciPy fractional polynomial samples: {np.array2string(np.array(poly_samples), precision=4)}
"""

display(message, target="py-output")`;
