/** Illustrative future value of current net + monthly leftover. Not advice. */
export function projectNetCents(opts: {
  netCents: number;
  years: number;
  annualPct: number;
  monthlyCents: number;
}): number {
  const years = Math.min(50, Math.max(0, Math.round(opts.years)));
  const r = Math.min(0.3, Math.max(0, opts.annualPct / 100));
  const contrib = Math.max(0, opts.monthlyCents) * 12;
  let v = Math.max(0, Math.round(opts.netCents));
  for (let i = 0; i < years; i++) {
    v = Math.round(v * (1 + r) + contrib);
  }
  return v;
}
