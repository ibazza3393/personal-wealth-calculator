import assert from 'node:assert/strict';
import { buildSnapshot, sanitizeLedger, toAud, toNzd } from './ledger';
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

assert.equal(toNzd(91, 'AUD', 0.91), 100);
assert.equal(toAud(100, 'NZD', 0.91), 91);

const cleaned = sanitizeLedger({ connections: [{ id: 'x', provider: 'plaid', country: 'US' }] });
assert.equal(cleaned.connections[0]?.provider, 'manual');
assert.equal(cleaned.connections[0]?.country, 'NZ');
assert.equal(cleaned.connections[0]?.scopes, 'read_only');

console.log('ledger tests passed', {
  net_nzd: Math.round(snap.net_worth_nzd),
  net_aud: Math.round(snap.net_worth_aud),
});
