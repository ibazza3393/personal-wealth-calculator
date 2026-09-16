import { futureValueMonthly, mortgagePayment, remainingBalance, runCompare } from './compare';
import { DEFAULT_COMPARE } from './types';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function close(a: number, b: number, eps = 1) {
  if (Math.abs(a - b) > eps) throw new Error(`expected ${b}, got ${a}`);
}

assert(mortgagePayment(0, 0.065, 30) === 0, 'zero principal');
close(mortgagePayment(400000, 0, 30) * 360, 400000, 1);

const pmt = mortgagePayment(400000, 0.06, 30);
assert(pmt > 2300 && pmt < 2500, `6% payment ${pmt}`);
close(remainingBalance(400000, 0.06, 30, 0), 400000, 1);
assert(remainingBalance(400000, 0.06, 30, 360) === 0, 'paid off');
assert(remainingBalance(400000, 0.06, 30, 12) < 400000, 'balance falls');

close(futureValueMonthly(100, 0, 0, 10), 100, 0.01);
close(futureValueMonthly(0, 100, 0, 1), 1200, 0.01);

const result = runCompare({ ...DEFAULT_COMPARE, years: 10 });
assert(result.columns.length === 3, 'three paths');
assert(result.columns.every((p) => p.endingCents >= 0), 'non-negative endings');
const sp = result.columns.find((p) => p.id === 'sp500')!;
const house = result.columns.find((p) => p.id === 'housing')!;
assert(sp.endingCents > 0, 'sp grows');
assert(house.endingCents > 0, 'house has equity');
assert(result.rows[0].cells.length === 3, 'three cells');

const cashBuy = runCompare({
  ...DEFAULT_COMPARE,
  lumpSum: 650000,
  homePrice: 650000,
  years: 1,
  appreciationPct: 0,
  housingCostPct: 0,
  mortgageRatePct: 0,
});
const housing = cashBuy.columns.find((p) => p.id === 'housing')!;
close(housing.endingCents / 100, 650000, 2);

console.log('compare tests passed');
