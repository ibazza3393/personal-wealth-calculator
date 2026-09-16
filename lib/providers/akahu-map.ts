import type { Account, AccountType, Connection, LedgerDocument, MoneyCurrency } from '../domain';

export type AkahuAccountJson = {
  _id?: string;
  name?: string;
  status?: string;
  type?: string;
  connection?: {
    _id?: string;
    name?: string;
    connection_type?: string;
  };
  balance?: {
    current?: number;
    available?: number | null;
    currency?: string;
  };
};

export type AkahuAccountsResponse = {
  success?: boolean;
  items?: AkahuAccountJson[];
};

function money(n: unknown): number {
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.round(Math.abs(v) * 100) / 100;
}

function currency(code: unknown): MoneyCurrency {
  if (code === 'AUD' || code === 'USD' || code === 'NZD') return code;
  return 'NZD';
}

export function mapAkahuType(type: string | undefined, name: string): AccountType {
  const t = (type ?? '').toUpperCase();
  const n = name.toLowerCase();
  if (t === 'CREDITCARD') return 'credit_card';
  if (t === 'KIWISAVER') return 'kiwi_saver';
  if (t === 'INVESTMENT') return 'investment';
  if (t === 'LOAN') {
    if (/mortgage|home loan|house loan/.test(n)) return 'mortgage';
    return 'loan';
  }
  if (t === 'CHECKING' || t === 'SAVINGS' || t === 'TERMDEPOSIT' || t === 'DEPOSITORY') return 'cash';
  return 'other';
}

export function mapAkahuAccounts(payload: AkahuAccountsResponse): {
  connections: Connection[];
  accounts: Account[];
} {
  const items = Array.isArray(payload.items) ? payload.items : [];
  const connectionsById = new Map<string, Connection>();
  const accounts: Account[] = [];

  for (const item of items) {
    if (!item._id) continue;
    const connId = item.connection?._id || `akahu-conn-${item._id}`;
    const institution = item.connection?.name || 'NZ bank';
    const active = (item.status ?? 'ACTIVE').toUpperCase() === 'ACTIVE';
    const existing = connectionsById.get(connId);
    if (!existing) {
      connectionsById.set(connId, {
        id: connId,
        provider: 'akahu',
        country: 'NZ',
        institution_name: institution,
        status: active ? 'active' : 'error',
        scopes: 'read_only',
        last_synced_at: new Date().toISOString(),
        consent_expires_at: null,
      });
    } else if (!active && existing.status === 'active') {
      existing.status = 'error';
    }

    const name = item.name || 'Account';
    accounts.push({
      id: item._id,
      connection_id: connId,
      country: 'NZ',
      type: mapAkahuType(item.type, name),
      name,
      institution,
      currency: currency(item.balance?.currency),
      current_balance: money(item.balance?.current),
      available_balance: item.balance?.available == null ? null : money(item.balance.available),
    });
  }

  return { connections: [...connectionsById.values()], accounts };
}

export function mergeAkahuLedger(
  doc: LedgerDocument,
  mapped: { connections: Connection[]; accounts: Account[] },
): LedgerDocument {
  const dropConn = new Set(doc.connections.filter((c) => c.provider === 'akahu').map((c) => c.id));
  const connections = [...doc.connections.filter((c) => c.provider !== 'akahu'), ...mapped.connections];
  const accounts = [...doc.accounts.filter((a) => !dropConn.has(a.connection_id)), ...mapped.accounts];
  const accountIds = new Set(accounts.map((a) => a.id));
  const holdings = doc.holdings.filter((h) => accountIds.has(h.account_id));
  return { ...doc, connections, accounts, holdings };
}
