import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppFilters, AppState, FeedItem, CriticalAlert, WatchlistFolder } from '../types/news';
import { generateMockData } from '../utils/mockData';
import { calculateScore, deduplicateItems } from '../utils/newsUtils';
import { getNotificationPreferences, filterFeedItems, filterCriticalAlerts, ImpactLevel, shouldShowInAppBanner } from '../utils/impactFilter';

// Simple storage implementation for demo
const storage = {
  async clearAll(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        Object.values(STORAGE_KEYS).forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            console.warn(`Failed to clear ${key}:`, error);
          }
        });
        console.log('Cleared all localStorage data');
      }
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  },
  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        let item: string | null = null;
        
        try {
          item = localStorage.getItem(key);
        } catch (getError) {
          console.warn(`Failed to get localStorage item for key ${key}:`, getError);
          return null;
        }
        
        if (!item || typeof item !== 'string') {
          return null;
        }
        
        const trimmed = item.trim();
        if (trimmed.length === 0) {
          return null;
        }
        
        // Check for common corruption patterns
        const firstChar = trimmed[0];
        const validFirstChars = ['{', '[', '"', 't', 'f', 'n', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-'];
        
        if (!validFirstChars.includes(firstChar)) {
          console.warn(`Detected corrupted localStorage data for key ${key} (starts with "${firstChar}"), clearing...`);
          try {
            localStorage.removeItem(key);
          } catch (removeError) {
            console.warn(`Failed to remove corrupted key ${key}:`, removeError);
          }
          return null;
        }
        
        // More robust validation - check if it's valid JSON
        try {
          JSON.parse(trimmed);
          return trimmed;
        } catch (parseError) {
          console.warn(`Invalid JSON in localStorage for key ${key}, clearing corrupted data:`, parseError);
          try {
            localStorage.removeItem(key);
          } catch (removeError) {
            console.warn(`Failed to remove corrupted key ${key}:`, removeError);
          }
          return null;
        }
      }
    } catch (error) {
      console.warn('localStorage access failed:', error);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem(key);
        }
      } catch (clearError) {
        console.warn('Failed to clear corrupted localStorage key:', clearError);
      }
    }
    return null;
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage && value && value !== 'undefined' && value !== 'null') {
        // Validate JSON before storing
        try {
          const parsed = JSON.parse(value); // Test if it's valid JSON
          if (parsed !== null && parsed !== undefined) {
            localStorage.setItem(key, value);
          }
        } catch (jsonError) {
          console.warn('Attempted to store invalid JSON, skipping:', jsonError);
          // Don't store invalid JSON
        }
      }
    } catch (error) {
      console.warn('localStorage write failed:', error);
    }
  },
};

const STORAGE_KEYS = {
  FILTERS: 'news_filters',
  WATCHLIST: 'news_watchlist',
  WATCHLIST_FOLDERS: 'news_watchlist_folders',
  ACTIVE_FOLDER: 'news_active_folder',
  UI_STATE: 'news_ui_state',
  SAVED_ARTICLES: 'news_saved_articles',
};

