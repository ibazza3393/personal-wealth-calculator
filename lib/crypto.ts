import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

/**
 * Symmetric encryption for the Akahu access tokens at rest.
 *
 * Row-level security already keeps these rows out of the browser. This is the
 * second layer: a database dump, a backup, or a mistaken policy should still
 * not hand someone a working key to a stranger's bank accounts.
 *
 * AES-256-GCM, so the ciphertext is authenticated — a tampered value fails to
 * decrypt rather than silently returning rubbish that we then send to Akahu.
 */
const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;

function key(): Buffer {
  const raw = process.env.AKAHU_TOKEN_KEY?.trim();
  if (!raw) {
    throw new Error('AKAHU_TOKEN_KEY is not set. Bank tokens cannot be stored without it.');
  }
  const buf = Buffer.from(raw, 'base64');
  if (buf.length !== 32) {
    throw new Error('AKAHU_TOKEN_KEY must be 32 bytes, base64 encoded (openssl rand -base64 32).');
  }
  return buf;
}

/** Returns `iv.ciphertext.tag`, each base64url, so it is one safe text column. */
export function encryptToken(plaintext: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key(), iv);
  const body = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, body, tag].map((b) => b.toString('base64url')).join('.');
}

export function decryptToken(stored: string): string {
  const parts = stored.split('.');
  if (parts.length !== 3) throw new Error('Stored token is not in the expected format.');
  const [iv, body, tag] = parts.map((p) => Buffer.from(p, 'base64url'));
  const decipher = createDecipheriv(ALGORITHM, key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(body), decipher.final()]).toString('utf8');
}
