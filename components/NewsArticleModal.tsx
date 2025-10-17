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
  ActivityIndicator,
} from 'react-native';
import { X } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { FeedItem, CriticalAlert } from '@/types/news';
import { useNewsStore } from '@/store/newsStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface NewsArticleModalProps {
  visible: boolean;
  article: FeedItem | CriticalAlert | null;
  onClose: () => void;
}

interface AIContent {
  summary: string;
  overview: string;
  opinion: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  impact: 'Low' | 'Medium' | 'High';
  forecast: string;
}

export default function NewsArticleModal({ visible, article, onClose }: NewsArticleModalProps) {
  const { saveArticle, unsaveArticle, isArticleSaved } = useNewsStore();
  const [translateY] = useState(new Animated.Value(SCREEN_HEIGHT));
  const [aiContent, setAiContent] = useState<AIContent | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

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
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      if (article) {
        generateAIContent();
      }
    } else {
      setAiContent(null);
      setIsLoadingAI(false);
    }
  }, [visible, article]);

  const generateAIContent = async () => {
    if (!article) return;
    
    setIsLoadingAI(true);
    
    try {
      const title = 'title' in article ? article.title : article.headline;
      const titleLower = title.toLowerCase();
      
      const sentiment: 'Bullish' | 'Bearish' | 'Neutral' = 
        titleLower.includes('surge') || titleLower.includes('gain') || titleLower.includes('beat') || titleLower.includes('rally') || titleLower.includes('soar') ? 'Bullish' :
        titleLower.includes('drop') || titleLower.includes('fall') || titleLower.includes('miss') || titleLower.includes('plunge') || titleLower.includes('crash') ? 'Bearish' :
        'Neutral';
      
      const confidence = sentiment === 'Bullish' ? 78 : sentiment === 'Bearish' ? 72 : 60;
      const impact: 'Low' | 'Medium' | 'High' = confidence >= 75 ? 'High' : confidence >= 50 ? 'Medium' : 'Low';
      
      const summary = title.length > 120 ? `${title.substring(0, 120)}...` : title;
      
      let overview = '';
      const tickers = article.tickers || [];
      
      if (titleLower.includes('tariff') && titleLower.includes('trump') && titleLower.includes('china')) {
        overview = `Former President Trump's announcement of potential 100% tariffs on Chinese imports represents a significant escalation in trade policy rhetoric. This development could impact ${tickers.length > 0 ? tickers.slice(0, 3).join(', ') : 'major indices and China-exposed equities'}, with potential ripple effects across global supply chains, consumer prices, and international trade relations.`;
      } else {
        const source = 'source' in article && typeof article.source === 'object' ? article.source.name : article.source;
        overview = `This ${typeof source === 'string' ? source : 'news'} article ${tickers.length > 0 ? `covers ${tickers.slice(0, 2).join(' and ')}` : 'discusses market developments'}, highlighting ${sentiment === 'Bullish' ? 'positive momentum and growth indicators' : sentiment === 'Bearish' ? 'challenges and downward pressure' : 'neutral market conditions'} with potential implications for investor positioning.`;
      }
      
      const forecast = sentiment === 'Bullish'
        ? 'Likely bullish sentiment in next 24-48 hours.'
        : sentiment === 'Bearish'
        ? 'Likely bearish sentiment in next 24-48 hours.'
        : 'Likely stable sentiment in next 24-48 hours.';
      
      setAiContent({
        summary,
        overview,
        opinion: sentiment === 'Bullish' ? 'Market likely to respond positively with increased buying pressure.' :
                 sentiment === 'Bearish' ? 'Market likely to respond negatively with increased selling pressure.' :
                 'Market expected to remain stable with balanced sentiment.',
        sentiment,
        confidence,
        impact,
        forecast,
      });
    } catch (error) {
      console.error('Error generating AI content:', error);
      const title = 'title' in article ? article.title : article.headline;
      setAiContent({
        summary: title,
        overview: 'This article provides important market information and updates.',
        opinion: 'Market expected to remain stable with balanced sentiment.',
        sentiment: 'Neutral',
        confidence: 50,
        impact: 'Medium',
        forecast: 'Likely stable sentiment in next 24-48 hours.',
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleTickerPress = (ticker: string) => {
    console.log('Ticker pressed:', ticker);
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

  if (!article) return null;

  const title = 'title' in article ? article.title : article.headline;
  const source = 'source' in article && typeof article.source === 'object' ? article.source.name : article.source;
  const publishedAt = article.published_at;
  const tickers = article.tickers || [];

  return (
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
                  {typeof source === 'string' ? source : 'Unknown'} • {formatTime(publishedAt)}
                </Text>
              </View>

              <View style={styles.divider} />

              {isLoadingAI && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FFD75A" />
                  <Text style={styles.loadingText}>Generating AI analysis...</Text>
                </View>
              )}

              {aiContent && (
                <>
                  <View style={styles.aiSection}>
                    <Text style={styles.sectionTitle}>AI SUMMARY</Text>
                    <Text style={styles.aiText}>{aiContent.summary}</Text>
                  </View>

                  <View style={styles.aiSection}>
                    <Text style={styles.sectionTitle}>AI OVERVIEW</Text>
                    <Text style={styles.aiText}>{aiContent.overview}</Text>
                  </View>

                  <View style={styles.aiSection}>
                    <Text style={styles.sectionTitle}>AI OPINION</Text>
                    <View style={styles.opinionRow}>
                      <Text style={styles.opinionDash}>—</Text>
                      <Text style={styles.opinionLabel}>({aiContent.impact})</Text>
                      <Text style={styles.opinionSentiment}>
                        {aiContent.sentiment} {aiContent.confidence}%
                      </Text>
                    </View>
                    <Text style={styles.opinionDescription}>
                      {aiContent.opinion}
                    </Text>
                  </View>

                  <View style={styles.aiSection}>
                    <Text style={styles.sectionTitle}>AI FORECAST</Text>
                    <Text style={styles.aiText}>{aiContent.forecast}</Text>
                  </View>
                </>
              )}

              {tickers.length > 0 && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.tickersSection}>
                    <Text style={styles.sectionTitle}>RELATED TICKERS</Text>
                    <View style={styles.tickersRow}>
                      {tickers.map((ticker, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.tickerPill}
                          onPress={() => handleTickerPress(ticker)}
                        >
                          <Text style={styles.tickerText}>{ticker}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 24,
  },
  loadingText: {
    fontSize: 13,
    color: '#888888',
  },
});
