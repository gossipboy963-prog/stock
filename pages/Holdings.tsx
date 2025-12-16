import React, { useState } from 'react';
import { useStore } from '../services/store';
import { formatCurrency, formatPercent } from '../utils/calculations';
import { Card, Button, Input, Badge } from '../components/UI';
import { Plus, X, Edit2, DollarSign } from 'lucide-react';
import { BucketType } from '../types';

export const Holdings = () => {
  const { portfolio, updateCash, addAsset, deleteAsset } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingCash, setIsEditingCash] = useState(false);
  
  // Form State
  const [form, setForm] = useState({ symbol: '', shares: '', avgCost: '', bucket: BucketType.TRADING });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.symbol || !form.shares || !form.avgCost) return;
    addAsset({
      symbol: form.symbol.toUpperCase(),
      shares: Number(form.shares),
      avgCost: Number(form.avgCost),
      bucket: form.bucket,
    });
    setIsAdding(false);
    setForm({ symbol: '', shares: '', avgCost: '', bucket: BucketType.TRADING });
  };

  const handleCashUpdate = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      updateCash(Number(fd.get('cash')));
      setIsEditingCash(false);
  }

  return (
    <div className="p-6 pt-10 pb-32 animate-fade-in">
        <header className="flex justify-between items-end mb-8">
            <h1 className="text-2xl font-light">Holdings</h1>
            <button onClick={() => setIsAdding(true)} className="flex items-center gap-1 text-sm font-medium bg-zen-text text-white px-4 py-2 rounded-full shadow-lg active:scale-95 transition-transform">
                <Plus size={16} /> Add Asset
            </button>
        </header>

        {/* Cash Card */}
        <Card className="mb-6 bg-zen-surface/50 border-dashed">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xs text-zen-subtext uppercase tracking-widest mb-1">Available Cash</h3>
                    {isEditingCash ? (
                         <form onSubmit={handleCashUpdate} className="flex gap-2">
                             <input name="cash" type="number" defaultValue={portfolio.cashUSD} className="w-32 bg-white px-2 py-1 rounded text-lg outline-none" autoFocus />
                             <button type="submit" className="text-xs bg-black text-white px-2 rounded">Save</button>
                         </form>
                    ) : (
                        <div className="text-xl font-medium flex items-center gap-2" onClick={() => setIsEditingCash(true)}>
                            {formatCurrency(portfolio.cashUSD)}
                            <Edit2 size={12} className="text-zen-subtext opacity-50" />
                        </div>
                    )}
                </div>
                <div className="bg-white p-2 rounded-full text-zen-subtext">
                    <DollarSign size={20} />
                </div>
            </div>
        </Card>

        {/* Assets List */}
        <div className="space-y-4">
            {portfolio.assets.length === 0 && (
                <div className="text-center py-10 text-zen-subtext text-sm">No assets currently held.</div>
            )}
            
            {portfolio.assets.map((asset) => {
                const marketVal = asset.shares * asset.currentPrice;
                const dailyPnl = (asset.currentPrice - asset.prevClose) * asset.shares;
                const totalPnl = (asset.currentPrice - asset.avgCost) * asset.shares;
                const totalPnlPercent = ((asset.currentPrice - asset.avgCost) / asset.avgCost) * 100;

                return (
                    <Card key={asset.id} className="relative group">
                        <button 
                            onClick={() => deleteAsset(asset.id)}
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zen-subtext hover:text-zen-alert"
                        >
                            <X size={16} />
                        </button>

                        <div className="flex justify-between mb-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-lg">{asset.symbol}</span>
                                    <Badge>{asset.bucket}</Badge>
                                </div>
                                <div className="text-xs text-zen-subtext mt-1 font-medium">{asset.shares} shares</div>
                            </div>
                            <div className="text-right">
                                <div className="font-medium">{formatCurrency(marketVal)}</div>
                            </div>
                        </div>

                        {/* Price Details - Explicitly showing Avg Cost and Close */}
                        <div className="bg-zen-surface/50 rounded-lg p-2 mb-3 flex justify-between text-xs text-zen-subtext">
                            <div className="flex flex-col">
                                <span className="opacity-70 text-[10px] uppercase">Avg Cost</span>
                                <span className="font-medium">{formatCurrency(asset.avgCost)}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="opacity-70 text-[10px] uppercase">Daily Close</span>
                                <span className="font-medium text-zen-text">{formatCurrency(asset.currentPrice)}</span>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-3 border-t border-zen-line text-xs">
                             <div className="flex gap-4">
                                <span>Day: <span className={dailyPnl >= 0 ? 'text-zen-accent' : 'text-zen-alert'}>
                                    {dailyPnl >= 0 ? '+' : ''}{formatCurrency(dailyPnl)}
                                </span></span>
                                
                             </div>
                             <div>
                                Total: <span className={totalPnl >= 0 ? 'text-zen-accent' : 'text-zen-alert'}>
                                    {totalPnlPercent.toFixed(1)}%
                                </span>
                             </div>
                        </div>
                    </Card>
                )
            })}
        </div>

        {/* Add Modal */}
        {isAdding && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
                <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-fade-in-up">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-medium">Add Position</h2>
                        <button onClick={() => setIsAdding(false)}><X size={20} /></button>
                    </div>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <Input 
                            label="Symbol (US Stock)" 
                            value={form.symbol} 
                            onChange={e => setForm({...form, symbol: e.target.value.toUpperCase()})} 
                            placeholder="AAPL"
                            autoFocus
                        />
                         <div className="flex gap-4">
                            <Input 
                                label="Shares" 
                                type="number"
                                value={form.shares} 
                                onChange={e => setForm({...form, shares: e.target.value})} 
                            />
                            <Input 
                                label="Avg Cost" 
                                type="number"
                                step="0.01"
                                value={form.avgCost} 
                                onChange={e => setForm({...form, avgCost: e.target.value})} 
                            />
                        </div>
                        <div>
                             <label className="block text-xs text-zen-subtext mb-1.5 tracking-wide">Bucket</label>
                             <div className="flex gap-2">
                                 {Object.values(BucketType).map(b => (
                                     <button
                                        type="button"
                                        key={b}
                                        onClick={() => setForm({...form, bucket: b})}
                                        className={`flex-1 py-2 text-xs border rounded-lg transition-colors ${form.bucket === b ? 'bg-zen-text text-white border-zen-text' : 'border-zen-line text-zen-subtext'}`}
                                     >
                                        {b}
                                     </button>
                                 ))}
                             </div>
                        </div>
                        <Button type="submit" className="mt-4">Save Position</Button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};