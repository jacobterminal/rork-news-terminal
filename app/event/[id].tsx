import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { EarningsItem, EconItem } from '../../types/news';
import { generateMockData } from '../../utils/mockData';
import { generateText } from '@rork/toolkit-sdk';

interface EventDetails {
  type: 'earnings' | 'econ';
  data: EarningsItem | EconItem;
  aiSummary: string;
  aiOverview: string;
  impact: 'High' | 'Medium' | 'Low';
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  relatedTickers: string[];
  source: string;
  timestamp: string;
}

export default function EventDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, type } = useLocalSearchParams<{ id: string; type: 'earnings' | 'econ' }>();
  
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadEventDetails();
  }, [id, type]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      const mockData = generateMockData();
      
      let eventData: EarningsItem | EconItem | undefined;
      let eventType: 'earnings' | 'econ' = type || 'earnings';
      
      if (eventType === 'earnings') {
        eventData = mockData.earnings.find(e => e.ticker === id);
      } else {
        eventData = mockData.econ.find(e => e.id === id);
      }
      
      if (!eventData) {
        console.error('Event not found:', id);
        setLoading(false);
        return;
      }

      const aiContent = await generateAIContent(eventData, eventType);
      
      const details: EventDetails = {
        type: eventType,
        data: eventData,
        aiSummary: aiContent.summary,
        aiOverview: aiContent.overview,
        impact: aiContent.impact,
        sentiment: aiContent.sentiment,
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
    impact: 'High' | 'Medium' | 'Low';
    sentiment: 'Bullish' | 'Bearish' | 'Neutral';
    relatedTickers: string[];
  }> => {
    try {
      if (type === 'earnings') {
        const earningsData = data as EarningsItem;
        const prompt = `Generate a brief analysis for ${earningsData.ticker} earnings report scheduled at ${earningsData.scheduled_at}. 
        Expected EPS: ${earningsData.cons_eps}, Expected Revenue: ${earningsData.cons_rev}B.
        ${earningsData.actual_eps ? `Actual EPS: ${earningsData.actual_eps}, Actual Revenue: ${earningsData.actual_rev}B. Verdict: ${earningsData.verdict}` : ''}
        
        Provide:
        1. A 2-3 sentence overview
        2. A brief summary (1 sentence)
        3. Impact rating (High/Medium/Low)
        4. Sentiment (Bullish/Bearish/Neutral)
        5. 2-3 related tickers
        
        Format as JSON: {"overview": "...", "summary": "...", "impact": "...", "sentiment": "...", "relatedTickers": ["...", "..."]}`;
        
        const response = await generateText({
          messages: [
            { role: 'user', content: prompt }
          ]
        });
        const parsed = JSON.parse(response);
        
        return {
          summary: parsed.summary || `${earningsData.ticker} earnings report analysis`,
          overview: parsed.overview || `Earnings report for ${earningsData.ticker} with expected EPS of ${earningsData.cons_eps}`,
          impact: parsed.impact || 'Medium',
          sentiment: parsed.sentiment || 'Neutral',
          relatedTickers: parsed.relatedTickers || [earningsData.ticker],
        };
      } else {
        const econData = data as EconItem;
        const prompt = `Generate a brief analysis for ${econData.name} economic event scheduled at ${econData.scheduled_at}.
        Forecast: ${econData.forecast}%, Previous: ${econData.previous}%.
        ${econData.actual !== null && econData.actual !== undefined ? `Actual: ${econData.actual}%` : ''}
        Impact: ${econData.impact}
        
        Provide:
        1. A 2-3 sentence overview
        2. A brief summary (1 sentence)
        3. Sentiment (Bullish/Bearish/Neutral)
        4. 2-3 related tickers that would be affected
        
        Format as JSON: {"overview": "...", "summary": "...", "sentiment": "...", "relatedTickers": ["...", "..."]}`;
        
        const response = await generateText({
          messages: [
            { role: 'user', content: prompt }
          ]
        });
        const parsed = JSON.parse(response);
        
        return {
          summary: parsed.summary || `${econData.name} economic indicator analysis`,
          overview: parsed.overview || `${econData.name} with forecast of ${econData.forecast}%`,
          impact: econData.impact,
          sentiment: parsed.sentiment || 'Neutral',
          relatedTickers: parsed.relatedTickers || ['SPY', 'QQQ'],
        };
      }
    } catch (error) {
      console.error('Error generating AI content:', error);
      
      if (type === 'earnings') {
        const earningsData = data as EarningsItem;
        return {
          summary: `Earnings report for ${earningsData.ticker}`,
          overview: `${earningsData.ticker} is scheduled to report earnings ${earningsData.report_time}. Analysts expect EPS of ${earningsData.cons_eps} and revenue of ${earningsData.cons_rev}B.`,
          impact: 'Medium',
          sentiment: 'Neutral',
          relatedTickers: [earningsData.ticker],
        };
      } else {
        const econData = data as EconItem;
        return {
          summary: `${econData.name} economic indicator`,
          overview: `${econData.name} is scheduled for release. Forecast is ${econData.forecast}% compared to previous ${econData.previous}%.`,
          impact: econData.impact,
          sentiment: 'Neutral',
          relatedTickers: ['SPY', 'QQQ'],
        };
      }
    }
  };

  const handleTickerPress = (ticker: string) => {
    console.log('Ticker pressed:', ticker);
  };

  const getSentimentColor = (sentiment: 'Bullish' | 'Bearish' | 'Neutral') => {
    switch (sentiment) {
      case 'Bullish': return theme.colors.bullish;
      case 'Bearish': return theme.colors.bearish;
      default: return theme.colors.textDim;
    }
  };

  const getImpactColor = (impact: 'High' | 'Medium' | 'Low') => {
    switch (impact) {
      case 'High': return '#FF1744';
      case 'Medium': return '#FF8C00';
      case 'Low': return '#6C757D';
      default: return theme.colors.textDim;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.neutral} />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </View>
    );
  }

  if (!eventDetails) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Event not found</Text>
        </View>
      </View>
    );
  }

  const isEarnings = eventDetails.type === 'earnings';
  const earningsData = isEarnings ? (eventDetails.data as EarningsItem) : null;
  const econData = !isEarnings ? (eventDetails.data as EconItem) : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.eventTitle}>
              {isEarnings ? `${earningsData?.ticker} Earnings Report` : econData?.name}
            </Text>
            <View style={styles.badgeRow}>
              <View style={[styles.impactBadge, { backgroundColor: getImpactColor(eventDetails.impact) }]}>
                <Text style={styles.badgeText}>{eventDetails.impact.toUpperCase()}</Text>
              </View>
              <View style={[styles.sentimentBadge, { backgroundColor: getSentimentColor(eventDetails.sentiment) }]}>
                <Text style={[styles.badgeText, { color: '#000000' }]}>
                  {eventDetails.sentiment.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Overview</Text>
            <Text style={styles.overviewText}>{eventDetails.aiOverview}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Summary</Text>
            <Text style={styles.summaryText}>{eventDetails.aiSummary}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Metrics</Text>
            {isEarnings && earningsData ? (
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Report Time</Text>
                  <Text style={styles.metricValue}>{earningsData.report_time}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Expected EPS</Text>
                  <Text style={styles.metricValue}>${earningsData.cons_eps?.toFixed(2)}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Expected Revenue</Text>
                  <Text style={styles.metricValue}>${earningsData.cons_rev?.toFixed(1)}B</Text>
                </View>
                {earningsData.actual_eps && (
                  <>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Actual EPS</Text>
                      <Text style={[styles.metricValue, { color: theme.colors.bullish }]}>
                        ${earningsData.actual_eps.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Actual Revenue</Text>
                      <Text style={[styles.metricValue, { color: theme.colors.bullish }]}>
                        ${earningsData.actual_rev?.toFixed(1)}B
                      </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Verdict</Text>
                      <Text style={[styles.metricValue, { 
                        color: earningsData.verdict === 'Beat' ? theme.colors.bullish : 
                               earningsData.verdict === 'Miss' ? theme.colors.bearish : 
                               theme.colors.textDim 
                      }]}>
                        {earningsData.verdict}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            ) : econData ? (
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Country</Text>
                  <Text style={styles.metricValue}>{econData.country}</Text>
                </View>
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
                    <Text style={[styles.metricValue, { color: theme.colors.bullish }]}>
                      {econData.actual.toFixed(1)}%
                    </Text>
                  </View>
                )}
              </View>
            ) : null}
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Related Tickers</Text>
            <View style={styles.tickersRow}>
              {eventDetails.relatedTickers.map((ticker, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tickerPill}
                  onPress={() => handleTickerPress(ticker)}
                >
                  <Text style={styles.tickerPillText}>{ticker}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Source:</Text>
              <Text style={styles.infoValue}>{eventDetails.source}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Scheduled:</Text>
              <Text style={styles.infoValue}>
                {new Date(eventDetails.timestamp).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  titleSection: {
    marginBottom: theme.spacing.md,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  impactBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sentimentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.neutral,
    marginVertical: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.neutral,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  overviewText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  metricItem: {
    minWidth: '45%',
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.textDim,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  tickersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tickerPill: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.neutral,
  },
  tickerPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textDim,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.textDim,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.textDim,
  },
});
