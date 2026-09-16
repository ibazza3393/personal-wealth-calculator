import assert from 'node:assert/strict';
import { mapAkahuAccounts, mapAkahuType, mergeAkahuLedger } from './akahu-map';
import { EMPTY_LEDGER } from '../domain';

assert.equal(mapAkahuType('SAVINGS', 'Everyday'), 'cash');
assert.equal(mapAkahuType('CREDITCARD', 'Visa'), 'credit_card');
assert.equal(mapAkahuType('LOAN', 'Home loan'), 'mortgage');
assert.equal(mapAkahuType('LOAN', 'Personal loan'), 'loan');
assert.equal(mapAkahuType('KIWISAVER', 'Growth'), 'kiwi_saver');

const mapped = mapAkahuAccounts({
  success: true,
  items: [
    {
      _id: 'acc_1',
      name: 'Everyday',
      status: 'ACTIVE',
      type: 'CHECKING',
      connection: { _id: 'conn_anz', name: 'ANZ', connection_type: 'official' },
      balance: { current: 1200.5, available: 1200.5, currency: 'NZD' },
    },
    {
      _id: 'acc_2',
      name: 'Home loan',
      status: 'ACTIVE',
      type: 'LOAN',
      connection: { _id: 'conn_anz', name: 'ANZ' },
      balance: { current: -412000, currency: 'NZD' },
    },
  ],
});

assert.equal(mapped.connections.length, 1);
assert.equal(mapped.connections[0]?.institution_name, 'ANZ');
assert.equal(mapped.accounts.length, 2);
assert.equal(mapped.accounts[1]?.type, 'mortgage');
assert.equal(mapped.accounts[1]?.current_balance, 412000);

const merged = mergeAkahuLedger(
  {
    ...EMPTY_LEDGER,
    connections: [
      {
        id: 'conn-akahu-old',
        provider: 'akahu',
        country: 'NZ',
        institution_name: 'Old',
        status: 'active',
        scopes: 'read_only',
        last_synced_at: null,
        consent_expires_at: null,
      },
      {
        id: 'conn-manual',
        provider: 'manual',
        country: 'NZ',
        institution_name: 'Manual ledger',
        status: 'active',
        scopes: 'read_only',
        last_synced_at: null,
        consent_expires_at: null,
      },
    ],
    accounts: [
      {
        id: 'acc-old',
        connection_id: 'conn-akahu-old',
        country: 'NZ',
        type: 'cash',
        name: 'Stale',
        institution: 'Old',
        currency: 'NZD',
        current_balance: 1,
        available_balance: 1,
      },
    ],
    properties: [],
  },
  mapped,
);

assert.equal(merged.connections.some((c) => c.id === 'conn-manual'), true);
assert.equal(merged.connections.some((c) => c.id === 'conn-akahu-old'), false);
assert.equal(merged.accounts.some((a) => a.id === 'acc-old'), false);
assert.equal(merged.accounts.some((a) => a.id === 'acc_1'), true);

console.log('akahu-map tests passed');
