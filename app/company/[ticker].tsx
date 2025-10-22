import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { ArrowLeft, ArrowUp } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeedItem, CriticalAlert, EarningsItem, EconItem } from '../../types/news';
import NewsCard from '../../components/NewsCard';
import NewsArticleModal from '../../components/NewsArticleModal';
import TimeRangeFilterPill, { TimeRange, CustomTimeRange } from '../../components/TimeRangeFilterPill';
import WatchlistFolderPicker from '../../components/WatchlistFolderPicker';
import CreateFolderModal from '../../components/CreateFolderModal';
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

const SECTOR_ETF_MAP: Record<string, string> = {
  'AAPL': 'XLK',
  'NVDA': 'XLK',
  'MSFT': 'XLK',
  'GOOGL': 'XLK',
  'META': 'XLK',
  'AMZN': 'XLY',
  'TSLA': 'XLY',
  'JPM': 'XLF',
  'BAC': 'XLF',
  'WMT': 'XLY',
};

const BROAD_ETFS = ['SPY', 'QQQ', 'DIA', 'IWM', 'DXY'];
const SECTOR_ETFS = ['XLK', 'XLF', 'XLY', 'XLI', 'XLE', 'XLV', 'XLP', 'XLU', 'XLB', 'XLRE'];
const US_LISTED_TICKERS = Object.keys(COMPANY_NAMES);

let lastBackPressTime = 0;
const BACK_DEBOUNCE_MS = 500;

