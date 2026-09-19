'use client';

import { ComparePaths } from '@/components/ComparePaths';
import { useWealth } from '@/components/WealthProvider';

export default function ComparePage() {
  const { data, patch, isHydrated } = useWealth();
  return (
    <main className="pt-2">
      <ComparePaths
        value={data.compare}
        hydrated={isHydrated}
        currency={data.currency}
        onChange={(next) => patch((p) => ({ ...p, compare: next }))}
      />
    </main>
  );
}
