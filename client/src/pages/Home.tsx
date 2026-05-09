/*
Neo-Brutalist Scientific Atlas reminder: preserve the asymmetric research-folio layout, tactile operator plates, graph-paper plotting fields, warm paper, carbon ink, and visible computation provenance. Ask: does this choice reinforce or dilute the design philosophy?
*/

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BookOpen, Code2, FlaskConical, FunctionSquare, Library, Sigma, Waves } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { runEngine, operatorCopy, type OperatorKind } from "@/lib/fractional";
import { pyscriptFractionalDemo } from "@/lib/pyscriptCode";
import { fcaaReferences, topicTallies } from "@/data/fcaaCurated";

const heroImage = "/manus-storage/fractional-hero-atlas_72ebcb39.png";
const operatorImage = "/manus-storage/fractional-operator-plates_56bac27b.png";
const referenceImage = "/manus-storage/fractional-reference-ledger_05ab69ca.png";
const dualEngineImage = "/manus-storage/fractional-python-typescript-dual-engine_d702f87d.png";

const operators = Object.entries(operatorCopy) as [OperatorKind, (typeof operatorCopy)[OperatorKind]][];
type StarterComparison = "ordinary" | "riemann-liouville" | "caputo";
const starterComparisons: Record<StarterComparison, { label: string; short: string; note: string }> = {
  ordinary: { label: "Ordinary derivative", short: "d/dx", note: "The classical starter: each polynomial term loses exactly one power." },
  "riemann-liouville": { label: "Riemann–Liouville", short: "RL-D", note: "The constant term is not erased; the lower terminal contributes a memory singularity." },
  caputo: { label: "Caputo", short: "C-D", note: "Polynomial terms below the integer ceiling of α vanish, matching classical initial-condition intuition." },
};

function numeric(value: number) {
  if (!Number.isFinite(value)) return "singular / unsupported";
  return Math.abs(value) > 10000 || Math.abs(value) < 0.0001 ? value.toExponential(5) : value.toFixed(6);
}

function starterPolynomialData(alpha: number, coeffs: number[], comparison: StarterComparison) {
  const localGamma = (z: number): number => {
    const p = [676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * localGamma(1 - z));
    z -= 1;
    let xg = 0.99999999999980993;
    for (let i = 0; i < p.length; i += 1) xg += p[i] / (z + i + 1);
    const t = z + p.length - 0.5;
    return Math.sqrt(2 * Math.PI) * t ** (z + 0.5) * Math.exp(-t) * xg;
  };
  return Array.from({ length: 57 }, (_, index) => {
    const x = 0.15 + index * 0.085;
    const p = coeffs[0] + coeffs[1] * x + coeffs[2] * x ** 2 + coeffs[3] * x ** 3;
    const classical = coeffs[1] + 2 * coeffs[2] * x + 3 * coeffs[3] * x ** 2;
    const rl = coeffs.reduce((sum, coeff, power) => {
      const denom = localGamma(power + 1 - alpha);
      if (!Number.isFinite(denom) || Math.abs(denom) < 1e-12) return sum;
      return sum + coeff * (localGamma(power + 1) / denom) * x ** (power - alpha);
    }, 0);
    const caputo = coeffs.reduce((sum, coeff, power) => {
      if (power < Math.ceil(alpha)) return sum;
      const denom = localGamma(power + 1 - alpha);
      if (!Number.isFinite(denom) || Math.abs(denom) < 1e-12) return sum;
      return sum + coeff * (localGamma(power + 1) / denom) * x ** (power - alpha);
    }, 0);
    const selected = comparison === "ordinary" ? classical : comparison === "caputo" ? caputo : rl;
    return { x: Number(x.toFixed(3)), polynomial: p, ordinary: classical, rl, caputo, selected };
  });
}

const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
const PYODIDE_INDEX_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";

async function loadPyodideScript() {
  const w = window as typeof window & { loadPyodide?: (options: { indexURL: string }) => Promise<any> };
  if (w.loadPyodide) return w.loadPyodide;
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${PYODIDE_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Pyodide script failed to load.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = PYODIDE_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Pyodide script failed to load from jsDelivr."));
    document.head.appendChild(script);
  });
  if (!w.loadPyodide) throw new Error("Pyodide script loaded, but loadPyodide was not attached to window.");
  return w.loadPyodide;
}