export default function TickerDetailPage() {
  const { ticker } = useLocalSearchParams<{ ticker: string }>();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { registerDropdown, shouldCloseDropdown } = useDropdown();
  const dropdownId = 'company-folder-picker';
  const { returnContext, clearReturnContext } = useNavigationStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const currentScrollYRef = useRef(0);
  
  const { 
    state, 
    criticalAlerts,
    activeFolderId,
    addTickerToFolder,
    createFolder,
  } = useNewsStore();

  const earningsItems = state.earnings || [];
  const econItems = state.econ || [];

  const [selectedArticle, setSelectedArticle] = useState<FeedItem | CriticalAlert | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEarnings, setSelectedEarnings] = useState<EarningsItem | null>(null);
  const [earningsModalVisible, setEarningsModalVisible] = useState(false);
  const [selectedEconEvent, setSelectedEconEvent] = useState<EconItem | null>(null);
  const [econModalVisible, setEconModalVisible] = useState(false);
  const [folderPickerVisible, setFolderPickerVisible] = useState(false);
  const [createFolderModalVisible, setCreateFolderModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'news' | 'earnings' | 'econ'>('news');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('today');
  const [customTimeRange, setCustomTimeRange] = useState<CustomTimeRange | undefined>(undefined);



  useEffect(() => {
    if (shouldCloseDropdown(dropdownId)) {
      setFolderPickerVisible(false);
      setCreateFolderModalVisible(false);
    }
  }, [shouldCloseDropdown, dropdownId]);

  useEffect(() => {
    const isAnyOpen = folderPickerVisible || createFolderModalVisible;
    registerDropdown(dropdownId, isAnyOpen);
  }, [folderPickerVisible, createFolderModalVisible, dropdownId, registerDropdown]);

  const tickerUpper = ticker?.toUpperCase() || '';
  const companyName = COMPANY_NAMES[tickerUpper] || `${tickerUpper} Corporation`;
  const companyIndustry = COMPANY_INDUSTRY[tickerUpper] || 'Unknown Industry';
  const companyOverview = COMPANY_OVERVIEW[tickerUpper] || `${companyName} operates in various market segments providing products and services worldwide.`;

  const watchlistFolders = useMemo(() => state.watchlistFolders || [], [state.watchlistFolders]);

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

  const companyEarnings = useMemo(() => {
    const now = Date.now();
    return earningsItems
      .filter(item => item.ticker === tickerUpper)
      .filter(item => {
        const eventTime = new Date(item.scheduled_at).getTime();
        return eventTime >= now;
      })
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  }, [earningsItems, tickerUpper]);

  const relevantEconEvents = useMemo(() => {
    const isUSListed = US_LISTED_TICKERS.includes(tickerUpper);
    const sectorETF = SECTOR_ETF_MAP[tickerUpper];
    const isBroadETF = BROAD_ETFS.includes(tickerUpper);
    const isSectorETF = SECTOR_ETFS.includes(tickerUpper);

    return econItems
      .filter(item => {
        const eventTime = new Date(item.scheduled_at).getTime();
        const cutoffTime = Date.now() - timeRangeInMs;
        if (eventTime <= cutoffTime) return false;

        if (isBroadETF || isSectorETF) {
          return item.impact === 'High' && item.country === 'US';
        }

        if (isUSListed) {
          const broadETFRelated = BROAD_ETFS.some(etf => 
            item.name.includes(etf) || item.id.includes(etf.toLowerCase())
          );
          if (broadETFRelated) return true;
        }

        if (sectorETF) {
          const sectorRelated = item.name.includes(sectorETF) || item.id.includes(sectorETF.toLowerCase());
          if (sectorRelated) return true;
        }

        return false;
      })
      .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
  }, [econItems, timeRangeInMs, tickerUpper]);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    currentScrollYRef.current = offsetY;
    const screenHeight = event.nativeEvent.layoutMeasurement.height;
    setShowScrollToTop(offsetY > screenHeight * 2);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleBack = () => {
    const now = Date.now();
    if (now - lastBackPressTime < BACK_DEBOUNCE_MS) {
      console.log('[CompanyPage] Back debounced');
      return;
    }
    lastBackPressTime = now;

    console.log('[CompanyPage] Back pressed');

    if (navigation.canGoBack()) {
      console.log('[CompanyPage] Using navigation.goBack()');
      navigation.goBack();
      clearReturnContext();
      return;
    }

    if (returnContext) {
      console.log('[CompanyPage] Restoring context:', returnContext);
      
      const validRoutes = ['instant', 'index', 'upcoming', 'watchlist', 'twitter', 'search'];
      const routeName = returnContext.routeName.replace(/^\//g, '');
      
      if (validRoutes.includes(routeName) || routeName === '') {
        const targetRoute = routeName === '' ? '/instant' : `/${routeName}`;
        router.push(targetRoute as any);
        clearReturnContext();
      } else {
        router.push('/instant');
        clearReturnContext();
      }
      return;
    }

    console.log('[CompanyPage] Fallback to /instant');
    router.push('/instant');
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

  const handleEarningsPress = (earning: EarningsItem) => {
    setSelectedEarnings(earning);
    setEarningsModalVisible(true);
  };

  const handleEconPress = (event: EconItem) => {
    setSelectedEconEvent(event);
    setEconModalVisible(true);
  };

  const handleExpandTo7Days = () => {
    setSelectedTimeRange('week_to_date');
    setCustomTimeRange(undefined);
  };

  const handleTickerPress = (ticker: string) => {
    if (ticker === tickerUpper) return;
    
    const stateToPreserve = {
      activeTab,
      selectedTimeRange,
      customTimeRange,
      scrollY: currentScrollYRef.current,
    };
    console.log('[CompanyPage] Navigating to', ticker, 'with preserved state:', stateToPreserve);
    
    router.push(`/company/${ticker}`);
  };



  const headerHeight = Platform.select({ web: 64, default: 56 });
  const backRowHeight = 44;

  return (
    <View style={styles.container}>
      <View style={[styles.fixedBackRow, { top: insets.top + headerHeight }]}>
        <View style={styles.goldDivider} />
        <TouchableOpacity
          style={styles.backButtonFixed}
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft size={18} color="#FFD75A" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { 
          paddingTop: insets.top + headerHeight + backRowHeight + 16,
          paddingBottom: insets.bottom + 24,
        }]}
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

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'news' && styles.tabActive]}
            onPress={() => setActiveTab('news')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'news' && styles.tabTextActive]}>News</Text>
          </TouchableOpacity>
          {companyEarnings.length > 0 && (
            <TouchableOpacity
              style={[styles.tab, activeTab === 'earnings' && styles.tabActive]}
              onPress={() => setActiveTab('earnings')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'earnings' && styles.tabTextActive]}>Earnings</Text>
            </TouchableOpacity>
          )}
          {relevantEconEvents.length > 0 && (
            <TouchableOpacity
              style={[styles.tab, activeTab === 'econ' && styles.tabActive]}
              onPress={() => setActiveTab('econ')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'econ' && styles.tabTextActive]}>Econ Events</Text>
            </TouchableOpacity>
          )}
        </View>

        {activeTab !== 'earnings' && (
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
        )}

        {activeTab === 'news' && companyAlerts.length > 0 && (
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

        {activeTab === 'news' && (
          <>
            <View style={styles.sectionHeaderContainer}>
              <View style={styles.topDivider} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ALL NEWS FEED</Text>
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
          </>
        )}

        {activeTab === 'earnings' && (
          <>
            <View style={styles.sectionHeaderContainer}>
              <View style={styles.topDivider} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>EARNINGS</Text>
              </View>
              <View style={styles.bottomDivider} />
            </View>

            {companyEarnings.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No upcoming earnings scheduled.</Text>
              </View>
            ) : (
              <View style={styles.earningsTable}>
                {companyEarnings.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.earningsRow}
                    onPress={() => handleEarningsPress(item)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.earningsHeader}>
                      <View style={styles.earningsLeft}>
                        <Text style={styles.earningsTicker}>{item.ticker}</Text>
                        <View style={styles.earningsSessionPill}>
                          <Text style={styles.earningsSessionText}>{item.report_time}</Text>
                        </View>
                      </View>
                      <Text style={styles.earningsDate}>
                        {new Date(item.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                    {item.verdict && (
                      <View style={styles.earningsVerdict}>
                        <View style={[
                          styles.verdictBadge,
                          item.verdict === 'Beat' && styles.verdictBeatBadge,
                          item.verdict === 'Miss' && styles.verdictMissBadge,
                        ]}>
                          <Text style={[
                            styles.verdictBadgeText,
                            item.verdict === 'Beat' && styles.verdictBeatText,
                            item.verdict === 'Miss' && styles.verdictMissText,
                          ]}>{item.verdict.toUpperCase()}</Text>
                        </View>
                      </View>
                    )}
                    <View style={styles.earningsMetrics}>
                      {item.actual_eps !== undefined && (
                        <View style={styles.metric}>
                          <Text style={styles.metricLabel}>EPS</Text>
                          <Text style={styles.metricValue}>${item.actual_eps.toFixed(2)}</Text>
                          {item.cons_eps !== undefined && (
                            <Text style={styles.metricCons}>(est. ${item.cons_eps.toFixed(2)})</Text>
                          )}
                        </View>
                      )}
                      {item.actual_rev !== undefined && (
                        <View style={styles.metric}>
                          <Text style={styles.metricLabel}>Revenue</Text>
                          <Text style={styles.metricValue}>${item.actual_rev.toFixed(1)}B</Text>
                          {item.cons_rev !== undefined && (
                            <Text style={styles.metricCons}>(est. ${item.cons_rev.toFixed(1)}B)</Text>
                          )}
                        </View>
                      )}
                      {item.cons_eps !== undefined && item.actual_eps === undefined && (
                        <View style={styles.metric}>
                          <Text style={styles.metricLabel}>Expected EPS</Text>
                          <Text style={styles.metricValue}>${item.cons_eps.toFixed(2)}</Text>
                        </View>
                      )}
                      {item.cons_rev !== undefined && item.actual_rev === undefined && (
                        <View style={styles.metric}>
                          <Text style={styles.metricLabel}>Expected Revenue</Text>
                          <Text style={styles.metricValue}>${item.cons_rev.toFixed(1)}B</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {activeTab === 'econ' && (
          <>
            <View style={styles.sectionHeaderContainer}>
              <View style={styles.topDivider} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ECONOMIC EVENTS</Text>
              </View>
              <View style={styles.bottomDivider} />
            </View>

            {relevantEconEvents.length === 0 ? (
              <View style={styles.emptyState}>
                <TouchableOpacity onPress={handleExpandTo7Days} activeOpacity={0.7}>
                  <Text style={styles.emptyText}>No events in this range</Text>
                  <Text style={styles.emptyTextLink}>• Expand to 7 Days</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.econTable}>
                {relevantEconEvents.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.econRow}
                    onPress={() => handleEconPress(item)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.econHeader}>
                      <Text style={styles.econName}>{item.name}</Text>
                      <View style={[
                        styles.econImpactBadge,
                        item.impact === 'High' && styles.econImpactHigh,
                        item.impact === 'Medium' && styles.econImpactMedium,
                        item.impact === 'Low' && styles.econImpactLow,
                      ]}>
                        <Text style={styles.econImpactText}>{item.impact.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={styles.econTime}>
                      {new Date(item.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {new Date(item.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <View style={styles.econMetrics}>
                      {item.actual !== undefined && item.actual !== null && (
                        <View style={styles.econMetric}>
                          <Text style={styles.econMetricLabel}>Actual</Text>
                          <Text style={styles.econMetricValue}>{item.actual}</Text>
                        </View>
                      )}
                      {item.forecast !== undefined && (
                        <View style={styles.econMetric}>
                          <Text style={styles.econMetricLabel}>Forecast</Text>
                          <Text style={styles.econMetricValue}>{item.forecast}</Text>
                        </View>
                      )}
                      {item.previous !== undefined && (
                        <View style={styles.econMetric}>
                          <Text style={styles.econMetricLabel}>Previous</Text>
                          <Text style={styles.econMetricValue}>{item.previous}</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
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

      <EarningsSheet
        visible={earningsModalVisible}
        earning={selectedEarnings}
        onClose={() => {
          setEarningsModalVisible(false);
          setSelectedEarnings(null);
        }}
      />

      <EconEventSheet
        visible={econModalVisible}
        event={selectedEconEvent}
        onClose={() => {
          setEconModalVisible(false);
          setSelectedEconEvent(null);
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
  emptyTextLink: {
    fontSize: 14,
    color: '#FFD75A',
    textAlign: 'center',
    fontWeight: '600',
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
  fixedBackRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 44,
    zIndex: 9999,
    backgroundColor: '#000000',
    justifyContent: 'center',
  },
  goldDivider: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#FFD75A',
  },
  backButtonFixed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFD75A',
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  tab: {
    paddingBottom: 4,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFD75A',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#777777',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }) as 'Courier' | 'monospace',
  },
  tabTextActive: {
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
  econTable: {
    backgroundColor: '#000000',
  },
  econRow: {
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  econHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  econName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  econImpactBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: 1,
    marginLeft: 8,
  },
  econImpactHigh: {
    borderColor: '#FF4444',
  },
  econImpactMedium: {
    borderColor: '#FFD75A',
  },
  econImpactLow: {
    borderColor: '#666666',
  },
  econImpactText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#999999',
    fontFamily: 'monospace',
  },
  econTime: {
    fontSize: 11,
    color: '#777777',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  econMetrics: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  econMetric: {
    flexDirection: 'column',
  },
  econMetricLabel: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 2,
  },
  econMetricValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  timeFilterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
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
});

type EconEventSheetProps = {
  visible: boolean;
  event: EconItem | null;
  onClose: () => void;
};

function EconEventSheet({ visible, event, onClose }: EconEventSheetProps) {
  if (!event || !visible) return null;

  const scheduledDate = new Date(event.scheduled_at);
  const dateStr = scheduledDate.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
  const timeStr = scheduledDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const hasActual = event.actual !== null && event.actual !== undefined;

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
            <Text style={styles.sheetTitle}>{event.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sheetSection}>
            <View style={styles.sheetRow}>
              <Text style={styles.sheetLabel}>Country</Text>
              <Text style={styles.sheetValue}>{event.country}</Text>
            </View>
            <View style={styles.sheetRow}>
              <Text style={styles.sheetLabel}>Scheduled</Text>
              <Text style={styles.sheetValue}>{dateStr} • {timeStr}</Text>
            </View>
            <View style={styles.sheetRow}>
              <Text style={styles.sheetLabel}>Impact</Text>
              <View style={[
                styles.econImpactBadge,
                event.impact === 'High' && styles.econImpactHigh,
                event.impact === 'Medium' && styles.econImpactMedium,
                event.impact === 'Low' && styles.econImpactLow,
              ]}>
                <Text style={styles.econImpactText}>{event.impact.toUpperCase()}</Text>
              </View>
            </View>
          </View>

          <View style={styles.sheetSection}>
            <Text style={styles.sheetSectionTitle}>Data</Text>
            {event.forecast !== undefined && (
              <View style={styles.sheetMetricRow}>
                <Text style={styles.sheetMetricLabel}>Forecast</Text>
                <Text style={styles.sheetMetricValue}>{event.forecast.toFixed(1)}%</Text>
              </View>
            )}
            {event.previous !== undefined && (
              <View style={styles.sheetMetricRow}>
                <Text style={styles.sheetMetricLabel}>Previous</Text>
                <Text style={styles.sheetMetricValue}>{event.previous.toFixed(1)}%</Text>
              </View>
            )}
            {hasActual && (
              <View style={styles.sheetMetricRow}>
                <Text style={styles.sheetMetricLabel}>Actual</Text>
                <Text style={[styles.sheetMetricValue, { color: '#00FF66' }]}>
                  {event.actual!.toFixed(1)}%
                </Text>
              </View>
            )}
          </View>

          {hasActual && event.forecast !== undefined && (
            <View style={styles.sheetSection}>
              <Text style={styles.sheetSectionTitle}>Result</Text>
              <Text style={styles.sheetValue}>
                {event.actual! > event.forecast ? 'Above Forecast' : 
                 event.actual! < event.forecast ? 'Below Forecast' : 
                 'Inline with Forecast'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
