'use client';

import { Hairline, Row } from '@/components/HoldingsGroup';
import { CurrencyInput } from '@/components/CurrencyInput';
import { SectionHero, SheetStat } from '@/components/SectionHero';
import { useWealth } from '@/components/WealthProvider';
import { budgetTotals } from '@/lib/budget';
import { centsToDollars, formatCents, toCents } from '@/lib/money';
import { MAX_ITEMS } from '@/lib/sanitize';
import { EXPENSE_GROUPS, type ExpenseItem, type ExpenseKind } from '@/lib/types';

export default function SpendPage() {
  const { data, patch, isHydrated } = useWealth();
  const { budget, currency } = data;
  const totals = budgetTotals(budget);
  const figure = (cents: number) => (isHydrated ? formatCents(cents, currency) : '—');

  const addItem = (kind: ExpenseKind) =>
    patch((prev) => {
      if (prev.budget.items.length >= MAX_ITEMS) return prev;
      const group = EXPENSE_GROUPS.find((g) => g.kind === kind);
      const item: ExpenseItem = {
        id: crypto.randomUUID(),
        kind,
        name: group?.title ?? 'Expense',
        amount: 0,
      };
      return { ...prev, budget: { ...prev.budget, items: [...prev.budget.items, item] } };
    });

  const loadDemo = () =>
    patch((prev) => ({
      ...prev,
      budget: {
        monthlyIncome: 8500,
        items: [
          { id: crypto.randomUUID(), kind: 'housing', name: 'Rent', amount: 2200 },
          { id: crypto.randomUUID(), kind: 'food', name: 'Groceries', amount: 650 },
          { id: crypto.randomUUID(), kind: 'transport', name: 'Transit + fuel', amount: 280 },
          { id: crypto.randomUUID(), kind: 'utilities', name: 'Power & internet', amount: 190 },
          { id: crypto.randomUUID(), kind: 'subs', name: 'Software & media', amount: 85 },
          { id: crypto.randomUUID(), kind: 'insurance', name: 'Health cover', amount: 140 },
        ],
      },
    }));

  const spentPct = totals.income > 0 ? Math.min(100, Math.round((totals.spent / totals.income) * 100)) : 0;

  if (isHydrated && !budget.monthlyIncome && budget.items.length === 0) {
    return (
      <main className="pt-4">
        <SectionHero
          tone="dusk"
          lead="Watch"
          headline="where it goes"
          sub="Set your take-home pay against what you actually spend, and your savings rate stops being a guess."
          ctaLabel="Load a sample month"
          onCta={loadDemo}
          note="Nothing is sent anywhere. Categories live in this browser alongside your holdings."
        >
          <p className="sh-preview-label">A month at a glance</p>
          <div className="sh-grid">
            <div className="sh-tile">
              <SheetStat label="Income" value="$8,500" />
            </div>
            <div className="sh-tile">
              <SheetStat label="Spent" value="$3,545" />
            </div>
            <div className="sh-tile">
              <SheetStat label="Left over" value="$4,955" delta="58%" positive />
            </div>
            <div className="sh-tile">
              <SheetStat label="Biggest line" value="Rent" delta="$2,200" />
            </div>
          </div>
        </SectionHero>
      </main>
    );
  }

  return (
    <main className="pt-4">
      <h1 className="text-[28px] font-semibold tracking-tight">Spend</h1>
      <p className="mt-1 max-w-xl text-[15px] text-[var(--secondary)]">
        Monthly cashflow calculator. Stays on this device.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Income" value={figure(totals.income)} />
        <Stat label="Spent" value={figure(totals.spent)} />
        <Stat label="Left" value={figure(totals.leftover)} />
        <Stat label="Savings rate" value={isHydrated ? `${Math.round(totals.rate * 100)}%` : '—'} />
      </div>

      <div className="panel mt-4 rounded-[20px] px-5 py-4">
        <div className="mb-2 flex justify-between text-[13px] text-[var(--secondary)]">
          <span>Used of income</span>
          <span className="tabular-nums">{spentPct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          <div
            className={`h-full rounded-full ${totals.leftover < 0 ? 'bg-[var(--red)]' : 'bg-[var(--blue)]'}`}
            style={{ width: `${spentPct}%` }}
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
          <p>
            Needs <span className="tabular-nums font-medium">{figure(totals.needs)}</span>
          </p>
          <p>
            Wants <span className="tabular-nums font-medium">{figure(totals.wants)}</span>
          </p>
        </div>
      </div>

      <p className="mb-2 mt-8 px-4 text-[13px] font-semibold text-[var(--secondary)]">Income</p>
      <div className="overflow-hidden rounded-[20px] bg-[var(--elevated)]">
        <Row
          label="Monthly income"
          caption="Pay after tax, averaged"
          cents={toCents(budget.monthlyIncome)}
          onCents={(cents) =>
            patch((p) => ({ ...p, budget: { ...p.budget, monthlyIncome: centsToDollars(cents) } }))
          }
          disabled={!isHydrated}
        />
      </div>

      {EXPENSE_GROUPS.map((group) => {
        const items = budget.items.filter((i) => i.kind === group.kind);
        const subtotal = items.reduce((s, i) => s + toCents(i.amount), 0);
        return (
          <div key={group.kind}>
            <div className="mb-2 mt-6 flex items-baseline justify-between px-4">
              <p className="text-[13px] font-semibold text-[var(--secondary)]">{group.title}</p>
              <p className="text-[13px] tabular-nums text-[var(--tertiary)]">{figure(subtotal)}</p>
            </div>
            <div className="overflow-hidden rounded-[20px] bg-[var(--elevated)]">
              {items.length === 0 && (
                <p className="px-4 py-3.5 text-[15px] text-[var(--tertiary)]">Nothing in {group.title.toLowerCase()}</p>
              )}
              {items.map((item, i) => (
                <div key={item.id}>
                  {i > 0 && <Hairline />}
                  <div className="flex items-center gap-2 px-4 py-2.5">
                    <input
                      type="text"
                      value={item.name}
                      disabled={!isHydrated}
                      onChange={(e) =>
                        patch((p) => ({
                          ...p,
                          budget: {
                            ...p.budget,
                            items: p.budget.items.map((row) =>
                              row.id === item.id ? { ...row, name: e.target.value.slice(0, 80) } : row,
                            ),
                          },
                        }))
                      }
                      className="min-w-0 flex-1 bg-transparent text-[17px] outline-none"
                    />
                    <CurrencyInput
                      cents={toCents(item.amount)}
                      disabled={!isHydrated}
                      ariaLabel={item.name}
                      onCentsChange={(cents) =>
                        patch((p) => ({
                          ...p,
                          budget: {
                            ...p.budget,
                            items: p.budget.items.map((row) =>
                              row.id === item.id ? { ...row, amount: centsToDollars(cents) } : row,
                            ),
                          },
                        }))
                      }
                    />
                    <button
                      type="button"
                      aria-label={`Remove ${item.name}`}
                      onClick={() =>
                        patch((p) => ({
                          ...p,
                          budget: {
                            ...p.budget,
                            items: p.budget.items.filter((row) => row.id !== item.id),
                          },
                        }))
                      }
                      className="hit text-[22px] leading-none text-[var(--tertiary)] hover:text-[var(--red)]"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              <Hairline />
              <button
                type="button"
                onClick={() => addItem(group.kind)}
                className="flex h-11 w-full items-center px-4 text-left text-[17px] text-[var(--blue)]"
              >
                Add {group.title.toLowerCase()}
              </button>
            </div>
          </div>
        );
      })}

      <div className="mt-8 flex justify-center">
        <button type="button" onClick={loadDemo} className="hit px-3 text-[17px] text-[var(--blue)]">
          Load sample spend
        </button>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel rounded-[16px] px-4 py-3">
      <p className="text-[12px] text-[var(--secondary)]">{label}</p>
      <p className="mt-1 text-[17px] font-semibold tabular-nums">{value}</p>
    </div>
  );
}
