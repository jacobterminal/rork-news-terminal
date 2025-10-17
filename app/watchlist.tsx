import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MoreVertical } from 'lucide-react-native';
import { FeedItem, CriticalAlert } from '../types/news';
import CriticalAlerts from '../components/CriticalAlerts';
import TerminalTickerRow from '../components/TerminalTickerRow';
import TimeRangeFilterPill, { TimeRange, CustomTimeRange } from '../components/TimeRangeFilterPill';
import NewsArticleModal from '../components/NewsArticleModal';

import WatchlistOptionsSheet from '../components/WatchlistOptionsSheet';
import CreateFolderModal from '../components/CreateFolderModal';
import TickerOrderModal from '../components/TickerOrderModal';
import ManageTickersModal from '../components/ManageTickersModal';
import { generateMockData } from '../utils/mockData';
import { useNewsStore } from '../store/newsStore';
import { useScrollReset } from '../utils/useScrollReset';


interface TickerNewsItem {
  time: string;
  source: string;
  headline: string;
  impact: 'Low' | 'Medium' | 'High';
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
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

const ALL_AVAILABLE_TICKERS = Object.keys(COMPANY_NAMES);

export default function WatchlistScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useScrollReset();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('last_hour');
  const [customTimeRange, setCustomTimeRange] = useState<CustomTimeRange | undefined>();
  const [selectedArticle, setSelectedArticle] = useState<FeedItem | CriticalAlert | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [optionsSheetVisible, setOptionsSheetVisible] = useState(false);
  const [createFolderModalVisible, setCreateFolderModalVisible] = useState(false);
  const [renameFolderModalVisible, setRenameFolderModalVisible] = useState(false);
  const [tickerOrderModalVisible, setTickerOrderModalVisible] = useState(false);
  const [manageTickersModalVisible, setManageTickersModalVisible] = useState(false);

  const { 
    state, 
    criticalAlerts,
    activeFolderId,
    setActiveFolder,
    createFolder,
    deleteFolder,
    renameFolder,
    addTickerToFolder,
    removeTickerFromFolder,
    reorderTickers,
  } = useNewsStore();
  
  const watchlistFolders = useMemo(() => state.watchlistFolders || [], [state.watchlistFolders]);
  
  const activeFolder = useMemo(() => {
    return watchlistFolders.find(f => f.id === activeFolderId) || null;
  }, [watchlistFolders, activeFolderId]);
  
  const activeTickers = useMemo(() => {
    return activeFolder?.tickers || [];
  }, [activeFolder]);

