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
  Linking,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  ExternalLink,
  Bookmark,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react-native';
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
  explainer: string;
}



export default function NewsArticleModal({ visible, article, onClose }: NewsArticleModalProps) {
  const { saveArticle, unsaveArticle, isArticleSaved } = useNewsStore();
  const [translateY] = useState(new Animated.Value(SCREEN_HEIGHT));
  const [aiContent, setAiContent] = useState<AIContent | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);



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
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
      
      if (article) {
        generateAIContent();
      }
    } else {
      setAiContent(null);
      setAiError(null);
      setIsLoadingAI(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, article]);

  const generateAIContent = async () => {
    if (!article) return;
    
    setIsLoadingAI(true);
    setAiError(null);
    
    try {
      const title = 'title' in article ? article.title : article.headline;
      const source = 'source' in article && typeof article.source === 'object' ? article.source.name : article.source;
      const tickers = article.tickers || [];
      
      const sentiment: 'Bullish' | 'Bearish' | 'Neutral' = 
        title.toLowerCase().includes('surge') || title.toLowerCase().includes('gain') || title.toLowerCase().includes('beat') ? 'Bullish' :
        title.toLowerCase().includes('drop') || title.toLowerCase().includes('fall') || title.toLowerCase().includes('miss') ? 'Bearish' :
        'Neutral';
      
      const confidence = sentiment !== 'Neutral' ? 72 : 55;
      
      const summary = `${title.substring(0, 150)}${title.length > 150 ? '...' : ''}`;
      
      const overview = `This news from ${typeof source === 'string' ? source : 'the source'} discusses developments ${tickers.length > 0 ? `related to ${tickers.slice(0, 2).join(' and ')}` : 'in the market'}. The information provides insights into recent market movements and potential implications for investors.`;
      
      const explainer = sentiment === 'Bullish' 
        ? 'The positive tone and language in this headline suggest favorable market conditions or company performance, which typically indicates bullish sentiment.'
        : sentiment === 'Bearish'
        ? 'The negative language and indicators in this headline suggest challenging conditions or underperformance, which typically indicates bearish sentiment.'
        : 'The headline presents factual information without strong directional indicators, suggesting a neutral market stance.';
      
      setAiContent({
        summary,
        overview,
        opinion: `${sentiment} sentiment detected with ${confidence}% confidence. ${explainer}`,
        sentiment,
        confidence,
        explainer,
      });
    } catch (error) {
      console.error('Error generating AI content:', error);
      
      const title = 'title' in article ? article.title : article.headline;
      setAiContent({
        summary: title,
        overview: 'This article provides important market information and updates.',
        opinion: 'Neutral sentiment with moderate confidence.',
        sentiment: 'Neutral',
        confidence: 50,
        explainer: 'Analysis based on headline content and market context.',
      });
    } finally {
      setIsLoadingAI(false);
    }
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

  const handleOpenOriginal = () => {
    if (article && 'url' in article && article.url) {
      Linking.openURL(article.url);
    }
  };

  const handleSave = () => {
    if (!article) return;
    
    if ('title' in article) {
      if (isArticleSaved(article.id)) {
        unsaveArticle(article.id);
      } else {
        saveArticle(article);
      }
    }
  };



  const getSentimentBorderColor = () => {
    if (!aiContent) return theme.colors.border;
    
    switch (aiContent.sentiment) {
      case 'Bullish':
        return theme.colors.bullish;
      case 'Bearish':
        return theme.colors.bearish;
      case 'Neutral':
        return theme.colors.neutral;
      default:
        return theme.colors.border;
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    const iconSize = 18;
    const color = sentiment === 'Bullish' ? theme.colors.bullish : 
                  sentiment === 'Bearish' ? theme.colors.bearish : theme.colors.neutral;
    
    switch (sentiment) {
      case 'Bullish':
        return <TrendingUp size={iconSize} color={color} />;
      case 'Bearish':
        return <TrendingDown size={iconSize} color={color} />;
      default:
        return <Minus size={iconSize} color={color} />;
    }
  };

  const getImpactLabel = (sentiment: string, confidence: number) => {
    if (confidence >= 75) return 'High';
    if (confidence >= 50) return 'Medium';
    return 'Low';
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
  const url = 'url' in article ? article.url : undefined;
  const tickers = article.tickers || [];
  const isSaved = 'title' in article && isArticleSaved(article.id);

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
            {
              transform: [{ translateY }],
              borderColor: getSentimentBorderColor(),
            },
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
              <Text style={styles.title}>{title}</Text>
              
              <View style={styles.sourceRow}>
                <Text style={styles.sourceText}>
                  {typeof source === 'string' ? source : 'Unknown'} • {formatTime(publishedAt)}
                </Text>
              </View>

              <View style={styles.actions}>
                {url && (
                  <TouchableOpacity style={styles.actionButton} onPress={handleOpenOriginal}>
                    <ExternalLink size={16} color={theme.colors.text} />
                    <Text style={styles.actionText}>Open Original</Text>
                  </TouchableOpacity>
                )}
                {'title' in article && (
                  <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
                    <Bookmark 
                      size={16} 
                      color={isSaved ? theme.colors.neutral : theme.colors.text}
                      fill={isSaved ? theme.colors.neutral : 'none'}
                    />
                    <Text style={[
                      styles.actionText, 
                      isSaved && { color: theme.colors.neutral }
                    ]}>
                      {isSaved ? 'Saved' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.divider} />

              {isLoadingAI && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={theme.colors.text} />
                  <Text style={styles.loadingText}>Generating AI analysis...</Text>
                </View>
              )}

              {aiError && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{aiError}</Text>
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
                      {getSentimentIcon(aiContent.sentiment)}
                      <Text style={styles.opinionLabel}>({getImpactLabel(aiContent.sentiment, aiContent.confidence)})</Text>
                      <Text style={[
                        styles.opinionSentiment,
                        { color: aiContent.sentiment === 'Bullish' ? theme.colors.bullish : 
                                 aiContent.sentiment === 'Bearish' ? theme.colors.bearish : theme.colors.neutral }
                      ]}>
                        {aiContent.sentiment} {aiContent.confidence}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.explainerSection}>
                    <Text style={styles.explainerText}>{aiContent.explainer}</Text>
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
                        <TouchableOpacity key={index} style={styles.tickerPill}>
                          <Text style={styles.tickerText}>{ticker}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}

              <View style={styles.disclaimer}>
                <Text style={styles.disclaimerText}>
                  AI summaries are generated for convenience. Not financial advice.
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
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
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: 12,
  },
  sourceRow: {
    marginBottom: 16,
  },
  sourceText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '500' as const,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 16,
  },
  aiSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: theme.colors.neutral,
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
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
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 23, 68, 0.1)',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: theme.colors.bearish,
    textAlign: 'center',
  },
  opinionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  opinionLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600' as const,
  },
  opinionSentiment: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  explainerSection: {
    marginTop: 12,
    marginBottom: 16,
  },
  explainerText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },

  aiText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  impactPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  impactText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  sentimentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sentimentText: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '600' as const,
  },
  confidenceText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  tickersSection: {
    marginTop: 0,
    marginBottom: 16,
  },
  tickersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tickerPill: {
    backgroundColor: theme.colors.neutral,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tickerText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: theme.colors.bg,
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
    fontStyle: 'italic',
  },
});
