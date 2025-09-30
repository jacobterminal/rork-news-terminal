import { Bell, TrendingUp, Calendar, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { theme, impactColors, sentimentConfig } from '../constants/theme';
import { FeedItem, EarningsItem, EconItem } from '../types/news';
import { formatTime, formatTimeCountdown } from '../utils/newsUtils';

interface NotificationProps {
  item: FeedItem;
  onDismiss: () => void;
  onPress?: (item: FeedItem) => void;
}

interface NotificationSystemProps {
  notifications: FeedItem[];
  earnings: EarningsItem[];
  econ: EconItem[];
  watchlistNews: FeedItem[];
  onDismiss: (id: string) => void;
  onNotificationPress?: (item: FeedItem) => void;
  onTickerPress: (ticker: string) => void;
}

function NotificationCard({ item, onDismiss, onPress }: NotificationProps) {
  const [slideAnim] = useState(new Animated.Value(300));
  const [fadeAnim] = useState(new Animated.Value(0));

  const handleDismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  }, [slideAnim, fadeAnim, onDismiss]);

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss after 8 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 8000);

    return () => clearTimeout(timer);
  }, [slideAnim, fadeAnim, handleDismiss]);

  const getSentimentColor = () => {
    const sentiment = item.classification?.sentiment;
    switch (sentiment) {
      case 'Bullish':
        return theme.colors.green;
      case 'Bearish':
        return theme.colors.red;
      default:
        return theme.colors.info;
    }
  };

  const getNotificationIcon = () => {
    if (item.tags?.earnings) return '📊';
    if (item.tags?.fed) return '🏛️';
    if (item.tags?.sec) return '📋';
    if (item.classification?.impact === 'High') return '🚨';
    return '📰';
  };

  return (
    <Animated.View
      style={[
        styles.notificationCard,
        {
          transform: [{ translateX: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <Pressable
        style={styles.notificationContent}
        onPress={() => onPress?.(item)}
      >
        <View style={styles.notificationHeader}>
          <View style={styles.notificationIcon}>
            <Text style={styles.iconText}>{getNotificationIcon()}</Text>
          </View>
          
          <View style={styles.notificationInfo}>
            <View style={styles.notificationMeta}>
              <Text style={styles.sourceText}>{item.source?.name || 'News'}</Text>
              <Text style={styles.timeText}>{formatTime(item.published_at || '')}</Text>
            </View>
            
            <Text style={styles.titleText} numberOfLines={2}>
              {item.title}
            </Text>
            
            {item.classification?.summary_15 && (
              <Text style={styles.summaryText} numberOfLines={1}>
                {item.classification.summary_15}
              </Text>
            )}
            
            <View style={styles.notificationFooter}>
              {item.tickers && item.tickers.length > 0 && (
                <View style={styles.tickerContainer}>
                  {item.tickers.slice(0, 3).map((ticker, index) => (
                    <View key={ticker} style={styles.tickerChip}>
                      <Text style={styles.tickerText}>{ticker}</Text>
                    </View>
                  ))}
                  {item.tickers.length > 3 && (
                    <Text style={styles.moreText}>+{item.tickers.length - 3}</Text>
                  )}
                </View>
              )}
              
              {item.classification?.sentiment && (
                <View style={[styles.sentimentBadge, { borderColor: getSentimentColor() }]}>
                  <Text style={[styles.sentimentText, { color: getSentimentColor() }]}>
                    {item.classification.sentiment === 'Bullish' ? '↗' : 
                     item.classification.sentiment === 'Bearish' ? '↘' : '→'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Pressable>
      
      <Pressable style={styles.dismissButton} onPress={handleDismiss}>
        <X size={16} color={theme.colors.textDim} />
      </Pressable>
    </Animated.View>
  );
}

interface BottomNotificationBarProps {
  earnings: EarningsItem[];
  econ: EconItem[];
  watchlistNews: FeedItem[];
  onTickerPress: (ticker: string) => void;
}

function BottomNotificationBar({ earnings, econ, watchlistNews, onTickerPress }: BottomNotificationBarProps) {
  const [activeTab, setActiveTab] = useState<'earnings' | 'econ' | 'watchlist'>('earnings');
  const [isExpanded, setIsExpanded] = useState(false);

  const upcomingEarnings = earnings.filter(e => !e.verdict).slice(0, 3);
  const todayEcon = econ.slice(0, 3);
  const latestWatchlist = watchlistNews.slice(0, 3);

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'earnings': return upcomingEarnings.length;
      case 'econ': return todayEcon.length;
      case 'watchlist': return latestWatchlist.length;
      default: return 0;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'earnings':
        return upcomingEarnings.map(item => (
          <Pressable key={item.ticker} style={styles.notificationItem} onPress={() => onTickerPress(item.ticker)}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTicker}>{item.ticker}</Text>
              <Text style={styles.itemTime}>{item.report_time}</Text>
            </View>
            <Text style={styles.itemSubtext}>
              EPS: ${(item.cons_eps || 0).toFixed(2)} • Rev: ${(item.cons_rev || 0).toFixed(1)}B
            </Text>
          </Pressable>
        ));
      case 'econ':
        return todayEcon.map(item => (
          <View key={item.id} style={styles.notificationItem}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={[styles.impactDot, { backgroundColor: impactColors[item.impact] }]} />
            </View>
            <Text style={styles.itemSubtext}>
              {item.actual !== null ? `Actual: ${item.actual}` : `Forecast: ${item.forecast || 0}`}
            </Text>
          </View>
        ));
      case 'watchlist':
        return latestWatchlist.map(item => (
          <Pressable key={item.id} style={styles.notificationItem} onPress={() => item.tickers?.[0] && onTickerPress(item.tickers[0])}>
            <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
            <View style={styles.itemFooter}>
              <Text style={styles.itemTickers}>{item.tickers?.slice(0, 2).join(', ')}</Text>
              <Text style={styles.itemTime}>{formatTime(item.published_at || '')}</Text>
            </View>
          </Pressable>
        ));
      default:
        return null;
    }
  };

  return (
    <View style={styles.bottomBar}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <Pressable 
          style={[styles.tab, activeTab === 'earnings' && styles.activeTab]} 
          onPress={() => { setActiveTab('earnings'); setIsExpanded(true); }}
        >
          <TrendingUp size={16} color={activeTab === 'earnings' ? theme.colors.text : theme.colors.textDim} />
          <Text style={[styles.tabText, activeTab === 'earnings' && styles.activeTabText]}>Earnings</Text>
          {getTabCount('earnings') > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{getTabCount('earnings')}</Text>
            </View>
          )}
        </Pressable>
        
        <Pressable 
          style={[styles.tab, activeTab === 'econ' && styles.activeTab]} 
          onPress={() => { setActiveTab('econ'); setIsExpanded(true); }}
        >
          <Calendar size={16} color={activeTab === 'econ' ? theme.colors.text : theme.colors.textDim} />
          <Text style={[styles.tabText, activeTab === 'econ' && styles.activeTabText]}>Econ</Text>
          {getTabCount('econ') > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{getTabCount('econ')}</Text>
            </View>
          )}
        </Pressable>
        
        <Pressable 
          style={[styles.tab, activeTab === 'watchlist' && styles.activeTab]} 
          onPress={() => { setActiveTab('watchlist'); setIsExpanded(true); }}
        >
          <Bell size={16} color={activeTab === 'watchlist' ? theme.colors.text : theme.colors.textDim} />
          <Text style={[styles.tabText, activeTab === 'watchlist' && styles.activeTabText]}>Watchlist</Text>
          {getTabCount('watchlist') > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{getTabCount('watchlist')}</Text>
            </View>
          )}
        </Pressable>
        
        <Pressable style={styles.collapseButton} onPress={() => setIsExpanded(!isExpanded)}>
          <Text style={styles.collapseText}>{isExpanded ? '−' : '+'}</Text>
        </Pressable>
      </View>
      
      {/* Content */}
      {isExpanded && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderContent()}
        </ScrollView>
      )}
    </View>
  );
}

