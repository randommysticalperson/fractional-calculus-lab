/*
Neo-Brutalist Scientific Atlas reminder: this Python code is displayed as a transparent laboratory plate. Keep SciPy/SymPy package usage explicit and reproducible, keep the output readable as a scientific bench note, and render plots as self-contained browser-safe artifacts.
*/

export const pyscriptFractionalDemo = String.raw`import base64
import io

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

plot_data_uri = ""
plot_note = "Matplotlib plot not generated."
try:
    import matplotlib
    matplotlib.use("AGG")
    import matplotlib.pyplot as plt

    dense_x = np.linspace(0.18, 4.2, 260)
    poly_curve = sum(coeffs[n] * dense_x ** n for n in range(len(coeffs)))
    ordinary_curve = coeffs[1] + 2 * coeffs[2] * dense_x + 3 * coeffs[3] * dense_x ** 2
    fractional_curve = sum(
        coeffs[n] * gamma(n + 1) / gamma(n + 1 - alpha) * dense_x ** (n - alpha)
        for n in range(len(coeffs))
    )

    fig, ax = plt.subplots(figsize=(8.4, 4.8), dpi=160)
    fig.patch.set_facecolor("#fff7e5")
    ax.set_facecolor("#fff7e5")
    ax.plot(dense_x, poly_curve, color="#2f6f74", linewidth=2.8, label="p(x)")
    ax.plot(dense_x, ordinary_curve, color="#241b14", linewidth=2.4, linestyle="--", label="ordinary p'(x)")
    ax.plot(dense_x, fractional_curve, color="#9f4329", linewidth=3.0, label=f"RL D^{alpha:.2f} p(x)")
    ax.scatter([x], [fractional_px], color="#9f4329", edgecolor="#241b14", linewidth=1.3, s=58, zorder=4)
    ax.annotate(
        f"x={x:.1f}\nD^αp={fractional_px:.3f}",
        xy=(x, fractional_px),
        xytext=(x + 0.35, fractional_px + 0.45),
        arrowprops={"arrowstyle": "->", "color": "#241b14", "linewidth": 1.2},
        fontsize=9,
        color="#241b14",
    )
    ax.set_title("Python-generated polynomial starter plot", fontweight="bold", color="#241b14")
    ax.set_xlabel("x", color="#241b14")
    ax.set_ylabel("value", color="#241b14")
    ax.grid(True, color="#49382a", alpha=0.22, linestyle="--", linewidth=0.8)
    ax.legend(frameon=True, facecolor="#f4ead5", edgecolor="#241b14", fontsize=9)
    for spine in ax.spines.values():
        spine.set_color("#241b14")
        spine.set_linewidth(1.3)
    ax.tick_params(colors="#241b14")
    fig.tight_layout()

    buffer = io.BytesIO()
    fig.savefig(buffer, format="png", bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    plot_data_uri = "data:image/png;base64," + encoded
    plot_note = "Matplotlib rendered a browser-safe PNG data URI from Python inside Pyodide."
except Exception as exc:
    plot_note = "Matplotlib fallback: " + repr(exc)

output = f"""
Pyodide scientific Python plate: NumPy · SciPy · SymPy are loaded.

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

Plot status: {plot_note}
"""`;
