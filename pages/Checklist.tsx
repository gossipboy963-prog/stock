import React, { useState } from 'react';
import { useStore } from '../services/store';
import { Card, Button, Input, Badge } from '../components/UI';
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { SOPStep, SOPStatus, TradeResult } from '../types';

const INITIAL_STEPS: SOPStep[] = [
  { id: 1, label: 'Price & Volume', description: 'Is the setup clean? Volume validating move?', status: SOPStatus.PENDING, note: '' },
  { id: 2, label: 'OBV', description: 'Confirm trend direction. Non-entry signal.', status: SOPStatus.PENDING, note: '' },
  { id: 3, label: 'A/D Line', description: 'Is institutional money supporting this?', status: SOPStatus.PENDING, note: '' },
  { id: 4, label: 'CMF', description: 'Is it flipping negative? Use as brake.', status: SOPStatus.PENDING, note: '' },
  { id: 5, label: 'RSI', description: '40-50 Support held? Divergence? No overbought trading.', status: SOPStatus.PENDING, note: '' },
  { id: 6, label: 'MA Structure', description: 'Above key MAs? Stop loss clear?', status: SOPStatus.PENDING, note: '' },
  { id: 7, label: 'ATR & R:R', description: 'Is R:R > 2? Position size correct?', status: SOPStatus.PENDING, note: '' },
];

const NO_TRADE_RULES = [
  "Choppy / Range Market",
  "Price good, Volume weak",
  "2 Consecutive Losses",
  "Emotional / Revenge Trading",
  "FOMO"
];

