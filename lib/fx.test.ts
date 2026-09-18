import assert from 'node:assert/strict';
import { convert, FALLBACK_FX, type FxTable } from './fx';

const fx: FxTable = {
  rates: { NZD: 1, AUD: 0.9, USD: 0.6, JPY: 90 },
  asOf: '2026-01-01',
  live: true,
};

// Same currency is a no-op, even for one with no rate listed.
assert.equal(convert(100, 'NZD', 'NZD', fx), 100);
assert.equal(convert(100, 'CHF', 'CHF', fx), 100);

// Base in and out.
assert.equal(convert(100, 'NZD', 'AUD', fx), 90);
assert.equal(convert(90, 'AUD', 'NZD', fx), 100);

// Cross rate that never touches the base directly: AUD -> USD.
assert.equal(Math.round((convert(90, 'AUD', 'USD', fx) ?? 0) * 100) / 100, 60);

// Every currency uses its own rate — USD must not borrow AUD's.
const usd = convert(100, 'USD', 'NZD', fx);
const aud = convert(100, 'AUD', 'NZD', fx);
assert.notEqual(usd, aud);
assert.equal(Math.round(usd ?? 0), 167);

// A missing rate returns null rather than a number converted at the wrong rate.
assert.equal(convert(100, 'ZAR', 'NZD', fx), null);
assert.equal(convert(100, 'NZD', 'ZAR', fx), null);
assert.equal(convert(Number.NaN, 'NZD', 'AUD', fx), null);

// A zero or negative rate is treated as missing, not divided by.
assert.equal(convert(100, 'BAD', 'NZD', { ...fx, rates: { ...fx.rates, BAD: 0 } }), null);

// The shipped fallback is internally consistent and flagged as not live.
assert.equal(FALLBACK_FX.rates.NZD, 1);
assert.equal(FALLBACK_FX.live, false);
assert.ok(FALLBACK_FX.rates.USD > 0 && FALLBACK_FX.rates.AUD > 0);

// Round trip through an intermediate currency preserves the amount.
const there = convert(250, 'USD', 'JPY', fx) ?? 0;
const back = convert(there, 'JPY', 'USD', fx) ?? 0;
assert.ok(Math.abs(back - 250) < 1e-9, `round trip drifted: ${back}`);

console.log('fx tests passed');
