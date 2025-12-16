import React, { useMemo } from 'react';
import { useStore } from '../services/store';
import { calculateTotals, calculateBuckets, formatCurrency, formatPercent } from '../utils/calculations';
import { Card, Button, Badge } from '../components/UI';
import { RefreshCw, TrendingUp, AlertCircle, PieChart } from 'lucide-react';
import { BucketType } from '../types';
import { PieChart as RePie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const Dashboard = () => {
  const { portfolio, updateEOD } = useStore();
  const { totalEquity, dailyChange, dailyChangePercent } = calculateTotals(portfolio);
  const buckets = calculateBuckets(portfolio, totalEquity);

  const isUpdatedToday = useMemo(() => {
    const last = new Date(portfolio.lastUpdated);
    const now = new Date();
    return last.getDate() === now.getDate() && last.getMonth() === now.getMonth() && last.getFullYear() === now.getFullYear();
  }, [portfolio.lastUpdated]);

  const etfBucket = buckets.find(b => b.name === BucketType.ETF);
  const etfWarning = etfBucket && Math.abs(etfBucket.ratio - 0.25) > 0.05;

  const sortedAssets = [...portfolio.assets].sort((a, b) => {
    const contA = (a.currentPrice - a.prevClose) * a.shares;
    const contB = (b.currentPrice - b.prevClose) * b.shares;
    return contB - contA;
  });

  const topContributor = sortedAssets[0];
  const bottomContributor = sortedAssets[sortedAssets.length - 1];

  const COLORS = ['#7A9A8A', '#2C2C2C', '#D1D5DB'];

  return (
    <div className="p-6 space-y-6 pt-10 animate-fade-in">
      {/* Header & Total */}
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-sm text-zen-subtext tracking-widest uppercase mb-1">Total Equity</h1>
          <div className="text-3xl font-light text-zen-text tracking-tight">
            {formatCurrency(totalEquity)}
          </div>
          <div className={`flex items-center gap-2 mt-2 text-sm ${dailyChange >= 0 ? 'text-zen-accent' : 'text-zen-alert'}`}>
            {dailyChange >= 0 ? <TrendingUp size={16} /> : <TrendingUp size={16} className="rotate-180" />}
            <span>{formatCurrency(Math.abs(dailyChange))} ({formatPercent(Math.abs(dailyChangePercent))})</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
             <div className="text-[10px] text-zen-subtext mb-1">
                {isUpdatedToday ? 'Updated Today' : 'Needs Update'}
            </div>
            <button 
                onClick={updateEOD}
                className={`p-2 rounded-full transition-all ${isUpdatedToday ? 'bg-zen-surface text-zen-subtext' : 'bg-zen-text text-white shadow-lg'}`}
            >
                <RefreshCw size={18} className={!isUpdatedToday ? "animate-pulse" : ""} />
            </button>
        </div>
      </header>

      {/* Allocation Chart */}
      <Card>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-medium flex items-center gap-2"><PieChart size={16} /> Allocation</h2>
            {etfWarning && <Badge color="red">ETF Rebalance Needed</Badge>}
        </div>
        <div className="h-40 w-full flex">
             {/* Wrap ResponsiveContainer in a fixed size block to prevent width(-1) error */}
             <div className="w-[45%] h-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RePie data={buckets} dataKey="value" innerRadius={35} outerRadius={55} paddingAngle={2} stroke="none">
                      {buckets.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </RePie>
                </ResponsiveContainer>
             </div>
            <div className="flex-1 flex flex-col justify-center gap-3 pl-2">
                {buckets.map((b, i) => (
                    <div key={b.name} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                            <span className="text-zen-subtext">{b.name}</span>
                        </div>
                        <span className="font-medium">{formatPercent(b.ratio * 100)}</span>
                    </div>
                ))}
            </div>
        </div>
        <div className="mt-4 pt-4 border-t border-zen-line text-xs text-zen-subtext leading-relaxed">
            <p>Target: ETF 25% • Trading 50% • Cash 25%</p>
        </div>
      </Card>

      {/* Daily Contributions */}
      {(topContributor || bottomContributor) && (
        <Card>
          <h2 className="text-sm font-medium mb-4 text-zen-subtext">Daily Movers</h2>
          <div className="space-y-3">
             {topContributor && (
                 <div className="flex justify-between items-center">
                     <div className="flex items-center gap-2">
                         <Badge color="green">Top</Badge>
                         <span className="font-medium">{topContributor.symbol}</span>
                     </div>
                     <span className="text-zen-accent text-sm">
                        +{formatCurrency((topContributor.currentPrice - topContributor.prevClose) * topContributor.shares)}
                     </span>
                 </div>
             )}
             {bottomContributor && bottomContributor.id !== topContributor?.id && (
                 <div className="flex justify-between items-center">
                     <div className="flex items-center gap-2">
                         <Badge color="red">Low</Badge>
                         <span className="font-medium">{bottomContributor.symbol}</span>
                     </div>
                     <span className="text-zen-alert text-sm">
                        {formatCurrency((bottomContributor.currentPrice - bottomContributor.prevClose) * bottomContributor.shares)}
                     </span>
                 </div>
             )}
          </div>
        </Card>
      )}

      <div className="h-4" /> {/* Spacer */}
    </div>
  );
};