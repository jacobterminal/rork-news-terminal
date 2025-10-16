import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { FeedItem } from '@/types/news';
import { useNewsStore } from '@/store/newsStore';
import NewsArticleModal from './NewsArticleModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CompanyInfoModalProps {
  visible: boolean;
  ticker: string | null;
  companyName?: string;
  onClose: () => void;
}

interface CompanyData {
  ticker: string;
  companyName: string;
  sector: string;
  exchange: string;
  overview: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  sentimentBreakdown: {
    bullish: number;
    bearish: number;
    neutral: number;
  };
  lastUpdated: string;
  recentNews: FeedItem[];
}

export default function CompanyInfoModal({
  visible,
  ticker,
  companyName,
  onClose,
}: CompanyInfoModalProps) {
  const { state } = useNewsStore();
  const [translateY] = useState(new Animated.Value(SCREEN_HEIGHT));
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<FeedItem | null>(null);
  const [showArticleModal, setShowArticleModal] = useState(false);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 5;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 150 || gestureState.vy > 0.5) {
        handleClose();
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }).start();
      }
    },
  });

  useEffect(() => {
    if (visible && ticker) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      generateCompanyData();
    } else {
      setCompanyData(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, ticker]);

  const generateCompanyData = () => {
    if (!ticker) return;

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const tickerNews = (state.feedItems || []).filter(
      (item: FeedItem) => item.tickers.includes(ticker) && 
              new Date(item.published_at).getTime() > sevenDaysAgo
    );

    const bullishCount = tickerNews.filter((item: FeedItem) => item.classification.sentiment === 'Bullish').length;
    const bearishCount = tickerNews.filter((item: FeedItem) => item.classification.sentiment === 'Bearish').length;
    const neutralCount = tickerNews.filter((item: FeedItem) => item.classification.sentiment === 'Neutral').length;

    const totalNews = tickerNews.length || 1;
    const bullishPercent = Math.round((bullishCount / totalNews) * 100);
    const bearishPercent = Math.round((bearishCount / totalNews) * 100);
    const neutralPercent = Math.round((neutralCount / totalNews) * 100);

    const overallSentiment: 'Bullish' | 'Bearish' | 'Neutral' = 
      bullishCount > bearishCount && bullishCount > neutralCount ? 'Bullish' :
      bearishCount > bullishCount && bearishCount > neutralCount ? 'Bearish' :
      'Neutral';

    let overview = '';
    let sector = '';
    let displayName = companyName || ticker;

    switch (ticker) {
      case 'AAPL':
        displayName = 'Apple Inc.';
        sector = 'Technology';
        overview = 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company is known for its iPhone product line, Mac computers, iPad tablets, and services including the App Store, Apple Music, and iCloud. Apple maintains a significant presence in consumer technology with a focus on premium hardware and integrated software ecosystems.';
        break;
      case 'NVDA':
        displayName = 'NVIDIA Corporation';
        sector = 'Technology / Semiconductors';
        overview = 'NVIDIA Corporation is a leading designer of graphics processing units (GPUs) for gaming and professional markets, as well as system-on-chip units for mobile computing and automotive markets. Recently, NVIDIA has become a dominant force in artificial intelligence and machine learning, with its data center GPUs powering the majority of AI training and inference workloads globally.';
        break;
      case 'TSLA':
        displayName = 'Tesla, Inc.';
        sector = 'Automotive / Clean Energy';
        overview = 'Tesla, Inc. designs, develops, manufactures, and sells electric vehicles and energy generation and storage systems. The company operates automotive and energy generation and storage segments, with a focus on accelerating the transition to sustainable energy. Tesla is known for its Model S, Model 3, Model X, Model Y vehicles, as well as solar energy products and battery storage solutions.';
        break;
      case 'MSFT':
        displayName = 'Microsoft Corporation';
        sector = 'Technology';
        overview = 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide. The company operates through segments including Productivity and Business Processes, Intelligent Cloud, and More Personal Computing. Microsoft is known for Windows OS, Office productivity suite, Azure cloud platform, and recent advances in AI through partnerships with OpenAI.';
        break;
      case 'GOOGL':
        displayName = 'Alphabet Inc.';
        sector = 'Technology / Internet';
        overview = 'Alphabet Inc., through its subsidiaries, provides various products and services in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America. The company operates through Google Services, Google Cloud, and Other Bets segments. Core products include Google Search, YouTube, Android, Chrome, and cloud computing services.';
        break;
      case 'META':
        displayName = 'Meta Platforms, Inc.';
        sector = 'Technology / Social Media';
        overview = 'Meta Platforms, Inc. engages in the development of products that enable people to connect and share with friends and family through mobile devices, personal computers, virtual reality headsets, and wearables worldwide. The company operates Facebook, Instagram, Messenger, WhatsApp, and is investing heavily in metaverse technologies through its Reality Labs division.';
        break;
      case 'AMZN':
        displayName = 'Amazon.com, Inc.';
        sector = 'E-commerce / Cloud Computing';
        overview = 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions through online and physical stores in North America and internationally. The company operates through three segments: North America, International, and Amazon Web Services (AWS). AWS is a leading cloud computing platform serving millions of customers globally.';
        break;
      case 'SPY':
        displayName = 'S&P 500 ETF';
        sector = 'Index Fund';
        overview = 'The SPDR S&P 500 ETF Trust seeks to provide investment results that, before expenses, correspond generally to the price and yield performance of the S&P 500 Index. This ETF is one of the largest and most liquid exchange-traded funds, providing broad exposure to the U.S. large-cap equity market.';
        break;
      case 'QQQ':
        displayName = 'Nasdaq-100 ETF';
        sector = 'Index Fund';
        overview = 'The Invesco QQQ Trust tracks the Nasdaq-100 Index, which includes 100 of the largest domestic and international non-financial companies listed on the Nasdaq Stock Market. The fund provides exposure to major technology and growth companies including Apple, Microsoft, Amazon, NVIDIA, and Meta.';
        break;
      case 'BABA':
        displayName = 'Alibaba Group';
        sector = 'E-commerce / Technology';
        overview = 'Alibaba Group Holding Limited operates e-commerce platforms in China and internationally. The company provides technology infrastructure and marketing reach to merchants, brands, retailers, and other businesses. Alibaba operates through core commerce, cloud computing, digital media and entertainment, and innovation initiatives.';
        break;
      default:
        displayName = companyName || ticker;
        sector = 'General Market';
        overview = `${displayName} is a publicly traded company with the ticker symbol ${ticker}. Recent market activity and news sentiment suggest ${overallSentiment.toLowerCase()} positioning. Detailed company information will be available pending data integration with financial APIs.`;
    }

    setCompanyData({
      ticker,
      companyName: displayName,
      sector,
      exchange: 'NASDAQ',
      overview,
      sentiment: overallSentiment,
      sentimentBreakdown: {
        bullish: bullishPercent,
        bearish: bearishPercent,
        neutral: neutralPercent,
      },
      lastUpdated: new Date().toISOString(),
      recentNews: tickerNews.slice(0, 10),
    });
  };

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleNewsPress = (newsItem: FeedItem) => {
    setSelectedArticle(newsItem);
    setShowArticleModal(true);
  };

  const getSentimentIcon = (sent: 'Bullish' | 'Bearish' | 'Neutral') => {
    const iconSize = 18;
    switch (sent) {
      case 'Bullish':
        return <TrendingUp size={iconSize} color="#00FF66" />;
      case 'Bearish':
        return <TrendingDown size={iconSize} color="#FF4444" />;
      default:
        return <Minus size={iconSize} color="#FFD75A" />;
    }
  };

  const getSentimentColor = (sent: 'Bullish' | 'Bearish' | 'Neutral') => {
    switch (sent) {
      case 'Bullish':
        return '#00FF66';
      case 'Bearish':
        return '#FF4444';
      default:
        return '#FFD75A';
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return timeString;
    }
  };

  const formatDate = (timeString: string) => {
    try {
      const date = new Date(timeString);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return timeString;
    }
  };

  if (!ticker) return null;

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.backdrop} 
            activeOpacity={1} 
            onPress={handleClose}
          />
          
          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ translateY }] },
            ]}
          >
            <View {...panResponder.panHandlers} style={styles.dragHandle}>
              <View style={styles.dragIndicator} />
            </View>

            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollView} 
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={styles.contentContainer}>
                <Text style={styles.tickerSymbol}>{ticker}</Text>
                <Text style={styles.companyName}>
                  {companyData?.companyName || 'Loading...'}
                </Text>
                {companyData && (
                  <Text style={styles.sectorText}>
                    {companyData.sector} • {companyData.exchange}
                  </Text>
                )}

                <View style={styles.divider} />

                {companyData && (
                  <>
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>COMPANY OVERVIEW (AI GENERATED)</Text>
                      <Text style={styles.overviewText}>{companyData.overview}</Text>
                    </View>

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>MARKET OVERVIEW</Text>
                      <View style={styles.sentimentRow}>
                        {getSentimentIcon(companyData.sentiment)}
                        <Text style={[
                          styles.sentimentLabel,
                          { color: getSentimentColor(companyData.sentiment) }
                        ]}>
                          {companyData.sentiment} Sentiment
                        </Text>
                      </View>
                      
                      <View style={styles.sentimentBarsContainer}>
                        <View style={styles.sentimentBarRow}>
                          <View style={styles.sentimentBarLabel}>
                            <View style={[styles.sentimentDot, { backgroundColor: '#00FF66' }]} />
                            <Text style={styles.sentimentBarText}>Bullish</Text>
                          </View>
                          <View style={styles.sentimentBarTrack}>
                            <View 
                              style={[
                                styles.sentimentBarFill, 
                                { 
                                  width: `${companyData.sentimentBreakdown.bullish}%`,
                                  backgroundColor: '#00FF66'
                                }
                              ]} 
                            />
                          </View>
                          <Text style={styles.sentimentPercentage}>
                            {companyData.sentimentBreakdown.bullish}%
                          </Text>
                        </View>

                        <View style={styles.sentimentBarRow}>
                          <View style={styles.sentimentBarLabel}>
                            <View style={[styles.sentimentDot, { backgroundColor: '#FF4444' }]} />
                            <Text style={styles.sentimentBarText}>Bearish</Text>
                          </View>
                          <View style={styles.sentimentBarTrack}>
                            <View 
                              style={[
                                styles.sentimentBarFill, 
                                { 
                                  width: `${companyData.sentimentBreakdown.bearish}%`,
                                  backgroundColor: '#FF4444'
                                }
                              ]} 
                            />
                          </View>
                          <Text style={styles.sentimentPercentage}>
                            {companyData.sentimentBreakdown.bearish}%
                          </Text>
                        </View>

                        <View style={styles.sentimentBarRow}>
                          <View style={styles.sentimentBarLabel}>
                            <View style={[styles.sentimentDot, { backgroundColor: '#888888' }]} />
                            <Text style={styles.sentimentBarText}>Neutral</Text>
                          </View>
                          <View style={styles.sentimentBarTrack}>
                            <View 
                              style={[
                                styles.sentimentBarFill, 
                                { 
                                  width: `${companyData.sentimentBreakdown.neutral}%`,
                                  backgroundColor: '#888888'
                                }
                              ]} 
                            />
                          </View>
                          <Text style={styles.sentimentPercentage}>
                            {companyData.sentimentBreakdown.neutral}%
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.updatedText}>
                        Updated: {formatTime(companyData.lastUpdated)}
                      </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>RECENT NEWS (PAST 7 DAYS)</Text>
                      
                      {companyData.recentNews.length === 0 ? (
                        <Text style={styles.noNewsText}>
                          No recent news available for {ticker}
                        </Text>
                      ) : (
                        <View style={styles.newsList}>
                          {companyData.recentNews.map((newsItem, index) => (
                            <TouchableOpacity
                              key={newsItem.id}
                              style={[
                                styles.newsCard,
                                index > 0 && styles.newsCardBorder,
                                { borderLeftColor: getSentimentColor(newsItem.classification.sentiment) }
                              ]}
                              onPress={() => handleNewsPress(newsItem)}
                              activeOpacity={0.7}
                            >
                              <View style={styles.newsHeader}>
                                <Text style={styles.newsSource}>
                                  {typeof newsItem.source === 'object' ? newsItem.source.name : newsItem.source}
                                </Text>
                                <Text style={styles.newsTime}>
                                  {formatDate(newsItem.published_at)} • {formatTime(newsItem.published_at)}
                                </Text>
                              </View>
                              
                              <Text style={styles.newsTitle} numberOfLines={2}>
                                {newsItem.title}
                              </Text>
                              
                              <View style={styles.newsFooter}>
                                <View style={[
                                  styles.impactPill,
                                  newsItem.classification.impact === 'High' && styles.highImpact,
                                  newsItem.classification.impact === 'Medium' && styles.mediumImpact,
                                  newsItem.classification.impact === 'Low' && styles.lowImpact,
                                ]}>
                                  <Text style={[
                                    styles.impactText,
                                    newsItem.classification.impact === 'High' && styles.highImpactText,
                                    newsItem.classification.impact === 'Medium' && styles.mediumImpactText,
                                    newsItem.classification.impact === 'Low' && styles.lowImpactText,
                                  ]}>
                                    {newsItem.classification.impact}
                                  </Text>
                                </View>
                                
                                <View style={styles.newsSentiment}>
                                  {getSentimentIcon(newsItem.classification.sentiment)}
                                  <Text style={[
                                    styles.newsConfidence,
                                    { color: getSentimentColor(newsItem.classification.sentiment) }
                                  ]}>
                                    {newsItem.classification.sentiment} {newsItem.classification.confidence}%
                                  </Text>
                                </View>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </>
                )}

                <View style={styles.disclaimer}>
                  <Text style={styles.disclaimerText}>
                    Company information is AI-generated and for informational purposes only. Not financial advice.
                  </Text>
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      <NewsArticleModal
        visible={showArticleModal}
        article={selectedArticle}
        onClose={() => {
          setShowArticleModal(false);
          setSelectedArticle(null);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: '#000000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 2,
    borderTopColor: '#FFD75A',
    height: SCREEN_HEIGHT * 0.9,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  tickerSymbol: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFD75A',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#EAEAEA',
    marginBottom: 4,
  },
  sectorText: {
    fontSize: 14,
    color: '#A1A1A1',
  },
  divider: {
    height: 1,
    backgroundColor: '#1A1A1A',
    marginVertical: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFD75A',
    marginBottom: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  overviewText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 24,
  },
  sentimentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sentimentLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  sentimentBarsContainer: {
    gap: 12,
    marginBottom: 12,
  },
  sentimentBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sentimentBarLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 70,
  },
  sentimentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sentimentBarText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500' as const,
  },
  sentimentBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  sentimentBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  sentimentPercentage: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600' as const,
    width: 40,
    textAlign: 'right',
  },
  updatedText: {
    fontSize: 11,
    color: '#888888',
    fontStyle: 'italic' as const,
  },
  newsList: {
    gap: 0,
  },
  newsCard: {
    paddingVertical: 16,
    paddingLeft: 12,
    borderLeftWidth: 2,
  },
  newsCardBorder: {
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  newsSource: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
  },
  newsTime: {
    fontSize: 11,
    color: '#666666',
  },
  newsTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 10,
  },
  newsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  impactPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  highImpact: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderColor: '#FF4444',
  },
  mediumImpact: {
    backgroundColor: 'rgba(255, 140, 0, 0.1)',
    borderColor: '#FF8C00',
  },
  lowImpact: {
    backgroundColor: 'rgba(108, 117, 125, 0.1)',
    borderColor: '#6C757D',
  },
  impactText: {
    fontSize: 10,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
  },
  highImpactText: {
    color: '#FF4444',
  },
  mediumImpactText: {
    color: '#FF8C00',
  },
  lowImpactText: {
    color: '#6C757D',
  },
  newsSentiment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  newsConfidence: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  noNewsText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    paddingVertical: 24,
    fontStyle: 'italic' as const,
  },
  disclaimer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  disclaimerText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic' as const,
  },
});
