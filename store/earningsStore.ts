import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { EarningsHistory, EarningsHistoryMap, Quarter, EarningsResult } from '../types/earnings';
import { searchRelevantEarningsNews, parseEarningsFromNews } from '../utils/earningsParser';

const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = localStorage.getItem(key);
        if (!item) return null;
        
        const trimmed = item.trim();
        if (trimmed.length === 0) return null;
        
        try {
          JSON.parse(trimmed);
          return trimmed;
        } catch (parseError) {
          console.warn(`Invalid JSON in localStorage for key ${key}, clearing:`, parseError);
          localStorage.removeItem(key);
          return null;
        }
      }
    } catch (error) {
      console.warn('localStorage access failed:', error);
    }
    return null;
  },
  
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage && value) {
        try {
          const parsed = JSON.parse(value);
          if (parsed !== null && parsed !== undefined) {
            localStorage.setItem(key, value);
          }
        } catch (jsonError) {
          console.warn('Attempted to store invalid JSON, skipping:', jsonError);
        }
      }
    } catch (error) {
      console.warn('localStorage write failed:', error);
    }
  },
};

const STORAGE_KEY = 'earnings_history';

function generateHistoryKey(ticker: string, fiscalYear: number, quarter: Quarter): string {
  return `${ticker}_${fiscalYear}_${quarter}`;
}

