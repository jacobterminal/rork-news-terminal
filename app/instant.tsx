import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Text, Animated, Platform } from 'react-native';
import { router } from 'expo-router';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { CriticalAlert, FeedItem } from '../types/news';
import NewsCard from '../components/NewsCard';
import TickerDrawer from '../components/TickerDrawer';
import CriticalAlerts from '../components/CriticalAlerts';
import NewsArticleModal from '../components/NewsArticleModal';
import { useNewsStore } from '../store/newsStore';
import { useScrollReset } from '../utils/useScrollReset';
import { useNavigationStore } from '../store/navigationStore';

export default function InstantScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const scrollViewRef = useScrollReset();
  const currentScrollRef = useRef(0);
  const { 
    state, 
    criticalAlerts, 
    highlightedAlert,
    openTicker, 
    closeTicker, 
    getTickerHeadlines,
    clearHighlightedAlert
  } = useNewsStore();
  const { setReturnContext } = useNavigationStore();
  const [selectedArticle, setSelectedArticle] = useState<FeedItem | CriticalAlert | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Filter for high impact and breaking news only
  const instantNews = useMemo(() => {
    return state.feedItems.filter(item => 
      item.classification.impact === 'High' || 
      item.classification.rumor_level === 'Confirmed'
    ).sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  }, [state.feedItems]);
  
  const [animatedItems, setAnimatedItems] = useState<Set<string>>(new Set());
  const animationRefs = useRef<Map<string, Animated.Value>>(new Map());
  
  useFocusEffect(
    React.useCallback(() => {
      const restore = route.params?.__restore;
      if (restore?.scrollOffset != null && scrollViewRef.current) {
        scrollViewRef.current.scrollTo?.({ y: restore.scrollOffset, animated: false });
        router.setParams({ __restore: undefined });
      }
    }, [route.params?.__restore])
  );
  
  useEffect(() => {
    instantNews.forEach((item, index) => {
      if (!animatedItems.has(item.id)) {
        if (!animationRefs.current.has(item.id)) {
          animationRefs.current.set(item.id, new Animated.Value(0));
        }
        
        const animValue = animationRefs.current.get(item.id);
        if (animValue) {
          setTimeout(() => {
            Animated.spring(animValue, {
              toValue: 1,
              useNativeDriver: true,
              tension: 50,
              friction: 7,
            }).start();
          }, index * 50);
        }
        
        setAnimatedItems(prev => new Set([...prev, item.id]));
      }
    });
  }, [instantNews, animatedItems]);
  
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
    const sanitizedTicker = ticker.trim().toUpperCase();
    
    setReturnContext({
      routeName: 'instant',
      scrollOffset: currentScrollRef.current,
    });
    
    router.push(`/company/${sanitizedTicker}` as any);
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



  const headerHeight = Platform.select({ web: 64, default: 56 });

  return (
    <View style={[styles.container, { paddingTop: insets.top + headerHeight }]}>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={(e) => (currentScrollRef.current = e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
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
        {instantNews.map((item) => {
          const animValue = animationRefs.current.get(item.id) || new Animated.Value(1);
          
          return (
            <Animated.View
              key={item.id}
              style={{
                opacity: animValue,
                transform: [
                  {
                    translateY: animValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                  {
                    scale: animValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
              }}
            >
              <NewsCard
                item={item}
                onTickerPress={handleTickerPress}
                onPress={() => handleNewsCardPress(item)}
              />
            </Animated.View>
          );
        })}
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