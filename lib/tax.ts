/** Illustrative resident income tax. Not advice. */

export type TaxRegion = 'AU' | 'NZ';

type Band = { upTo: number; rate: number };

const AU: Band[] = [
  { upTo: 18200, rate: 0 },
  { upTo: 45000, rate: 0.16 },
  { upTo: 135000, rate: 0.3 },
  { upTo: 190000, rate: 0.37 },
  { upTo: Infinity, rate: 0.45 },
];

const NZ: Band[] = [
  { upTo: 15600, rate: 0.105 },
  { upTo: 53500, rate: 0.175 },
  { upTo: 78100, rate: 0.3 },
  { upTo: 180000, rate: 0.33 },
  { upTo: Infinity, rate: 0.39 },
];

function taxOn(taxable: number, bands: Band[]): number {
  let tax = 0;
  let prev = 0;
  for (const band of bands) {
    const slice = Math.min(taxable, band.upTo) - prev;
    if (slice > 0) tax += slice * band.rate;
    prev = band.upTo;
    if (taxable <= band.upTo) break;
  }
  return tax;
}

export function calcIncomeTax(opts: {
  region: TaxRegion;
  income: number;
  deductions: number;
}) {
  const income = Math.max(0, opts.income);
  const deductions = Math.max(0, Math.min(income, opts.deductions));
  const taxable = Math.max(0, income - deductions);
  const incomeTax = taxOn(taxable, opts.region === 'AU' ? AU : NZ);
  const medicare = opts.region === 'AU' ? taxable * 0.02 : 0;
  const total = incomeTax + medicare;
  const net = income - total;
  const effective = income > 0 ? total / income : 0;
  return { income, deductions, taxable, incomeTax, medicare, total, net, effective };
}
