import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, BackHandler, Platform } from 'react-native';
import { useLocalSearchParams, router, useNavigation, useFocusEffect } from 'expo-router';
import { useRoute } from '@react-navigation/native';
import { ArrowLeft, ArrowUp } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeedItem, CriticalAlert, EarningsItem } from '../../types/news';
import NewsCard from '../../components/NewsCard';
import NewsArticleModal from '../../components/NewsArticleModal';
import TimeRangeFilterPill, { TimeRange, CustomTimeRange } from '../../components/TimeRangeFilterPill';
import WatchlistFolderPicker from '../../components/WatchlistFolderPicker';
import CreateFolderModal from '../../components/CreateFolderModal';
import ScheduledEarningsCard from '../../components/ScheduledEarningsCard';
import { useNewsStore } from '../../store/newsStore';
import { useDropdown } from '../../store/dropdownStore';
import { useNavigationStore } from '../../store/navigationStore';


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

let lastBackPressTime = 0;
const BACK_DEBOUNCE_MS = 500;

export default function TickerDetailPage() {
  const { ticker } = useLocalSearchParams<{ ticker: string }>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { registerDropdown, shouldCloseDropdown } = useDropdown();
  const dropdownId = 'company-folder-picker';
  const { returnContext, setReturnContext, clearReturnContext } = useNavigationStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const currentScrollYRef = useRef(0);

  useEffect(() => {
    const ctx = route.params?.returnContext;
    if (ctx) {
      console.log('[CompanyPage] Received returnContext from params:', ctx);
      setReturnContext(ctx);
    }
  }, [route.params?.returnContext, setReturnContext]);
  
  const { 
    state, 
    criticalAlerts,
    addTickerToFolder,
    createFolder,
  } = useNewsStore();

  const earningsItems = state.earnings || [];

  const [selectedArticle, setSelectedArticle] = useState<FeedItem | CriticalAlert | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEarnings, setSelectedEarnings] = useState<EarningsItem | null>(null);
  const [earningsModalVisible, setEarningsModalVisible] = useState(false);
  const [createFolderModalVisible, setCreateFolderModalVisible] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('today');
  const [customTimeRange, setCustomTimeRange] = useState<CustomTimeRange | undefined>(undefined);



  useEffect(() => {
    if (shouldCloseDropdown(dropdownId)) {
      setCreateFolderModalVisible(false);
    }
  }, [shouldCloseDropdown, dropdownId]);

  useEffect(() => {
    registerDropdown(dropdownId, createFolderModalVisible);
  }, [createFolderModalVisible, dropdownId, registerDropdown]);

  const tickerUpper = ticker?.toUpperCase() || '';
  const companyName = COMPANY_NAMES[tickerUpper] || `${tickerUpper} Corporation`;
  const companyIndustry = COMPANY_INDUSTRY[tickerUpper] || 'Unknown Industry';
  const companyOverview = COMPANY_OVERVIEW[tickerUpper] || `${companyName} operates in various market segments providing products and services worldwide.`;

  const timeRangeInMs = useMemo(() => {
    if (selectedTimeRange === 'custom' && customTimeRange) {
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
    
    switch (selectedTimeRange) {
      case 'last_hour':
        return 60 * 60 * 1000;
      case 'today':
        return 24 * 60 * 60 * 1000;
      case 'past_2_days':
        return 2 * 24 * 60 * 60 * 1000;
      case 'past_5_days':
        return 5 * 24 * 60 * 60 * 1000;
      case 'week_to_date':
        return 7 * 24 * 60 * 60 * 1000;
      default:
        return 24 * 60 * 60 * 1000;
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

  const nextEarnings = useMemo(() => {
    const now = Date.now();
    const futureEarnings = earningsItems
      .filter(item => item.ticker === tickerUpper)
      .filter(item => {
        const eventTime = new Date(item.scheduled_at).getTime();
        return eventTime > now;
      })
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
    
    return futureEarnings.length > 0 ? futureEarnings[0] : null;
  }, [earningsItems, tickerUpper]);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    currentScrollYRef.current = offsetY;
    const screenHeight = event.nativeEvent.layoutMeasurement.height;
    setShowScrollToTop(offsetY > screenHeight * 2);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const goSmartBack = React.useCallback(() => {
    const now = Date.now();
    if (now - lastBackPressTime < BACK_DEBOUNCE_MS) {
      console.log('[CompanyPage] Back debounced');
      return;
    }
    lastBackPressTime = now;

    console.log('[CompanyPage] Back pressed, returnContext:', returnContext);

    if (returnContext?.origin) {
      console.log('[CompanyPage] Navigating back to:', returnContext.origin, 'with scroll:', returnContext.scrollOffset);
      
      const routeMap: Record<string, string> = {
        'index': 'index',
        'instant': 'instant',
        'upcoming': 'upcoming',
        'watchlist': 'watchlist',
        'twitter': 'twitter',
        'search': 'search',
      };
      
      const targetRoute = routeMap[returnContext.origin] || 'index';
      
      navigation.getParent()?.navigate(targetRoute, {
        __restore: {
          scrollOffset: returnContext.scrollOffset,
          timeRange: returnContext.timeRange,
          customTimeRange: returnContext.customTimeRange,
          searchQuery: returnContext.searchQuery,
        },
      });
      
      clearReturnContext();
      return;
    }

    if (navigation.canGoBack()) {
      console.log('[CompanyPage] Using navigation.goBack()');
      navigation.goBack();
      return;
    }

    console.log('[CompanyPage] Fallback to instant');
    router.push('/instant');
  }, [navigation, returnContext, clearReturnContext]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        goSmartBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [goSmartBack])
  );

  const handleCreateFolder = async (name: string) => {
    const folderId = await createFolder(name, false);
    const success = await addTickerToFolder(folderId, tickerUpper);
    if (success) {
      console.log(`Created folder "${name}" and added ${tickerUpper}`);
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

  const handleEarningsPress = (earning: EarningsItem) => {
    setSelectedEarnings(earning);
    setEarningsModalVisible(true);
  };

  const handleTickerPress = (ticker: string) => {
    if (ticker === tickerUpper) return;
    
    const stateToPreserve = {
      selectedTimeRange,
      customTimeRange,
      scrollY: currentScrollYRef.current,
    };
    console.log('[CompanyPage] Navigating to', ticker, 'with preserved state:', stateToPreserve);
    
    router.push(`/company/${ticker}`);
  };

  const headerHeight = Platform.select({ web: 64, default: 56 });

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { 
          paddingTop: headerHeight + insets.top,
          paddingBottom: insets.bottom + 24,
        }]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.goldDividerTop} />
        <TouchableOpacity
          style={styles.backButton}
          onPress={goSmartBack}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft size={18} color="#FFD75A" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.companyOverviewSection}>
          <Text style={styles.companyName}>{companyName}</Text>
          <Text style={styles.companyIndustry}>{companyIndustry}</Text>
          <View style={styles.watchlistButtonContainer}>
            <View style={styles.watchlistPill}>
              <Text style={styles.watchlistPillText}>Added to Watchlist</Text>
            </View>
            <WatchlistFolderPicker symbol={tickerUpper} />
          </View>
          <Text style={styles.companyOverview}>{companyOverview}</Text>
        </View>

        <ScheduledEarningsCard
          symbol={tickerUpper}
          companyFiscalStartMonth={1}
          events={earningsItems as any}
        />

        {nextEarnings && (
          <View style={styles.upcomingEarningsSection}>
            <Text style={styles.upcomingEarningsTitle}>Upcoming Earnings</Text>
            <TouchableOpacity
              style={styles.upcomingEarningsCard}
              onPress={() => handleEarningsPress(nextEarnings)}
              activeOpacity={0.8}
            >
              <View style={styles.upcomingHeader}>
                <View style={styles.upcomingTickerPill}>
                  <Text style={styles.upcomingTickerText}>{nextEarnings.ticker}</Text>
                </View>
                <View style={styles.upcomingSessionPill}>
                  <Text style={styles.upcomingSessionText}>{nextEarnings.report_time}</Text>
                </View>
                <Text style={styles.upcomingDate}>
                  {new Date(nextEarnings.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
              <View style={styles.upcomingMetrics}>
                <Text style={styles.upcomingMetricsRow}>
                  <Text style={styles.upcomingMetricLabel}>Expected EPS: </Text>
                  <Text style={styles.upcomingMetricValue}>
                    {nextEarnings.cons_eps !== undefined ? `${nextEarnings.cons_eps.toFixed(2)}` : 'NA'}
                  </Text>
                  <Text style={styles.metricSeparator}> • </Text>
                  <Text style={styles.upcomingMetricLabel}>Expected Revenue: </Text>
                  <Text style={styles.upcomingMetricValue}>
                    {nextEarnings.cons_rev !== undefined ? `${nextEarnings.cons_rev.toFixed(1)}B` : 'NA'}
                  </Text>
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {companyAlerts.length > 0 && (
          <>
            <View style={styles.sectionHeaderContainer}>
              <View style={styles.topDivider} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>CRITICAL ALERTS</Text>
              </View>
              <View style={styles.bottomDivider} />
            </View>
            {companyAlerts.map((alert) => {
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
                          <TouchableOpacity 
                            key={t} 
                            onPress={() => handleTickerPress(t)}
                            activeOpacity={0.7}
                            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                          >
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ALL NEWS FEED</Text>
          </View>
          <View style={styles.bottomDivider} />
        </View>
        <View style={styles.timeFilterContainer}>
          <TimeRangeFilterPill
            selectedRange={selectedTimeRange}
            customRange={customTimeRange}
            onRangeChange={(range, custom) => {
              setSelectedTimeRange(range);
              setCustomTimeRange(custom);
            }}
          />
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
        onTickerPress={handleTickerPress}
      />

      <CreateFolderModal
        visible={createFolderModalVisible}
        mode="create"
        onClose={() => setCreateFolderModalVisible(false)}
        onSubmit={handleCreateFolder}
      />

      <EarningsSheet
        visible={earningsModalVisible}
        earning={selectedEarnings}
        onClose={() => {
          setEarningsModalVisible(false);
          setSelectedEarnings(null);
        }}
      />
    </View>
  );
}

type EarningsSheetProps = {
  visible: boolean;
  earning: EarningsItem | null;
  onClose: () => void;
};

function EarningsSheet({ visible, earning, onClose }: EarningsSheetProps) {
  if (!earning || !visible) return null;

  const scheduledDate = new Date(earning.scheduled_at);
  const dateStr = scheduledDate.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <TouchableOpacity
      style={styles.modalOverlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <View style={styles.modalContentWrapper}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.earningsSheetContent}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{earning.ticker} Earnings Report</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sheetSection}>
            <View style={styles.sheetRow}>
              <Text style={styles.sheetLabel}>Date</Text>
              <Text style={styles.sheetValue}>{dateStr}</Text>
            </View>
            <View style={styles.sheetRow}>
              <Text style={styles.sheetLabel}>Report Time</Text>
              <View style={styles.earningsSessionPill}>
                <Text style={styles.earningsSessionText}>{earning.report_time}</Text>
              </View>
            </View>
          </View>

          {earning.verdict && (
            <View style={styles.sheetSection}>
              <View style={[styles.verdictBadgeLarge, 
                earning.verdict === 'Beat' && styles.verdictBeatBadge,
                earning.verdict === 'Miss' && styles.verdictMissBadge
              ]}>
                <Text style={[styles.verdictBadgeTextLarge,
                  earning.verdict === 'Beat' && styles.verdictBeatText,
                  earning.verdict === 'Miss' && styles.verdictMissText
                ]}>{earning.verdict.toUpperCase()}</Text>
              </View>
            </View>
          )}

          <View style={styles.sheetSection}>
            <Text style={styles.sheetSectionTitle}>Estimates</Text>
            {earning.cons_eps !== undefined && (
              <View style={styles.sheetMetricRow}>
                <Text style={styles.sheetMetricLabel}>EPS (est.)</Text>
                <Text style={styles.sheetMetricValue}>${earning.cons_eps.toFixed(2)}</Text>
              </View>
            )}
            {earning.cons_rev !== undefined && (
              <View style={styles.sheetMetricRow}>
                <Text style={styles.sheetMetricLabel}>Revenue (est.)</Text>
                <Text style={styles.sheetMetricValue}>${earning.cons_rev.toFixed(1)}B</Text>
              </View>
            )}
          </View>

          {(earning.actual_eps !== undefined || earning.actual_rev !== undefined) && (
            <View style={styles.sheetSection}>
              <Text style={styles.sheetSectionTitle}>Actuals</Text>
              {earning.actual_eps !== undefined && (
                <View style={styles.sheetMetricRow}>
                  <Text style={styles.sheetMetricLabel}>EPS</Text>
                  <Text style={styles.sheetMetricValue}>${earning.actual_eps.toFixed(2)}</Text>
                </View>
              )}
              {earning.actual_rev !== undefined && (
                <View style={styles.sheetMetricRow}>
                  <Text style={styles.sheetMetricLabel}>Revenue</Text>
                  <Text style={styles.sheetMetricValue}>${earning.actual_rev.toFixed(1)}B</Text>
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
    color: '#FFD75A',
    fontWeight: '700',
    textDecorationLine: 'underline' as const,
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
    marginBottom: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  watchlistPill: {
    borderWidth: 1,
    borderColor: '#3a2f14',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  watchlistPillText: {
    color: '#E7C15F',
    fontWeight: '700' as const,
    fontSize: 12,
  },
  companyOverview: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  goldDividerTop: {
    height: 1,
    backgroundColor: '#FFD75A',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    minHeight: 44,
    backgroundColor: '#000000',
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFD75A',
  },
  earningsTable: {
    backgroundColor: '#000000',
  },
  earningsRow: {
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  earningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  earningsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  earningsTicker: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  earningsSessionPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 215, 90, 0.15)',
    borderRadius: 4,
  },
  earningsSessionText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFD75A',
    fontFamily: 'monospace',
  },
  earningsDate: {
    fontSize: 11,
    color: '#777777',
    fontFamily: 'monospace',
  },
  earningsVerdict: {
    marginBottom: 8,
  },
  verdictBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: 1,
  },
  verdictBeatBadge: {
    borderColor: '#00FF66',
  },
  verdictMissBadge: {
    borderColor: '#FF4444',
  },
  verdictBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  verdictBeatText: {
    color: '#00FF66',
  },
  verdictMissText: {
    color: '#FF4444',
  },
  earningsMetrics: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  metric: {
    flexDirection: 'column',
  },
  metricLabel: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  metricCons: {
    fontSize: 10,
    color: '#777777',
    marginTop: 2,
  },
  timeFilterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'flex-end',
    backgroundColor: '#000000',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  modalContentWrapper: {
    width: '90%',
    maxWidth: 500,
  },
  earningsSheetContent: {
    backgroundColor: '#0A0A0A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD75A',
    padding: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFD75A',
    fontFamily: 'monospace',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 215, 90, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFD75A',
    fontWeight: '700',
  },
  sheetSection: {
    marginBottom: 16,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sheetLabel: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '600',
  },
  sheetValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  sheetSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD75A',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  sheetMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sheetMetricLabel: {
    fontSize: 12,
    color: '#999999',
  },
  sheetMetricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  verdictBadgeLarge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 2,
  },
  verdictBadgeTextLarge: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  upcomingEarningsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  upcomingEarningsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E7C15F',
    marginBottom: 12,
  },
  upcomingEarningsCard: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#3a2f14',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  upcomingTickerPill: {
    backgroundColor: 'rgba(231, 193, 95, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  upcomingTickerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E7C15F',
    fontFamily: 'monospace',
  },
  upcomingSessionPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 215, 90, 0.15)',
    borderRadius: 4,
  },
  upcomingSessionText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFD75A',
    fontFamily: 'monospace',
  },
  upcomingDate: {
    fontSize: 11,
    color: '#999999',
    fontFamily: 'monospace',
    marginLeft: 'auto',
  },
  upcomingMetrics: {
    marginTop: 4,
  },
  upcomingMetricsRow: {
    fontSize: 11,
    lineHeight: 16,
  },
  upcomingMetricLabel: {
    fontSize: 11,
    color: '#777777',
  },
  upcomingMetricValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  metricSeparator: {
    fontSize: 11,
    color: '#555555',
  },
});
