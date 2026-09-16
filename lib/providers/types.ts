import type { Account, Connection, Holding } from '../domain';

/** Provider adapters implement this. UI never imports Akahu/Basiq field names. */
export interface BankAdapter {
  id: 'akahu' | 'au-cdr';
  country: 'NZ' | 'AU';
  listConnections(): Promise<Connection[]>;
  listAccounts(connectionId: string): Promise<Account[]>;
  listHoldings(accountId: string): Promise<Holding[]>;
}

export class AdapterNotConnectedError extends Error {
  constructor(id: string) {
    super(`${id} is a stub. Connect in a sandbox after the mock home screen is approved.`);
    this.name = 'AdapterNotConnectedError';
  }
}
