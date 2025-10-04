import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { FeedItem, CriticalAlert } from '../types/news';
import AlertSearchBar from '../components/AlertSearchBar';
import CriticalAlerts from '../components/CriticalAlerts';
import SavedArticleCard from '../components/SavedArticleCard';
import TerminalTickerRow from '../components/TerminalTickerRow';
import TimeRangeFilterPill, { TimeRange, CustomTimeRange } from '../components/TimeRangeFilterPill';
import { generateMockData } from '../utils/mockData';
import { useNewsStore } from '../store/newsStore';
import { theme } from '../constants/theme';
import { useScrollReset } from '../utils/useScrollReset';

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
  const { 
    state, 
    criticalAlerts,
    savedArticles,
  } = useNewsStore();
  
  const watchlistFolders = useMemo(() => state.watchlistFolders || [], [state.watchlistFolders]);
  const allTickers = useMemo(() => {
    const tickers = new Set<string>();
    watchlistFolders.forEach(folder => {
      folder.tickers.forEach(ticker => tickers.add(ticker));
    });
    return Array.from(tickers);
  }, [watchlistFolders]);

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
  };

  const handleTickerPress = (ticker: string) => {
    if (!ticker?.trim() || ticker.length > 20) return;
    const sanitizedTicker = ticker.trim();
    console.log('Ticker pressed:', sanitizedTicker);
  };

  const handleCriticalAlertPress = (alert: CriticalAlert) => {
    console.log('Critical alert pressed:', alert.headline);
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





  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Reserved space for drop banners and search */}
      <View style={styles.reservedSpace}>
        <AlertSearchBar 
          onTickerPress={handleTickerPress}
          feedItems={feedItems}
        />
      </View>
      
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
            <Text nativeID="banner-anchor-point" style={styles.sectionTitle}>WATCHLIST</Text>
            <TimeRangeFilterPill
              selectedRange={timeRange}
              customRange={customTimeRange}
              onRangeChange={handleTimeRangeChange}
            />
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
            <TouchableOpacity 
              style={styles.savedArticlesHeader}
              onPress={() => setSavedArticlesExpanded(!savedArticlesExpanded)}
            >
              <View style={styles.savedArticlesTitleRow}>
                <Text style={styles.sectionTitle}>SAVED ARTICLES</Text>
                <View style={styles.savedArticlesCounter}>
                  <Text style={styles.savedArticlesCountText}>{savedArticles.length}</Text>
                </View>
              </View>
              {savedArticlesExpanded ? (
                <ChevronUp size={16} color={theme.colors.textSecondary} />
              ) : (
                <ChevronDown size={16} color={theme.colors.textSecondary} />
              )}
            </TouchableOpacity>
            <View style={styles.divider} />
            
            {savedArticlesExpanded && (
              <>
                {savedArticles.map(article => (
                  <View key={article.id} style={styles.savedArticleContainer}>
                    <SavedArticleCard article={article} />
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  reservedSpace: {
    height: 50,
    backgroundColor: '#000000',
    justifyContent: 'center',
    paddingHorizontal: 16,
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
  savedArticleContainer: {
    marginHorizontal: 16,
  },
  savedArticlesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  savedArticlesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savedArticlesCounter: {
    backgroundColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  savedArticlesCountText: {
    color: '#E6E6E6',
    fontSize: 10,
    fontWeight: '600',
  },
});