  useEffect(() => {
    const mockData = generateMockData();
    setFeedItems(mockData.feedItems);
    
    const interval = setInterval(() => {
      if (activeTickers.length === 0) return;
      
      const randomTicker = activeTickers[Math.floor(Math.random() * activeTickers.length)];
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
  }, [activeTickers]);

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
    
    activeTickers.forEach(ticker => {
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
        }));
      
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
  }, [feedItems, activeTickers, timeRange, customTimeRange]);

  const recentCriticalAlerts = useMemo(() => {
    return criticalAlerts.filter(alert => {
      const alertTime = new Date(alert.published_at).getTime();
      const sixHoursAgo = Date.now() - (6 * 60 * 60 * 1000);
      return alertTime > sixHoursAgo || !alert.is_released;
    });
  }, [criticalAlerts]);

  const handleHeadlinePress = (headline: any) => {
    const article = feedItems.find(item => item.title === headline.headline);
    if (article) {
      setSelectedArticle(article);
      setModalVisible(true);
    }
  };

  const handleTickerPress = (ticker: string) => {
    if (!ticker?.trim() || ticker.length > 20) return;
    console.log('Ticker pressed:', ticker);
  };

  const handleCriticalAlertPress = (alert: CriticalAlert) => {
    setSelectedArticle(alert);
    setModalVisible(true);
  };

  const handleTimeRangeChange = (range: TimeRange, customRange?: CustomTimeRange) => {
    setTimeRange(range);
    if (range === 'custom' && customRange) {
      setCustomTimeRange(customRange);
    } else {
      setCustomTimeRange(undefined);
    }
  };

  const handleCreateFolder = async (name: string) => {
    await createFolder(name, watchlistFolders.length === 0);
  };

  const handleRenameFolder = async (name: string) => {
    if (activeFolderId) {
      await renameFolder(activeFolderId, name);
    }
  };

  const handleDeleteFolder = () => {
    if (!activeFolderId || !activeFolder) return;

    Alert.alert(
      'Delete Folder',
      `Delete folder "${activeFolder.name}" and remove its tickers from Watchlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteFolder(activeFolderId);
          },
        },
      ]
    );
  };

  const handleSaveTickerOrder = async (newOrder: string[]) => {
    if (activeFolderId) {
      await reorderTickers(activeFolderId, newOrder);
    }
  };

  const handleManageTickers = async (tickers: string[]) => {
    if (!activeFolderId || !activeFolder) return;

    const toAdd = tickers.filter(t => !activeFolder.tickers.includes(t));
    const toRemove = activeFolder.tickers.filter(t => !tickers.includes(t));

    for (const ticker of toRemove) {
      await removeTickerFromFolder(activeFolderId, ticker);
    }

    for (const ticker of toAdd) {
      await addTickerToFolder(activeFolderId, ticker);
    }
  };

  const headerHeight = Platform.select({ web: 64, default: 56 });

  if (watchlistFolders.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + headerHeight }]}>
        <View style={styles.emptyCreateState}>
          <Text style={styles.emptyCreateTitle}>Create a Watchlist Folder</Text>
          <Text style={styles.emptyCreateSubtitle}>
            You need a folder to save and view tickers.
          </Text>
          <TouchableOpacity
            style={styles.emptyCreateButton}
            onPress={() => setCreateFolderModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.emptyCreateButtonText}>Create Folder</Text>
          </TouchableOpacity>
        </View>

        <CreateFolderModal
          visible={createFolderModalVisible}
          mode="create"
          onClose={() => setCreateFolderModalVisible(false)}
          onSubmit={handleCreateFolder}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + headerHeight }]}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <CriticalAlerts 
          alerts={recentCriticalAlerts}
          onAlertPress={handleCriticalAlertPress}
        />
        
        <View style={styles.sectionHeader}>
          <View style={styles.divider} />
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>WATCHLIST</Text>
            <View style={styles.headerRightControls}>
              <TimeRangeFilterPill
                selectedRange={timeRange}
                customRange={customTimeRange}
                onRangeChange={handleTimeRangeChange}
              />
              <TouchableOpacity
                style={styles.optionsButton}
                onPress={() => setOptionsSheetVisible(true)}
                activeOpacity={0.7}
              >
                <MoreVertical size={18} color="#FFD75A" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.divider} />
        </View>
        
        {activeTickers.length > 0 ? (
          activeTickers.map(ticker => {
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
            <Text style={styles.emptyText}>No tickers yet</Text>
            <Text style={styles.emptySubtext}>Add from Search or the Options menu</Text>
          </View>
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

      <WatchlistOptionsSheet
        visible={optionsSheetVisible}
        folderName={activeFolder?.name || ''}
        onClose={() => setOptionsSheetVisible(false)}
        onCreateFolder={() => setCreateFolderModalVisible(true)}
        onRenameFolder={() => setRenameFolderModalVisible(true)}
        onConfigureOrder={() => setTickerOrderModalVisible(true)}
        onManageTickers={() => setManageTickersModalVisible(true)}
        onDeleteFolder={handleDeleteFolder}
      />

      <CreateFolderModal
        visible={createFolderModalVisible}
        mode="create"
        onClose={() => setCreateFolderModalVisible(false)}
        onSubmit={handleCreateFolder}
      />

      <CreateFolderModal
        visible={renameFolderModalVisible}
        mode="rename"
        initialName={activeFolder?.name || ''}
        onClose={() => setRenameFolderModalVisible(false)}
        onSubmit={handleRenameFolder}
      />

      <TickerOrderModal
        visible={tickerOrderModalVisible}
        tickers={activeTickers}
        onClose={() => setTickerOrderModalVisible(false)}
        onSave={handleSaveTickerOrder}
      />

      <ManageTickersModal
        visible={manageTickersModalVisible}
        folderName={activeFolder?.name || ''}
        currentTickers={activeTickers}
        allAvailableTickers={ALL_AVAILABLE_TICKERS}
        onClose={() => setManageTickersModalVisible(false)}
        onSave={handleManageTickers}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  headerRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 12,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#000000',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFD75A',
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  divider: {
    height: 1,
    backgroundColor: '#FFD75A',
    width: '100%',
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
  emptyCreateState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyCreateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFD75A',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyCreateSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  emptyCreateButton: {
    backgroundColor: '#FFD75A',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
  },
  emptyCreateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});
