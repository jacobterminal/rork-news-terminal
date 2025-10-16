import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router, useSegments } from 'expo-router';
import { ArrowLeft, Plus, TrendingUp, TrendingDown } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeedItem, CriticalAlert } from '../../types/news';
import NewsCard from '../../components/NewsCard';
import NewsArticleModal from '../../components/NewsArticleModal';
import WatchlistFolderPicker from '../../components/WatchlistFolderPicker';
import CreateFolderModal from '../../components/CreateFolderModal';
import { useNewsStore } from '../../store/newsStore';
import { useDropdown } from '../../store/dropdownStore';

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

export default function CompanyProfileScreen() {
  const { ticker } = useLocalSearchParams<{ ticker: string }>();
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const { registerDropdown, shouldCloseDropdown } = useDropdown();
  const dropdownId = 'company-folder-picker';
  
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
    registerDropdown(dropdownId, folderPickerVisible || createFolderModalVisible);
  }, [folderPickerVisible, createFolderModalVisible, registerDropdown, dropdownId]);

  const tickerUpper = ticker?.toUpperCase() || '';
  const companyName = COMPANY_NAMES[tickerUpper] || `${tickerUpper} Corporation`;
  const companyIndustry = COMPANY_INDUSTRY[tickerUpper] || 'Unknown Industry';
  const companyOverview = COMPANY_OVERVIEW[tickerUpper] || `${companyName} operates in various market segments providing products and services worldwide.`;

  const watchlistFolders = useMemo(() => state.watchlistFolders || [], [state.watchlistFolders]);

  const companyAlerts = useMemo(() => {
    return criticalAlerts
      .filter(alert => alert.tickers && alert.tickers.includes(tickerUpper))
      .filter(alert => {
        const alertTime = new Date(alert.published_at).getTime();
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return alertTime > sevenDaysAgo;
      })
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  }, [criticalAlerts, tickerUpper]);

  const companyNews = useMemo(() => {
    return state.feedItems
      .filter(item => item.tickers && item.tickers.includes(tickerUpper))
      .filter(item => {
        const newsTime = new Date(item.published_at).getTime();
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return newsTime > sevenDaysAgo;
      })
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  }, [state.feedItems, tickerUpper]);

  const overallSentiment = useMemo(() => {
    if (companyNews.length === 0) return 'Neutral';
    
    const sentiments = companyNews.map(news => news.classification.sentiment);
    const bullishCount = sentiments.filter(s => s === 'Bullish').length;
    const bearishCount = sentiments.filter(s => s === 'Bearish').length;
    
    if (bullishCount > bearishCount) return 'Bullish';
    if (bearishCount > bullishCount) return 'Bearish';
    return 'Neutral';
  }, [companyNews]);

  const avgConfidence = useMemo(() => {
    if (companyNews.length === 0) return 0;
    const total = companyNews.reduce((sum, news) => sum + news.classification.confidence, 0);
    return Math.round(total / companyNews.length);
  }, [companyNews]);

  const handleBack = () => {
    const mainPages = ['/instant', '/index', '/upcoming', '/watchlist', '/twitter'];
    
    if (mainPages.includes(lastRoute)) {
      router.replace(lastRoute as any);
    } else {
      router.replace('/instant');
    }
  };

  const handleAddToWatchlist = () => {
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
    router.push(`/company/${ticker}`);
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#FFD75A" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.tickerTitle}>{tickerUpper}</Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddToWatchlist}
          activeOpacity={0.7}
        >
          <Plus size={20} color="#FFD75A" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{companyName}</Text>
          <Text style={styles.companyIndustry}>{companyIndustry}</Text>
        </View>

        <View style={styles.miniMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Sentiment</Text>
            <View style={styles.sentimentRow}>
              {overallSentiment === 'Bullish' && <TrendingUp size={14} color="#00FF66" />}
              {overallSentiment === 'Bearish' && <TrendingDown size={14} color="#FF4444" />}
              <Text style={[
                styles.metricValue,
                overallSentiment === 'Bullish' && styles.bullishText,
                overallSentiment === 'Bearish' && styles.bearishText,
                overallSentiment === 'Neutral' && styles.neutralText,
              ]}>
                {overallSentiment}
              </Text>
            </View>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Confidence</Text>
            <Text style={styles.metricValue}>{avgConfidence}%</Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Articles (7d)</Text>
            <Text style={styles.metricValue}>{companyNews.length}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COMPANY OVERVIEW</Text>
          <Text style={styles.overviewText}>{companyOverview}</Text>
        </View>

        {companyAlerts.length > 0 && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>CRITICAL ALERTS</Text>
            </View>
            {companyAlerts.map(alert => (
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
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>COMPANY NEWS</Text>
        </View>

        {companyNews.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No recent news for {tickerUpper}</Text>
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

        {relatedTickers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>RELATED TICKERS</Text>
            <View style={styles.relatedTickers}>
              {relatedTickers.map(ticker => (
                <TouchableOpacity
                  key={ticker}
                  style={styles.relatedTickerPill}
                  onPress={() => handleTickerPress(ticker)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.relatedTickerText}>{ticker}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#000000',
  },
  backButton: {
    padding: 6,
    width: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  tickerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFD75A',
    letterSpacing: 0.5,
  },
  addButton: {
    padding: 6,
    width: 40,
    alignItems: 'flex-end',
  },
  divider: {
    height: 1,
    backgroundColor: '#FFD75A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  companyInfo: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  companyIndustry: {
    fontSize: 13,
    color: '#A1A1A1',
  },
  miniMetrics: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 20,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: '#777777',
    textTransform: 'uppercase',
    marginBottom: 4,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sentimentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bullishText: {
    color: '#00FF66',
  },
  bearishText: {
    color: '#FF4444',
  },
  neutralText: {
    color: '#FFD75A',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD75A',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  overviewText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 20,
    marginTop: 8,
  },
  alertCard: {
    backgroundColor: '#0A0A0A',
    borderLeftWidth: 2,
    borderLeftColor: '#FFD75A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 8,
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
  relatedTickers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  relatedTickerPill: {
    backgroundColor: 'rgba(255, 215, 90, 0.1)',
    borderWidth: 1,
    borderColor: '#FFD75A',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  relatedTickerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFD75A',
  },
});
