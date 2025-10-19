import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router, useSegments } from 'expo-router';
import { ArrowLeft, Plus, ArrowUp } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeedItem, CriticalAlert } from '../../types/news';
import NewsCard from '../../components/NewsCard';
import NewsArticleModal from '../../components/NewsArticleModal';
import WatchlistFolderPicker from '../../components/WatchlistFolderPicker';
import CreateFolderModal from '../../components/CreateFolderModal';
import { useNewsStore } from '../../store/newsStore';
import { useDropdown } from '../../store/dropdownStore';
import TimeRangeFilterPill, { TimeRange, CustomTimeRange } from '../../components/TimeRangeFilterPill';

const COMPANY_NAMES: Record<string, string> = {
  'AAPL': 'Apple Inc.',
  'NVDA': 'NVIDIA Corporation',
  'TSLA': 'Tesla Inc.',
  'MSFT': 'Microsoft Corporation',
  'GOOGL': 'Alphabet Inc.',
  'META': 'Meta Platforms Inc.',
  'AMZN': 'Amazon.com Inc.',
  'JPM': 'JPMorgan Chase & Co.',
  'BAC': 'Bank of America Corp.',
  'WMT': 'Walmart Inc.',
};

const COMPANY_INDUSTRY: Record<string, string> = {
  'AAPL': 'Technology / Consumer Electronics',
  'NVDA': 'Technology / Semiconductors',
  'TSLA': 'Automotive / Electric Vehicles',
  'MSFT': 'Technology / Software',
  'GOOGL': 'Technology / Internet Services',
  'META': 'Technology / Social Media',
  'AMZN': 'Technology / E-Commerce',
  'JPM': 'Financial Services / Banking',
  'BAC': 'Financial Services / Banking',
  'WMT': 'Retail / Discount Stores',
};

const COMPANY_OVERVIEW: Record<string, string> = {
  'AAPL': 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company operates through iPhone, Mac, iPad, Wearables, Home & Accessories, and Services segments.',
  'NVDA': 'NVIDIA Corporation designs and manufactures graphics processing units and system on chip units. The company operates in two segments: Graphics and Compute & Networking. It serves the gaming, professional visualization, data center, and automotive markets.',
  'TSLA': 'Tesla Inc. designs, develops, manufactures, and sells electric vehicles, energy generation and storage systems. The company operates through Automotive and Energy Generation and Storage segments.',
  'MSFT': 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide. The company operates through Productivity & Business Processes, Intelligent Cloud, and Personal Computing segments.',
  'GOOGL': 'Alphabet Inc. provides various products and platforms across multiple industries, including advertising, commerce, cloud computing, hardware, and entertainment. The company operates through Google Services, Google Cloud, and Other Bets segments.',
  'META': 'Meta Platforms Inc. develops products that enable people to connect and share with friends and family through mobile devices, personal computers, and other surfaces worldwide. The company operates through Family of Apps and Reality Labs segments.',
  'AMZN': 'Amazon.com Inc. engages in the retail sale of consumer products and subscriptions through online and physical stores worldwide. The company operates through North America, International, and Amazon Web Services segments.',
  'JPM': 'JPMorgan Chase & Co. operates as a financial services company worldwide. The company operates through Consumer & Community Banking, Corporate & Investment Bank, Commercial Banking, and Asset & Wealth Management segments.',
  'BAC': 'Bank of America Corporation provides banking and financial products and services for individual consumers, small- and middle-market businesses, institutional investors, large corporations, and governments worldwide.',
  'WMT': 'Walmart Inc. engages in the operation of retail, wholesale, and other units worldwide. The company operates through three segments: Walmart U.S., Walmart International, and Sam\'s Club.',
};

