import React, { createContext, useContext, useEffect, useState } from 'react';
import { Asset, PortfolioData, JournalEntry, BucketType } from '../types';
import { GoogleGenAI } from "@google/genai";

interface StoreContextType {
  portfolio: PortfolioData;
  journal: JournalEntry[];
  addAsset: (asset: Omit<Asset, 'id' | 'currentPrice' | 'prevClose'>) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  updateCash: (amount: number) => void;
  updateEOD: () => Promise<void>;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  resetPortfolio: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY_PORTFOLIO = 'zen_portfolio_v1';
const STORAGE_KEY_JOURNAL = 'zen_journal_v1';

const INITIAL_PORTFOLIO: PortfolioData = {
  cashUSD: 10000,
  assets: [],
  lastUpdated: Date.now(),
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portfolio, setPortfolio] = useState<PortfolioData>(INITIAL_PORTFOLIO);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from Storage
  useEffect(() => {
    const pData = localStorage.getItem(STORAGE_KEY_PORTFOLIO);
    const jData = localStorage.getItem(STORAGE_KEY_JOURNAL);
    
    if (pData) setPortfolio(JSON.parse(pData));
    if (jData) setJournal(JSON.parse(jData));
    setLoaded(true);
  }, []);

  // Save to Storage
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY_PORTFOLIO, JSON.stringify(portfolio));
    localStorage.setItem(STORAGE_KEY_JOURNAL, JSON.stringify(journal));
  }, [portfolio, journal, loaded]);

  const addAsset = (asset: Omit<Asset, 'id' | 'currentPrice' | 'prevClose'>) => {
    const newAsset: Asset = {
      ...asset,
      id: crypto.randomUUID(),
      currentPrice: asset.avgCost, // Init with cost
      prevClose: asset.avgCost,    // Init with cost
    };
    setPortfolio(prev => ({ ...prev, assets: [...prev.assets, newAsset] }));
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    setPortfolio(prev => ({
      ...prev,
      assets: prev.assets.map(a => a.id === id ? { ...a, ...updates } : a)
    }));
  };

  const deleteAsset = (id: string) => {
    setPortfolio(prev => ({
      ...prev,
      assets: prev.assets.filter(a => a.id !== id)
    }));
  };

  const updateCash = (amount: number) => {
    setPortfolio(prev => ({ ...prev, cashUSD: amount }));
  };

  const updateEOD = async () => {
    const symbols = [...new Set(portfolio.assets.map(a => a.symbol))];
    if (symbols.length === 0) {
        setPortfolio(prev => ({ ...prev, lastUpdated: Date.now() }));
        return;
    }

    try {
      // Use Gemini to fetch real market data via Google Search
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `Get the most recent closing price (price) and the closing price of the trading day before that (prevClose) for the following US stocks: ${symbols.join(', ')}.
      
      Return ONLY a raw JSON object (no markdown formatting, no explanation) where the key is the stock symbol (uppercase) and the value is an object with 'price' and 'prevClose'.
      Example:
      {
        "AAPL": { "price": 150.25, "prevClose": 148.50 },
        "NVDA": { "price": 480.00, "prevClose": 475.20 }
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      let text = response.text || '';
      // Clean up markdown if present
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const prices = JSON.parse(text);

      setPortfolio(prev => {
        const updatedAssets = prev.assets.map(asset => {
          const marketData = prices[asset.symbol] || prices[asset.symbol.toUpperCase()];
          
          if (marketData && typeof marketData.price === 'number') {
            return {
              ...asset,
              currentPrice: marketData.price,
              prevClose: marketData.prevClose || asset.currentPrice // Fallback if prevClose missing
            };
          }
          return asset;
        });

        return {
          ...prev,
          assets: updatedAssets,
          lastUpdated: Date.now()
        };
      });

    } catch (error) {
      console.error("Failed to update EOD prices via Gemini:", error);
      // Fallback: If API fails, just update timestamp to prevent infinite retry loops in UI
      // In a real app, show a toast notification here.
    }
  };

  const addJournalEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry = { ...entry, id: crypto.randomUUID() };
    setJournal(prev => [newEntry, ...prev]);
  };

  const resetPortfolio = () => {
      setPortfolio(INITIAL_PORTFOLIO);
      setJournal([]);
  }

  return (
    <StoreContext.Provider value={{ 
      portfolio, 
      journal, 
      addAsset, 
      updateAsset, 
      deleteAsset, 
      updateCash, 
      updateEOD, 
      addJournalEntry,
      resetPortfolio
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};