export default function NotificationSystem({ 
  notifications, 
  earnings,
  econ,
  watchlistNews,
  onDismiss, 
  onNotificationPress,
  onTickerPress
}: NotificationSystemProps) {
  return (
    <>
      {/* Top Notifications */}
      <View style={styles.container}>
        {notifications.map((notification, index) => (
          <View key={notification.id} style={[styles.notificationWrapper, { top: index * 110 }]}>
            <NotificationCard
              item={notification}
              onDismiss={() => onDismiss(notification.id)}
              onPress={onNotificationPress ? () => onNotificationPress(notification) : undefined}
            />
          </View>
        ))}
      </View>
      
      {/* Bottom Notification Bar */}
      <BottomNotificationBar
        earnings={earnings}
        econ={econ}
        watchlistNews={watchlistNews}
        onTickerPress={onTickerPress}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 16,
    left: 16,
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    zIndex: 999,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: theme.colors.bg,
  },
  tabText: {
    fontSize: 12,
    color: theme.colors.textDim,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 8,
    backgroundColor: theme.colors.red,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  collapseButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: theme.colors.bg,
  },
  collapseText: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  content: {
    maxHeight: 200,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  notificationItem: {
    backgroundColor: theme.colors.bg,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTicker: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
  itemName: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '500',
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemTime: {
    fontSize: 11,
    color: theme.colors.textDim,
    fontFamily: 'monospace',
  },
  itemSubtext: {
    fontSize: 11,
    color: theme.colors.textDim,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTickers: {
    fontSize: 11,
    color: theme.colors.info,
    fontWeight: '500',
  },
  impactDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  notificationWrapper: {
    position: 'absolute',
    right: 0,
    left: 0,
  },
  notificationCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  notificationContent: {
    flex: 1,
    padding: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 11,
    color: theme.colors.info,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  timeText: {
    fontSize: 10,
    color: theme.colors.textDim,
    fontFamily: 'monospace',
  },
  titleText: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 11,
    color: theme.colors.textDim,
    lineHeight: 14,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  tickerChip: {
    backgroundColor: theme.colors.bg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tickerText: {
    fontSize: 9,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  moreText: {
    fontSize: 9,
    color: theme.colors.textDim,
    fontWeight: '500',
  },
  sentimentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  sentimentText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  dismissButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.bg,
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.border,
  },
});