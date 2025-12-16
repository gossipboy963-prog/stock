export enum BucketType {
  ETF = 'ETF',
  TRADING = 'Trading',
  HEDGE_CASH = 'Hedge+Cash'
}

export interface Asset {
  id: string;
  symbol: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  prevClose: number;
  bucket: BucketType;
  notes?: string;
}

export interface PortfolioData {
  cashUSD: number;
  assets: Asset[];
  lastUpdated: number; // Timestamp
}

export enum SOPStatus {
  PENDING = 'pending',
  PASS = 'pass',
  WARN = 'warn',
  FAIL = 'fail'
}

export interface SOPStep {
  id: number;
  label: string;
  description: string;
  status: SOPStatus;
  note: string;
}

export enum TradeResult {
  TRADABLE = 'Tradable',
  OBSERVE = 'Observe',
  NO_TRADE = 'No Trade'
}

export interface JournalEntry {
  id: string;
  date: number; // Timestamp
  symbol: string;
  price?: number;
  direction: 'Long' | 'Short';
  result: TradeResult;
  sopData: SOPStep[];
  riskData?: {
    entry: number;
    stopLoss: number;
    target?: number;
    riskAmount: number;
    shares: number;
    rr?: number;
  };
  noTradeReason?: string;
  notes?: string;
}