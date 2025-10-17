import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { X } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { EarningsItem, EconItem } from '../../types/news';
import { generateMockData } from '../../utils/mockData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EventDetails {
  type: 'earnings' | 'econ';
  data: EarningsItem | EconItem;
  aiSummary: string;
  aiOverview: string;
  aiOpinion: string;
  aiForecast: string;
  impact: 'High' | 'Medium' | 'Low';
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  relatedTickers: string[];
  source: string;
  timestamp: string;
}

export default function EventDetailsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id, type } = useLocalSearchParams();
  
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [visible, setVisible] = useState<boolean>(true);
  const [translateY] = useState(new Animated.Value(SCREEN_HEIGHT));

  useEffect(() => {
    loadEventDetails();
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [id, type]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      const mockData = generateMockData();
      
      let eventData: EarningsItem | EconItem | undefined;
      let eventType: 'earnings' | 'econ' = (type as 'earnings' | 'econ') || 'earnings';
      
      if (eventType === 'earnings') {
        eventData = mockData.earnings.find(e => e.ticker === id);
      } else {
        eventData = mockData.econ.find(e => e.id === id);
      }
      
      if (!eventData) {
        console.error('[EventDetails] Event not found:', id);
        setLoading(false);
        setTimeout(() => {
          router.replace('/upcoming');
        }, 1500);
        return;
      }

      const aiContent = await generateAIContent(eventData, eventType);
      
      const details: EventDetails = {
        type: eventType,
        data: eventData,
        aiSummary: aiContent.summary,
        aiOverview: aiContent.overview,
        aiOpinion: aiContent.opinion,
        aiForecast: aiContent.forecast,
        impact: aiContent.impact,
        sentiment: aiContent.sentiment,
        confidence: aiContent.confidence,
        relatedTickers: aiContent.relatedTickers,
        source: eventType === 'earnings' ? 'Company Filing' : 'Economic Calendar',
        timestamp: eventData.scheduled_at,
      };
      
      setEventDetails(details);
    } catch (error) {
      console.error('Error loading event details:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIContent = async (
    data: EarningsItem | EconItem,
    type: 'earnings' | 'econ'
  ): Promise<{
    summary: string;
    overview: string;
    opinion: string;
    forecast: string;
    impact: 'High' | 'Medium' | 'Low';
    sentiment: 'Bullish' | 'Bearish' | 'Neutral';
    confidence: number;
    relatedTickers: string[];
  }> => {
    if (type === 'earnings') {
      const earningsData = data as EarningsItem;
      
      const hasActuals = earningsData.actual_eps !== null && earningsData.actual_eps !== undefined;
      let sentiment: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';
      let impact: 'High' | 'Medium' | 'Low' = 'Medium';
      let confidence = 50;
      
      if (hasActuals && earningsData.verdict) {
        if (earningsData.verdict === 'Beat') {
          sentiment = 'Bullish';
          impact = 'High';
          confidence = 78;
        } else if (earningsData.verdict === 'Miss') {
          sentiment = 'Bearish';
          impact = 'High';
          confidence = 72;
        } else {
          confidence = 55;
        }
      } else {
        confidence = 60;
      }
      
      const summary = hasActuals 
        ? `${earningsData.ticker} reported ${earningsData.verdict?.toLowerCase() || 'results'} with EPS of ${earningsData.actual_eps?.toFixed(2)} vs expected ${earningsData.cons_eps?.toFixed(2)}.`
        : `${earningsData.ticker} is scheduled to report earnings ${earningsData.report_time} with expected EPS of ${earningsData.cons_eps?.toFixed(2)}.`;
      
      const overview = hasActuals
        ? `${earningsData.ticker} reported ${earningsData.report_time} earnings with actual EPS of ${earningsData.actual_eps?.toFixed(2)} compared to consensus of ${earningsData.cons_eps?.toFixed(2)}. Revenue came in at ${earningsData.actual_rev?.toFixed(1)}B versus expectations of ${earningsData.cons_rev?.toFixed(1)}B. The company ${earningsData.verdict?.toLowerCase() || 'met'} analyst expectations.`
        : `${earningsData.ticker} is scheduled to report earnings ${earningsData.report_time}. Analysts expect EPS of ${earningsData.cons_eps?.toFixed(2)} and revenue of ${earningsData.cons_rev?.toFixed(1)}B. This earnings report will provide insights into the company's recent performance and future guidance.`;
      
      const opinion = `${sentiment} ${confidence}%`;
      
      const forecast = hasActuals
        ? sentiment === 'Bullish'
          ? 'Likely positive market reaction in next 24-48 hours.'
          : sentiment === 'Bearish'
          ? 'Likely negative market reaction in next 24-48 hours.'
          : 'Likely stable market reaction in next 24-48 hours.'
        : 'Likely moderate market volatility around earnings release.';
      
      return {
        summary,
        overview,
        opinion,
        forecast,
        impact,
        sentiment,
        confidence,
        relatedTickers: [earningsData.ticker],
      };
    } else {
      const econData = data as EconItem;
      const hasActual = econData.actual !== null && econData.actual !== undefined;
      
      let sentiment: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';
      let confidence = 50;
      
      if (hasActual && econData.forecast !== null && econData.forecast !== undefined) {
        if (econData.actual! > econData.forecast) {
          sentiment = econData.name.toLowerCase().includes('unemployment') ? 'Bearish' : 'Bullish';
          confidence = 72;
        } else if (econData.actual! < econData.forecast) {
          sentiment = econData.name.toLowerCase().includes('unemployment') ? 'Bullish' : 'Bearish';
          confidence = 68;
        } else {
          confidence = 55;
        }
      } else {
        confidence = 60;
      }
      
      const summary = hasActual
        ? `${econData.name} came in at ${econData.actual?.toFixed(1)}% vs forecast of ${econData.forecast?.toFixed(1)}%.`
        : `${econData.name} is expected to be released with a forecast of ${econData.forecast?.toFixed(1)}%.`;
      
      const overview = hasActual
        ? `The ${econData.name} for ${econData.country} was released showing ${econData.actual?.toFixed(1)}% compared to the forecasted ${econData.forecast?.toFixed(1)}% and previous reading of ${econData.previous?.toFixed(1)}%. This ${econData.impact.toLowerCase()}-impact indicator provides insights into economic conditions.`
        : `The ${econData.name} for ${econData.country} is scheduled for release. Economists forecast ${econData.forecast?.toFixed(1)}% compared to the previous ${econData.previous?.toFixed(1)}%. This ${econData.impact.toLowerCase()}-impact indicator is closely watched by market participants.`;
      
      const opinion = `${sentiment} ${confidence}%`;
      
      const forecast = hasActual
        ? 'Likely moderate market volatility in next 24-48 hours.'
        : 'Likely increased market volatility around data release.';
      
      return {
        summary,
        overview,
        opinion,
        forecast,
        impact: econData.impact,
        sentiment,
        confidence,
        relatedTickers: ['SPY', 'QQQ', 'DXY'],
      };
    }
  };

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

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      try {
        if (router.canGoBack?.()) {
          router.back();
        } else {
          router.replace('/upcoming');
        }
      } catch (error) {
        console.error('[EventDetails] Navigation error:', error);
        router.replace('/upcoming');
      }
    });
  };

  const handleTickerPress = (ticker: string) => {
    handleClose();
    setTimeout(() => {
      router.push(`/company/${ticker}`);
    }, 350);
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  if (loading || !eventDetails) {
    return (
      <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
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
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFD75A" />
              <Text style={styles.loadingText}>
                {loading ? 'Loading event details...' : 'Event not found'}
              </Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  const isEarnings = eventDetails.type === 'earnings';
  const earningsData = isEarnings ? (eventDetails.data as EarningsItem) : null;
  const econData = !isEarnings ? (eventDetails.data as EconItem) : null;
  const title = isEarnings ? `${earningsData?.ticker} Earnings Report` : econData?.name || 'Event Details';

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose} statusBarTranslucent>
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
          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            bounces={false}
            {...panResponder.panHandlers}
          >
            <View style={styles.contentContainer}>
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <Text style={styles.title}>{title}</Text>
                  <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <X size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.sourceText}>
                  {eventDetails.source} • {formatTime(eventDetails.timestamp)}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.aiSection}>
                <Text style={styles.sectionTitle}>AI SUMMARY</Text>
                <Text style={styles.aiText}>{eventDetails.aiSummary}</Text>
              </View>

              <View style={styles.aiSection}>
                <Text style={styles.sectionTitle}>AI OVERVIEW</Text>
                <Text style={styles.aiText}>{eventDetails.aiOverview}</Text>
              </View>

              <View style={styles.aiSection}>
                <Text style={styles.sectionTitle}>AI OPINION</Text>
                <View style={styles.opinionRow}>
                  <Text style={styles.opinionDash}>—</Text>
                  <Text style={styles.opinionLabel}>({eventDetails.impact})</Text>
                  <Text style={styles.opinionSentiment}>
                    {eventDetails.sentiment} {eventDetails.confidence}%
                  </Text>
                </View>
                <Text style={styles.opinionDescription}>
                  {eventDetails.sentiment === 'Bullish' ? 'Market likely to respond positively with increased buying pressure.' :
                   eventDetails.sentiment === 'Bearish' ? 'Market likely to respond negatively with increased selling pressure.' :
                   'Market expected to remain stable with balanced sentiment.'}
                </Text>
              </View>

              <View style={styles.aiSection}>
                <Text style={styles.sectionTitle}>AI FORECAST</Text>
                <Text style={styles.aiText}>{eventDetails.aiForecast}</Text>
              </View>

              {((isEarnings && earningsData) || econData) && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.aiSection}>
                    <Text style={styles.sectionTitle}>KEY METRICS</Text>
                    {isEarnings && earningsData ? (
                      <View style={styles.metricsGrid}>
                        {earningsData.actual_eps !== null && earningsData.actual_eps !== undefined ? (
                          <>
                            <View style={styles.metricItem}>
                              <Text style={styles.metricLabel}>Actual EPS</Text>
                              <Text style={styles.metricValue}>${earningsData.actual_eps.toFixed(2)}</Text>
                            </View>
                            <View style={styles.metricItem}>
                              <Text style={styles.metricLabel}>Expected EPS</Text>
                              <Text style={styles.metricValue}>${earningsData.cons_eps?.toFixed(2)}</Text>
                            </View>
                            <View style={styles.metricItem}>
                              <Text style={styles.metricLabel}>Actual Revenue</Text>
                              <Text style={styles.metricValue}>${earningsData.actual_rev?.toFixed(1)}B</Text>
                            </View>
                            <View style={styles.metricItem}>
                              <Text style={styles.metricLabel}>Expected Revenue</Text>
                              <Text style={styles.metricValue}>${earningsData.cons_rev?.toFixed(1)}B</Text>
                            </View>
                          </>
                        ) : (
                          <>
                            <View style={styles.metricItem}>
                              <Text style={styles.metricLabel}>Expected EPS</Text>
                              <Text style={styles.metricValue}>${earningsData.cons_eps?.toFixed(2)}</Text>
                            </View>
                            <View style={styles.metricItem}>
                              <Text style={styles.metricLabel}>Expected Revenue</Text>
                              <Text style={styles.metricValue}>${earningsData.cons_rev?.toFixed(1)}B</Text>
                            </View>
                          </>
                        )}
                      </View>
                    ) : econData ? (
                      <View style={styles.metricsGrid}>
                        <View style={styles.metricItem}>
                          <Text style={styles.metricLabel}>Forecast</Text>
                          <Text style={styles.metricValue}>{econData.forecast?.toFixed(1)}%</Text>
                        </View>
                        <View style={styles.metricItem}>
                          <Text style={styles.metricLabel}>Previous</Text>
                          <Text style={styles.metricValue}>{econData.previous?.toFixed(1)}%</Text>
                        </View>
                        {econData.actual !== null && econData.actual !== undefined && (
                          <View style={styles.metricItem}>
                            <Text style={styles.metricLabel}>Actual</Text>
                            <Text style={styles.metricValue}>{econData.actual.toFixed(1)}%</Text>
                          </View>
                        )}
                      </View>
                    ) : null}
                  </View>
                </>
              )}

              <View style={styles.divider} />

              <View style={styles.tickersSection}>
                <Text style={styles.sectionTitle}>RELATED TICKERS</Text>
                <View style={styles.tickersRow}>
                  {eventDetails.relatedTickers.map((ticker, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.tickerPill}
                      onPress={() => handleTickerPress(ticker)}
                      activeOpacity={0.6}
                    >
                      <Text style={styles.tickerText}>{ticker}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  AI summaries are <Text style={styles.footerUnderline}>generated for convenience</Text>. Not financial advice.
                </Text>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: '#000000',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderTopWidth: 1,
    borderTopColor: '#FFD75A',
    borderLeftWidth: 0,
    borderRightWidth: 0,
    height: SCREEN_HEIGHT * 0.92,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    lineHeight: 30,
    flex: 1,
    paddingRight: 16,
  },
  closeButton: {
    padding: 4,
  },
  sourceText: {
    fontSize: 13,
    color: '#888888',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#FFD75A',
    marginVertical: 16,
  },
  aiSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFD75A',
    marginBottom: 8,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  aiText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    opacity: 0.9,
  },
  opinionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  opinionDash: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '400' as const,
  },
  opinionLabel: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '400' as const,
  },
  opinionSentiment: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFD75A',
  },
  opinionDescription: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    opacity: 0.9,
  },
  metricsGrid: {
    gap: 12,
  },
  metricItem: {
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  tickersSection: {
    marginBottom: 16,
  },
  tickersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tickerPill: {
    backgroundColor: '#FFD75A',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tickerText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#000000',
    textTransform: 'uppercase' as const,
  },
  footer: {
    marginTop: 24,
    paddingTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: 'rgba(136, 136, 136, 0.8)',
    textAlign: 'center',
    lineHeight: 16,
  },
  footerUnderline: {
    textDecorationLine: 'underline',
    color: '#FFD75A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 13,
    color: '#888888',
  },
});