export const [NewsStoreProvider, useNewsStore] = createContextHook(() => {
  const [state, setState] = useState<AppState>(() => {
    // Initialize with empty state first to prevent hydration mismatch
    return {
      feedItems: [],
      earnings: [],
      econ: [],
      watchlist: ['AAPL', 'NVDA', 'TSLA'],
      watchlistFolders: [
        {
          id: 'default',
          name: 'My Watchlist',
          tickers: ['AAPL', 'NVDA', 'TSLA'],
          isExpanded: true,
        },
      ],
      filters: {
        all: true,
        watchlist: false,
        macro: false,
        earnings: false,
        sec: false,
        social: false,
        tech: false,
        finance: false,
        healthcare: false,
        energy: false,
        consumer: false,
        industrial: false,
      },
      ui: {
        tickerDrawer: {
          open: false,
          ticker: null,
        },
      },
      notifications: [],
      critical_alerts: [],
      savedArticles: [],
    };
  });


  const [isHydrated, setIsHydrated] = useState(false);
  const [wsConnected] = useState(true);
  const [notifications, setNotifications] = useState<FeedItem[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<CriticalAlert[]>([]);
  const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(new Set());
  const [highlightedAlert, setHighlightedAlert] = useState<string | null>(null);
  const [savedArticles, setSavedArticles] = useState<FeedItem[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [impactLevel, setImpactLevel] = useState<ImpactLevel>('MED_HIGH');

  const loadPersistedData = useCallback(async () => {
    if (!isHydrated) return;
    
    try {
      const prefs = await getNotificationPreferences();
      setImpactLevel(prefs.impactLevel || 'MED_HIGH');
      
      const [filtersData, watchlistData, watchlistFoldersData, activeFolderData, uiData, savedArticlesData] = await Promise.allSettled([
        storage.getItem(STORAGE_KEYS.FILTERS),
        storage.getItem(STORAGE_KEYS.WATCHLIST),
        storage.getItem(STORAGE_KEYS.WATCHLIST_FOLDERS),
        storage.getItem(STORAGE_KEYS.ACTIVE_FOLDER),
        storage.getItem(STORAGE_KEYS.UI_STATE),
        storage.getItem(STORAGE_KEYS.SAVED_ARTICLES),
      ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : null));

      setState(prev => {
        let parsedFilters = prev.filters;
        let parsedWatchlist = prev.watchlist;
        let parsedWatchlistFolders = prev.watchlistFolders;
        let parsedUi = prev.ui;
        let parsedSavedArticles: FeedItem[] = [];
        
        if (filtersData && typeof filtersData === 'string' && filtersData.trim().length > 0) {
          try {
            const parsed = JSON.parse(filtersData);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              parsedFilters = { ...prev.filters, ...parsed };
            }
          } catch (error) {
            console.warn('Failed to parse filters data, using defaults:', error);
          }
        }
        
        if (watchlistData && typeof watchlistData === 'string' && watchlistData.trim().length > 0) {
          try {
            const parsed = JSON.parse(watchlistData);
            if (Array.isArray(parsed)) {
              parsedWatchlist = parsed.filter(item => typeof item === 'string');
            }
          } catch (error) {
            console.warn('Failed to parse watchlist data, using defaults:', error);
          }
        }
        
        if (watchlistFoldersData && typeof watchlistFoldersData === 'string' && watchlistFoldersData.trim().length > 0) {
          try {
            const parsed = JSON.parse(watchlistFoldersData);
            if (Array.isArray(parsed)) {
              parsedWatchlistFolders = parsed.filter(folder => 
                folder && typeof folder === 'object' && 
                typeof folder.id === 'string' && 
                typeof folder.name === 'string' && 
                Array.isArray(folder.tickers)
              );
            }
          } catch (error) {
            console.warn('Failed to parse watchlist folders data, using defaults:', error);
          }
        }
        
        if (uiData && typeof uiData === 'string' && uiData.trim().length > 0) {
          try {
            const parsed = JSON.parse(uiData);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              parsedUi = { ...prev.ui, ...parsed };
            }
          } catch (error) {
            console.warn('Failed to parse UI data, using defaults:', error);
          }
        }
        
        if (savedArticlesData && typeof savedArticlesData === 'string' && savedArticlesData.trim().length > 0) {
          try {
            const parsed = JSON.parse(savedArticlesData);
            if (Array.isArray(parsed)) {
              parsedSavedArticles = parsed.filter(article => 
                article && typeof article === 'object' && 
                typeof article.id === 'string' && 
                typeof article.title === 'string'
              );
            }
          } catch (error) {
            console.warn('Failed to parse saved articles data, using defaults:', error);
          }
        }
        
        setSavedArticles(parsedSavedArticles);
        
        if (activeFolderData && typeof activeFolderData === 'string' && activeFolderData.trim().length > 0) {
          try {
            const parsed = JSON.parse(activeFolderData);
            if (typeof parsed === 'string') {
              setActiveFolderId(parsed);
            } else if (parsedWatchlistFolders.length > 0) {
              setActiveFolderId(parsedWatchlistFolders[0].id);
            }
          } catch (error) {
            console.warn('Failed to parse active folder data:', error);
            if (parsedWatchlistFolders.length > 0) {
              setActiveFolderId(parsedWatchlistFolders[0].id);
            }
          }
        } else if (parsedWatchlistFolders.length > 0) {
          setActiveFolderId(parsedWatchlistFolders[0].id);
        }
        
        return {
          ...prev,
          filters: parsedFilters,
          watchlist: parsedWatchlist,
          watchlistFolders: parsedWatchlistFolders,
          ui: parsedUi,
        };
      });
    } catch (error) {
      console.error('Failed to load persisted data:', error);
    }
  }, [isHydrated]);

  // Handle hydration and load initial data
  useEffect(() => {
    // Set hydrated immediately to prevent timeout
    setIsHydrated(true);
    
    // Load data asynchronously without blocking
    const initializeData = () => {
      try {
        const mockData = generateMockData();
        
        if (mockData && typeof mockData === 'object') {
          setState(prev => ({
            ...prev,
            feedItems: Array.isArray(mockData.feedItems) ? mockData.feedItems : [],
            earnings: Array.isArray(mockData.earnings) ? mockData.earnings : [],
            econ: Array.isArray(mockData.econ) ? mockData.econ : [],
          }));
          
          if (Array.isArray(mockData.critical_alerts)) {
            setCriticalAlerts(mockData.critical_alerts);
          }
        }
      } catch (error) {
        console.error('Failed to load mock data:', error);
      }
    };
    
    // Initialize immediately
    initializeData();
  }, []);

  // Load persisted data after hydration
  useEffect(() => {
    loadPersistedData();
  }, [loadPersistedData]);

  const injectRandomNewsItem = useCallback(() => {
    try {
      const mockData = generateMockData();
      if (!mockData || !mockData.feedItems || !Array.isArray(mockData.feedItems)) {
        console.warn('Invalid mock data structure');
        return;
      }
      
      const mockItems = mockData.feedItems;
      if (mockItems.length === 0) return;
      
      // Use deterministic selection based on current time to avoid randomness
      const itemIndex = Math.floor(Date.now() / 10000) % mockItems.length;
      const selectedItem = mockItems[itemIndex];
      
      if (!selectedItem || typeof selectedItem !== 'object') {
        console.warn('Invalid selected item');
        return;
      }
      
      const newItem = {
        ...selectedItem,
        id: `live_${Date.now()}`,
        published_at: new Date().toISOString(),
        title: `[LIVE] ${selectedItem.title || 'Untitled'}`, // Mark as live update
      };

      setState(prev => {
        try {
          const currentItems = Array.isArray(prev.feedItems) ? prev.feedItems : [];
          const updatedItems = [newItem, ...currentItems];
          const scoredItems = updatedItems
            .filter(item => item && typeof item === 'object' && item.title)
            .map(feedItem => {
              try {
                return {
                  ...feedItem,
                  score: calculateScore(feedItem, Array.isArray(prev.watchlist) ? prev.watchlist : []),
                };
              } catch (scoreError) {
                console.warn('Error calculating score for item:', scoreError);
                return { ...feedItem, score: 0 };
              }
            });
          
          const deduped = deduplicateItems(scoredItems);
          const top200 = deduped.slice(0, 200);

          console.log('📰 New item injected:', (newItem.title || 'Untitled').slice(0, 50) + '...');
          
          // Add to notifications with in-app banner filter
          const shouldShow = async () => {
            return await shouldShowInAppBanner(newItem, Array.isArray(prev.watchlist) ? prev.watchlist : []);
          };
          
          shouldShow().then(canShow => {
            if (canShow) {
              setNotifications(prevNotifications => {
                const updated = [newItem, ...prevNotifications].slice(0, 5);
                return updated;
              });
            }
          }).catch(err => {
            console.error('[NewsStore] Error checking banner filter:', err);
          });
          
          // Create critical alert for high impact items (independent of banner filter)
          const isHighImpact = newItem.classification?.impact === 'High';
          if (isHighImpact) {
              const criticalAlert: CriticalAlert = {
                id: `critical_${newItem.id}`,
                type: newItem.tags?.fed ? 'fed' : newItem.tags?.earnings ? 'earnings' : 'cpi',
                headline: newItem.title,
                source: newItem.source.name,
                tickers: newItem.tickers || [],
                impact: newItem.classification.impact,
                sentiment: newItem.classification.sentiment,
                confidence: newItem.classification.confidence,
                published_at: newItem.published_at,
                is_released: true,
              };
              
              setCriticalAlerts(prev => [criticalAlert, ...prev].slice(0, 10));
            }
          
          return {
            ...prev,
            feedItems: top200,
          };
        } catch (stateError) {
          console.error('Error updating state with new item:', stateError);
          return prev;
        }
      });
    } catch (error) {
      console.error('Failed to inject random news item:', error);
    }
  }, []);

  // WebSocket simulation - only start after hydration with delay
  useEffect(() => {
    if (!isHydrated) return;
    
    let initialDelay: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;
    
    // Add initial delay before starting WebSocket simulation
    initialDelay = setTimeout(() => {
      interval = setInterval(() => {
        if (wsConnected && typeof injectRandomNewsItem === 'function') {
          try {
            injectRandomNewsItem();
          } catch (error) {
            console.error('Error injecting news item:', error);
          }
        }
      }, 15000); // Increased to 15s interval to reduce load
    }, 10000); // Wait 10 seconds after hydration

    return () => {
      if (initialDelay) clearTimeout(initialDelay);
      if (interval) clearInterval(interval);
    };
  }, [wsConnected, isHydrated, injectRandomNewsItem]);

  const setFilters = useCallback(async (newFilters: Partial<AppFilters>) => {
    const updatedFilters = { ...state.filters, ...newFilters };
    setState(prev => ({ ...prev, filters: updatedFilters }));
    
    if (isHydrated) {
      try {
        const filtersString = JSON.stringify(updatedFilters);
        if (filtersString && filtersString !== 'undefined' && filtersString !== 'null' && filtersString.length > 0) {
          await storage.setItem(STORAGE_KEYS.FILTERS, filtersString);
        }
      } catch (error) {
        console.error('Failed to persist filters:', error);
        // Clear potentially corrupted data
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem(STORAGE_KEYS.FILTERS);
          }
        } catch (clearError) {
          console.warn('Failed to clear corrupted filters:', clearError);
        }
      }
    }
  }, [state.filters, isHydrated]);

  const openTicker = useCallback((ticker: string) => {
    setState(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        tickerDrawer: {
          open: true,
          ticker,
        },
      },
    }));
  }, []);

  const closeTicker = useCallback(() => {
    setState(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        tickerDrawer: {
          open: false,
          ticker: null,
        },
      },
    }));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const handleNotificationPress = useCallback((item: FeedItem) => {
    // Open ticker drawer if the item has tickers
    if (item.tickers && item.tickers.length > 0) {
      openTicker(item.tickers[0]);
    }
    // Dismiss the notification
    dismissNotification(item.id);
  }, [openTicker, dismissNotification]);
  
  const dismissBanner = useCallback((alertId: string) => {
    setDismissedBanners(prev => new Set([...prev, alertId]));
  }, []);
  
  const getActiveBanners = useCallback(() => {
    return criticalAlerts.filter(alert => !dismissedBanners.has(alert.id));
  }, [criticalAlerts, dismissedBanners]);
  
  const clearHighlightedAlert = useCallback(() => {
    setHighlightedAlert(null);
  }, []);

  // Folder management functions
  const setActiveFolder = useCallback(async (folderId: string) => {
    setActiveFolderId(folderId);
    
    if (isHydrated) {
      try {
        await storage.setItem(STORAGE_KEYS.ACTIVE_FOLDER, JSON.stringify(folderId));
      } catch (error) {
        console.error('Failed to persist active folder:', error);
      }
    }
  }, [isHydrated]);

  const createFolder = useCallback(async (name: string, setAsActive: boolean = false): Promise<string> => {
    const newFolder: WatchlistFolder = {
      id: `folder_${Date.now()}`,
      name: name.trim(),
      tickers: [],
      isExpanded: true,
    };
    
    setState(prev => ({
      ...prev,
      watchlistFolders: [...prev.watchlistFolders, newFolder],
    }));
    
    if (setAsActive) {
      setActiveFolderId(newFolder.id);
    }
    
    if (isHydrated) {
      try {
        const updatedFolders = [...state.watchlistFolders, newFolder];
        await storage.setItem(STORAGE_KEYS.WATCHLIST_FOLDERS, JSON.stringify(updatedFolders));
        
        if (setAsActive) {
          await storage.setItem(STORAGE_KEYS.ACTIVE_FOLDER, JSON.stringify(newFolder.id));
        }
      } catch (error) {
        console.error('Failed to persist new folder:', error);
      }
    }
    
    return newFolder.id;
  }, [state.watchlistFolders, isHydrated]);

  const deleteFolder = useCallback(async (folderId: string) => {
    const updatedFolders = state.watchlistFolders.filter(folder => folder.id !== folderId);
    
    setState(prev => ({
      ...prev,
      watchlistFolders: updatedFolders,
    }));
    
    if (activeFolderId === folderId) {
      const newActiveId = updatedFolders.length > 0 ? updatedFolders[0].id : null;
      setActiveFolderId(newActiveId);
      
      if (isHydrated && newActiveId) {
        try {
          await storage.setItem(STORAGE_KEYS.ACTIVE_FOLDER, JSON.stringify(newActiveId));
        } catch (error) {
          console.error('Failed to persist new active folder:', error);
        }
      }
    }
    
    if (isHydrated) {
      try {
        await storage.setItem(STORAGE_KEYS.WATCHLIST_FOLDERS, JSON.stringify(updatedFolders));
      } catch (error) {
        console.error('Failed to persist folder deletion:', error);
      }
    }
  }, [state.watchlistFolders, activeFolderId, isHydrated]);

  const renameFolder = useCallback(async (folderId: string, newName: string) => {
    setState(prev => ({
      ...prev,
      watchlistFolders: prev.watchlistFolders.map(folder => 
        folder.id === folderId ? { ...folder, name: newName.trim() } : folder
      ),
    }));
    
    if (isHydrated) {
      try {
        const updatedFolders = state.watchlistFolders.map(folder => 
          folder.id === folderId ? { ...folder, name: newName.trim() } : folder
        );
        await storage.setItem(STORAGE_KEYS.WATCHLIST_FOLDERS, JSON.stringify(updatedFolders));
      } catch (error) {
        console.error('Failed to persist folder rename:', error);
      }
    }
  }, [state.watchlistFolders, isHydrated]);

  const toggleFolderExpansion = useCallback(async (folderId: string) => {
    setState(prev => ({
      ...prev,
      watchlistFolders: prev.watchlistFolders.map(folder => 
        folder.id === folderId ? { ...folder, isExpanded: !folder.isExpanded } : folder
      ),
    }));
    
    if (isHydrated) {
      try {
        const updatedFolders = state.watchlistFolders.map(folder => 
          folder.id === folderId ? { ...folder, isExpanded: !folder.isExpanded } : folder
        );
        await storage.setItem(STORAGE_KEYS.WATCHLIST_FOLDERS, JSON.stringify(updatedFolders));
      } catch (error) {
        console.error('Failed to persist folder expansion:', error);
      }
    }
  }, [state.watchlistFolders, isHydrated]);

  const addTickerToFolder = useCallback(async (folderId: string, ticker: string): Promise<boolean> => {
    const folder = state.watchlistFolders.find(f => f.id === folderId);
    if (!folder || folder.tickers.includes(ticker)) {
      return false;
    }
    
    setState(prev => ({
      ...prev,
      watchlistFolders: prev.watchlistFolders.map(folder => 
        folder.id === folderId
          ? { ...folder, tickers: [...folder.tickers, ticker] }
          : folder
      ),
    }));
    
    if (isHydrated) {
      try {
        const updatedFolders = state.watchlistFolders.map(folder => 
          folder.id === folderId
            ? { ...folder, tickers: [...folder.tickers, ticker] }
            : folder
        );
        await storage.setItem(STORAGE_KEYS.WATCHLIST_FOLDERS, JSON.stringify(updatedFolders));
      } catch (error) {
        console.error('Failed to persist ticker addition:', error);
      }
    }
    
    return true;
  }, [state.watchlistFolders, isHydrated]);

  const removeTickerFromFolder = useCallback(async (folderId: string, ticker: string) => {
    setState(prev => ({
      ...prev,
      watchlistFolders: prev.watchlistFolders.map(folder => 
        folder.id === folderId
          ? { ...folder, tickers: folder.tickers.filter(t => t !== ticker) }
          : folder
      ),
    }));
    
    if (isHydrated) {
      try {
        const updatedFolders = state.watchlistFolders.map(folder => 
          folder.id === folderId
            ? { ...folder, tickers: folder.tickers.filter(t => t !== ticker) }
            : folder
        );
        await storage.setItem(STORAGE_KEYS.WATCHLIST_FOLDERS, JSON.stringify(updatedFolders));
      } catch (error) {
        console.error('Failed to persist ticker removal:', error);
      }
    }
  }, [state.watchlistFolders, isHydrated]);

  const reorderTickers = useCallback(async (folderId: string, newOrder: string[]) => {
    setState(prev => ({
      ...prev,
      watchlistFolders: prev.watchlistFolders.map(folder => 
        folder.id === folderId
          ? { ...folder, tickers: newOrder }
          : folder
      ),
    }));
    
    if (isHydrated) {
      try {
        const updatedFolders = state.watchlistFolders.map(folder => 
          folder.id === folderId
            ? { ...folder, tickers: newOrder }
            : folder
        );
        await storage.setItem(STORAGE_KEYS.WATCHLIST_FOLDERS, JSON.stringify(updatedFolders));
      } catch (error) {
        console.error('Failed to persist ticker reorder:', error);
      }
    }
  }, [state.watchlistFolders, isHydrated]);

  // Saved articles management
  const saveArticle = useCallback(async (article: FeedItem) => {
    const isAlreadySaved = savedArticles.some(saved => saved.id === article.id);
    if (isAlreadySaved) return;
    
    const updatedSavedArticles = [article, ...savedArticles];
    setSavedArticles(updatedSavedArticles);
    
    if (isHydrated) {
      try {
        await storage.setItem(STORAGE_KEYS.SAVED_ARTICLES, JSON.stringify(updatedSavedArticles));
      } catch (error) {
        console.error('Failed to persist saved article:', error);
      }
    }
  }, [savedArticles, isHydrated]);

  const unsaveArticle = useCallback(async (articleId: string) => {
    const updatedSavedArticles = savedArticles.filter(article => article.id !== articleId);
    setSavedArticles(updatedSavedArticles);
    
    if (isHydrated) {
      try {
        await storage.setItem(STORAGE_KEYS.SAVED_ARTICLES, JSON.stringify(updatedSavedArticles));
      } catch (error) {
        console.error('Failed to persist unsaved article:', error);
      }
    }
  }, [savedArticles, isHydrated]);

  const isArticleSaved = useCallback((articleId: string) => {
    return savedArticles.some(article => article.id === articleId);
  }, [savedArticles]);



  const getTickerHeadlines = useCallback((ticker: string) => {
    if (!ticker || !state.feedItems || !Array.isArray(state.feedItems)) {
      return [];
    }
    
    return state.feedItems
      .filter(item => item && (item.tickers || []).some(t => t === ticker))
      .slice(0, 5);
  }, [state.feedItems]);

  // Sector mapping for tickers - memoized to prevent re-creation
  const sectorMapping = useMemo((): Record<string, string> => ({
    // Tech
    'AAPL': 'tech', 'MSFT': 'tech', 'GOOGL': 'tech', 'GOOG': 'tech', 'AMZN': 'tech',
    'TSLA': 'tech', 'NVDA': 'tech', 'META': 'tech', 'NFLX': 'tech', 'CRM': 'tech',
    'ORCL': 'tech', 'ADBE': 'tech', 'INTC': 'tech', 'AMD': 'tech', 'PYPL': 'tech',
    // Finance
    'JPM': 'finance', 'BAC': 'finance', 'WFC': 'finance', 'GS': 'finance', 'MS': 'finance',
    'C': 'finance', 'USB': 'finance', 'PNC': 'finance', 'TFC': 'finance', 'COF': 'finance',
    'AXP': 'finance', 'BLK': 'finance', 'SCHW': 'finance', 'CB': 'finance', 'MMC': 'finance',
    // Healthcare
    'JNJ': 'healthcare', 'UNH': 'healthcare', 'PFE': 'healthcare', 'ABBV': 'healthcare', 'TMO': 'healthcare',
    'ABT': 'healthcare', 'LLY': 'healthcare', 'BMY': 'healthcare', 'AMGN': 'healthcare', 'GILD': 'healthcare',
    'CVS': 'healthcare', 'ANTM': 'healthcare', 'CI': 'healthcare', 'HUM': 'healthcare', 'CNC': 'healthcare',
    // Energy
    'XOM': 'energy', 'CVX': 'energy', 'COP': 'energy', 'EOG': 'energy', 'SLB': 'energy',
    'PSX': 'energy', 'VLO': 'energy', 'MPC': 'energy', 'OXY': 'energy', 'HAL': 'energy',
    'BKR': 'energy', 'DVN': 'energy', 'FANG': 'energy', 'APA': 'energy', 'MRO': 'energy',
    // Consumer
    'WMT': 'consumer', 'PG': 'consumer', 'KO': 'consumer', 'PEP': 'consumer', 'COST': 'consumer',
    'HD': 'consumer', 'MCD': 'consumer', 'NKE': 'consumer', 'SBUX': 'consumer', 'TGT': 'consumer',
    'LOW': 'consumer', 'TJX': 'consumer', 'DG': 'consumer', 'DLTR': 'consumer', 'KR': 'consumer',
    // Industrial
    'BA': 'industrial', 'CAT': 'industrial', 'GE': 'industrial', 'MMM': 'industrial', 'HON': 'industrial',
    'UPS': 'industrial', 'RTX': 'industrial', 'LMT': 'industrial', 'DE': 'industrial', 'FDX': 'industrial',
    'NOC': 'industrial', 'GD': 'industrial', 'LHX': 'industrial', 'TXT': 'industrial', 'ITW': 'industrial',
  }), []);

  const getTickerSector = useCallback((ticker: string): string | null => {
    return sectorMapping[ticker] || null;
  }, [sectorMapping]);

  const getFilteredItems = useCallback(() => {
    const { filters, feedItems, watchlist } = state;
    
    if (!feedItems || !Array.isArray(feedItems)) {
      return [];
    }
    
    let filtered = feedItems;
    
    filtered = filterFeedItems(filtered, impactLevel);
    
    if (filters.all) return filtered;
    
    return filtered.filter(item => {
      if (!item) return false;
      
      // Traditional filters
      if (filters.watchlist && !(item.tickers || []).some(ticker => (watchlist || []).includes(ticker))) return false;
      if (filters.macro && !item.tags?.is_macro) return false;
      if (filters.earnings && !item.tags?.earnings) return false;
      if (filters.sec && !item.tags?.sec) return false;
      if (filters.social && !item.tags?.social) return false;
      
      // Sector filters
      const sectorFilters = ['tech', 'finance', 'healthcare', 'energy', 'consumer', 'industrial'] as const;
      const activeSectorFilters = sectorFilters.filter(sector => filters[sector]);
      
      if (activeSectorFilters.length > 0) {
        const itemSectors = (item.tickers || []).map(ticker => getTickerSector(ticker)).filter(Boolean);
        if (!activeSectorFilters.some(sector => itemSectors.includes(sector))) {
          return false;
        }
      }
      
      return true;
    });
  }, [state, getTickerSector, impactLevel]);

  // Dev controls
  const injectTestItem = useCallback((type: 'fed' | 'earnings') => {
    const timestamp = new Date().toISOString();
    const testItems = {
      fed: {
        id: `test_fed_${Date.now()}`,
        published_at: timestamp,
        title: '[TEST] Fed Chair Powell Signals Potential Rate Cut in December Meeting',
        url: 'https://example.com',
        source: { name: 'Reuters', type: 'news' as const, reliability: 95, url: 'https://reuters.com' },
        tickers: ['SPY', 'QQQ'],
        tags: { is_macro: true, fed: true, sec: false, earnings: false, social: false },
        classification: {
          rumor_level: 'Confirmed' as const,
          sentiment: 'Bullish' as const,
          confidence: 85,
          impact: 'High' as const,
          summary_15: 'Powell hints at December rate cut amid cooling inflation data',
        },
      },
      earnings: {
        id: `test_earnings_${Date.now()}`,
        published_at: timestamp,
        title: '[TEST] NVDA Reports Q3 Earnings Beat: $0.75 vs $0.70 Expected',
        url: 'https://example.com',
        source: { name: 'Bloomberg', type: 'earnings' as const, reliability: 98, url: 'https://bloomberg.com' },
        tickers: ['NVDA'],
        tags: { is_macro: false, fed: false, sec: false, earnings: true, social: false },
        classification: {
          rumor_level: 'Confirmed' as const,
          sentiment: 'Bullish' as const,
          confidence: 95,
          impact: 'High' as const,
          summary_15: 'NVIDIA crushes Q3 expectations with strong datacenter growth',
        },
      },
    };

    const testItem = testItems[type];
    setState(prev => ({
      ...prev,
      feedItems: [testItem, ...prev.feedItems],
    }));
    
    // Create critical alert for test items
    const criticalAlert: CriticalAlert = {
      id: `critical_${testItem.id}`,
      type: type === 'fed' ? 'fed' : 'earnings',
      headline: testItem.title,
      source: testItem.source.name,
      tickers: testItem.tickers || [],
      impact: testItem.classification.impact,
      sentiment: testItem.classification.sentiment,
      confidence: testItem.classification.confidence,
      published_at: testItem.published_at,
      is_released: true,
      ...(type === 'earnings' && {
        expected_eps: 0.70,
        actual_eps: 0.75,
        expected_rev: 32000000000,
        actual_rev: 35000000000,
        verdict: 'Beat',
      }),
      ...(type === 'fed' && {
        forecast: '5.25%',
        previous: '5.50%',
        actual: '5.00%',
        verdict: 'Dovish vs Forecast',
      }),
    };
    
    setCriticalAlerts(prev => [criticalAlert, ...prev].slice(0, 10));
  }, []);

  const updateImpactLevel = useCallback(async (newLevel: ImpactLevel) => {
    setImpactLevel(newLevel);
    console.log('[NewsStore] Impact level updated to:', newLevel);
  }, []);

  const getFilteredCriticalAlerts = useCallback(() => {
    return filterCriticalAlerts(criticalAlerts);
  }, [criticalAlerts]);

  return useMemo(() => ({
    state,
    isHydrated,
    wsConnected,
    notifications,
    criticalAlerts: getFilteredCriticalAlerts(),
    highlightedAlert,
    savedArticles,
    activeFolderId,
    impactLevel,
    updateImpactLevel,
    setFilters,
    openTicker,
    closeTicker,
    getTickerHeadlines,
    getFilteredItems,
    injectTestItem,
    getTickerSector,
    dismissNotification,
    handleNotificationPress,
    dismissBanner,
    getActiveBanners,
    setHighlightedAlert,
    clearHighlightedAlert,
    setActiveFolder,
    createFolder,
    deleteFolder,
    renameFolder,
    toggleFolderExpansion,
    addTickerToFolder,
    removeTickerFromFolder,
    reorderTickers,
    saveArticle,
    unsaveArticle,
    isArticleSaved,
  }), [state, isHydrated, wsConnected, notifications, criticalAlerts, highlightedAlert, savedArticles, activeFolderId, impactLevel, updateImpactLevel, setFilters, openTicker, closeTicker, getTickerHeadlines, getFilteredItems, injectTestItem, getTickerSector, dismissNotification, handleNotificationPress, dismissBanner, getActiveBanners, setHighlightedAlert, clearHighlightedAlert, setActiveFolder, createFolder, deleteFolder, renameFolder, toggleFolderExpansion, addTickerToFolder, removeTickerFromFolder, reorderTickers, saveArticle, unsaveArticle, isArticleSaved, getFilteredCriticalAlerts]);
});