export const [EarningsStoreProvider, useEarningsStore] = createContextHook(() => {
  const [historyMap, setHistoryMap] = useState<EarningsHistoryMap>({});
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const data = await storage.getItem(STORAGE_KEY);
        
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            setHistoryMap(parsed);
            console.log(`📊 Loaded ${Object.keys(parsed).length} earnings records from storage`);
          }
        }
      } catch (error) {
        console.error('Failed to load earnings history:', error);
      } finally {
        setIsHydrated(true);
      }
    };
    
    loadPersistedData();
  }, []);

  const persistData = useCallback(async (data: EarningsHistoryMap) => {
    if (!isHydrated) return;
    
    try {
      await storage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist earnings history:', error);
    }
  }, [isHydrated]);

  const saveEarningsRecord = useCallback(async (record: EarningsHistory) => {
    const key = generateHistoryKey(record.ticker, record.fiscalYear, record.quarter);
    
    setHistoryMap(prev => {
      const existing = prev[key];
      
      if (existing && existing.confidence > record.confidence) {
        console.log(`⚠️ Skipping lower confidence record for ${key}`);
        return prev;
      }
      
      const updated = {
        ...prev,
        [key]: {
          ...record,
          updatedAt: new Date().toISOString(),
        },
      };
      
      persistData(updated);
      console.log(`💾 Saved earnings record: ${key} (${record.source}, confidence: ${record.confidence})`);
      
      return updated;
    });
  }, [persistData]);

  const bulkSaveEarnings = useCallback(async (records: EarningsHistory[]) => {
    setHistoryMap(prev => {
      const updated = { ...prev };
      let savedCount = 0;
      
      records.forEach(record => {
        const key = generateHistoryKey(record.ticker, record.fiscalYear, record.quarter);
        const existing = updated[key];
        
        if (!existing || existing.confidence <= record.confidence) {
          updated[key] = {
            ...record,
            updatedAt: new Date().toISOString(),
          };
          savedCount++;
        }
      });
      
      if (savedCount > 0) {
        persistData(updated);
        console.log(`💾 Bulk saved ${savedCount} earnings records`);
      }
      
      return updated;
    });
  }, [persistData]);

  const getEarningsRecord = useCallback((
    ticker: string,
    fiscalYear: number,
    quarter: Quarter
  ): EarningsHistory | null => {
    const key = generateHistoryKey(ticker, fiscalYear, quarter);
    return historyMap[key] || null;
  }, [historyMap]);

  const getTickerHistory = useCallback((
    ticker: string,
    fiscalYear?: number
  ): EarningsHistory[] => {
    return Object.values(historyMap)
      .filter(record => 
        record.ticker === ticker &&
        (fiscalYear === undefined || record.fiscalYear === fiscalYear)
      )
      .sort((a, b) => {
        if (a.fiscalYear !== b.fiscalYear) {
          return b.fiscalYear - a.fiscalYear;
        }
        const quarterOrder = { Q4: 4, Q3: 3, Q2: 2, Q1: 1 };
        return quarterOrder[b.quarter] - quarterOrder[a.quarter];
      });
  }, [historyMap]);

  const clearOldRecords = useCallback(async (yearsToKeep: number = 3) => {
    const cutoffYear = new Date().getFullYear() - yearsToKeep;
    
    setHistoryMap(prev => {
      const filtered = Object.entries(prev)
        .filter(([_, record]) => record.fiscalYear >= cutoffYear)
        .reduce((acc, [key, record]) => {
          acc[key] = record;
          return acc;
        }, {} as EarningsHistoryMap);
      
      const removedCount = Object.keys(prev).length - Object.keys(filtered).length;
      
      if (removedCount > 0) {
        persistData(filtered);
        console.log(`🗑️ Cleared ${removedCount} old earnings records`);
      }
      
      return filtered;
    });
  }, [persistData]);

  const updateEarningsResult = useCallback(async (
    ticker: string,
    fiscalYear: number,
    quarter: Quarter,
    result: EarningsResult,
    confidence: number
  ) => {
    const key = generateHistoryKey(ticker, fiscalYear, quarter);
    
    setHistoryMap(prev => {
      const existing = prev[key];
      
      if (!existing) {
        console.warn(`⚠️ Cannot update result: record not found for ${key}`);
        return prev;
      }
      
      if (existing.confidence > confidence) {
        console.log(`⚠️ Skipping lower confidence update for ${key}`);
        return prev;
      }
      
      const updated = {
        ...prev,
        [key]: {
          ...existing,
          result,
          confidence,
          updatedAt: new Date().toISOString(),
        },
      };
      
      persistData(updated);
      console.log(`✏️ Updated result for ${key}: ${result}`);
      
      return updated;
    });
  }, [persistData]);

  const getTotalRecordCount = useCallback((): number => {
    return Object.keys(historyMap).length;
  }, [historyMap]);

  const clearAllRecords = useCallback(async () => {
    setHistoryMap({});
    await storage.setItem(STORAGE_KEY, JSON.stringify({}));
    console.log('🗑️ Cleared all earnings history records');
  }, []);

  const backfillFromNews = useCallback(async (
    ticker: string,
    fiscalYear: number,
    quarter: Quarter,
    newsItems: any[]
  ): Promise<boolean> => {
    const key = generateHistoryKey(ticker, fiscalYear, quarter);
    const existing = historyMap[key];
    
    if (existing && existing.source !== 'mock' && existing.actualEps !== null) {
      console.log(`⏭️ Priority 1: Using earnings_history for ${key} (source: ${existing.source})`);
      return false;
    }
    
    if (existing && existing.source === 'mock') {
      console.log(`🔄 Priority 2: Found mock data for ${key}, attempting news parse`);
    } else {
      console.log(`🔍 Priority 2: No real data for ${key}, attempting news parse`);
    }
    
    const relevantNews = searchRelevantEarningsNews(newsItems, ticker, fiscalYear, quarter);
    console.log(`📰 Found ${relevantNews.length} relevant earnings news items for ${key}`);
    
    for (const newsItem of relevantNews) {
      try {
        const parsed = parseEarningsFromNews(newsItem);
        
        if (!parsed) {
          continue;
        }
        
        if (parsed.result !== '—' || parsed.actualEps !== null) {
          const newRecord: EarningsHistory = {
            ticker,
            fiscalYear,
            quarter,
            actualEps: parsed.actualEps,
            revenueUsd: parsed.revenueUsd,
            session: parsed.session,
            result: parsed.result,
            source: 'news_parse',
            articleId: newsItem.id,
            confidence: parsed.confidence,
            updatedAt: new Date().toISOString(),
          };
          
          await saveEarningsRecord(newRecord);
          console.log(`✅ Priority 2 Success: Backfilled ${key} from news (article: ${newsItem.id}, result: ${parsed.result}, confidence: ${parsed.confidence})`);
          return true;
        }
      } catch (error) {
        console.warn(`⚠️ Error parsing news item for ${key}:`, error);
      }
    }
    
    console.log(`❌ Priority 2 Failed: No earnings data found in news for ${key} (leaving NA)`);
    return false;
  }, [historyMap, saveEarningsRecord]);

  return useMemo(() => ({
    isHydrated,
    historyMap,
    saveEarningsRecord,
    bulkSaveEarnings,
    getEarningsRecord,
    getTickerHistory,
    clearOldRecords,
    updateEarningsResult,
    getTotalRecordCount,
    clearAllRecords,
    backfillFromNews,
  }), [
    isHydrated,
    historyMap,
    saveEarningsRecord,
    bulkSaveEarnings,
    getEarningsRecord,
    getTickerHistory,
    clearOldRecords,
    updateEarningsResult,
    getTotalRecordCount,
    clearAllRecords,
    backfillFromNews,
  ]);
});
