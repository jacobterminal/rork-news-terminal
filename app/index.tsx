import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { CriticalAlert, FeedItem } from '../types/news';
import NewsCard from '../components/NewsCard';
import TickerDrawer from '../components/TickerDrawer';
import { useNewsStore } from '../store/newsStore';
import { useScrollReset } from '../utils/useScrollReset';
import CriticalAlerts from '../components/CriticalAlerts';
import AlertSearchBar from '../components/AlertSearchBar';
import TimeRangeFilterPill, { TimeRange, CustomTimeRange } from '../components/TimeRangeFilterPill';
import NewsArticleModal from '../components/NewsArticleModal';

export default function NewsScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useScrollReset();
  const { state, criticalAlerts, openTicker, closeTicker, getTickerHeadlines } = useNewsStore();
  const { watchlist, feedItems, ui } = state;
  const [timeRange, setTimeRange] = useState<TimeRange>('last_hour');
  const [customTimeRange, setCustomTimeRange] = useState<CustomTimeRange | undefined>();
  const [selectedArticle, setSelectedArticle] = useState<FeedItem | CriticalAlert | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Filter feed items to only show news for tickers in watchlist
  const watchlistFeedItems = useMemo(() => {
    if (!watchlist || watchlist.length === 0) {
      return [];
    }
    
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
          
          const convertTo24Hour = (hour: string, period: 'AM' | 'PM'): number => {
            let h = parseInt(hour);
            if (period === 'AM') {
              if (h === 12) return 0;
              return h;
            } else {
              if (h === 12) return 12;
              return h + 12;
            }
          };
          
          const startHour = convertTo24Hour(customTimeRange.startHour, customTimeRange.startPeriod);
          const startMinute = parseInt(customTimeRange.startMinute);
          const endHour = convertTo24Hour(customTimeRange.endHour, customTimeRange.endPeriod);
          const endMinute = parseInt(customTimeRange.endMinute);
          
          const rangeStart = new Date(currentYear, startMonth, startDay, startHour, startMinute);
          const rangeEnd = new Date(currentYear, endMonth, endDay, endHour, endMinute);
          
          return newsTime >= rangeStart && newsTime <= rangeEnd;
        }
        default:
          return true;
      }
    };
    
    return feedItems
      .filter(item => {
        // Check if any of the item's tickers are in the watchlist
        return item.tickers && item.tickers.some(ticker => {
          if (!ticker || !ticker.trim() || ticker.length > 10) return false;
          const sanitizedTicker = ticker.trim();
          return watchlist.includes(sanitizedTicker);
        });
      })
      .filter(item => isNewsInTimeRange(item.published_at))
      .sort((a, b) => {
        // Sort by published_at DESC (most recent first)
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      });
  }, [feedItems, watchlist, timeRange, customTimeRange]);

  const handleTickerPress = (ticker: string) => {
    if (!ticker || !ticker.trim() || ticker.length > 10) return;
    const sanitizedTicker = ticker.trim().toUpperCase();
    openTicker(sanitizedTicker);
  };

  const handleCloseDrawer = () => {
    closeTicker();
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



  const handleCriticalAlertPress = (alert: CriticalAlert) => {
    console.log('Critical alert pressed:', alert.headline);
    setSelectedArticle(alert);
    setModalVisible(true);
  };

  const handleNewsCardPress = (article: FeedItem) => {
    setSelectedArticle(article);
    setModalVisible(true);
  };
  

  
  // Filter critical alerts for recent ones (within last 6 hours)
  const recentCriticalAlerts = useMemo(() => {
    return criticalAlerts.filter(alert => {
      const alertTime = new Date(alert.published_at).getTime();
      const sixHoursAgo = Date.now() - (6 * 60 * 60 * 1000);
      return alertTime > sixHoursAgo || !alert.is_released; // Include upcoming alerts
    });
  }, [criticalAlerts]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.reservedSpace}>
        <AlertSearchBar 
          onTickerPress={handleTickerPress}
          feedItems={watchlistFeedItems}
        />
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {recentCriticalAlerts.length > 0 && (
          <CriticalAlerts 
            alerts={recentCriticalAlerts}
            onAlertPress={handleCriticalAlertPress}
          />
        )}
        <View style={styles.sectionHeaderContainer}>
          <View style={styles.divider} />
          <View nativeID="banner-anchor-point" style={styles.sectionHeader} testID="watchlist-based-news-header">
            <Text style={styles.sectionTitle}>WATCHLIST BASED NEWS</Text>
            <TimeRangeFilterPill
              selectedRange={timeRange}
              customRange={customTimeRange}
              onRangeChange={handleTimeRangeChange}
            />
          </View>
          <View style={styles.divider} />
        </View>
        {watchlist.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Add tickers to your Watchlist to see news here.
            </Text>
          </View>
        ) : watchlistFeedItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No recent news for your watchlist tickers.
            </Text>
          </View>
        ) : (
          <View style={styles.newsTable}>
            {watchlistFeedItems.map((item) => (
              <NewsCard
                key={item.id}
                item={item}
                onTickerPress={handleTickerPress}
                onPress={() => handleNewsCardPress(item)}
              />
            ))}
          </View>
        )}
      </ScrollView>
      
      <TickerDrawer
        isOpen={ui.tickerDrawer.open}
        ticker={ui.tickerDrawer.ticker}
        headlines={ui.tickerDrawer.ticker ? getTickerHeadlines(ui.tickerDrawer.ticker) : []}
        onClose={handleCloseDrawer}
      />

      <NewsArticleModal
        visible={modalVisible}
        article={selectedArticle}
        onClose={() => {
          setModalVisible(false);
          setSelectedArticle(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  reservedSpace: {
    height: 50,
    backgroundColor: theme.colors.bg,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.sm,
  },
  sectionHeaderContainer: {
    marginTop: 8,
    marginBottom: 0,
  },
  sectionHeader: {
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
    color: theme.colors.sectionTitle,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.sectionTitle,
  },
  newsTable: {
    backgroundColor: theme.colors.bg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyStateText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textDim,
    textAlign: 'center',
    lineHeight: 20,
  },
});