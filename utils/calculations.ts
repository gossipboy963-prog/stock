import { Asset, BucketType, PortfolioData } from '../types';

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

export const formatPercent = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(val / 100);
};

export const calculateTotals = (data: PortfolioData) => {
  const assetsValue = data.assets.reduce((acc, curr) => acc + (curr.shares * curr.currentPrice), 0);
  const totalEquity = assetsValue + data.cashUSD;
  
  const prevAssetsValue = data.assets.reduce((acc, curr) => acc + (curr.shares * curr.prevClose), 0);
  // Assuming cash didn't change for daily change calc simplicity, or track prevCash separately. 
  // For MVP, we only track asset daily P&L.
  const dailyChange = assetsValue - prevAssetsValue;
  const dailyChangePercent = prevAssetsValue > 0 ? (dailyChange / prevAssetsValue) * 100 : 0;

  return { totalEquity, assetsValue, dailyChange, dailyChangePercent };
};

export const calculateBuckets = (data: PortfolioData, totalEquity: number) => {
  const bucketValues = {
    [BucketType.ETF]: 0,
    [BucketType.TRADING]: 0,
    [BucketType.HEDGE_CASH]: data.cashUSD
  };

  data.assets.forEach(asset => {
    bucketValues[asset.bucket] += asset.shares * asset.currentPrice;
  });

  return [
    { name: BucketType.ETF, value: bucketValues[BucketType.ETF], ratio: bucketValues[BucketType.ETF] / totalEquity },
    { name: BucketType.TRADING, value: bucketValues[BucketType.TRADING], ratio: bucketValues[BucketType.TRADING] / totalEquity },
    { name: BucketType.HEDGE_CASH, value: bucketValues[BucketType.HEDGE_CASH], ratio: bucketValues[BucketType.HEDGE_CASH] / totalEquity },
  ];
};
