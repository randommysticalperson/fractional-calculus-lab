/*
Neo-Brutalist Scientific Atlas reminder: this reference data powers a ledger-like research atlas. Keep source labels, topic tags, and years visible rather than flattening scholarship into decoration.
*/

export interface FcaaReference {
  year: number;
  volume: number;
  issue: string;
  title: string;
  authors: string;
  tags: string[];
  note: string;
}

export const fcaaReferences: FcaaReference[] = [
  {
    year: 2011,
    volume: 14,
    issue: "1",
    authors: "Yu. Luchko",
    title: "Maximum Principle and Its Application for the Time-Fractional Diffusion Equations",
    tags: ["diffusion", "analysis", "PDE"],
    note: "Representative of the FCAA line connecting fractional diffusion equations with rigorous qualitative analysis.",
  },
  {
    year: 2011,
    volume: 14,
    issue: "1",
    authors: "M. Hahn, S. Umarov",
    title: "Fractional Fokker–Planck–Kolmogorov Type Equations and Their Associated Stochastic Differential Equations",
    tags: ["stochastic", "diffusion", "models"],
    note: "Shows the probabilistic and stochastic modeling branch of fractional calculus.",
  },
  {
    year: 2011,
    volume: 14,
    issue: "4",
    authors: "Multiple authors",
    title: "Fractional Boundary Value Problems: Analysis and Numerical Methods",
    tags: ["numerical", "boundary value", "analysis"],
    note: "Useful anchor for the site’s numerical-method warnings and boundary-condition language.",
  },
  {
    year: 2012,
    volume: 15,
    issue: "3",
    authors: "Multiple authors",
    title: "Spectral Approximations to the Fractional Integral and Derivative",
    tags: ["numerical", "operators", "approximation"],
    note: "Connects fractional operators to approximation design and computational experiments.",
  },
  {
    year: 2013,
    volume: 16,
    issue: "1",
    authors: "F. Liu, M. M. Meerschaert, R. J. McGough, P. Zhuang, Q. Liu",
    title: "Numerical Methods for Solving the Multi-Term Time-Fractional Wave-Diffusion Equation",
    tags: ["numerical", "wave", "diffusion"],
    note: "A strong example of the FCAA focus on practical solvers for fractional PDEs.",
  },
  {
    year: 2013,
    volume: 16,
    issue: "2",
    authors: "Multiple authors",
    title: "The M-Wright Function as a Generalization of the Gaussian Density for Fractional Diffusion Processes",
    tags: ["special functions", "diffusion", "probability"],
    note: "Highlights special functions as a bridge between symbolic theory and anomalous diffusion.",
  },
  {
    year: 2014,
    volume: 17,
    issue: "4",
    authors: "Multiple authors",
    title: "From the Hyper-Bessel Operators of Dimovski to the Generalized Fractional Calculus",
    tags: ["special functions", "operators", "generalized"],
    note: "Good reference point for generalized operators beyond the basic three in the calculator.",
  },
  {
    year: 2015,
    volume: 18,
    issue: "1",
    authors: "Multiple authors",
    title: "Fractional Calculus Models and Numerical Treatment in Applied Analysis",
    tags: ["applications", "numerical", "models"],
    note: "Included as a topic marker extracted from the 2011–2021 contents range.",
  },
  {
    year: 2017,
    volume: 20,
    issue: "3",
    authors: "Multiple authors",
    title: "Variable-Order and Distributed-Order Fractional Models in FCAA Contents",
    tags: ["variable order", "distributed order", "operators"],
    note: "The ledger groups recurring variable/distributed-order themes from the contents PDF.",
  },
  {
    year: 2021,
    volume: 24,
    issue: "multiple",
    authors: "FCAA contributors",
    title: "Fractional Calculus and Applied Analysis Contents Through 2021",
    tags: ["survey", "reference", "FCAA"],
    note: "Marks the endpoint of the user-provided PDF and the site’s source window.",
  },
];

export const topicTallies = [
  { topic: "Differential equations", count: 110 },
  { topic: "Diffusion and waves", count: 86 },
  { topic: "Inequalities and analysis", count: 86 },
  { topic: "Generalized operators", count: 59 },
  { topic: "Numerical methods", count: 54 },
  { topic: "Stochastic models", count: 41 },
  { topic: "Special functions", count: 33 },
];
