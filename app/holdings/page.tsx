'use client';

import { EditableRow, Hairline, HoldingsGroup, Row } from '@/components/HoldingsGroup';
import { useWealth } from '@/components/WealthProvider';
import { centsToDollars, formatCents, toCents } from '@/lib/money';
import { MAX_ITEMS } from '@/lib/sanitize';
import { DEFAULT_COMPARE, HOLDING_GROUPS, type Holding, type HoldingKind } from '@/lib/types';

export default function HoldingsPage() {
  const { data, patch, clearValue, isHydrated, holdingValue } = useWealth();
  const { liquidCash, propertyValue, holdings, liabilities, currency } = data;

  const addHolding = (kind: HoldingKind, name: string, symbol?: string) =>
    patch((prev) => {
      if (prev.holdings.filter((h) => h.kind === kind).length >= MAX_ITEMS) return prev;
      const next: Holding = { id: crypto.randomUUID(), kind, name, value: 0, symbol, units: 0 };
      return { ...prev, holdings: [...prev.holdings, next] };
    });

  const loadDemo = () =>
    patch((prev) => ({
      ...prev,
      liquidCash: 24500,
      propertyValue: 485000,
      holdings: [
        { id: crypto.randomUUID(), kind: 'stocks', name: 'Apple', symbol: 'AAPL', units: 10, value: 0 },
        { id: crypto.randomUUID(), kind: 'funds', name: 'S&P 500', symbol: 'SPY', units: 8, value: 0 },
        { id: crypto.randomUUID(), kind: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', units: 0.25, value: 0 },
        { id: crypto.randomUUID(), kind: 'crypto', name: 'Ether', symbol: 'ETH', units: 2, value: 0 },
        { id: crypto.randomUUID(), kind: 'bonds', name: 'Treasuries', value: 22000 },
        { id: crypto.randomUUID(), kind: 'retirement', name: 'KiwiSaver', value: 64000 },
      ],
      liabilities: [
        { id: crypto.randomUUID(), name: 'Mortgage', value: 312000 },
        { id: crypto.randomUUID(), name: 'Student loans', value: 18500 },
      ],
      compare: DEFAULT_COMPARE,
    }));

  return (
    <main className="mx-auto max-w-[980px] px-5 pb-20 pt-8">
      <h1 className="text-[28px] font-semibold tracking-tight">Holdings</h1>
      <p className="mt-1 max-w-xl text-[15px] text-[var(--secondary)]">
        Tickers and units mark to market. Your list never leaves this browser — only public prices are fetched.
      </p>

      <p className="mb-2 mt-8 px-4 text-[13px] font-semibold text-[var(--secondary)]">Core</p>
      <div className="overflow-hidden rounded-[20px] bg-[var(--elevated)]">
        <Row
          label="Liquid cash"
          caption="Checking, savings"
          cents={toCents(liquidCash)}
          onCents={(cents) => patch((p) => ({ ...p, liquidCash: centsToDollars(cents) }))}
          disabled={!isHydrated}
        />
        <Hairline />
        <Row
          label="Property"
          caption="Estimated market value"
          cents={toCents(propertyValue)}
          onCents={(cents) => patch((p) => ({ ...p, propertyValue: centsToDollars(cents) }))}
          disabled={!isHydrated}
        />
      </div>

      {HOLDING_GROUPS.map((group) => (
        <HoldingsGroup
          key={group.kind}
          title={group.title}
          empty={group.empty}
          add={group.add}
          priced={group.priced}
          items={holdings.filter((h) => h.kind === group.kind)}
          disabled={!isHydrated}
          liveLabel={(item) => formatCents(holdingValue(item), currency)}
          onAdd={() => addHolding(group.kind, group.title, group.kind === 'bitcoin' ? 'BTC' : undefined)}
          onName={(id, name) =>
            patch((p) => ({
              ...p,
              holdings: p.holdings.map((row) => (row.id === id ? { ...row, name } : row)),
            }))
          }
          onSymbol={(id, symbol) =>
            patch((p) => ({
              ...p,
              holdings: p.holdings.map((row) => (row.id === id ? { ...row, symbol } : row)),
            }))
          }
          onUnits={(id, units) =>
            patch((p) => ({
              ...p,
              holdings: p.holdings.map((row) => (row.id === id ? { ...row, units } : row)),
            }))
          }
          onCents={(id, cents) =>
            patch((p) => ({
              ...p,
              holdings: p.holdings.map((row) =>
                row.id === id ? { ...row, value: centsToDollars(cents) } : row,
              ),
            }))
          }
          onRemove={(id) =>
            patch((p) => ({
              ...p,
              holdings: p.holdings.filter((row) => row.id !== id),
            }))
          }
        />
      ))}

      <p className="mb-2 mt-6 px-4 text-[13px] font-semibold text-[var(--secondary)]">Liabilities</p>
      <div className="overflow-hidden rounded-[20px] bg-[var(--elevated)]">
        {liabilities.length === 0 && (
          <p className="px-4 py-3.5 text-[15px] text-[var(--tertiary)]">No loans or cards yet</p>
        )}
        {liabilities.map((item, i) => (
          <div key={item.id}>
            {i > 0 && <Hairline />}
            <EditableRow
              name={item.name}
              cents={toCents(item.value)}
              disabled={!isHydrated}
              onName={(name) =>
                patch((p) => ({
                  ...p,
                  liabilities: p.liabilities.map((row) => (row.id === item.id ? { ...row, name } : row)),
                }))
              }
              onCents={(cents) =>
                patch((p) => ({
                  ...p,
                  liabilities: p.liabilities.map((row) =>
                    row.id === item.id ? { ...row, value: centsToDollars(cents) } : row,
                  ),
                }))
              }
              onRemove={() =>
                patch((p) => ({
                  ...p,
                  liabilities: p.liabilities.filter((row) => row.id !== item.id),
                }))
              }
            />
          </div>
        ))}
        <Hairline />
        <button
          type="button"
          onClick={() =>
            patch((p) =>
              p.liabilities.length >= MAX_ITEMS
                ? p
                : {
                    ...p,
                    liabilities: [...p.liabilities, { id: crypto.randomUUID(), name: 'Loan', value: 0 }],
                  },
            )
          }
          className="flex h-11 w-full items-center px-4 text-left text-[17px] text-[var(--blue)]"
        >
          Add liability
        </button>
      </div>

      <div className="mt-8 flex justify-center gap-6 text-[17px]">
        <button type="button" onClick={loadDemo} className="text-[var(--blue)]">
          Load sample
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Clear every figure saved on this device?')) clearValue();
          }}
          className="text-[var(--red)]"
        >
          Clear
        </button>
      </div>
    </main>
  );
}
