import 'server-only';

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

/**
 * AES-256-GCM for Akahu user access tokens at rest.
 *
 * The token is a live, read-only credential on somebody's bank accounts. It
 * has to be reversible — the sync needs the plaintext to call Akahu — so this
 * is encryption, not hashing, and the whole guarantee rests on the key living
 * somewhere the database does not. AKAHU_TOKEN_KEY is a server environment
 * variable; a database dump without it is ciphertext.
 *
 * GCM rather than CBC because it authenticates: a tampered ciphertext fails
 * to decrypt rather than yielding plausible garbage that then gets sent to
 * Akahu as a bearer token.
 */

const ALGORITHM = 'aes-256-gcm';
const KEY_BYTES = 32;
/** 96 bits is the GCM-recommended nonce size; longer inputs get re-hashed. */
const IV_BYTES = 12;

export const KEY_VERSION = 1;

export type SealedToken = {
  ciphertext: string;
  iv: string;
  authTag: string;
  keyVersion: number;
};

function key(): Buffer {
  const raw = process.env.AKAHU_TOKEN_KEY?.trim();
  if (!raw) {
    throw new Error(
      'AKAHU_TOKEN_KEY is not set. Generate one with `openssl rand -base64 32` and put it in the server environment.',
    );
  }
  const bytes = Buffer.from(raw, 'base64');
  if (bytes.length !== KEY_BYTES) {
    throw new Error(
      `AKAHU_TOKEN_KEY must be ${KEY_BYTES} bytes of base64 (got ${bytes.length}). Generate one with \`openssl rand -base64 32\`.`,
    );
  }
  return bytes;
}

/** True when a key is present and the right shape, without throwing. */
export function isTokenKeyConfigured(): boolean {
  try {
    key();
    return true;
  } catch {
    return false;
  }
}

export function seal(plaintext: string): SealedToken {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return {
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    authTag: cipher.getAuthTag().toString('base64'),
    keyVersion: KEY_VERSION,
  };
}

export function open(sealed: SealedToken): string {
  const decipher = createDecipheriv(ALGORITHM, key(), Buffer.from(sealed.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(sealed.authTag, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(sealed.ciphertext, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}
