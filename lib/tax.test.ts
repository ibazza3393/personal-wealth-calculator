import { calcIncomeTax } from './tax';

function close(a: number, b: number, eps = 1) {
  if (Math.abs(a - b) > eps) throw new Error(`expected ${b} got ${a}`);
}

const nz = calcIncomeTax({ region: 'NZ', income: 80000, deductions: 0 });
close(nz.taxable, 80000, 0.01);
// 15600*0.105 + 37900*0.175 + 24600*0.30 + 1900*0.33
const nzExpect = 15600 * 0.105 + 37900 * 0.175 + 24600 * 0.3 + 1900 * 0.33;
close(nz.incomeTax, nzExpect, 1);
if (nz.medicare !== 0) throw new Error('NZ medicare');

const au = calcIncomeTax({ region: 'AU', income: 50000, deductions: 0 });
const auExpect = (45000 - 18200) * 0.16 + (50000 - 45000) * 0.3;
close(au.incomeTax, auExpect, 1);
close(au.medicare, 50000 * 0.02, 0.02);

const ded = calcIncomeTax({ region: 'AU', income: 50000, deductions: 10000 });
if (ded.taxable !== 40000) throw new Error('taxable');

console.log('tax tests passed');
