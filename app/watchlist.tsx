import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react-native';
import { FeedItem, CriticalAlert } from '../types/news';
import CriticalAlerts from '../components/CriticalAlerts';
import SavedArticleCard from '../components/SavedArticleCard';
import TerminalTickerRow from '../components/TerminalTickerRow';
import TimeRangeFilterPill, { TimeRange, CustomTimeRange } from '../components/TimeRangeFilterPill';
import NewsArticleModal from '../components/NewsArticleModal';
import { generateMockData } from '../utils/mockData';
import { useNewsStore } from '../store/newsStore';
import { theme } from '../constants/theme';
import { useScrollReset } from '../utils/useScrollReset';
import UniversalBackButton from '../components/UniversalBackButton';
import WatchlistConfigMenu from '../components/WatchlistConfigMenu';
import CreateWatchlistModal from '../components/CreateWatchlistModal';
import EditWatchlistNameModal from '../components/EditWatchlistNameModal';
import ConfigureTickerOrderModal from '../components/ConfigureTickerOrderModal';
import ManageTickersModal from '../components/ManageTickersModal';
import Toast from '../components/Toast';

interface TickerNewsItem {
  time: string;
  source: string;
  headline: string;
  impact: 'Low' | 'Medium' | 'High';
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  isEarnings?: boolean;
  expectedEps?: number;
  actualEps?: number;
  expectedRev?: number;
  actualRev?: number;
  verdict?: 'Beat' | 'Miss' | 'Inline';
}

interface TickerData {
  ticker: string;
  company: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  todayNews: TickerNewsItem[];
}

const COMPANY_NAMES: Record<string, string> = {
  'AAPL': 'Apple Inc.',
  'NVDA': 'NVIDIA Corp.',
  'TSLA': 'Tesla Inc.',
  'MSFT': 'Microsoft Corp.',
  'GOOGL': 'Alphabet Inc.',
  'META': 'Meta Platforms',
  'AMZN': 'Amazon.com Inc.',
  'JPM': 'JPMorgan Chase',
  'BAC': 'Bank of America',
  'WMT': 'Walmart Inc.',
};

