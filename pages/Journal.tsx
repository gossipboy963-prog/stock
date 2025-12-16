import React, { useState } from 'react';
import { useStore } from '../services/store';
import { formatCurrency } from '../utils/calculations';
import { Card, Badge } from '../components/UI';
import { TradeResult, SOPStatus } from '../types';
import { ChevronRight, Filter } from 'lucide-react';

export const Journal = () => {
  const { journal } = useStore();
  const [filter, setFilter] = useState<'All' | TradeResult>('All');

  const filtered = journal.filter(entry => filter === 'All' || entry.result === filter);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 pt-10 pb-32 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-light">Journal</h1>
            <div className="flex gap-2 text-xs">
                {(['All', TradeResult.TRADABLE, TradeResult.NO_TRADE] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-full transition-colors ${filter === f ? 'bg-zen-text text-white' : 'bg-zen-surface text-zen-subtext'}`}
                    >
                        {f === 'All' ? 'All' : f === TradeResult.TRADABLE ? 'Trade' : 'Skip'}
                    </button>
                ))}
            </div>
        </div>

        <div className="space-y-4">
            {filtered.length === 0 && (
                <div className="text-center py-10 text-zen-subtext text-sm">No journal entries yet. Start the SOP.</div>
            )}

            {filtered.map(entry => (
                <Card key={entry.id} className="!p-4 active:scale-[0.99] transition-transform">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-lg">{entry.symbol}</span>
                                {entry.price && (
                                    <span className="text-sm text-zen-subtext font-mono tracking-tight">
                                        @{formatCurrency(entry.price)}
                                    </span>
                                )}
                                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${entry.direction === 'Long' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {entry.direction}
                                </span>
                            </div>
                            <div className="text-[10px] text-zen-subtext mt-1">{formatDate(entry.date)}</div>
                        </div>
                        <Badge color={entry.result === TradeResult.TRADABLE ? 'green' : entry.result === TradeResult.NO_TRADE ? 'red' : 'gray'}>
                            {entry.result}
                        </Badge>
                    </div>

                    {entry.noTradeReason ? (
                         <div className="mt-3 bg-zen-warn/10 p-2 rounded text-xs text-zen-alert font-medium border border-zen-warn/20">
                            Stopped by: {entry.noTradeReason}
                         </div>
                    ) : (
                        <div className="mt-3 space-y-2">
                             {/* Mini SOP summary */}
                             <div className="flex gap-1">
                                 {entry.sopData.map(s => (
                                     <div key={s.id} className={`h-1 flex-1 rounded-full ${
                                         s.status === SOPStatus.PASS ? 'bg-zen-accent' : 
                                         s.status === SOPStatus.WARN ? 'bg-[#D4A5A5]' : 
                                         s.status === SOPStatus.FAIL ? 'bg-zen-alert' : 'bg-zen-line'
                                     }`} />
                                 ))}
                             </div>
                             <p className="text-xs text-zen-subtext italic">"{entry.notes}"</p>
                        </div>
                    )}
                </Card>
            ))}
        </div>
    </div>
  );
};