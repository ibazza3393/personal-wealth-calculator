import { toCents } from './money';
import type { Budget, ExpenseKind } from './types';
import { EXPENSE_GROUPS } from './types';

export function budgetTotals(budget: Budget) {
  const income = toCents(budget.monthlyIncome);
  const spent = budget.items.reduce((sum, item) => sum + toCents(item.amount), 0);
  const leftover = income - spent;
  const rate = income > 0 ? leftover / income : 0;

  const byKind = (kind: ExpenseKind) =>
    budget.items.filter((i) => i.kind === kind).reduce((s, i) => s + toCents(i.amount), 0);

  const needs = EXPENSE_GROUPS.filter((g) => g.bucket === 'need').reduce(
    (s, g) => s + byKind(g.kind),
    0,
  );
  const wants = EXPENSE_GROUPS.filter((g) => g.bucket === 'want').reduce(
    (s, g) => s + byKind(g.kind),
    0,
  );

  return { income, spent, leftover, rate, needs, wants, byKind };
}
