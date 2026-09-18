import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { encryptToken, decryptToken } from './crypto';

process.env.AKAHU_TOKEN_KEY = Buffer.alloc(32, 7).toString('base64');

test('a token survives a round trip', () => {
  const token = 'user_token_abc123';
  assert.equal(decryptToken(encryptToken(token)), token);
});

test('the same token encrypts differently every time', () => {
  // A fresh IV per call, so identical tokens do not produce identical rows.
  assert.notEqual(encryptToken('same'), encryptToken('same'));
});

test('a tampered ciphertext fails loudly rather than returning rubbish', () => {
  const stored = encryptToken('user_token_abc123');
  const [iv, body, tag] = stored.split('.');
  const flipped = Buffer.from(body, 'base64url');
  flipped[0] ^= 0xff;
  assert.throws(() => decryptToken([iv, flipped.toString('base64url'), tag].join('.')));
});

test('a malformed value is rejected', () => {
  assert.throws(() => decryptToken('not-a-token'));
});

test('a wrong key cannot read the ciphertext', () => {
  const stored = encryptToken('secret');
  const original = process.env.AKAHU_TOKEN_KEY;
  process.env.AKAHU_TOKEN_KEY = Buffer.alloc(32, 9).toString('base64');
  assert.throws(() => decryptToken(stored));
  process.env.AKAHU_TOKEN_KEY = original;
});

test('a key of the wrong length is refused rather than silently padded', () => {
  const original = process.env.AKAHU_TOKEN_KEY;
  process.env.AKAHU_TOKEN_KEY = Buffer.alloc(16, 1).toString('base64');
  assert.throws(() => encryptToken('x'), /32 bytes/);
  process.env.AKAHU_TOKEN_KEY = original;
});
