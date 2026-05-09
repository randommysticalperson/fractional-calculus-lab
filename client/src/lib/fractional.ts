/*
Neo-Brutalist Scientific Atlas reminder: this engine supports a visible, provenance-rich research folio UI. Preserve explicit method labels, warnings, and operator-plate terminology rather than hiding computation behind generic helpers.
*/

import nerdamer from "nerdamer";
import "nerdamer/Calculus";
import "nerdamer/Algebra";
import "nerdamer/Solve";

export type OperatorKind = "riemann-liouville-derivative" | "caputo-derivative" | "riemann-liouville-integral" | "grunwald-letnikov";

export interface EngineInput {
  alpha: number;
  beta: number;
  x: number;
  step: number;
  terms: number;
  operator: OperatorKind;
}

export interface SymbolicResult {
  ok: boolean;
  expression: string;
  tex: string;
  method: "nerdamer+custom-rule" | "custom-rule" | "unsupported";
  warning?: string;
}

export interface NumericPoint {
  x: number;
  f: number;
  derivative: number;
  integral: number;
  gl: number;
  kernel: number;
}

export interface EngineResult {
  symbolic: SymbolicResult;
  numericValue: number;
  numericLabel: string;
  numericPoints: NumericPoint[];
  weights: { k: number; value: number }[];
  provenance: string[];
  warnings: string[];
}

const LANCZOS_COEFFICIENTS = [
  676.5203681218851,
  -1259.1392167224028,
  771.32342877765313,
  -176.61502916214059,
  12.507343278686905,
  -0.13857109526572012,
  9.9843695780195716e-6,
  1.5056327351493116e-7,
];

