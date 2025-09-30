import React, { Component, useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DevControls from '../components/DevControls';
import FilterRow from '../components/FilterRow';
import MainFeed from '../components/MainFeed';
import NotificationSystem from '../components/NotificationSystem';
import TickerDrawer from '../components/TickerDrawer';
import TopTape from '../components/TopTape';
import { theme } from '../constants/theme';
import { NewsStoreProvider, useNewsStore } from '../store/newsStore';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('NewsTracker Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

function NewsTrackerContent() {
  const {
    state,
    isHydrated,
    wsConnected,
    notifications,
    setFilters,
    openTicker,
    closeTicker,
    getTickerHeadlines,
    getFilteredItems,
    injectTestItem,
    dismissNotification,
    handleNotificationPress,
  } = useNewsStore();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show loading until both mounted and hydrated to prevent hydration mismatch
  if (!isMounted || !isHydrated) {
    return (
      <View style={styles.loadingContainer}>
        {/* Minimal loading state to prevent hydration mismatch */}
        <View style={styles.loadingPlaceholder} />
      </View>
    );
  }

  const filteredItems = getFilteredItems();
  const watchlistNews = (state.feedItems || []).filter(item =>
    item && (item.tickers || []).some(ticker => (state.watchlist || []).includes(ticker))
  );
  const tickerHeadlines = state.ui.tickerDrawer.ticker
    ? getTickerHeadlines(state.ui.tickerDrawer.ticker)
    : [];

  return (
    <View style={styles.container}>
      {/* Top Tape */}
      <TopTape items={state.feedItems} onTickerPress={openTicker} />

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Main Feed */}
        <View style={styles.feedContainer}>
          <MainFeed items={filteredItems} onTickerPress={openTicker} />
        </View>
      </View>

      {/* Filter Row - Now at bottom */}
      <FilterRow filters={state.filters} onFiltersChange={setFilters} />

      {/* Ticker Drawer */}
      <TickerDrawer
        isOpen={state.ui.tickerDrawer.open}
        ticker={state.ui.tickerDrawer.ticker}
        onClose={closeTicker}
        headlines={tickerHeadlines}
      />

      {/* Dev Controls */}
      {Platform.OS === 'web' && (
        <DevControls
          onInjectFed={() => injectTestItem('fed')}
          onInjectEarnings={() => injectTestItem('earnings')}
        />
      )}

      {/* Notification System */}
      <NotificationSystem
        notifications={notifications}
        earnings={state.earnings}
        econ={state.econ}
        watchlistNews={watchlistNews}
        onDismiss={dismissNotification}
        onNotificationPress={handleNotificationPress}
        onTickerPress={openTicker}
      />

      {/* WebSocket Status */}
      {!wsConnected && (
        <View style={styles.wsStatus}>
          {/* WebSocket status banner could be added here */}
        </View>
      )}
    </View>
  );
}

export default function NewsTracker() {
  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <NewsStoreProvider>
          <NewsTrackerContent />
        </NewsStoreProvider>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  loadingPlaceholder: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    paddingBottom: 120, // Add padding for bottom notification bar
  },
  feedContainer: {
    flex: 1,
    minWidth: 0,
  },
  wsStatus: {
    position: 'absolute',
    top: 76, // Below tape and filter row
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: theme.colors.amber + '20',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: theme.fontSize.base + 4,
    color: theme.colors.red,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textDim,
    textAlign: 'center',
    lineHeight: 20,
  },
});