export default function TickerDetailPage() {
  const { ticker } = useLocalSearchParams<{ ticker: string }>();
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const { registerDropdown, shouldCloseDropdown } = useDropdown();
  const dropdownId = 'company-folder-picker';
  const scrollViewRef = useRef<ScrollView>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  
  const { 
    state, 
    criticalAlerts,
    activeFolderId,
    addTickerToFolder,
    createFolder,
  } = useNewsStore();

  const [selectedArticle, setSelectedArticle] = useState<FeedItem | CriticalAlert | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [folderPickerVisible, setFolderPickerVisible] = useState(false);
  const [createFolderModalVisible, setCreateFolderModalVisible] = useState(false);
  const [lastRoute, setLastRoute] = useState<string>('/instant');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('last_hour');
  const [customTimeRange, setCustomTimeRange] = useState<CustomTimeRange | undefined>(undefined);

  useEffect(() => {
    const currentPath = `/${segments.join('/')}`;
    if (!currentPath.startsWith('/company/')) {
      setLastRoute(currentPath);
    }
  }, [segments]);

  useEffect(() => {
    if (shouldCloseDropdown(dropdownId)) {
      setFolderPickerVisible(false);
      setCreateFolderModalVisible(false);
    }
  }, [shouldCloseDropdown, dropdownId]);

  useEffect(() => {
    const isAnyOpen = folderPickerVisible || createFolderModalVisible;
    registerDropdown(dropdownId, isAnyOpen);
  }, [folderPickerVisible, createFolderModalVisible, dropdownId]);

  const tickerUpper = ticker?.toUpperCase() || '';
  const companyName = COMPANY_NAMES[tickerUpper] || `${tickerUpper} Corporation`;
  const companyIndustry = COMPANY_INDUSTRY[tickerUpper] || 'Unknown Industry';
  const companyOverview = COMPANY_OVERVIEW[tickerUpper] || `${companyName} operates in various market segments providing products and services worldwide.`;

  const watchlistFolders = useMemo(() => state.watchlistFolders || [], [state.watchlistFolders]);

  const timeRangeInMs = useMemo(() => {
    switch (selectedTimeRange) {
      case 'last_hour': return 60 * 60 * 1000;
      case 'today': return 24 * 60 * 60 * 1000;
      case 'past_2_days': return 2 * 24 * 60 * 60 * 1000;
      case 'past_5_days': return 5 * 24 * 60 * 60 * 1000;
      case 'week_to_date': return 7 * 24 * 60 * 60 * 1000;
      case 'custom': {
        if (!customTimeRange) return 24 * 60 * 60 * 1000;
        const currentYear = new Date().getFullYear();
        const startParts = customTimeRange.startDate.split('/');
        const endParts = customTimeRange.endDate.split('/');
        const startHour24 = customTimeRange.startPeriod === 'AM' 
          ? (parseInt(customTimeRange.startHour) === 12 ? 0 : parseInt(customTimeRange.startHour))
          : (parseInt(customTimeRange.startHour) === 12 ? 12 : parseInt(customTimeRange.startHour) + 12);
        const endHour24 = customTimeRange.endPeriod === 'AM'
          ? (parseInt(customTimeRange.endHour) === 12 ? 0 : parseInt(customTimeRange.endHour))
          : (parseInt(customTimeRange.endHour) === 12 ? 12 : parseInt(customTimeRange.endHour) + 12);
        const startDateTime = new Date(
          currentYear,
          parseInt(startParts[0]) - 1,
          parseInt(startParts[1]),
          startHour24,
          parseInt(customTimeRange.startMinute)
        );
        const endDateTime = new Date(
          currentYear,
          parseInt(endParts[0]) - 1,
          parseInt(endParts[1]),
          endHour24,
          parseInt(customTimeRange.endMinute)
        );
        return endDateTime.getTime() - startDateTime.getTime();
      }
      default: return 60 * 60 * 1000;
    }
  }, [selectedTimeRange, customTimeRange]);

  const companyAlerts = useMemo(() => {
    return criticalAlerts
      .filter(alert => alert.tickers && alert.tickers.includes(tickerUpper))
      .filter(alert => {
        const alertTime = new Date(alert.published_at).getTime();
        const cutoffTime = Date.now() - timeRangeInMs;
        return alertTime > cutoffTime;
      })
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  }, [criticalAlerts, tickerUpper, timeRangeInMs]);

  const companyNews = useMemo(() => {
    return state.feedItems
      .filter(item => item.tickers && item.tickers.includes(tickerUpper))
      .filter(item => {
        const newsTime = new Date(item.published_at).getTime();
        const cutoffTime = Date.now() - timeRangeInMs;
        return newsTime > cutoffTime;
      })
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  }, [state.feedItems, tickerUpper, timeRangeInMs]);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const screenHeight = event.nativeEvent.layoutMeasurement.height;
    setShowScrollToTop(offsetY > screenHeight * 2);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleBack = () => {
    const mainPages = ['/instant', '/index', '/upcoming', '/watchlist', '/twitter'];
    
    if (mainPages.includes(lastRoute)) {
      router.replace(lastRoute as any);
    } else {
      router.replace('/instant');
    }
  };

  const isInWatchlist = useMemo(() => {
    return watchlistFolders.some(folder => folder.tickers.includes(tickerUpper));
  }, [watchlistFolders, tickerUpper]);

  const handleAddToWatchlist = () => {
    if (isInWatchlist) return;
    if (watchlistFolders.length === 0) {
      setCreateFolderModalVisible(true);
    } else {
      setFolderPickerVisible(true);
    }
  };

  const handleSelectFolder = async (folderId: string) => {
    const success = await addTickerToFolder(folderId, tickerUpper);
    if (success) {
      const folder = watchlistFolders.find(f => f.id === folderId);
      Alert.alert('Success', `Added ${tickerUpper} to ${folder?.name || 'folder'}`);
    } else {
      Alert.alert('Info', `${tickerUpper} is already in this folder`);
    }
    setFolderPickerVisible(false);
  };

  const handleCreateFolder = async (name: string) => {
    const folderId = await createFolder(name, false);
    const success = await addTickerToFolder(folderId, tickerUpper);
    if (success) {
      Alert.alert('Success', `Created folder "${name}" and added ${tickerUpper}`);
    }
    setCreateFolderModalVisible(false);
  };

  const handleNewsCardPress = (article: FeedItem) => {
    setSelectedArticle(article);
    setModalVisible(true);
  };

  const handleAlertPress = (alert: CriticalAlert) => {
    setSelectedArticle(alert);
    setModalVisible(true);
  };

  const handleTickerPress = (ticker: string) => {
    if (ticker === tickerUpper) return;
    router.replace(`/company/${ticker}`);
  };

  const handleTimeRangeChange = (range: TimeRange, customRange?: CustomTimeRange) => {
    setSelectedTimeRange(range);
    if (customRange) {
      setCustomTimeRange(customRange);
    }
  };

  const relatedTickers = useMemo(() => {
    const allTickers = new Set<string>();
    companyNews.forEach(item => {
      item.tickers.forEach(t => {
        if (t !== tickerUpper) {
          allTickers.add(t);
        }
      });
    });
    return Array.from(allTickers).slice(0, 5);
  }, [companyNews, tickerUpper]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.companyOverviewSection}>
          <Text style={styles.companyName}>{companyName}</Text>
          <Text style={styles.companyIndustry}>{companyIndustry}</Text>
          <View style={styles.watchlistButtonContainer}>
            <TouchableOpacity
              style={[
                styles.watchlistButton,
                isInWatchlist && styles.watchlistButtonAdded,
              ]}
              onPress={handleAddToWatchlist}
              activeOpacity={isInWatchlist ? 1 : 0.7}
              disabled={isInWatchlist}
            >
              <Text style={[
                styles.watchlistButtonText,
                isInWatchlist && styles.watchlistButtonTextAdded,
              ]}>
                {isInWatchlist ? 'Added to Watchlist' : 'Add to Watchlist +'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.companyOverview}>{companyOverview}</Text>
        </View>

        {companyAlerts.length > 0 && (
          <>
            <View style={styles.sectionHeaderContainer}>
              <View style={styles.topDivider} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>CRITICAL ALERTS</Text>
              </View>
              <View style={styles.bottomDivider} />
            </View>
            {companyAlerts.map((alert, index) => {
              const otherTickers = alert.tickers.filter(t => t !== tickerUpper);
              return (
                <View key={alert.id} style={styles.alertCard}>
                  <TouchableOpacity
                    onPress={() => handleAlertPress(alert)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.alertHeader}>
                      <Text style={styles.alertSource}>{alert.source}</Text>
                      <Text style={styles.alertTime}>
                        {new Date(alert.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <Text style={styles.alertHeadline}>{alert.headline}</Text>
                    <View style={styles.alertMeta}>
                      <View style={[
                        styles.sentimentBadge,
                        alert.sentiment === 'Bullish' && styles.bullishBadge,
                        alert.sentiment === 'Bearish' && styles.bearishBadge,
                        alert.sentiment === 'Neutral' && styles.neutralBadge,
                      ]}>
                        <Text style={[
                          styles.sentimentBadgeText,
                          alert.sentiment === 'Bullish' && styles.bullishBadgeText,
                          alert.sentiment === 'Bearish' && styles.bearishBadgeText,
                          alert.sentiment === 'Neutral' && styles.neutralBadgeText,
                        ]}>
                          {alert.sentiment === 'Bullish' ? 'BULL' : alert.sentiment === 'Bearish' ? 'BEAR' : 'NEUT'}
                        </Text>
                      </View>
                      <Text style={styles.alertImpact}>{alert.impact.toUpperCase()}</Text>
                    </View>
                    {otherTickers.length > 0 && (
                      <View style={styles.relatedTickersRow}>
                        <Text style={styles.relatedLabel}>Related: </Text>
                        {otherTickers.slice(0, 3).map(t => (
                          <TouchableOpacity key={t} onPress={() => handleTickerPress(t)}>
                            <Text style={styles.relatedTicker}>{t}</Text>
                          </TouchableOpacity>
                        ))}
                        {otherTickers.length > 3 && (
                          <Text style={styles.relatedMore}>+{otherTickers.length - 3}</Text>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
        )}

        <View style={styles.sectionHeaderContainer}>
          <View style={styles.topDivider} />
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>ALL NEWS FEED</Text>
            <TimeRangeFilterPill
              selectedRange={selectedTimeRange}
              customRange={customTimeRange}
              onRangeChange={handleTimeRangeChange}
            />
          </View>
          <View style={styles.bottomDivider} />
        </View>

        {companyNews.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No news for {tickerUpper} in selected time range</Text>
          </View>
        ) : (
          <View style={styles.newsTable}>
            {companyNews.map(item => (
              <NewsCard
                key={item.id}
                item={item}
                onTickerPress={handleTickerPress}
                onPress={() => handleNewsCardPress(item)}
              />
            ))}
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {showScrollToTop && (
        <TouchableOpacity
          style={[styles.scrollToTopButton, { bottom: insets.bottom + 80 }]}
          onPress={scrollToTop}
          activeOpacity={0.8}
        >
          <ArrowUp size={20} color="#FFD75A" />
        </TouchableOpacity>
      )}

      <NewsArticleModal
        visible={modalVisible}
        article={selectedArticle}
        onClose={() => {
          setModalVisible(false);
          setSelectedArticle(null);
        }}
      />

      <WatchlistFolderPicker
        visible={folderPickerVisible}
        folders={watchlistFolders.map(f => ({
          id: f.id,
          name: f.name,
          tickerCount: f.tickers.length,
        }))}
        activeFolderId={activeFolderId}
        onSelectFolder={handleSelectFolder}
        onCreateFolder={() => {
          setFolderPickerVisible(false);
          setTimeout(() => setCreateFolderModalVisible(true), 100);
        }}
        onClose={() => setFolderPickerVisible(false)}
      />

      <CreateFolderModal
        visible={createFolderModalVisible}
        mode="create"
        onClose={() => setCreateFolderModalVisible(false)}
        onSubmit={handleCreateFolder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  sectionHeaderContainer: {
    marginTop: 0,
  },
  topDivider: {
    height: 1,
    backgroundColor: '#FFD75A',
    marginTop: 8,
  },
  bottomDivider: {
    height: 1,
    backgroundColor: '#FFD75A',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD75A',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  alertCard: {
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#FFD75A',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  alertSource: {
    fontSize: 10,
    color: '#777777',
    textTransform: 'uppercase',
  },
  alertTime: {
    fontSize: 10,
    color: '#777777',
    fontFamily: 'monospace',
  },
  alertHeadline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 18,
    marginBottom: 8,
  },
  alertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sentimentBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  bullishBadge: {
    borderColor: '#00FF66',
  },
  bearishBadge: {
    borderColor: '#FF4444',
  },
  neutralBadge: {
    borderColor: '#FFD75A',
  },
  sentimentBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  bullishBadgeText: {
    color: '#00FF66',
  },
  bearishBadgeText: {
    color: '#FF4444',
  },
  neutralBadgeText: {
    color: '#FFD75A',
  },
  alertImpact: {
    fontSize: 9,
    color: '#777777',
    fontWeight: '600',
  },
  relatedTickersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  relatedLabel: {
    fontSize: 10,
    color: '#666666',
  },
  relatedTicker: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#999999',
    fontWeight: '700',
  },
  relatedMore: {
    fontSize: 9,
    color: '#666666',
  },
  newsTable: {
    backgroundColor: '#000000',
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
  scrollToTopButton: {
    position: 'absolute',
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderWidth: 1,
    borderColor: '#FFD75A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD75A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  companyOverviewSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#000000',
  },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  companyIndustry: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 14,
  },
  watchlistButtonContainer: {
    marginBottom: 14,
  },
  watchlistButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFD75A',
    backgroundColor: 'rgba(255, 215, 90, 0.1)',
  },
  watchlistButtonAdded: {
    borderColor: '#555555',
    backgroundColor: 'rgba(85, 85, 85, 0.2)',
  },
  watchlistButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD75A',
  },
  watchlistButtonTextAdded: {
    color: '#999999',
  },
  companyOverview: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.85)',
  },
});
