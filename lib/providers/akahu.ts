import { AdapterNotConnectedError, type BankAdapter } from './types';

/**
 * NZ bank pipe. Official open banking via Akahu (accredited requestor).
 * KiwiSaver and managed funds are NOT on official bank APIs — use CSV/manual.
 * Tokens live in AKAHU_* env on the server. Personal App: my.akahu.nz/developers.
 */
export const akahuAdapter: BankAdapter = {
  id: 'akahu',
  country: 'NZ',
  async listConnections() {
    throw new AdapterNotConnectedError('akahu');
  },
  async listAccounts() {
    throw new AdapterNotConnectedError('akahu');
  },
  async listHoldings() {
    throw new AdapterNotConnectedError('akahu');
  },
};
