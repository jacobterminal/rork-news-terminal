import React, { useState, useMemo, useEffect } from 'react';
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
  ChevronDown,
  ChevronUp,
  Flag,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { FeedItem, Comment, CommentSortType, CriticalAlert } from '@/types/news';
import { useNewsStore } from '@/store/newsStore';
import { generateText } from '@rork/toolkit-sdk';

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

interface CommunitySentiment {
  bearish: number;
  neutral: number;
  bullish: number;
  userVote: 'bearish' | 'neutral' | 'bullish' | null;
}

export default function NewsArticleModal({ visible, article, onClose }: NewsArticleModalProps) {
  const { saveArticle, unsaveArticle, isArticleSaved } = useNewsStore();
  const [translateY] = useState(new Animated.Value(SCREEN_HEIGHT));
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [commentSort, setCommentSort] = useState<CommentSortType>('Hot');
  const [aiContent, setAiContent] = useState<AIContent | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [communitySentiment, setCommunitySentiment] = useState<CommunitySentiment>({
    bearish: 28,
    neutral: 15,
    bullish: 57,
    userVote: null,
  });

  const mockComments: Comment[] = [
    {
      id: '1',
      user_handle: 'TraderMike',
      body: 'This is a significant development. Market reaction expected.',
      created_at: new Date().toISOString(),
      upvotes: 12,
      downvotes: 2,
      flagged: false,
    },
    {
      id: '2',
      user_handle: 'MarketWatch',
      body: 'Great analysis. This aligns with recent trends.',
      created_at: new Date().toISOString(),
      upvotes: 8,
      downvotes: 1,
      flagged: false,
    },
  ];

  const sortedComments = useMemo(() => {
    const comments = [...mockComments];
    switch (commentSort) {
      case 'Hot':
        return comments.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
      case 'New':
        return comments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'Top':
        return comments.sort((a, b) => b.upvotes - a.upvotes);
      default:
        return comments;
    }
  }, [commentSort, mockComments]);

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
      
      const summaryPrompt = `Summarize this news headline in 1-2 concise sentences:\n"${title}"\nSource: ${source}`;
      const overviewPrompt = `Provide a factual overview (2-3 sentences) of this event:\n"${title}"`;
      const opinionPrompt = `Analyze the market sentiment and provide a directional outlook for this news:\n"${title}"\nProvide: sentiment (Bullish/Bearish/Neutral), confidence (0-100), and a brief explanation why.`;
      
      const [summary, overview, opinionText] = await Promise.all([
        generateText(summaryPrompt),
        generateText(overviewPrompt),
        generateText(opinionPrompt),
      ]);
      
      const sentimentMatch = opinionText.match(/\b(Bullish|Bearish|Neutral)\b/i);
      const confidenceMatch = opinionText.match(/\b(\d{1,3})%?\b/);
      
      const sentiment = (sentimentMatch?.[1] as 'Bullish' | 'Bearish' | 'Neutral') || 'Neutral';
      const confidence = confidenceMatch ? Math.min(100, parseInt(confidenceMatch[1])) : 65;
      
      setAiContent({
        summary: summary.trim(),
        overview: overview.trim(),
        opinion: opinionText.trim(),
        sentiment,
        confidence,
        explainer: opinionText.trim(),
      });
    } catch (error) {
      console.error('Error generating AI content:', error);
      setAiError('Failed to generate AI analysis');
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

  const handleCommunitySentimentVote = (vote: 'bearish' | 'neutral' | 'bullish') => {
    setCommunitySentiment(prev => {
      if (prev.userVote === vote) {
        return prev;
      }
      
      const newSentiment = { ...prev };
      
      if (prev.userVote) {
        newSentiment[prev.userVote] = Math.max(0, newSentiment[prev.userVote] - 1);
      }
      
      newSentiment[vote] = newSentiment[vote] + 1;
      newSentiment.userVote = vote;
      
      return newSentiment;
    });
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

  const handleVote = (commentId: string, type: 'up' | 'down') => {
    console.log(`Vote ${type} on comment ${commentId}`);
  };

  const handleReport = (commentId: string) => {
    console.log('Report comment:', commentId);
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

  const renderComment = (comment: Comment, isReply = false) => {
    if (!comment || !comment.id || !comment.user_handle.trim()) return null;
    
    return (
      <View key={comment.id} style={[styles.comment, isReply && styles.reply]}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentHandle}>{comment.user_handle}</Text>
          <Text style={styles.commentTime}>{formatTime(comment.created_at)}</Text>
        </View>
        <Text style={styles.commentBody}>{comment.body}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity
            style={styles.voteButton}
            onPress={() => handleVote(comment.id, 'up')}
          >
            <ArrowUp size={14} color={theme.colors.textSecondary} />
            <Text style={styles.voteCount}>{comment.upvotes}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.voteButton}
            onPress={() => handleVote(comment.id, 'down')}
          >
            <ArrowDown size={14} color={theme.colors.textSecondary} />
            <Text style={styles.voteCount}>{comment.downvotes}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => handleReport(comment.id)}
          >
            <Flag size={12} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
        {comment.replies?.map(reply => renderComment(reply, true))}
      </View>
    );
  };

  if (!article) return null;

  const title = 'title' in article ? article.title : article.headline;
  const source = 'source' in article && typeof article.source === 'object' ? article.source.name : article.source;
  const publishedAt = article.published_at;
  const url = 'url' in article ? article.url : undefined;
  const tickers = article.tickers || [];
  const isSaved = 'title' in article && isArticleSaved(article.id);

  const totalVotes = communitySentiment.bearish + communitySentiment.neutral + communitySentiment.bullish;
  const bearishPercent = totalVotes > 0 ? Math.round((communitySentiment.bearish / totalVotes) * 100) : 0;
  const neutralPercent = totalVotes > 0 ? Math.round((communitySentiment.neutral / totalVotes) * 100) : 0;
  const bullishPercent = totalVotes > 0 ? Math.round((communitySentiment.bullish / totalVotes) * 100) : 0;

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

                  <View style={styles.divider} />

                  <View style={styles.communitySection}>
                    <Text style={styles.sectionTitle}>COMMUNITY SENTIMENT</Text>
                    <View style={styles.sentimentButtons}>
                      <TouchableOpacity
                        style={[
                          styles.sentimentButton,
                          styles.bearishButton,
                          communitySentiment.userVote === 'bearish' && styles.sentimentButtonActive,
                        ]}
                        onPress={() => handleCommunitySentimentVote('bearish')}
                      >
                        <Text style={[
                          styles.sentimentButtonText,
                          communitySentiment.userVote === 'bearish' && styles.sentimentButtonTextActive,
                        ]}>
                          Bearish
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.sentimentButton,
                          styles.neutralButton,
                          communitySentiment.userVote === 'neutral' && styles.sentimentButtonActive,
                        ]}
                        onPress={() => handleCommunitySentimentVote('neutral')}
                      >
                        <Text style={[
                          styles.sentimentButtonText,
                          communitySentiment.userVote === 'neutral' && styles.sentimentButtonTextActive,
                        ]}>
                          Neutral
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.sentimentButton,
                          styles.bullishButton,
                          communitySentiment.userVote === 'bullish' && styles.sentimentButtonActive,
                        ]}
                        onPress={() => handleCommunitySentimentVote('bullish')}
                      >
                        <Text style={[
                          styles.sentimentButtonText,
                          communitySentiment.userVote === 'bullish' && styles.sentimentButtonTextActive,
                        ]}>
                          Bullish
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.sentimentBar}>
                      <View style={[styles.sentimentBarSegment, styles.bearishSegment, { flex: bearishPercent }]} />
                      <View style={[styles.sentimentBarSegment, styles.neutralSegment, { flex: neutralPercent }]} />
                      <View style={[styles.sentimentBarSegment, styles.bullishSegment, { flex: bullishPercent }]} />
                    </View>
                    <View style={styles.sentimentPercentages}>
                      <Text style={styles.percentageText}>{bearishPercent}%</Text>
                      <Text style={styles.percentageText}>{neutralPercent}%</Text>
                      <Text style={styles.percentageText}>{bullishPercent}%</Text>
                    </View>
                  </View>
                </>
              )}

              {tickers.length > 0 && (
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
              )}

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.commentsHeader}
                onPress={() => setCommentsExpanded(!commentsExpanded)}
              >
                <Text style={styles.commentsTitle}>
                  Comments • {mockComments.length}
                </Text>
                {commentsExpanded ? (
                  <ChevronUp size={20} color={theme.colors.text} />
                ) : (
                  <ChevronDown size={20} color={theme.colors.text} />
                )}
              </TouchableOpacity>

              {commentsExpanded && (
                <>
                  <View style={styles.sortRow}>
                    {(['Hot', 'New', 'Top'] as CommentSortType[]).map((sort) => (
                      <TouchableOpacity
                        key={sort}
                        style={[
                          styles.sortButton,
                          commentSort === sort && styles.sortButtonActive,
                        ]}
                        onPress={() => setCommentSort(sort)}
                      >
                        <Text
                          style={[
                            styles.sortText,
                            commentSort === sort && styles.sortTextActive,
                          ]}
                        >
                          {sort}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.commentsList}>
                    {sortedComments.map(comment => renderComment(comment))}
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
  communitySection: {
    marginBottom: 16,
  },
  sentimentButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  sentimentButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  bearishButton: {
    borderColor: theme.colors.bearish,
    backgroundColor: 'rgba(255, 23, 68, 0.1)',
  },
  neutralButton: {
    borderColor: theme.colors.neutral,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  bullishButton: {
    borderColor: theme.colors.bullish,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
  },
  sentimentButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  sentimentButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
  },
  sentimentButtonTextActive: {
    color: theme.colors.text,
    fontWeight: '700' as const,
  },
  sentimentBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  sentimentBarSegment: {
    height: '100%',
  },
  bearishSegment: {
    backgroundColor: theme.colors.bearish,
  },
  neutralSegment: {
    backgroundColor: theme.colors.neutral,
  },
  bullishSegment: {
    backgroundColor: theme.colors.bullish,
  },
  sentimentPercentages: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  percentageText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600' as const,
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
    paddingVertical: 4,
    borderRadius: 12,
  },
  tickerText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: theme.colors.bg,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  commentsTitle: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600' as const,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: theme.colors.card,
  },
  sortButtonActive: {
    backgroundColor: theme.colors.neutral,
  },
  sortText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  sortTextActive: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  commentsList: {
    gap: 12,
  },
  comment: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 12,
  },
  reply: {
    marginLeft: 16,
    marginTop: 8,
    backgroundColor: theme.colors.bg,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.border,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentHandle: {
    fontSize: 12,
    color: theme.colors.neutral,
    fontWeight: '600' as const,
  },
  commentTime: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  commentBody: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voteCount: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  reportButton: {
    marginLeft: 'auto',
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
