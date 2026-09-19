/**
 * Single source of truth for the legal pages. The operating company is the
 * entity behind the product — Next Wealth is the product name only.
 *
 * TODO(barry): confirm the support address and registered office before launch;
 * the values below are placeholders used across /privacy and /terms.
 */
export const LEGAL = {
  product: 'Next Wealth',
  company: 'Barry Iyengar Designs Limited',
  jurisdiction: 'New Zealand',
  contactEmail: 'hello@nextwealth.app',
  lastUpdated: '18 September 2026',
} as const;
