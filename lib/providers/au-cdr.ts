import { AdapterNotConnectedError, type BankAdapter } from './types';

/**
 * AU Consumer Data Right pipe. Basiq or Fiskil sit behind this name.
 * We do not apply to become an ACCC ADR in v1. Consents expire.
 */
export const auCdrAdapter: BankAdapter = {
  id: 'au-cdr',
  country: 'AU',
  async listConnections() {
    throw new AdapterNotConnectedError('au-cdr');
  },
  async listAccounts() {
    throw new AdapterNotConnectedError('au-cdr');
  },
  async listHoldings() {
    throw new AdapterNotConnectedError('au-cdr');
  },
};
