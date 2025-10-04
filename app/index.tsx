import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { CriticalAlert } from '../types/news';
import NewsCard from '../components/NewsCard';
import TickerDrawer from '../components/TickerDrawer';
import { useNewsStore } from '../store/newsStore';
import CriticalAlerts from '../components/CriticalAlerts';
import AlertSearchBar from '../components/AlertSearchBar';

const BANNER_HEIGHT = 86;

export default function NewsScreen() {
  const insets = useSafeAreaInsets();
  const { state, criticalAlerts, openTicker, closeTicker, getTickerHeadlines } = useNewsStore();
  const { watchlist, feedItems, ui } = state;
  
  // Filter feed items to only show news for tickers in watchlist
  const watchlistFeedItems = useMemo(() => {
    if (!watchlist || watchlist.length === 0) {
      return [];
    }
    
    return feedItems
      .filter(item => {
        // Check if any of the item's tickers are in the watchlist
        return item.tickers && item.tickers.some(ticker => {
          if (!ticker || !ticker.trim() || ticker.length > 10) return false;
          const sanitizedTicker = ticker.trim();
          return watchlist.includes(sanitizedTicker);
        });
      })
      .sort((a, b) => {
        // Sort by published_at DESC (most recent first)
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      });
  }, [feedItems, watchlist]);

  const handleTickerPress = (ticker: string) => {
    if (!ticker || !ticker.trim() || ticker.length > 10) return;
    const sanitizedTicker = ticker.trim().toUpperCase();
    openTicker(sanitizedTicker);
  };

  const handleCloseDrawer = () => {
    closeTicker();
  };



  const handleCriticalAlertPress = (alert: CriticalAlert) => {
    console.log('Critical alert pressed:', alert.headline);
    // Could navigate to full article or show alert details
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
        <View style={styles.sectionHeader} testID="watchlist-based-news-header">
          <Text style={styles.sectionTitle}>WATCHLIST BASED NEWS</Text>
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
    paddingTop: BANNER_HEIGHT,
    paddingBottom: theme.spacing.sm,
  },
  sectionHeader: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.sectionTitle,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: theme.colors.sectionTitle,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
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