export const Checklist = () => {
  const { addJournalEntry } = useStore();
  const [symbol, setSymbol] = useState('');
  const [price, setPrice] = useState('');
  const [steps, setSteps] = useState<SOPStep[]>(INITIAL_STEPS);
  const [direction, setDirection] = useState<'Long' | 'Short'>('Long');
  const [noTradeReason, setNoTradeReason] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const handleStatusChange = (id: number, status: SOPStatus) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    if (status !== SOPStatus.PASS) {
        setExpandedStep(id); // Auto expand to add note if not passed
    } else {
        setExpandedStep(id + 1 <= 7 ? id + 1 : null); // Auto advance
    }
  };

  const handleNoteChange = (id: number, note: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, note } : s));
  };

  const calculateResult = (): { result: TradeResult, advice: string } => {
    if (noTradeReason) return { result: TradeResult.NO_TRADE, advice: "Step back. Preserve capital. The market will be there tomorrow." };
    
    const fails = steps.filter(s => s.status === SOPStatus.FAIL).length;
    const warns = steps.filter(s => s.status === SOPStatus.WARN).length;
    const pending = steps.filter(s => s.status === SOPStatus.PENDING).length;

    if (fails > 0) return { result: TradeResult.NO_TRADE, advice: "Setup invalid. Do not force it. Patience pays." };
    if (pending > 0) return { result: TradeResult.OBSERVE, advice: "Incomplete analysis. Finish the SOP." };
    if (warns > 0) return { result: TradeResult.OBSERVE, advice: "Setup has flaws. Reduced size or wait for better confirmation." };
    
    return { result: TradeResult.TRADABLE, advice: "Setup looks pristine. Execute with discipline. Honor your stop." };
  };

  const { result, advice } = calculateResult();

  const handleSave = () => {
    if (!symbol) return;
    addJournalEntry({
        date: Date.now(),
        symbol: symbol.toUpperCase(),
        price: price ? Number(price) : undefined,
        direction,
        result,
        sopData: steps,
        noTradeReason: noTradeReason || undefined,
        notes: advice
    });
    setSaved(true);
    setTimeout(() => {
        setSaved(false);
        setSymbol('');
        setPrice('');
        setSteps(INITIAL_STEPS);
        setNoTradeReason(null);
    }, 1500);
  };

  return (
    <div className="p-6 pt-10 pb-32 animate-fade-in">
      <h1 className="text-2xl font-light mb-6">Trade SOP</h1>

      <Card className="mb-6 sticky top-4 z-40 bg-white/95 backdrop-blur shadow-md">
        <div className="flex flex-col gap-3 mb-4">
            <div className="flex gap-3">
                <div className="flex-1">
                    <Input 
                        placeholder="SYMBOL" 
                        value={symbol} 
                        onChange={e => setSymbol(e.target.value)} 
                        className="uppercase font-bold tracking-wider"
                    />
                </div>
                <div className="w-28">
                    <Input 
                        placeholder="PRICE" 
                        type="number"
                        value={price} 
                        onChange={e => setPrice(e.target.value)} 
                        className="font-mono text-center"
                    />
                </div>
            </div>
            
            <div className="flex bg-zen-surface rounded-lg p-1">
                <button 
                    onClick={() => setDirection('Long')} 
                    className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${direction === 'Long' ? 'bg-white shadow-sm text-zen-text' : 'text-zen-subtext'}`}
                >Long</button>
                <button 
                    onClick={() => setDirection('Short')} 
                    className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${direction === 'Short' ? 'bg-white shadow-sm text-zen-text' : 'text-zen-subtext'}`}
                >Short</button>
            </div>
        </div>
        <div className={`p-3 rounded-lg flex items-start gap-3 border ${
            result === TradeResult.TRADABLE ? 'bg-zen-accent/10 border-zen-accent/20' : 
            result === TradeResult.NO_TRADE ? 'bg-zen-alert/10 border-zen-alert/20' : 
            'bg-zen-surface border-zen-line'
        }`}>
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                     <span className="font-bold text-sm tracking-wide uppercase">{result}</span>
                </div>
                <p className="text-xs opacity-80 leading-relaxed">{advice}</p>
            </div>
        </div>
      </Card>

      <div className="space-y-6">
          {/* No Trade List */}
          <div className="bg-zen-surface/30 p-4 rounded-xl border border-zen-warn/20">
              <h3 className="text-xs font-bold text-zen-alert uppercase tracking-widest mb-3">Hard Stop Checklist</h3>
              <div className="space-y-2">
                  {NO_TRADE_RULES.map((rule) => (
                      <label key={rule} className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${noTradeReason === rule ? 'bg-zen-alert border-zen-alert' : 'border-zen-subtext/30 bg-white'}`}>
                              {noTradeReason === rule && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={noTradeReason === rule} 
                            onChange={() => setNoTradeReason(noTradeReason === rule ? null : rule)}
                          />
                          <span className={`text-sm transition-colors ${noTradeReason === rule ? 'text-zen-alert font-medium' : 'text-zen-subtext group-hover:text-zen-text'}`}>{rule}</span>
                      </label>
                  ))}
              </div>
          </div>

          {/* SOP Steps */}
          <div className={`space-y-3 transition-opacity duration-300 ${noTradeReason ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              {steps.map((step) => (
                  <Card key={step.id} className="!p-4 transition-all">
                      <div className="flex justify-between items-center" onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}>
                          <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-zen-surface text-zen-subtext text-xs flex items-center justify-center font-medium font-mono">{step.id}</span>
                              <span className="font-medium text-sm">{step.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                              {step.status === SOPStatus.PASS && <CheckCircle2 size={18} className="text-zen-accent" />}
                              {step.status === SOPStatus.WARN && <AlertTriangle size={18} className="text-[#D4A5A5]" />}
                              {step.status === SOPStatus.FAIL && <XCircle size={18} className="text-zen-alert" />}
                          </div>
                      </div>

                      {expandedStep === step.id && (
                          <div className="mt-4 pt-4 border-t border-zen-line animate-fade-in">
                              <p className="text-xs text-zen-subtext mb-4">{step.description}</p>
                              
                              <div className="grid grid-cols-3 gap-2 mb-4">
                                  <button onClick={() => handleStatusChange(step.id, SOPStatus.PASS)} className={`py-2 text-xs rounded-lg border ${step.status === SOPStatus.PASS ? 'bg-zen-accent text-white border-zen-accent' : 'border-zen-line'}`}>Pass</button>
                                  <button onClick={() => handleStatusChange(step.id, SOPStatus.WARN)} className={`py-2 text-xs rounded-lg border ${step.status === SOPStatus.WARN ? 'bg-[#D4A5A5] text-white border-[#D4A5A5]' : 'border-zen-line'}`}>Caution</button>
                                  <button onClick={() => handleStatusChange(step.id, SOPStatus.FAIL)} className={`py-2 text-xs rounded-lg border ${step.status === SOPStatus.FAIL ? 'bg-zen-alert text-white border-zen-alert' : 'border-zen-line'}`}>Fail</button>
                              </div>

                              <Input 
                                placeholder="Observations..." 
                                value={step.note} 
                                onChange={(e) => handleNoteChange(step.id, e.target.value)}
                                className="text-xs bg-zen-surface border-none"
                              />
                          </div>
                      )}
                  </Card>
              ))}
          </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 p-6 bg-gradient-to-t from-zen-bg to-transparent pointer-events-none">
          <Button 
            onClick={handleSave} 
            disabled={!symbol}
            className={`shadow-xl pointer-events-auto flex items-center justify-center gap-2 ${saved ? 'bg-zen-accent' : ''}`}
          >
              {saved ? <CheckCircle2 size={18}/> : <Save size={18} />}
              {saved ? 'Saved to Journal' : 'Save Entry'}
          </Button>
      </div>
    </div>
  );
};