export default function WatchlistScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useScrollReset();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [savedArticlesExpanded, setSavedArticlesExpanded] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('last_hour');
  const [customTimeRange, setCustomTimeRange] = useState<CustomTimeRange | undefined>();
  const [selectedArticle, setSelectedArticle] = useState<FeedItem | CriticalAlert | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { 
    state, 
    criticalAlerts,
    savedArticles,
    unsaveArticle,
    createFolder,
    renameFolder,
    addTickerToFolder,
    removeTickerFromFolder,
  } = useNewsStore();
  
  const watchlistFolders = useMemo(() => state.watchlistFolders || [], [state.watchlistFolders]);
  const [currentFolderId, setCurrentFolderId] = useState<string>('default');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [manageModalVisible, setManageModalVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const currentFolder = useMemo(() => {
    return watchlistFolders.find(f => f.id === currentFolderId) || watchlistFolders[0];
  }, [watchlistFolders, currentFolderId]);
  
  const allTickers = useMemo(() => {
    return currentFolder?.tickers || [];
  }, [currentFolder]);

  useEffect(() => {
    const mockData = generateMockData();
    setFeedItems(mockData.feedItems);
    
    // Mock updates for watchlist stocks
    const interval = setInterval(() => {
      if (allTickers.length === 0) return;
      
      const randomTicker = allTickers[Math.floor(Math.random() * allTickers.length)];
      const headlines = [
        `${randomTicker} announces major product update`,
        `${randomTicker} beats quarterly earnings expectations`,
        `${randomTicker} stock upgraded by major analyst firm`,
        `${randomTicker} CEO makes bullish comments on future growth`,
        `${randomTicker} reports strong user engagement metrics`
      ];
      
      const newNewsItem: FeedItem = {
        id: `live_${Date.now()}`,
        published_at: new Date().toISOString(),
        title: headlines[Math.floor(Math.random() * headlines.length)],
        url: 'https://example.com',
        source: { name: "MarketWatch", type: 'news', reliability: 85, url: 'https://marketwatch.com' },
        tickers: [randomTicker],
        tags: { is_macro: false, fed: false, sec: false, earnings: false, social: false },
        classification: {
          rumor_level: 'Confirmed',
          sentiment: ["Bullish", "Bearish", "Neutral"][Math.floor(Math.random() * 3)] as "Bullish" | "Bearish" | "Neutral",
          confidence: 70 + Math.floor(Math.random() * 25),
          impact: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)] as "Low" | "Medium" | "High",
          summary_15: `Latest update on ${randomTicker} performance and outlook`,
        },
      };
      
      setFeedItems(prev => [newNewsItem, ...prev.slice(0, 199)]);
    }, 18000);

    return () => clearInterval(interval);
  }, [allTickers]);

  const tickerDataMap = useMemo(() => {
    const getWeekStart = (date: Date): Date => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day;
      return new Date(d.getFullYear(), d.getMonth(), diff, 0, 0, 0, 0);
    };

    const isNewsInTimeRange = (publishedAt: string): boolean => {
      const newsTime = new Date(publishedAt);
      const now = new Date();
      
      switch (timeRange) {
        case 'last_hour': {
          const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
          return newsTime >= oneHourAgo;
        }
        case 'today': {
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          return newsTime >= todayStart;
        }
        case 'past_2_days': {
          const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
          return newsTime >= twoDaysAgo;
        }
        case 'past_5_days': {
          const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
          return newsTime >= fiveDaysAgo;
        }
        case 'week_to_date': {
          const weekStart = getWeekStart(now);
          return newsTime >= weekStart;
        }
        case 'custom': {
          if (!customTimeRange) return true;
          
          const currentYear = now.getFullYear();
          const startDateParts = customTimeRange.startDate.split('/');
          const endDateParts = customTimeRange.endDate.split('/');
          
          if (startDateParts.length !== 2 || endDateParts.length !== 2) return true;
          
          const startMonth = parseInt(startDateParts[0]) - 1;
          const startDay = parseInt(startDateParts[1]);
          const endMonth = parseInt(endDateParts[0]) - 1;
          const endDay = parseInt(endDateParts[1]);
          
          const startHour = parseInt(customTimeRange.startHour);
          const startMinute = parseInt(customTimeRange.startMinute);
          const endHour = parseInt(customTimeRange.endHour);
          const endMinute = parseInt(customTimeRange.endMinute);
          
          const rangeStart = new Date(currentYear, startMonth, startDay, startHour, startMinute);
          const rangeEnd = new Date(currentYear, endMonth, endDay, endHour, endMinute);
          
          return newsTime >= rangeStart && newsTime <= rangeEnd;
        }
        default:
          return true;
      }
    };

    const map: Record<string, TickerData> = {};
    
    allTickers.forEach(ticker => {
      const tickerNews = feedItems
        .filter(item => item.tickers?.includes(ticker))
        .filter(item => isNewsInTimeRange(item.published_at))
        .slice(0, 10)
        .map(item => ({
          time: item.published_at,
          source: item.source.name,
          headline: item.title,
          impact: item.classification.impact,
          sentiment: item.classification.sentiment,
          confidence: item.classification.confidence,
          isEarnings: item.tags?.earnings || false,
          ...(item.tags?.earnings && {
            expectedEps: 0.70 + Math.random() * 0.5,
            actualEps: 0.75 + Math.random() * 0.5,
            expectedRev: 30000000000 + Math.random() * 10000000000,
            actualRev: 32000000000 + Math.random() * 10000000000,
            verdict: ['Beat', 'Miss', 'Inline'][Math.floor(Math.random() * 3)] as 'Beat' | 'Miss' | 'Inline',
          }),
        }));
      
      // Calculate overall sentiment for the ticker
      const sentiments = tickerNews.map(news => news.sentiment);
      const bullishCount = sentiments.filter(s => s === 'Bullish').length;
      const bearishCount = sentiments.filter(s => s === 'Bearish').length;
      
      let overallSentiment: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';
      if (bullishCount > bearishCount) overallSentiment = 'Bullish';
      else if (bearishCount > bullishCount) overallSentiment = 'Bearish';
      
      const avgConfidence = tickerNews.length > 0 
        ? Math.round(tickerNews.reduce((sum, news) => sum + news.confidence, 0) / tickerNews.length)
        : 0;
      
      map[ticker] = {
        ticker,
        company: COMPANY_NAMES[ticker] || `${ticker} Corp.`,
        sentiment: overallSentiment,
        confidence: avgConfidence,
        todayNews: tickerNews,
      };
    });
    
    return map;
  }, [feedItems, allTickers, timeRange, customTimeRange]);

  // Filter critical alerts for recent ones (within last 6 hours)
  const recentCriticalAlerts = useMemo(() => {
    return criticalAlerts.filter(alert => {
      const alertTime = new Date(alert.published_at).getTime();
      const sixHoursAgo = Date.now() - (6 * 60 * 60 * 1000);
      return alertTime > sixHoursAgo || !alert.is_released; // Include upcoming alerts
    });
  }, [criticalAlerts]);

  const handleHeadlinePress = (headline: any) => {
    console.log('Headline pressed:', headline.headline);
    
    const article = feedItems.find(item => item.title === headline.headline);
    if (article) {
      setSelectedArticle(article);
      setModalVisible(true);
    }
  };

  const handleTickerPress = (ticker: string) => {
    if (!ticker?.trim() || ticker.length > 20) return;
    const sanitizedTicker = ticker.trim();
    console.log('Ticker pressed:', sanitizedTicker);
  };

  const handleCriticalAlertPress = (alert: CriticalAlert) => {
    console.log('Critical alert pressed:', alert.headline);
    setSelectedArticle(alert);
    setModalVisible(true);
  };

  const handleSavedArticlePress = (article: FeedItem) => {
    console.log('Saved article pressed:', article.title);
    setSelectedArticle(article);
    setModalVisible(true);
  };

  const handleClearAllSavedArticles = () => {
    console.log('Clearing all saved articles');
    savedArticles.forEach(article => unsaveArticle(article.id));
  };

  const handleTimeRangeChange = (range: TimeRange, customRange?: CustomTimeRange) => {
    console.log('Time range changed:', range, customRange);
    setTimeRange(range);
    if (range === 'custom' && customRange) {
      setCustomTimeRange(customRange);
    } else {
      setCustomTimeRange(undefined);
    }
  };

  const handleCreateFolder = (name: string) => {
    createFolder(name);
    console.log('Created folder:', name);
  };

  const handleEditName = (newName: string) => {
    if (currentFolder) {
      renameFolder(currentFolder.id, newName);
      console.log('Renamed folder to:', newName);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleSaveOrder = (newOrder: string[]) => {
    if (currentFolder) {
      newOrder.forEach((ticker, index) => {
        removeTickerFromFolder(currentFolder.id, ticker);
      });
      newOrder.forEach(ticker => {
        addTickerToFolder(currentFolder.id, ticker);
      });
      console.log('Saved new order:', newOrder);
    }
  };

  const handleSaveTickers = (tickers: string[]) => {
    if (!currentFolder) return;
    
    const currentTickers = currentFolder.tickers;
    const tickersToRemove = currentTickers.filter(t => !tickers.includes(t));
    const tickersToAdd = tickers.filter(t => !currentTickers.includes(t));
    
    tickersToRemove.forEach(ticker => {
      removeTickerFromFolder(currentFolder.id, ticker);
    });
    
    tickersToAdd.forEach(ticker => {
      addTickerToFolder(currentFolder.id, ticker);
    });
    
    console.log('Updated tickers:', tickers);
  };





  const headerHeight = Platform.select({ web: 64, default: 56 });

  return (
    <View style={[styles.container, { paddingTop: insets.top + headerHeight }]}>
      <UniversalBackButton />
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Critical Alerts at the top of the scrollable content */}
        <CriticalAlerts 
          alerts={recentCriticalAlerts}
          onAlertPress={handleCriticalAlertPress}
        />
        
        {/* Watchlist Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.divider} />
          <View style={styles.headerRow}>
            <Text nativeID="banner-anchor-point" style={styles.sectionTitle}>
              {currentFolder?.name.toUpperCase() || 'WATCHLIST'}
            </Text>
            <View style={styles.headerControls}>
              <TimeRangeFilterPill
                selectedRange={timeRange}
                customRange={customTimeRange}
                onRangeChange={handleTimeRangeChange}
              />
              <WatchlistConfigMenu
                onCreateFolder={() => setCreateModalVisible(true)}
                onEditName={() => setEditModalVisible(true)}
                onConfigureOrder={() => setOrderModalVisible(true)}
                onManageTickers={() => setManageModalVisible(true)}
              />
            </View>
          </View>
          <View style={styles.divider} />
        </View>
        
        {/* Terminal-style Ticker Rows */}
        {allTickers.length > 0 ? (
          allTickers.map(ticker => {
            const tickerData = tickerDataMap[ticker];
            if (!tickerData) return null;
            
            const hasActiveNews = tickerData.todayNews.length > 0 && 
              tickerData.todayNews.some(news => news.impact === 'High');
            
            const newsHeadlines = tickerData.todayNews.map(news => ({
              time: news.time,
              source: news.source,
              headline: news.headline,
              impact: news.impact,
              sentiment: news.sentiment,
              confidence: news.confidence,
            }));
            
            return (
              <TerminalTickerRow
                key={ticker}
                ticker={ticker}
                company={tickerData.company}
                sentiment={tickerData.sentiment}
                newsCount={tickerData.todayNews.length}
                hasActiveNews={hasActiveNews}
                newsHeadlines={newsHeadlines}
                onPress={() => handleTickerPress(ticker)}
                onHeadlinePress={handleHeadlinePress}
              />
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tickers in watchlist</Text>
            <Text style={styles.emptySubtext}>Add tickers to start tracking</Text>
          </View>
        )}
        
        {/* Saved Articles Section */}
        {savedArticles.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.savedArticlesHeaderContainer}>
              <TouchableOpacity 
                style={styles.savedArticlesHeader}
                onPress={() => setSavedArticlesExpanded(!savedArticlesExpanded)}
                activeOpacity={0.7}
              >
                <View style={styles.savedArticlesTitleRow}>
                  <Text style={styles.sectionTitle}>SAVED ARTICLES</Text>
                  <View style={styles.savedArticlesCounter}>
                    <Text style={styles.savedArticlesCountText}>({savedArticles.length})</Text>
                  </View>
                </View>
                {savedArticlesExpanded ? (
                  <ChevronUp size={16} color={theme.colors.textSecondary} />
                ) : (
                  <ChevronDown size={16} color={theme.colors.textSecondary} />
                )}
              </TouchableOpacity>
              {savedArticlesExpanded && (
                <TouchableOpacity 
                  style={styles.clearAllButton}
                  onPress={handleClearAllSavedArticles}
                  activeOpacity={0.7}
                >
                  <Trash2 size={14} color={theme.colors.textDim} />
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.divider} />
            
            {savedArticlesExpanded && (
              <View style={styles.savedArticlesContent}>
                {savedArticles.map(article => (
                  <TouchableOpacity 
                    key={article.id} 
                    style={styles.savedArticleContainer}
                    onPress={() => handleSavedArticlePress(article)}
                    activeOpacity={0.8}
                  >
                    <SavedArticleCard article={article} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <NewsArticleModal
        visible={modalVisible}
        article={selectedArticle}
        onClose={() => {
          setModalVisible(false);
          setSelectedArticle(null);
        }}
      />

      <CreateWatchlistModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={handleCreateFolder}
      />

      <EditWatchlistNameModal
        visible={editModalVisible}
        currentName={currentFolder?.name || ''}
        onClose={() => setEditModalVisible(false)}
        onSubmit={handleEditName}
        onSuccess={() => showToast('Watchlist name updated successfully')}
      />

      <ConfigureTickerOrderModal
        visible={orderModalVisible}
        tickers={allTickers}
        onClose={() => setOrderModalVisible(false)}
        onSave={handleSaveOrder}
        onSuccess={() => showToast('Order saved')}
      />

      <ManageTickersModal
        visible={manageModalVisible}
        currentTickers={allTickers}
        onClose={() => setManageModalVisible(false)}
        onSave={handleSaveTickers}
        onSuccess={() => showToast('Watchlist updated')}
      />

      <Toast
        visible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 37,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 12,
  },
  sectionHeader: {
    marginBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#000000',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#F5C518',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5C518',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#555A64',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
    marginTop: 8,
  },
  savedArticlesHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000000',
  },
  savedArticlesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  savedArticlesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  savedArticlesCounter: {
    justifyContent: 'center',
  },
  savedArticlesCountText: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearAllText: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '500',
  },
  savedArticlesContent: {
    paddingTop: 8,
  },
  savedArticleContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
});