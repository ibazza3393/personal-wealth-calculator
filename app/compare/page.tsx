'use client';

import { ComparePaths } from '@/components/ComparePaths';
import { useWealth } from '@/components/WealthProvider';

export default function ComparePage() {
  const { data, patch, isHydrated } = useWealth();
  return (
    <main className="mx-auto max-w-[1100px] px-4 pt-2 sm:px-5">
      <ComparePaths
        value={data.compare}
        hydrated={isHydrated}
        currency={data.currency}
        onChange={(next) => patch((p) => ({ ...p, compare: next }))}
      />
    </main>
  );
}
