import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Pressable, Modal, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { CriticalAlert, FeedItem } from '../types/news';
import { MoreVertical } from 'lucide-react-native';
import NewsCard from '../components/NewsCard';
import TickerDrawer from '../components/TickerDrawer';
import { useNewsStore } from '../store/newsStore';
import { useDropdown } from '../store/dropdownStore';
import { useScrollReset } from '../utils/useScrollReset';
import CriticalAlerts from '../components/CriticalAlerts';
import TimeRangeFilterPill, { TimeRange, CustomTimeRange } from '../components/TimeRangeFilterPill';
import NewsArticleModal from '../components/NewsArticleModal';
import UniversalBackButton from '../components/UniversalBackButton';

export default function NewsScreen() {
  const { registerDropdown, shouldCloseDropdown } = useDropdown();
  const dropdownId = 'news-menu';
  const insets = useSafeAreaInsets();
  const scrollViewRef = useScrollReset();
  const { state, criticalAlerts, openTicker, closeTicker, getTickerHeadlines } = useNewsStore();
  const { watchlist, feedItems, ui } = state;
  const [timeRange, setTimeRange] = useState<TimeRange>('last_hour');
  const [customTimeRange, setCustomTimeRange] = useState<CustomTimeRange | undefined>();
  const [selectedArticle, setSelectedArticle] = useState<FeedItem | CriticalAlert | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showWatchlistFilter, setShowWatchlistFilter] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (shouldCloseDropdown(dropdownId)) {
      setMenuVisible(false);
    }
  }, [shouldCloseDropdown, dropdownId]);

  useEffect(() => {
    registerDropdown(dropdownId, menuVisible);
  }, [menuVisible, registerDropdown, dropdownId]);
  
  // Filter feed items to only show news for tickers in watchlist
  const watchlistFeedItems = useMemo(() => {
    // If watchlist filter is disabled, show all feed items
    if (!showWatchlistFilter) {
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
        .filter(item => isNewsInTimeRange(item.published_at))
        .sort((a, b) => {
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
        });
    }
    
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
  }, [feedItems, watchlist, timeRange, customTimeRange, showWatchlistFilter]);

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
        {recentCriticalAlerts.length > 0 && (
          <CriticalAlerts 
            alerts={recentCriticalAlerts}
            onAlertPress={handleCriticalAlertPress}
          />
        )}
        <View style={styles.sectionHeaderContainer}>
          <View style={styles.divider} />
          <View nativeID="banner-anchor-point" style={styles.sectionHeader} testID="watchlist-based-news-header">
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>
                {showWatchlistFilter ? 'WATCHLIST BASED NEWS' : 'ALL NEWS'}
              </Text>
              <Pressable
                style={styles.menuButton}
                onPress={() => setMenuVisible(true)}
                hitSlop={8}
              >
                <MoreVertical size={16} color={theme.colors.sectionTitle} />
              </Pressable>
            </View>
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

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowWatchlistFilter(true);
                setMenuVisible(false);
              }}
            >
              <Text style={[styles.menuItemText, showWatchlistFilter && styles.menuItemTextActive]}>
                Watchlist Based News
              </Text>
              {showWatchlistFilter && <View style={styles.activeIndicator} />}
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowWatchlistFilter(false);
                setMenuVisible(false);
              }}
            >
              <Text style={[styles.menuItemText, !showWatchlistFilter && styles.menuItemTextActive]}>
                All News
              </Text>
              {!showWatchlistFilter && <View style={styles.activeIndicator} />}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingTop: 37,
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
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: theme.colors.sectionTitle,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  menuButton: {
    padding: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 200,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500' as const,
  },
  menuItemTextActive: {
    color: theme.colors.sectionTitle,
  },
  menuDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.sectionTitle,
  },
});