export function gamma(z: number): number {
  if (Number.isInteger(z) && z <= 0) return Number.NaN;
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  z -= 1;
  let x = 0.99999999999980993;
  for (let i = 0; i < LANCZOS_COEFFICIENTS.length; i += 1) {
    x += LANCZOS_COEFFICIENTS[i] / (z + i + 1);
  }
  const t = z + LANCZOS_COEFFICIENTS.length - 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

function finite(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

export function powerFunction(beta: number, x: number): number {
  if (x < 0 && Math.abs(beta % 1) > 1e-8) return Number.NaN;
  return Math.pow(Math.max(x, 0), beta);
}

export function riemannLiouvillePowerDerivative(alpha: number, beta: number, x: number): number {
  const denominator = gamma(beta - alpha + 1);
  const numerator = gamma(beta + 1);
  if (!Number.isFinite(denominator) || Math.abs(denominator) < 1e-12) return Number.NaN;
  return (numerator / denominator) * Math.pow(Math.max(x, 1e-9), beta - alpha);
}

export function caputoPowerDerivative(alpha: number, beta: number, x: number): number {
  if (Math.abs(beta) < 1e-12) return 0;
  const ceilAlpha = Math.ceil(alpha);
  if (beta < ceilAlpha - 1) return Number.NaN;
  return riemannLiouvillePowerDerivative(alpha, beta, x);
}

export function riemannLiouvillePowerIntegral(alpha: number, beta: number, x: number): number {
  const denominator = gamma(beta + alpha + 1);
  const numerator = gamma(beta + 1);
  if (!Number.isFinite(denominator) || Math.abs(denominator) < 1e-12) return Number.NaN;
  return (numerator / denominator) * Math.pow(Math.max(x, 0), beta + alpha);
}

export function generalizedBinomial(alpha: number, k: number): number {
  if (k === 0) return 1;
  let coefficient = 1;
  for (let i = 1; i <= k; i += 1) {
    coefficient *= (alpha - i + 1) / i;
  }
  return coefficient;
}

export function grunwaldLetnikovPower(alpha: number, beta: number, x: number, h: number, terms: number): number {
  const n = Math.max(1, Math.min(terms, Math.floor(x / h)));
  let total = 0;
  for (let k = 0; k <= n; k += 1) {
    const weight = Math.pow(-1, k) * generalizedBinomial(alpha, k);
    total += weight * powerFunction(beta, x - k * h);
  }
  return total / Math.pow(h, alpha);
}

export function symbolicPowerRule(input: EngineInput): SymbolicResult {
  const { alpha, beta, operator } = input;
  const roundedAlpha = Number(alpha.toFixed(4));
  const roundedBeta = Number(beta.toFixed(4));
  let expression = "";
  let warning = "Symbolic support is intentionally scoped to f(x)=x^β and gamma-function rules; generic expressions use the numerical plate.";

  if (operator === "riemann-liouville-integral") {
    expression = `(gamma(${roundedBeta}+1)/gamma(${roundedBeta}+${roundedAlpha}+1))*x^(${roundedBeta}+${roundedAlpha})`;
  } else if (operator === "caputo-derivative") {
    if (Math.abs(beta) < 1e-12) {
      expression = "0";
      warning = "Caputo derivative of a constant is zero under the selected left-sided convention.";
    } else {
      expression = `(gamma(${roundedBeta}+1)/gamma(${roundedBeta}-${roundedAlpha}+1))*x^(${roundedBeta}-${roundedAlpha})`;
    }
  } else {
    expression = `(gamma(${roundedBeta}+1)/gamma(${roundedBeta}-${roundedAlpha}+1))*x^(${roundedBeta}-${roundedAlpha})`;
  }

  try {
    const simplified = nerdamer(expression).toString();
    const tex = nerdamer.convertToLaTeX(simplified);
    return { ok: true, expression: simplified, tex, method: "nerdamer+custom-rule", warning };
  } catch {
    return { ok: true, expression, tex: expression, method: "custom-rule", warning };
  }
}

export function makeSamples(input: EngineInput): NumericPoint[] {
  const { alpha, beta, step, terms } = input;
  const points: NumericPoint[] = [];
  const maxX = 6;
  const count = 96;
  for (let i = 1; i <= count; i += 1) {
    const x = (maxX * i) / count;
    const derivative = riemannLiouvillePowerDerivative(alpha, beta, x);
    const integral = riemannLiouvillePowerIntegral(alpha, beta, x);
    const gl = grunwaldLetnikovPower(alpha, beta, x, Math.max(step, 0.01), terms);
    const kernel = Math.pow(Math.max(x, 1e-9), alpha - 1) / gamma(alpha);
    points.push({
      x: Number(x.toFixed(3)),
      f: finite(powerFunction(beta, x)),
      derivative: finite(derivative),
      integral: finite(integral),
      gl: finite(gl),
      kernel: finite(kernel),
    });
  }
  return points;
}

export function makeWeights(alpha: number, terms: number): { k: number; value: number }[] {
  const max = Math.max(4, Math.min(terms, 40));
  return Array.from({ length: max + 1 }, (_, k) => ({
    k,
    value: Math.pow(-1, k) * generalizedBinomial(alpha, k),
  }));
}

export function runEngine(input: EngineInput): EngineResult {
  const symbolic = symbolicPowerRule(input);
  const warnings: string[] = [];
  if (input.x <= 0.05) warnings.push("Values close to the lower terminal x=0 may expose kernel singularities or gamma poles.");
  if (input.alpha <= 0 || input.alpha >= 2) warnings.push("This lab focuses on 0 < α < 2. Results outside that band should be treated as exploratory.");
  if (input.step > 0.2) warnings.push("Large Grünwald–Letnikov steps can blur the memory kernel; lower h for convergence experiments.");

  let numericValue: number;
  let numericLabel: string;
  switch (input.operator) {
    case "caputo-derivative":
      numericValue = caputoPowerDerivative(input.alpha, input.beta, input.x);
      numericLabel = "Caputo symbolic power-rule value";
      break;
    case "riemann-liouville-integral":
      numericValue = riemannLiouvillePowerIntegral(input.alpha, input.beta, input.x);
      numericLabel = "Riemann–Liouville fractional integral value";
      break;
    case "grunwald-letnikov":
      numericValue = grunwaldLetnikovPower(input.alpha, input.beta, input.x, input.step, input.terms);
      numericLabel = "Grünwald–Letnikov weighted-memory value";
      break;
    default:
      numericValue = riemannLiouvillePowerDerivative(input.alpha, input.beta, input.x);
      numericLabel = "Riemann–Liouville fractional derivative value";
  }

  if (!Number.isFinite(numericValue)) warnings.push("The selected parameters approach a gamma pole or unsupported Caputo power case; inspect symbolic denominator conditions.");

  return {
    symbolic,
    numericValue: finite(numericValue, Number.NaN),
    numericLabel,
    numericPoints: makeSamples(input),
    weights: makeWeights(input.alpha, input.terms),
    provenance: [
      "TypeScript gamma: Lanczos approximation",
      "Symbolic route: custom fractional power rule passed through Nerdamer where possible",
      "Numerical route: Grünwald–Letnikov finite-memory convolution and gamma-ratio sampling",
    ],
    warnings,
  };
}

export const operatorCopy: Record<OperatorKind, { label: string; short: string; definition: string }> = {
  "riemann-liouville-derivative": {
    label: "Riemann–Liouville derivative",
    short: "RL-D",
    definition: "A left-sided fractional derivative obtained by differentiating a fractional integral; powerful for kernel analysis but can give nonzero derivatives for constants.",
  },
  "caputo-derivative": {
    label: "Caputo derivative",
    short: "C-D",
    definition: "A derivative-after-integer-differentiation form often preferred in initial-value models because ordinary initial conditions remain interpretable.",
  },
  "riemann-liouville-integral": {
    label: "Riemann–Liouville integral",
    short: "RL-I",
    definition: "A weakly singular convolution integral that encodes power-law memory from a lower terminal.",
  },
  "grunwald-letnikov": {
    label: "Grünwald–Letnikov derivative",
    short: "GL-D",
    definition: "A fractional finite-difference limit using generalized binomial weights, well suited to discrete memory experiments.",
  },
};
