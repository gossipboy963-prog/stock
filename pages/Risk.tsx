import React, { useState, useEffect } from 'react';
import { useStore } from '../services/store';
import { formatCurrency } from '../utils/calculations';
import { Card, Button, Input } from '../components/UI';
import { calculateTotals } from '../utils/calculations';

export const Risk = () => {
  const { portfolio } = useStore();
  const { totalEquity } = calculateTotals(portfolio);

  const [inputs, setInputs] = useState({
    accountSize: totalEquity.toString(),
    riskPercent: '1.0',
    entryPrice: '',
    stopPrice: '',
    targetPrice: ''
  });

  const [results, setResults] = useState<{shares: number, riskAmount: number, cost: number, rr: number} | null>(null);

  useEffect(() => {
    // Auto update account size if it changes in store
    if (!inputs.accountSize || inputs.accountSize === '0') {
        setInputs(prev => ({...prev, accountSize: totalEquity.toString()}));
    }
  }, [totalEquity]);

  const calculate = () => {
    const account = parseFloat(inputs.accountSize);
    const riskPct = parseFloat(inputs.riskPercent) / 100;
    const entry = parseFloat(inputs.entryPrice);
    const stop = parseFloat(inputs.stopPrice);
    const target = inputs.targetPrice ? parseFloat(inputs.targetPrice) : 0;

    if (!account || !entry || !stop) return;

    const riskPerShare = Math.abs(entry - stop);
    const riskAmount = account * riskPct;
    const shares = Math.floor(riskAmount / riskPerShare);
    const cost = shares * entry;
    
    let rr = 0;
    if (target) {
        const reward = Math.abs(target - entry);
        rr = reward / riskPerShare;
    }

    setResults({ shares, riskAmount, cost, rr });
  };

  useEffect(() => {
      calculate();
  }, [inputs]);

  return (
    <div className="p-6 pt-10 pb-32 animate-fade-in">
        <h1 className="text-2xl font-light mb-6">Risk Calc</h1>

        <Card className="mb-6 bg-zen-surface/30">
            <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                    <div className="text-xs text-zen-subtext uppercase tracking-wider mb-1">Position Size</div>
                    <div className="text-3xl font-light text-zen-text">{results ? results.shares : 0}</div>
                    <div className="text-xs text-zen-subtext mt-1">{results ? formatCurrency(results.cost) : '$0.00'}</div>
                </div>
                <div>
                    <div className="text-xs text-zen-subtext uppercase tracking-wider mb-1">Risk Amount</div>
                    <div className="text-xl font-medium text-zen-alert">{results ? formatCurrency(results.riskAmount) : '$0.00'}</div>
                    <div className="text-xs text-zen-subtext mt-1">{inputs.riskPercent}% of Equity</div>
                </div>
            </div>
            {results && results.rr > 0 && (
                <div className="mt-4 pt-4 border-t border-zen-line flex justify-center">
                    <div className={`text-sm font-medium px-3 py-1 rounded-full ${results.rr >= 2 ? 'bg-zen-accent/10 text-zen-accent' : 'bg-zen-warn/20 text-zen-warn'}`}>
                        R:R Ratio {results.rr.toFixed(2)}
                    </div>
                </div>
            )}
        </Card>

        <div className="space-y-4">
            <Input 
                label="Account Equity" 
                type="number" 
                value={inputs.accountSize} 
                onChange={e => setInputs({...inputs, accountSize: e.target.value})} 
            />
            <div className="grid grid-cols-2 gap-4">
                <Input 
                    label="Entry Price" 
                    type="number" 
                    placeholder="0.00"
                    value={inputs.entryPrice} 
                    onChange={e => setInputs({...inputs, entryPrice: e.target.value})} 
                />
                <Input 
                    label="Stop Loss" 
                    type="number" 
                    placeholder="0.00"
                    value={inputs.stopPrice} 
                    onChange={e => setInputs({...inputs, stopPrice: e.target.value})}
                    className={inputs.entryPrice && inputs.stopPrice && Number(inputs.stopPrice) >= Number(inputs.entryPrice) ? 'text-zen-alert' : ''} 
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <Input 
                    label="Risk %" 
                    type="number" 
                    step="0.1"
                    value={inputs.riskPercent} 
                    onChange={e => setInputs({...inputs, riskPercent: e.target.value})} 
                />
                <Input 
                    label="Target (Opt)" 
                    type="number" 
                    placeholder="0.00"
                    value={inputs.targetPrice} 
                    onChange={e => setInputs({...inputs, targetPrice: e.target.value})} 
                />
            </div>
        </div>
        
        <div className="mt-8 p-4 bg-white border border-zen-line rounded-xl text-xs text-zen-subtext leading-relaxed">
            <strong className="block mb-2 text-zen-text">Coach's Note:</strong>
            Standard risk is 1% per trade. If your stop loss is tight, you buy more shares. If wide, you buy fewer. The dollar risk remains constant. Do not exceed position limits.
        </div>
    </div>
  );
};