export default function Home() {
  const [alpha, setAlpha] = useState(0.63);
  const [beta, setBeta] = useState(2.4);
  const [x, setX] = useState(2.0);
  const [step, setStep] = useState(0.05);
  const [terms, setTerms] = useState(34);
  const [operator, setOperator] = useState<OperatorKind>("riemann-liouville-derivative");
  const [query, setQuery] = useState("");
  const [polyCoeffs, setPolyCoeffs] = useState([0.45, 1.65, -0.85, 0.18]);
  const [starterComparison, setStarterComparison] = useState<StarterComparison>("riemann-liouville");

  const result = useMemo(() => runEngine({ alpha, beta, x, step, terms, operator }), [alpha, beta, x, step, terms, operator]);
  const polynomialStarter = useMemo(() => starterPolynomialData(alpha, polyCoeffs, starterComparison), [alpha, polyCoeffs, starterComparison]);
  const polynomialFormula = useMemo(() => `${polyCoeffs[3].toFixed(2)}x³ ${polyCoeffs[2] < 0 ? "−" : "+"} ${Math.abs(polyCoeffs[2]).toFixed(2)}x² ${polyCoeffs[1] < 0 ? "−" : "+"} ${Math.abs(polyCoeffs[1]).toFixed(2)}x ${polyCoeffs[0] < 0 ? "−" : "+"} ${Math.abs(polyCoeffs[0]).toFixed(2)}`, [polyCoeffs]);
  const updatePolyCoeff = (index: number, value: number) => setPolyCoeffs((current) => current.map((coeff, i) => (i === index ? value : coeff)));
  const [pythonStatus, setPythonStatus] = useState("Preparing browser Python runtime…");
  const [pythonOutput, setPythonOutput] = useState("Waiting for Pyodide package loader.");
  const [pythonPlotUri, setPythonPlotUri] = useState("");

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled) {
        setPythonStatus("Python runtime is still loading — source fallback shown below.");
        setPythonOutput("Pyodide can take time on first load, especially SciPy. The exact Python/SciPy/SymPy source remains available below while the runtime continues attempting to load.");
      }
    }, 18000);

    async function bootScientificPython() {
      try {
        setPythonStatus("Loading Pyodide WebAssembly runtime…");
        const loadPyodide = await loadPyodideScript();
        if (cancelled) return;
        const pyodide = await loadPyodide({ indexURL: PYODIDE_INDEX_URL });
        if (cancelled) return;
        setPythonStatus("Loading NumPy, SciPy, SymPy, and Matplotlib packages…");
        await pyodide.loadPackage(["numpy", "scipy", "sympy", "matplotlib"]);
        if (cancelled) return;
        setPythonStatus("Running SciPy/SymPy fractional calculus computation…");
        await pyodide.runPythonAsync(pyscriptFractionalDemo);
        const output = pyodide.globals.get("output");
        const plotUri = pyodide.globals.get("plot_data_uri");
        if (cancelled) return;
        window.clearTimeout(timeout);
        setPythonOutput(output ? output.toString() : "Python completed without an output variable.");
        setPythonPlotUri(plotUri ? plotUri.toString() : "");
        setPythonStatus("Python plate ready — computed in browser with Pyodide.");
      } catch (error) {
        if (cancelled) return;
        window.clearTimeout(timeout);
        setPythonStatus("Python runtime error — showing diagnostic and source fallback.");
        setPythonOutput(String(error instanceof Error ? error.stack || error.message : error));
      }
    }

    bootScientificPython();
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  const filteredReferences = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return fcaaReferences;
    return fcaaReferences.filter((entry) =>
      [entry.title, entry.authors, entry.note, ...entry.tags].join(" ").toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="min-h-screen overflow-hidden text-foreground">
      <header className="container relative grid gap-8 pb-16 pt-6 lg:grid-cols-[1.08fr_.92fr] lg:items-end lg:pt-10">
        <nav className="col-span-full flex flex-wrap items-center justify-between gap-4 border-b-2 border-foreground pb-4">
          <a href="#top" className="plate-title text-sm">Fractional Calculus Lab</a>
          <div className="flex flex-wrap gap-2 text-xs">
            <a className="atlas-chip px-3 py-2" href="#starter-derivative">Derivative starter</a>
            <a className="atlas-chip px-3 py-2" href="#operator-bench">Operator bench</a>
            <a className="atlas-chip px-3 py-2" href="#python-lab">PyScript SciPy</a>
            <a className="atlas-chip px-3 py-2" href="#reference-ledger">FCAA ledger</a>
          </div>
        </nav>

        <section id="top" className="relative z-10 animate-plate-enter">
          <div className="mb-5 flex flex-wrap gap-3">
            <span className="atlas-chip px-3 py-2">TypeScript symbolic first</span>
            <span className="atlas-chip px-3 py-2">Python SciPy/SymPy loaded</span>
            <span className="atlas-chip px-3 py-2">FCAA 2011–2021 source window</span>
          </div>
          <h1 className="ink-shadow max-w-5xl text-6xl font-black leading-[0.88] sm:text-7xl lg:text-8xl">
            Fractional calculus, shown as an operator atlas.
          </h1>
          <p className="mt-7 max-w-2xl text-xl leading-8">
            Explore non-integer differentiation and integration with a browser-native TypeScript engine, a PyScript scientific Python plate, and a searchable reference ledger grounded in the supplied FCAA contents.
          </p>
          <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
            <div className="atlas-card p-4"><b className="plate-title text-xs">Symbolic route</b><p className="mt-2 text-sm">Custom gamma-ratio rules passed through Nerdamer when possible.</p></div>
            <div className="atlas-card p-4"><b className="plate-title text-xs">Numerical route</b><p className="mt-2 text-sm">Grünwald–Letnikov weights and sampled memory kernels.</p></div>
            <div className="atlas-card p-4"><b className="plate-title text-xs">Python route</b><p className="mt-2 text-sm">PyScript loads NumPy, SciPy, and SymPy inside an isolated browser frame.</p></div>
          </div>
        </section>

        <aside className="relative animate-plate-enter lg:pb-4" style={{ animationDelay: "120ms" }}>
          <div className="atlas-card paper-tear overflow-hidden p-3 rotate-1">
            <img src={heroImage} alt="Abstract fractional calculus atlas with operator curves" className="h-[520px] w-full object-cover" />
          </div>
          <div className="atlas-card absolute -bottom-5 left-6 max-w-xs bg-card p-4 -rotate-2">
            <p className="plate-title text-xs">Kernel memory note</p>
            <p className="mt-2 text-sm">Fractional operators remember earlier states through singular or long-tailed kernels, not just local slopes.</p>
          </div>
        </aside>
      </header>

      <main>
        <section id="starter-derivative" className="container grid gap-7 py-14 lg:grid-cols-[.85fr_1.15fr]">
          <aside className="atlas-card h-fit p-5">
            <div className="flex items-center gap-3"><Sigma /><h2 className="text-4xl font-black">Derivative starter</h2></div>
            <p className="mt-4 leading-7">Start with an ordinary polynomial. The black curve is <span className="mono">p(x)={polynomialFormula}</span>. Use the sliders below to reshape the polynomial, then compare the familiar first derivative against fractional derivative presets at the current order <span className="mono">α={alpha.toFixed(2)}</span>.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="atlas-card bg-[#fff7e5] p-4"><p className="plate-title text-xs">Polynomial</p><p className="mono mt-2">p(x)</p><p className="mt-2 text-sm">A curve built from powers x⁰, x¹, x², x³.</p></div>
              <div className="atlas-card bg-[#fff7e5] p-4"><p className="plate-title text-xs">Classical derivative</p><p className="mono mt-2">p'(x)</p><p className="mt-2 text-sm">Each term drops its exponent by exactly one.</p></div>
              <div className="atlas-card bg-[#fff7e5] p-4"><p className="plate-title text-xs">Selected comparison</p><p className="mono mt-2">{starterComparisons[starterComparison].short}</p><p className="mt-2 text-sm">{starterComparisons[starterComparison].note}</p></div>
            </div>
            <div className="mt-5 border-2 border-foreground bg-[#fff7e5] p-4">
              <p className="plate-title text-xs">Polynomial coefficients</p>
              <div className="mt-3 grid gap-3">
                {["constant", "x", "x²", "x³"].map((label, index) => (
                  <label key={label} className="block">
                    <span className="plate-title flex justify-between text-[10px]"><span>{label}</span><span>{polyCoeffs[index].toFixed(2)}</span></span>
                    <input className="mt-2 w-full accent-[#2f6f74]" type="range" min={-2.5} max={2.5} step={0.01} value={polyCoeffs[index]} onChange={(event) => updatePolyCoeff(index, Number(event.target.value))} />
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-5 border-2 border-foreground bg-[#fff7e5] p-4">
              <p className="plate-title text-xs">Comparison preset</p>
              <div className="mt-3 grid gap-2">
                {(Object.entries(starterComparisons) as [StarterComparison, (typeof starterComparisons)[StarterComparison]][]).map(([key, meta]) => (
                  <button key={key} onClick={() => setStarterComparison(key)} className={`border-2 border-foreground p-3 text-left transition ${starterComparison === key ? "bg-foreground text-background" : "bg-card hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--foreground)]"}`}>
                    <span className="mono text-xs">{meta.short}</span><span className="block font-semibold">{meta.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
          <div className="atlas-card graph-paper p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4"><h3 className="text-3xl font-black">Polynomial to fractional derivative</h3><span className="atlas-chip px-2 py-1 text-[10px]">starter visual</span></div>
            <div className="h-[430px] bg-[#fff7e5]/75 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={polynomialStarter} margin={{ left: 8, right: 18, top: 12, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#49382a55" />
                  <XAxis dataKey="x" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={56} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="polynomial" name="p(x)" stroke="#17120f" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="ordinary" name="ordinary derivative p'(x)" stroke="#2f6f74" strokeWidth={2} strokeDasharray="7 5" dot={false} />
                  <Line type="monotone" dataKey="selected" name={`${starterComparisons[starterComparison].label} comparison`} stroke="#9f4329" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section id="operator-bench" className="container grid gap-7 py-14 lg:grid-cols-[380px_1fr]">
          <aside className="atlas-card h-fit p-5">
            <div className="mb-4 flex items-center gap-3"><FunctionSquare /><h2 className="text-3xl font-black">Operator bench</h2></div>
            <p className="mb-5 leading-7">The bench first attempts a symbolic rule for <span className="mono">f(x)=x^β</span>. If the selected case is singular or outside the symbolic rule, the numerical plate remains available.</p>

            <label className="plate-title text-xs">Operator</label>
            <div className="mt-3 grid gap-2">
              {operators.map(([key, meta]) => (
                <button key={key} onClick={() => setOperator(key)} className={`border-2 border-foreground p-3 text-left transition ${operator === key ? "bg-foreground text-background" : "bg-card hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--foreground)]"}`}>
                  <span className="mono text-xs">{meta.short}</span><span className="block font-semibold">{meta.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-5">
              {[
                ["Order α", alpha, setAlpha, 0.05, 1.8, 0.01],
                ["Power β", beta, setBeta, 0, 5, 0.05],
                ["Evaluation x", x, setX, 0.1, 6, 0.05],
                ["GL step h", step, setStep, 0.01, 0.25, 0.01],
              ].map(([label, value, setter, min, max, st]) => (
                <label key={label as string} className="block">
                  <span className="plate-title flex justify-between text-xs"><span>{label as string}</span><span>{Number(value).toFixed(2)}</span></span>
                  <input className="mt-2 w-full accent-[#9f4329]" type="range" min={min as number} max={max as number} step={st as number} value={value as number} onChange={(event) => (setter as (n: number) => void)(Number(event.target.value))} />
                </label>
              ))}
              <label className="block">
                <span className="plate-title flex justify-between text-xs"><span>Memory terms</span><span>{terms}</span></span>
                <input className="mt-2 w-full accent-[#9f4329]" type="range" min={6} max={60} step={1} value={terms} onChange={(event) => setTerms(Number(event.target.value))} />
              </label>
            </div>
          </aside>

          <section className="grid gap-7">
            <div className="atlas-card grid gap-5 p-5 lg:grid-cols-[1fr_310px]">
              <div>
                <p className="plate-title text-xs">{operatorCopy[operator].label}</p>
                <h3 className="mt-2 text-4xl font-black">{result.numericLabel}</h3>
                <p className="mt-3 text-5xl font-black text-[#9f4329] mono">{numeric(result.numericValue)}</p>
                <p className="mt-4 leading-7">{operatorCopy[operator].definition}</p>
                <div className="mt-5 rounded-none border-2 border-foreground bg-[#17120f] p-4 text-[#f4ead5]">
                  <p className="plate-title text-xs text-[#91d7e2]">Symbolic expression</p>
                  <p className="mono mt-2 break-all text-sm">{result.symbolic.expression}</p>
                  <p className="mt-3 text-xs text-[#e2c270]">Method: {result.symbolic.method}</p>
                </div>
              </div>
              <img src={operatorImage} alt="Fractional operator plates" className="h-full min-h-[300px] w-full border-2 border-foreground object-cover" />
            </div>

            {result.warnings.length > 0 && (
              <div className="atlas-card flex gap-3 bg-[#f1dfc0] p-4">
                <AlertTriangle className="mt-1 shrink-0 text-[#9f4329]" />
                <div>{result.warnings.map((warning) => <p key={warning} className="leading-7">{warning}</p>)}</div>
              </div>
            )}

            <div className="grid gap-7 xl:grid-cols-[1.3fr_.7fr]">
              <div className="atlas-card graph-paper p-5">
                <div className="mb-4 flex items-center justify-between gap-4"><h3 className="text-3xl font-black">Function and operator traces</h3><span className="atlas-chip px-2 py-1 text-[10px]">Recharts plate</span></div>
                <div className="h-[360px] bg-[#fff7e5]/70 p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.numericPoints} margin={{ left: 8, right: 18, top: 12, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="4 4" stroke="#49382a55" />
                      <XAxis dataKey="x" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} width={56} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="f" name="x^β" stroke="#2f6f74" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="derivative" name="RL derivative" stroke="#9f4329" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="integral" name="RL integral" stroke="#5d7f3f" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="gl" name="GL estimate" stroke="#3d2f85" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="atlas-card graph-paper p-5">
                <h3 className="mb-4 text-3xl font-black">GL memory weights</h3>
                <div className="h-[360px] bg-[#fff7e5]/70 p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.weights.slice(0, 28)}>
                      <CartesianGrid strokeDasharray="4 4" stroke="#49382a55" />
                      <XAxis dataKey="k" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#9f4329" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>
        </section>

        <section id="python-lab" className="container grid gap-7 py-14 lg:grid-cols-[.9fr_1.1fr]">
          <div className="atlas-card overflow-hidden p-3 -rotate-1"><img src={dualEngineImage} alt="Dual TypeScript and Python scientific computation engine" className="h-full min-h-[480px] w-full object-cover" /></div>
          <div className="atlas-card p-5">
            <div className="flex items-center gap-3"><Code2 /><h2 className="text-4xl font-black">Python / Pyodide SciPy plate</h2></div>
            <p className="mt-4 leading-7">This plate now uses a direct main-page Pyodide loader rather than a hidden iframe, so its package-loading status is visible. It explicitly loads <span className="mono">numpy</span>, <span className="mono">scipy</span>, <span className="mono">sympy</span>, and <span className="mono">matplotlib</span> before running the same gamma-ratio power law and polynomial derivative starter.</p>
            <div className="mt-5 border-2 border-foreground bg-[#17120f] p-5 text-[#f5ead4] shadow-[8px_8px_0_#24180c]">
              <span className="mono inline-block border border-[#f5ead4] px-2 py-1 text-xs uppercase tracking-[.18em] text-[#92dce5]">Pyodide loading NumPy · SciPy · SymPy · Matplotlib</span>
              <p className="mono mt-4 text-xs uppercase tracking-[.12em] text-[#e2c270]">{pythonStatus}</p>
              <pre className="mt-4 max-h-[300px] overflow-auto whitespace-pre-wrap text-xs leading-6">{pythonOutput}</pre>
              {pythonPlotUri && (
                <figure className="mt-5 bg-[#fff7e5] p-2 text-[#241b14] shadow-[5px_5px_0_#9f4329]">
                  <img src={pythonPlotUri} alt="Python-generated Matplotlib plot comparing p(x), ordinary derivative, and Riemann-Liouville fractional derivative" className="w-full border-2 border-[#241b14]" />
                  <figcaption className="mono mt-2 text-[10px] uppercase tracking-[.14em]">Rendered in Python with Matplotlib AGG, returned to React as a PNG data URI.</figcaption>
                </figure>
              )}
            </div>
            <details className="mt-5 border-2 border-foreground bg-[#fff7e5] p-4">
              <summary className="plate-title cursor-pointer text-xs">View Python source</summary>
              <pre className="mt-4 overflow-x-auto text-xs leading-6">{pyscriptFractionalDemo}</pre>
            </details>
          </div>
        </section>

        <section className="container grid gap-7 py-14 lg:grid-cols-[.75fr_1.25fr]">
          <div className="atlas-card p-5">
            <div className="flex items-center gap-3"><Waves /><h2 className="text-4xl font-black">Kernel field</h2></div>
            <p className="mt-4 leading-7">The Riemann–Liouville integral uses a weakly singular kernel proportional to <span className="mono">(x-t)^(α-1)/Γ(α)</span>. As α changes, the memory field reshapes rather than behaving like a local slope.</p>
            <div className="mt-5 h-[270px] bg-[#fff7e5]/80 p-2 graph-paper">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.numericPoints}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#49382a55" />
                  <XAxis dataKey="x" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="kernel" stroke="#2f6f74" fill="#91d7e266" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="atlas-card p-5">
            <div className="flex items-center gap-3"><Sigma /><h2 className="text-4xl font-black">Method provenance</h2></div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {result.provenance.map((item, index) => (
                <div key={item} className="border-2 border-foreground bg-[#fff7e5] p-4 shadow-[5px_5px_0_#241b14]">
                  <span className="mono text-xs">0{index + 1}</span>
                  <p className="mt-2 leading-7">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-none border-2 border-foreground bg-[#17120f] p-4 text-[#f4ead5]">
              <p className="plate-title text-xs text-[#91d7e2]">Interpretive caution</p>
              <p className="mt-2 leading-7">Fractional derivatives are definition-dependent. The same α can encode different physical assumptions under Riemann–Liouville, Caputo, Grünwald–Letnikov, Hadamard, or variable-order constructions.</p>
            </div>
          </div>
        </section>

        <section id="reference-ledger" className="container grid gap-7 py-14 lg:grid-cols-[360px_1fr]">
          <aside className="atlas-card h-fit p-5">
            <div className="flex items-center gap-3"><Library /><h2 className="text-4xl font-black">FCAA ledger</h2></div>
            <p className="mt-4 leading-7">The supplied PDF is used as a source window over FCAA Vol. 14–24. Search by topic to connect calculator ideas with article themes.</p>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search diffusion, numerical, Caputo…" className="mt-5 w-full border-2 border-foreground bg-[#fff7e5] p-3 mono outline-none focus:shadow-[4px_4px_0_#241b14]" />
            <img src={referenceImage} alt="Reference ledger illustration" className="mt-5 h-72 w-full border-2 border-foreground object-cover" />
            <Button className="mt-5 w-full rounded-none border-2 border-foreground bg-[#9f4329] font-bold text-[#fff7e5] shadow-[5px_5px_0_#241b14] hover:bg-[#7d311f]" asChild>
              <a href="https://www.math.bas.bg/~fcaa/FCAA-Contents-2011-2021.pdf" target="_blank" rel="noreferrer">Open source PDF</a>
            </Button>
          </aside>

          <div className="grid gap-7">
            <div className="atlas-card p-5">
              <div className="flex items-center gap-3"><BookOpen /><h3 className="text-3xl font-black">Topic tallies extracted from the contents</h3></div>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {topicTallies.map((topic) => (
                  <div key={topic.topic} className="border-2 border-foreground bg-[#fff7e5] p-4">
                    <p className="plate-title text-[10px]">{topic.topic}</p>
                    <p className="mt-2 text-4xl font-black mono text-[#9f4329]">{topic.count}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {filteredReferences.map((entry) => (
                <article key={`${entry.year}-${entry.title}`} className="atlas-card p-5 transition hover:-translate-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="atlas-chip px-2 py-1 text-[10px]">Vol. {entry.volume} · No. {entry.issue} · {entry.year}</span>
                    {entry.tags.map((tag) => <span key={tag} className="border border-foreground bg-[#dfeec8] px-2 py-1 mono text-[10px] uppercase tracking-wider">{tag}</span>)}
                  </div>
                  <h3 className="mt-3 text-2xl font-black">{entry.title}</h3>
                  <p className="mt-2 mono text-sm text-muted-foreground">{entry.authors}</p>
                  <p className="mt-3 leading-7">{entry.note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="container pb-10 pt-8">
        <div className="atlas-card flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center">
          <p className="leading-7">Built as a static React/TypeScript atlas. Source claims cite the supplied FCAA contents PDF, Springer’s FCAA scope page, Nerdamer documentation, and PyScript configuration documentation.</p>
          <a href="#top" className="atlas-chip px-4 py-3 text-center">Return to top</a>
        </div>
      </footer>
    </div>
  );
}
