import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { ArrowLeft, Clock, ExternalLink, Bookmark } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { generateText } from '@rork/toolkit-sdk';
import { useNewsStore } from '@/store/newsStore';

interface NewsDetails {
  id: string;
  ticker: string;
  headline: string;
  source: string;
  time: string;
  summary: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  impact: 'Low' | 'Medium' | 'High';
  aiOverview?: string;
  aiOpinion?: string;
  relatedTickers?: string[];
}

export default function NewsDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [newsDetails, setNewsDetails] = useState<NewsDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const { isArticleSaved, saveArticle, unsaveArticle } = useNewsStore();

  useEffect(() => {
    loadNewsDetails();
  }, [id]);

  const loadNewsDetails = async () => {
    try {
      setLoading(true);
      
      const decodedData = JSON.parse(decodeURIComponent(id));
      
      setNewsDetails({
        id: decodedData.id || Date.now().toString(),
        ticker: decodedData.ticker,
        headline: decodedData.headline,
        source: decodedData.source,
        time: decodedData.time,
        summary: decodedData.summary,
        sentiment: decodedData.sentiment,
        confidence: decodedData.confidence,
        impact: decodedData.impact,
        relatedTickers: [decodedData.ticker],
      });

      setAiLoading(true);
      try {
        const aiOverview = await generateText({
          messages: [
            {
              role: 'user',
              content: `Provide a detailed 2-3 sentence overview of this news: "${decodedData.headline}". Focus on key facts and market implications.`,
            },
          ],
        });

        const aiOpinion = await generateText({
          messages: [
            {
              role: 'user',
              content: `Provide a brief market opinion on this news: "${decodedData.headline}". What should traders watch for?`,
            },
          ],
        });

        setNewsDetails(prev => prev ? {
          ...prev,
          aiOverview,
          aiOpinion,
        } : null);
      } catch (error) {
        console.error('Error generating AI content:', error);
      } finally {
        setAiLoading(false);
      }
    } catch (error) {
      console.error('Error loading news details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!newsDetails) return;
    
    const feedItem = {
      id: newsDetails.id,
      published_at: newsDetails.time,
      title: newsDetails.headline,
      url: '',
      source: { name: newsDetails.source, type: 'news' as const, reliability: 85 },
      tickers: [newsDetails.ticker],
      tags: { is_macro: false, fed: false, sec: false, earnings: false, social: false },
      classification: {
        rumor_level: 'Confirmed' as const,
        sentiment: newsDetails.sentiment,
        confidence: newsDetails.confidence,
        impact: newsDetails.impact,
        summary_15: newsDetails.summary,
      },
    };

    if (isArticleSaved(newsDetails.id)) {
      unsaveArticle(newsDetails.id);
    } else {
      saveArticle(feedItem);
    }
  };

  const handleTickerPress = (ticker: string) => {
    console.log('Ticker pressed:', ticker);
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  const getImpactColor = (impact: 'Low' | 'Medium' | 'High') => {
    switch (impact) {
      case 'High': return '#FF1744';
      case 'Medium': return '#FF8C00';
      default: return '#6C757D';
    }
  };

  const getSentimentColor = (sentiment: 'Bullish' | 'Bearish' | 'Neutral') => {
    switch (sentiment) {
      case 'Bullish': return '#00FF5A';
      case 'Bearish': return '#FF3131';
      default: return '#F5C518';
    }
  };

  if (loading || !newsDetails) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: '',
            headerStyle: { backgroundColor: theme.colors.bg },
            headerTintColor: theme.colors.text,
            headerLeft: () => (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <ArrowLeft size={24} color={theme.colors.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.activeCyan} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerStyle: { backgroundColor: theme.colors.bg },
          headerTintColor: theme.colors.text,
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headline}>{newsDetails.headline}</Text>

          <View style={styles.metaRow}>
            <View style={styles.sourceRow}>
              <Text style={styles.sourceText}>{newsDetails.source}</Text>
              <View style={styles.timeDot} />
              <Clock size={12} color={theme.colors.textDim} />
              <Text style={styles.timeText}>{formatTime(newsDetails.time)}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
              <Bookmark
                size={16}
                color={isArticleSaved(newsDetails.id) ? theme.colors.activeCyan : theme.colors.text}
                fill={isArticleSaved(newsDetails.id) ? theme.colors.activeCyan : 'none'}
              />
              <Text style={[styles.actionText, isArticleSaved(newsDetails.id) && { color: theme.colors.activeCyan }]}>
                {isArticleSaved(newsDetails.id) ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SUMMARY</Text>
          <Text style={styles.summaryText}>{newsDetails.summary}</Text>
        </View>

        {aiLoading ? (
          <View style={styles.aiLoadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.activeCyan} />
            <Text style={styles.aiLoadingText}>Generating AI analysis...</Text>
          </View>
        ) : (
          <>
            {newsDetails.aiOverview && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>AI OVERVIEW</Text>
                <Text style={styles.aiText}>{newsDetails.aiOverview}</Text>
              </View>
            )}

            {newsDetails.aiOpinion && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>AI OPINION</Text>
                <Text style={styles.aiText}>{newsDetails.aiOpinion}</Text>
              </View>
            )}
          </>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>IMPACT & SENTIMENT</Text>
          <View style={styles.impactRow}>
            <View style={[styles.impactPill, { backgroundColor: getImpactColor(newsDetails.impact) }]}>
              <Text style={styles.impactText}>{newsDetails.impact} Impact</Text>
            </View>
            <View style={[styles.sentimentPill, { backgroundColor: getSentimentColor(newsDetails.sentiment) + '20' }]}>
              <Text style={[styles.sentimentText, { color: getSentimentColor(newsDetails.sentiment) }]}>
                {newsDetails.sentiment}
              </Text>
            </View>
            <Text style={[styles.confidenceText, { color: getSentimentColor(newsDetails.sentiment) }]}>
              {newsDetails.confidence}% confidence
            </Text>
          </View>
        </View>

        {newsDetails.relatedTickers && newsDetails.relatedTickers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>RELATED TICKERS</Text>
            <View style={styles.tickersRow}>
              {newsDetails.relatedTickers.map((ticker) => (
                <TouchableOpacity
                  key={ticker}
                  style={styles.tickerPill}
                  onPress={() => handleTickerPress(ticker)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.tickerPillText}>{ticker}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            AI summaries are generated for convenience. Not financial advice.
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  backButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  header: {
    padding: theme.spacing.lg,
  },
  headline: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.md,
  },
  metaRow: {
    marginBottom: theme.spacing.md,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sourceText: {
    fontSize: 12,
    color: theme.colors.bullish,
    fontWeight: '600' as const,
  },
  timeDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.textDim,
  },
  timeText: {
    fontSize: 12,
    color: theme.colors.textDim,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  actionText: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '500' as const,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  section: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: theme.colors.bullish,
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
  },
  summaryText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  aiLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  aiLoadingText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  aiText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  impactPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  impactText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  sentimentPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  sentimentText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  tickersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tickerPill: {
    backgroundColor: theme.colors.bullish,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tickerPillText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: theme.colors.bg,
  },
  disclaimer: {
    padding: theme.spacing.lg,
  },
  disclaimerText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});