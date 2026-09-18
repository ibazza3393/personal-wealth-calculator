import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { initialsFor } from './useUser';

test('initials come from a full name, first and last', () => {
  assert.equal(initialsFor('Barry Iyengar', 'barry@example.com'), 'BI');
});

test('a single name falls back to its first two letters', () => {
  assert.equal(initialsFor('Barry', null), 'BA');
});

test('no name falls back to the email local part', () => {
  assert.equal(initialsFor(null, 'barry.iyengar@example.com'), 'BI');
});

test('nobody signed in yields no initials rather than a placeholder', () => {
  assert.equal(initialsFor(null, null), '');
});
