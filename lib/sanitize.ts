import type { AssetItem, LiabilityItem, WealthData } from './types';
import { DEFAULT_WEALTH_DATA } from './types';
import { centsToDollars, toCents } from './money';

const MAX_NAME = 80;
export const MAX_ITEMS = 50;

function sanitizeName(name: unknown): string {
  if (typeof name !== 'string') return '';
  return name.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME);
}

function sanitizeItem(raw: unknown, fallbackId: string): AssetItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const name = sanitizeName(row.name);
  const value = centsToDollars(toCents(row.value));
  const id =
    typeof row.id === 'string' && row.id.length > 0 && row.id.length <= 64
      ? row.id
      : fallbackId;
  if (!name && value === 0) return null;
  return { id, name: name || 'Untitled', value };
}

function uniqueIds<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.map((item, i) => {
    let id = item.id;
    if (!id || seen.has(id)) id = `${item.id || 'item'}-${i}`;
    seen.add(id);
    return id === item.id ? item : { ...item, id };
  });
}

/**
 * Coerce anything pulled from localStorage into a safe WealthData shape.
 * Prevents crash-on-refresh if the JSON is truncated, from an old schema, or tampered with.
 */
export function sanitizeWealthData(raw: unknown): WealthData {
  if (!raw || typeof raw !== 'object') return DEFAULT_WEALTH_DATA;
  const d = raw as Record<string, unknown>;

  const marketAssets = uniqueIds(
    Array.isArray(d.marketAssets)
      ? d.marketAssets
          .map((row, i) => sanitizeItem(row, `market-${i}`))
          .filter((x): x is AssetItem => x !== null)
          .slice(0, MAX_ITEMS)
      : [],
  );
  const liabilities = uniqueIds(
    Array.isArray(d.liabilities)
      ? d.liabilities
          .map((row, i) => sanitizeItem(row, `liability-${i}`))
          .filter((x): x is LiabilityItem => x !== null)
          .slice(0, MAX_ITEMS)
      : [],
  );

  return {
    liquidCash: centsToDollars(toCents(d.liquidCash)),
    propertyValue: centsToDollars(toCents(d.propertyValue)),
    marketAssets,
    liabilities,
  };
}
