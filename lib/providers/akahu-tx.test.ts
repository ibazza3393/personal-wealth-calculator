import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { mapAkahuTransactions, mapCategory, toCents } from './akahu-tx';

test('amounts convert to whole cents without float drift', () => {
  assert.equal(toCents(12.34), 1234);
  assert.equal(toCents(-89.99), -8999);
  // 0.1 + 0.2 is the classic float trap; the boundary must round it flat.
  assert.equal(toCents(0.1 + 0.2), 30);
  assert.equal(toCents(undefined), null);
  assert.equal(toCents('not a number'), null);
});

test('spend keeps its negative sign so a sum is just a sum', () => {
  const { transactions } = mapAkahuTransactions({
    items: [
      { _id: 'a', _account: 'acc', date: '2026-09-01T00:00:00Z', amount: -42.5, description: 'Countdown' },
      { _id: 'b', _account: 'acc', date: '2026-09-02T00:00:00Z', amount: 1200, description: 'Salary' },
    ],
  });
  assert.equal(transactions[0].amount_cents, -4250);
  assert.equal(transactions[1].amount_cents, 120000);
  assert.equal(
    transactions.reduce((sum, t) => sum + t.amount_cents, 0),
    115750,
  );
});

test('rows that cannot be reconciled are dropped and counted, never guessed', () => {
  const { transactions, skipped } = mapAkahuTransactions({
    items: [
      { _id: 'ok', _account: 'acc', date: '2026-09-01T00:00:00Z', amount: -10 },
      { _account: 'acc', date: '2026-09-01T00:00:00Z', amount: -10 },
      { _id: 'no-account', date: '2026-09-01T00:00:00Z', amount: -10 },
      { _id: 'no-amount', _account: 'acc', date: '2026-09-01T00:00:00Z' },
      { _id: 'bad-date', _account: 'acc', date: 'not a date', amount: -10 },
    ],
  });
  assert.equal(transactions.length, 1);
  assert.equal(skipped, 4);
});

test('an unrecognised category stays null rather than becoming "other"', () => {
  assert.equal(mapCategory('Groceries', undefined), 'food');
  assert.equal(mapCategory('Utilities', undefined), 'utilities');
  assert.equal(mapCategory(undefined, 'Health'), 'health');
  // Miscategorising quietly distorts every budget total that counts it.
  assert.equal(mapCategory('Something Akahu invented', 'also unknown'), null);
  assert.equal(mapCategory(undefined, undefined), null);
});

test('a missing description gets a placeholder, not an empty row', () => {
  const { transactions } = mapAkahuTransactions({
    items: [{ _id: 'a', _account: 'acc', date: '2026-09-01T00:00:00Z', amount: -1, description: '   ' }],
  });
  assert.equal(transactions[0].description, 'Transaction');
  assert.equal(transactions[0].merchant, null);
});

test('the paging cursor is carried through for incremental sync', () => {
  const { nextCursor } = mapAkahuTransactions({ items: [], cursor: { next: 'abc123' } });
  assert.equal(nextCursor, 'abc123');
  assert.equal(mapAkahuTransactions({ items: [] }).nextCursor, null);
});
