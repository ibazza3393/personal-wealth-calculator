'use client';

import React from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Home, 
  CreditCard, 
  Plus, 
  Trash2, 
  Download, 
  RotateCcw,
  Shield 
} from 'lucide-react';
import { useLocalStorage } from '../lib/useLocalStorage';
import { WealthData, AssetItem, LiabilityItem, DEFAULT_WEALTH_DATA } from '../lib/types';

export default function PersonalWealthCalculator() {
  const {
    value: data,
    setValue,
    clearValue,
    isHydrated,
  } = useLocalStorage<WealthData>('personal-wealth-data', DEFAULT_WEALTH_DATA);

  const { liquidCash, propertyValue, marketAssets, liabilities } = data;

  // Pure client-side calculations - never leave the browser
  const totalMarketAssets = marketAssets.reduce((sum, item) => sum + (item.value || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, item) => sum + (item.value || 0), 0);
  const totalAssets = liquidCash + propertyValue + totalMarketAssets;
  const netWorth = totalAssets - totalLiabilities;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  };

  const formatCurrencyInput = (amount: number): string => {
    // For inputs, show exact value or empty for 0 to allow easy editing
    return amount === 0 ? '' : amount.toString();
  };

  const parseCurrency = (input: string): number => {
    const num = parseFloat(input);
    return isNaN(num) ? 0 : Math.max(0, num);
  };

  // Update handlers
  const updateLiquidCash = (inputValue: string) => {
    const value = parseCurrency(inputValue);
    setValue((prev) => ({ ...prev, liquidCash: value }));
  };

  const updatePropertyValue = (inputValue: string) => {
    const value = parseCurrency(inputValue);
    setValue((prev) => ({ ...prev, propertyValue: value }));
  };

  // Market Assets handlers
  const addMarketAsset = () => {
    const newItem: AssetItem = {
      id: crypto.randomUUID(),
      name: 'New Portfolio',
      value: 0,
    };
    setValue((prev) => ({
      ...prev,
      marketAssets: [...prev.marketAssets, newItem],
    }));
  };

  const updateMarketAsset = (id: string, field: 'name' | 'value', input: string) => {
    setValue((prev) => ({
      ...prev,
      marketAssets: prev.marketAssets.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === 'value' ? parseCurrency(input) : input,
            }
          : item
      ),
    }));
  };

  const removeMarketAsset = (id: string) => {
    setValue((prev) => ({
      ...prev,
      marketAssets: prev.marketAssets.filter((item) => item.id !== id),
    }));
  };

  // Liabilities handlers
  const addLiability = () => {
    const newItem: LiabilityItem = {
      id: crypto.randomUUID(),
      name: 'New Loan / Card',
      value: 0,
    };
    setValue((prev) => ({
      ...prev,
      liabilities: [...prev.liabilities, newItem],
    }));
  };

  const updateLiability = (id: string, field: 'name' | 'value', input: string) => {
    setValue((prev) => ({
      ...prev,
      liabilities: prev.liabilities.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === 'value' ? parseCurrency(input) : input,
            }
          : item
      ),
    }));
  };

  const removeLiability = (id: string) => {
    setValue((prev) => ({
      ...prev,
      liabilities: prev.liabilities.filter((item) => item.id !== id),
    }));
  };

  const loadDemoData = () => {
    const demoData: WealthData = {
      liquidCash: 24500,
      propertyValue: 485000,
      marketAssets: [
        { id: crypto.randomUUID(), name: 'VTSAX / Total Stock', value: 187500 },
        { id: crypto.randomUUID(), name: 'Individual Stocks', value: 42500 },
        { id: crypto.randomUUID(), name: 'Crypto Holdings', value: 18500 },
      ],
      liabilities: [
        { id: crypto.randomUUID(), name: 'Primary Mortgage', value: 312000 },
        { id: crypto.randomUUID(), name: 'Student Loans', value: 18500 },
        { id: crypto.randomUUID(), name: 'Credit Cards', value: 3200 },
      ],
    };
    setValue(demoData);
  };

  const handleClear = () => {
    if (window.confirm('Clear all saved data? This will reset everything to zero.')) {
      clearValue();
    }
  };

  const downloadBackup = () => {
    const exportData = {
      ...data,
      exportedAt: new Date().toISOString(),
      note: 'Personal Wealth Calculator backup - import not supported in this version',
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wealth-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Asset composition percentages (for visual bars)
  const liquidPercent = totalAssets > 0 ? Math.round((liquidCash / totalAssets) * 100) : 0;
  const marketPercent = totalAssets > 0 ? Math.round((totalMarketAssets / totalAssets) * 100) : 0;
  const propertyPercent = totalAssets > 0 ? Math.round((propertyValue / totalAssets) * 100) : 0;

  const netWorthColor = netWorth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
  const netWorthBg = netWorth >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/50' : 'bg-red-50 dark:bg-red-950/50';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto max-w-5xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Wealth Calculator</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 -mt-0.5">Personal Net Worth</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <Shield className="h-3.5 w-3.5" />
            <span>100% Private • Local Storage</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Net Worth Hero */}
        <div className={`mb-8 rounded-3xl p-8 md:p-10 ${netWorthBg} border border-zinc-200 dark:border-zinc-800`}>
          <div className="flex flex-col items-center text-center">
            <div className="text-sm font-medium tracking-[1px] text-zinc-500 dark:text-zinc-400 mb-2">
              YOUR NET WORTH
            </div>
            <div className={`net-worth ${netWorthColor} tabular-nums`}>
              {formatCurrency(netWorth)}
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm">
              <div className="text-zinc-500 dark:text-zinc-400">
                Total Assets: <span className="font-medium text-zinc-700 dark:text-zinc-300 tabular-nums">{formatCurrency(totalAssets)}</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <div className="text-zinc-500 dark:text-zinc-400">
                Total Liabilities: <span className="font-medium text-zinc-700 dark:text-zinc-300 tabular-nums">{formatCurrency(totalLiabilities)}</span>
              </div>
            </div>
            {!isHydrated && (
              <div className="mt-2 text-xs text-zinc-400">Loading saved data…</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button 
            onClick={loadDemoData} 
            className="btn btn-secondary flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" /> Load Demo Data
          </button>
          <button 
            onClick={downloadBackup} 
            className="btn btn-secondary flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> Download Backup
          </button>
          <button 
            onClick={handleClear} 
            className="btn btn-danger flex items-center gap-2 ml-auto"
          >
            <Trash2 className="h-4 w-4" /> Clear All Data
          </button>
        </div>

        {/* Main Input Sections */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Assets Column */}
          <div className="card">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-semibold">Assets</h2>
            </div>

            {/* Liquid Cash */}
            <div className="mb-6">
              <label className="section-title flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Liquid Cash
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium text-zinc-400">$</div>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={formatCurrencyInput(liquidCash)}
                  onChange={(e) => updateLiquidCash(e.target.value)}
                  placeholder="0"
                  className="input input-number pl-8"
                />
              </div>
              <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">Checking, savings, money markets, cash on hand</p>
            </div>

            {/* Property Value */}
            <div className="mb-6">
              <label className="section-title flex items-center gap-2">
                <Home className="h-4 w-4" /> Property Value
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium text-zinc-400">$</div>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={formatCurrencyInput(propertyValue)}
                  onChange={(e) => updatePropertyValue(e.target.value)}
                  placeholder="0"
                  className="input input-number pl-8"
                />
              </div>
              <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">Primary residence, investment properties (estimated market value)</p>
            </div>

            {/* Market Assets */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="section-title flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Market Assets
                </label>
                <div className="text-right">
                  <div className="text-xs text-zinc-500">Total</div>
                  <div className="font-mono font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalMarketAssets)}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                {marketAssets.length === 0 && (
                  <div className="text-sm text-zinc-400 italic py-2">No portfolios added yet</div>
                )}
                {marketAssets.map((item) => (
                  <div key={item.id} className="list-row">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateMarketAsset(item.id, 'name', e.target.value)}
                      placeholder="Portfolio name"
                      className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                    />
                    <div className="relative w-36">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</div>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        value={formatCurrencyInput(item.value)}
                        onChange={(e) => updateMarketAsset(item.id, 'value', e.target.value)}
                        className="w-full rounded-md border border-zinc-200 bg-white pl-7 py-2 text-sm font-mono tabular-nums dark:border-zinc-700 dark:bg-zinc-950"
                      />
                    </div>
                    <button
                      onClick={() => removeMarketAsset(item.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-500 dark:hover:text-red-400"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={addMarketAsset} className="add-btn w-full justify-center">
                <Plus className="h-4 w-4" /> Add Portfolio
              </button>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Stocks, ETFs, bonds, crypto, retirement accounts</p>
            </div>
          </div>

          {/* Liabilities Column */}
          <div className="card">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="h-5 w-5 text-red-600 dark:text-red-400" />
              <h2 className="text-lg font-semibold">Liabilities</h2>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="section-title">Loans &amp; Credit Cards</div>
              <div className="text-right">
                <div className="text-xs text-zinc-500">Total</div>
                <div className="font-mono font-semibold tabular-nums text-red-600 dark:text-red-400">
                  {formatCurrency(totalLiabilities)}
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              {liabilities.length === 0 && (
                <div className="text-sm text-zinc-400 italic py-2">No liabilities added yet</div>
              )}
              {liabilities.map((item) => (
                <div key={item.id} className="list-row">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateLiability(item.id, 'name', e.target.value)}
                    placeholder="Loan or card name"
                    className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  />
                  <div className="relative w-36">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</div>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      value={formatCurrencyInput(item.value)}
                      onChange={(e) => updateLiability(item.id, 'value', e.target.value)}
                      className="w-full rounded-md border border-zinc-200 bg-white pl-7 py-2 text-sm font-mono tabular-nums dark:border-zinc-700 dark:bg-zinc-950"
                    />
                  </div>
                  <button
                    onClick={() => removeLiability(item.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-500 dark:hover:text-red-400"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <button onClick={addLiability} className="add-btn w-full justify-center">
              <Plus className="h-4 w-4" /> Add Liability
            </button>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Mortgage, auto loans, student debt, credit cards, personal loans</p>
          </div>
        </div>

        {/* Breakdown & Visuals */}
        <div className="mt-6 card">
          <h3 className="text-lg font-semibold mb-4">Breakdown</h3>

          {/* Asset Composition Bar */}
          {totalAssets > 0 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Asset Composition</span>
                <span className="text-zinc-500">{formatCurrency(totalAssets)}</span>
              </div>
              <div className="h-3 w-full flex rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {liquidCash > 0 && (
                  <div 
                    className="h-full bg-emerald-500 transition-all" 
                    style={{ width: `${liquidPercent}%` }}
                    title={`Liquid Cash: ${liquidPercent}%`}
                  />
                )}
                {totalMarketAssets > 0 && (
                  <div 
                    className="h-full bg-blue-500 transition-all" 
                    style={{ width: `${marketPercent}%` }}
                    title={`Market Assets: ${marketPercent}%`}
                  />
                )}
                {propertyValue > 0 && (
                  <div 
                    className="h-full bg-amber-500 transition-all" 
                    style={{ width: `${propertyPercent}%` }}
                    title={`Property: ${propertyPercent}%`}
                  />
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" /> Liquid: {liquidPercent}%
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-blue-500" /> Market: {marketPercent}%
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-amber-500" /> Property: {propertyPercent}%
                </div>
              </div>
            </div>
          )}

          {/* Summary Table */}
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-600 dark:text-zinc-400">Liquid Cash</span>
              <span className="font-mono tabular-nums">{formatCurrency(liquidCash)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-600 dark:text-zinc-400">Market Assets</span>
              <span className="font-mono tabular-nums">{formatCurrency(totalMarketAssets)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-600 dark:text-zinc-400">Property Value</span>
              <span className="font-mono tabular-nums">{formatCurrency(propertyValue)}</span>
            </div>
            <div className="flex justify-between py-1 font-medium">
              <span>Total Assets</span>
              <span className="font-mono tabular-nums">{formatCurrency(totalAssets)}</span>
            </div>

            <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />

            <div className="flex justify-between py-1 text-red-600 dark:text-red-400">
              <span>Total Liabilities</span>
              <span className="font-mono tabular-nums">−{formatCurrency(totalLiabilities)}</span>
            </div>
            <div className={`flex justify-between py-2 text-base font-semibold rounded-lg px-3 -mx-1 ${netWorth >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/40' : 'bg-red-50 dark:bg-red-950/40'}`}>
              <span>Net Worth</span>
              <span className={`font-mono tabular-nums ${netWorthColor}`}>{formatCurrency(netWorth)}</span>
            </div>
          </div>
        </div>

        {/* Privacy Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs text-zinc-500 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400">
            <Shield className="h-3.5 w-3.5" />
            All calculations run locally in your browser. Your financial data never leaves this device.
          </div>
          <p className="mt-3 text-[10px] text-zinc-400">
            Data is automatically saved to your browser&apos;s LocalStorage. Clear data anytime using the button above.
          </p>
        </div>
      </main>
    </div>
  );
}
