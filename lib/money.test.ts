import {
  centsToDollars,
  formatCents,
  labelPercents,
  parseDollars,
  toCents,
  widthPercents,
} from './money';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function almostEqual(a: number, b: number) {
  return Math.abs(a - b) < 1e-9;
}

// Classic float trap: 0.1 + 0.2
assert(toCents(0.1) + toCents(0.2) === 30, '0.10 + 0.20 must be 30 cents');
assert(centsToDollars(toCents(0.1) + toCents(0.2)) === 0.3, 'cents round-trip 0.30');

// Net worth identity in cents
const assets = toCents(24500) + toCents(485000) + toCents(187500) + toCents(42500) + toCents(18500);
const debts = toCents(312000) + toCents(18500) + toCents(3200);
assert(assets === 75_800_000, `demo assets ${assets}`);
assert(debts === 33_370_000, `demo debts ${debts}`);
assert(assets - debts === 42_430_000, `demo net ${assets - debts}`);
assert(formatCents(assets - debts) === '$424,300', `format ${formatCents(assets - debts)}`);

// parseDollars strips junk and extra dots
assert(parseDollars('$1,234.50') === 1234.5, 'parse currency junk');
assert(parseDollars('12.34.56') === 12.34, 'only first decimal');
assert(parseDollars('') === 0, 'empty');
assert(parseDollars('-9') === 9 || parseDollars('-9') === 0, 'no negatives from minus sign stripped');
assert(parseDollars('-9') === 9, 'minus stripped, digits remain');

// Percents sum to 100
const labels = labelPercents([1, 1, 1]);
assert(labels.reduce((a, b) => a + b, 0) === 100, `1/1/1 labels ${labels}`);
assert(labelPercents([0, 0, 0]).every((n) => n === 0), 'zero total');
const leftover = labelPercents([33.3, 33.3, 33.4].map((n) => n));
assert(leftover.reduce((a, b) => a + b, 0) === 100, `leftover ${leftover}`);

const widths = widthPercents([50, 50, 0]);
assert(almostEqual(widths[0], 50) && almostEqual(widths[1], 50) && widths[2] === 0, `widths ${widths}`);

console.log('money tests passed');
