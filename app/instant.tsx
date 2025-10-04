import React, { useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { CriticalAlert } from '../types/news';
import NewsCard from '../components/NewsCard';
import TickerDrawer from '../components/TickerDrawer';
import CriticalAlerts from '../components/CriticalAlerts';
import AlertSearchBar from '../components/AlertSearchBar';
import { useNewsStore } from '../store/newsStore';

export default function InstantScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );
  
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, []);
  const { 
    state, 
    criticalAlerts, 
    highlightedAlert,
    openTicker, 
    closeTicker, 
    getTickerHeadlines,
    clearHighlightedAlert
  } = useNewsStore();
  
  // Filter for high impact and breaking news only
  const instantNews = useMemo(() => {
    return state.feedItems.filter(item => 
      item.classification.impact === 'High' || 
      item.classification.rumor_level === 'Confirmed'
    );
  }, [state.feedItems]);
  
  // Filter for recent critical alerts (within last 6 hours)
  const recentAlerts = useMemo(() => {
    return criticalAlerts.filter(alert => {
      const alertTime = new Date(alert.published_at).getTime();
      const sixHoursAgo = Date.now() - (6 * 60 * 60 * 1000);
      return alertTime > sixHoursAgo || !alert.is_released; // Include upcoming alerts
    });
  }, [criticalAlerts]);

  const handleTickerPress = (ticker: string) => {
    if (!ticker?.trim() || ticker.length > 20) return;
    const sanitizedTicker = ticker.trim();
    openTicker(sanitizedTicker);
  };

  const handleCloseDrawer = () => {
    closeTicker();
  };



  const handleCriticalAlertPress = (alert: CriticalAlert) => {
    console.log('Critical alert pressed:', alert.headline);
    // Could navigate to full article or show alert details
  };



  return (
    <View style={styles.container}>
      {/* Reserved space for drop banners and search */}
      <View style={[styles.reservedSpace, { paddingTop: insets.top }]}>
        <AlertSearchBar 
          onTickerPress={handleTickerPress}
          feedItems={state.feedItems}
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
          alerts={recentAlerts}
          onAlertPress={handleCriticalAlertPress}
          highlightedAlertId={highlightedAlert}
          onHighlightClear={clearHighlightedAlert}
        />
        
        {/* Section header: WATCHLIST INSTANT NEWS */}
        <View nativeID="banner-anchor-point" style={styles.sectionHeader} testID="instant-section-header">
          <Text style={styles.sectionTitle} accessibilityRole="header">WATCHLIST INSTANT NEWS</Text>
          <View style={styles.sectionDivider} />
        </View>

        {/* News feed */}
        {instantNews.map((item) => (
          <NewsCard
            key={item.id}
            item={item}
            onTickerPress={handleTickerPress}
          />
        ))}
      </ScrollView>
      
      <TickerDrawer
        isOpen={state.ui.tickerDrawer.open}
        ticker={state.ui.tickerDrawer.ticker}
        headlines={state.ui.tickerDrawer.ticker ? getTickerHeadlines(state.ui.tickerDrawer.ticker) : []}
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
    height: 35,
    backgroundColor: theme.colors.bg,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 8,
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
    backgroundColor: theme.colors.bg,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: theme.colors.sectionTitle,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    width: '100%',
  },
});