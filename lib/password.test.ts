import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MIN_LENGTH, checkPassword } from './password';

test('a long, varied password passes every rule', () => {
  const result = checkPassword('Correct-Horse-9-Battery');
  assert.equal(result.ok, true);
  assert.equal(result.failed.length, 0);
  assert.equal(result.met, result.total);
});

test('length alone is not strength', () => {
  const result = checkPassword('a'.repeat(MIN_LENGTH + 8));
  assert.equal(result.ok, false);
  assert.deepEqual(
    result.failed.map((r) => r.id).sort(),
    ['digit', 'symbol', 'upper'],
  );
});

test('variety alone is not strength either', () => {
  const result = checkPassword('Aa1!');
  assert.equal(result.ok, false);
  assert.deepEqual(result.failed.map((r) => r.id), ['length']);
});

test('the old eight-character minimum no longer passes', () => {
  // The form used to accept this. Recorded as a test so a future relaxation
  // of MIN_LENGTH has to be deliberate.
  assert.equal(checkPassword('Ab1!efgh').ok, false);
});

test('an empty password fails everything', () => {
  const result = checkPassword('');
  assert.equal(result.ok, false);
  assert.equal(result.met, 0);
});

test('a password manager symbol counts as a symbol', () => {
  for (const symbol of ['~', '`', '|', '<', '>', '€', '£']) {
    const value = `Abcdefghij1${symbol}`;
    assert.equal(checkPassword(value).ok, true, `${symbol} should count`);
  }
});

test('whitespace does not count as a symbol', () => {
  assert.equal(checkPassword('Abcdefghij1 ').ok, false);
});
