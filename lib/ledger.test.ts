import assert from 'node:assert/strict';
import { buildSnapshot, sanitizeLedger, toAud, toNzd } from './ledger';
import { FALLBACK_FX } from './fx';
import { MOCK_LEDGER } from './mock';

const snap = buildSnapshot(MOCK_LEDGER);
assert.equal(Math.round(snap.cash), 18420);
assert.equal(Math.round(snap.investments), 24680);
assert.equal(Math.round(snap.super), 86200);
assert.equal(Math.round(snap.property), 1180000);
assert.equal(Math.round(snap.other_assets), 18000);
assert.equal(Math.round(snap.credit_cards), Math.round(2140 / 0.91));
assert.equal(Math.round(snap.mortgages), 412000);
assert.equal(snap.fx_rate_nzd_aud, 0.91);
assert.ok(snap.net_worth_nzd > 0);
assert.ok(Math.abs(snap.net_worth_aud - snap.net_worth_nzd * 0.91) < 0.02);

assert.equal(toNzd(91, 'AUD', FALLBACK_FX), 100);
assert.equal(toAud(100, 'NZD', FALLBACK_FX), 91);

// Regression: USD used to fall through to the AUD branch, so US$100 was
// converted at the NZD/AUD rate (109.89) instead of the NZD/USD one.
const usdInNzd = toNzd(100, 'USD', FALLBACK_FX);
assert.equal(Math.round(usdInNzd), Math.round(100 / FALLBACK_FX.rates.USD));
assert.ok(
  Math.abs(usdInNzd - 100 / FALLBACK_FX.rates.AUD) > 1,
  `USD must not be converted at the AUD rate (got ${usdInNzd})`,
);

const cleaned = sanitizeLedger({ connections: [{ id: 'x', provider: 'plaid', country: 'US' }] });
assert.equal(cleaned.connections[0]?.provider, 'manual');
assert.equal(cleaned.connections[0]?.country, 'NZ');
assert.equal(cleaned.connections[0]?.scopes, 'read_only');

console.log('ledger tests passed', {
  net_nzd: Math.round(snap.net_worth_nzd),
  net_aud: Math.round(snap.net_worth_aud),
});
