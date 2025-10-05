import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { CriticalAlert, FeedItem } from '../types/news';
import NewsCard from '../components/NewsCard';
import TickerDrawer from '../components/TickerDrawer';
import CriticalAlerts from '../components/CriticalAlerts';
import AlertSearchBar from '../components/AlertSearchBar';
import NewsArticleModal from '../components/NewsArticleModal';
import { useNewsStore } from '../store/newsStore';
import { useScrollReset } from '../utils/useScrollReset';

export default function InstantScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useScrollReset();
  const { 
    state, 
    criticalAlerts, 
    highlightedAlert,
    openTicker, 
    closeTicker, 
    getTickerHeadlines,
    clearHighlightedAlert
  } = useNewsStore();
  const [selectedArticle, setSelectedArticle] = useState<FeedItem | CriticalAlert | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
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
    setSelectedArticle(alert);
    setModalVisible(true);
  };

  const handleNewsCardPress = (article: FeedItem) => {
    setSelectedArticle(article);
    setModalVisible(true);
  };



  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Reserved space for drop banners and search */}
      <View style={styles.reservedSpace}>
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
            onPress={() => handleNewsCardPress(item)}
          />
        ))}
      </ScrollView>
      
      <TickerDrawer
        isOpen={state.ui.tickerDrawer.open}
        ticker={state.ui.tickerDrawer.ticker}
        headlines={state.ui.tickerDrawer.ticker ? getTickerHeadlines(state.ui.tickerDrawer.ticker) : []}
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
    paddingHorizontal: 16,
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