import assert from 'node:assert/strict';
import { projectNetCents } from './project';

assert.equal(projectNetCents({ netCents: 10000, years: 0, annualPct: 10, monthlyCents: 0 }), 10000);
assert.equal(projectNetCents({ netCents: 10000, years: 1, annualPct: 10, monthlyCents: 0 }), 11000);
assert.equal(projectNetCents({ netCents: 0, years: 1, annualPct: 0, monthlyCents: 100 }), 1200);
assert.ok(projectNetCents({ netCents: 100000, years: 10, annualPct: 10, monthlyCents: 0 }) > 250000);

console.log('project tests passed');
