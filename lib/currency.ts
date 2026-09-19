export const CURRENCIES = [
  { code: 'USD', locale: 'en-US', label: 'US Dollar' },
  { code: 'NZD', locale: 'en-NZ', label: 'NZ Dollar' },
  { code: 'AUD', locale: 'en-AU', label: 'Australian Dollar' },
  { code: 'EUR', locale: 'en-EU', label: 'Euro' },
  { code: 'GBP', locale: 'en-GB', label: 'British Pound' },
  { code: 'CAD', locale: 'en-CA', label: 'Canadian Dollar' },
  { code: 'JPY', locale: 'ja-JP', label: 'Japanese Yen' },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

const CODES = new Set<string>(CURRENCIES.map((c) => c.code));

export function isCurrency(value: unknown): value is CurrencyCode {
  return typeof value === 'string' && CODES.has(value);
}

export const CRYPTO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  XRP: 'ripple',
};

