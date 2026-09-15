export interface AssetItem {
  id: string;
  name: string;
  value: number;
}

export interface LiabilityItem {
  id: string;
  name: string;
  value: number;
}

export interface WealthData {
  liquidCash: number;
  propertyValue: number;
  marketAssets: AssetItem[];
  liabilities: LiabilityItem[];
}

export const DEFAULT_WEALTH_DATA: WealthData = {
  liquidCash: 0,
  propertyValue: 0,
  marketAssets: [],
  liabilities: [],
};

export const STORAGE_KEY = 'personal-wealth-data';
