/*
Neo-Brutalist Scientific Atlas reminder: this PyScript code is displayed as a transparent laboratory plate. Keep SciPy/SymPy package usage explicit and reproducible.
*/

export const pyscriptFractionalDemo = String.raw`from pyscript import display
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

message = f"""
SciPy/SymPy fractional power plate\n
α = {alpha:.2f}, β = {beta:.2f}, x = {x:.2f}\nRiemann–Liouville D^α x^β = {rl_derivative:.8f}\nRiemann–Liouville I^α x^β = {rl_integral:.8f}\nSymPy formula: {sp.sstr(symbolic)}\nNumPy sample: {np.array2string(trace, precision=4)}\n"""

display(message, target="py-output")`;
