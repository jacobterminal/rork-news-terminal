import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,

} from 'react-native';
import { useLocalSearchParams, Stack, router, useNavigation } from 'expo-router';

import {
  ExternalLink,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Flag,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
} from 'lucide-react-native';
import { theme, impactColors } from '@/constants/theme';
import { ArticleData, Comment, CommentSortType, FeedItem } from '@/types/news';
import { useNewsStore } from '@/store/newsStore';
import { newsAnalysisStore, SENTIMENT_COLORS, SentimentLabel, ImpactLevel } from '@/store/newsAnalysis';
import ArticleLinkPill from '@/components/ArticleLinkPill';

// Mock article data - in real app this would come from API
const mockArticleData: ArticleData = {
  id: '1',
  title: 'Fed Minutes Reveal Split on Rate Cuts as Markets Price in Pause',
  source: {
    name: 'Reuters',
    type: 'news',
    reliability: 95,
    url: 'https://reuters.com',
  },
  published_at: '21:15:03',
  original_url: 'https://reuters.com/article/fed-minutes',
  ai: {
    summary: 'Fed minutes show split; markets priced a pause; expect near-term volatility.',
    overview: 'Federal Reserve officials expressed divergent views on the pace of future rate cuts during their last meeting. Several members favored a more cautious approach citing persistent inflation concerns. Market participants had already priced in a pause for the next meeting.',
    opinion: 'The dovish-hawkish split suggests policy uncertainty that typically increases market volatility.',
    sentiment: 'Bearish',
    confidence: 78,
    impact: 'High',
    explainer: 'Fed policy uncertainty historically leads to increased volatility in equity markets as investors reassess risk premiums and discount rates for future cash flows.',
  },
  comments: [
    {
      id: '1',
      user_handle: 'TraderMike',
      body: 'This explains the recent bond volatility. Fed uncertainty always spooks fixed income.',
      created_at: '21:18:30',
      upvotes: 12,
      downvotes: 2,
      flagged: false,
    },
    {
      id: '2',
      user_handle: 'MarketWatch',
      body: 'Split decisions are never good for market confidence. Expect more chop ahead.',
      created_at: '21:22:15',
      upvotes: 8,
      downvotes: 1,
      flagged: false,
      replies: [
        {
          id: '3',
          user_handle: 'BullishBear',
          body: 'Disagree. Markets love clarity, but they adapt to uncertainty quickly.',
          created_at: '21:25:42',
          upvotes: 5,
          downvotes: 3,
          flagged: false,
        },
      ],
    },
  ],
  community_sentiment: {
    bullish: 25,
    neutral: 33,
    bearish: 42,
  },
};

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  console.log('Article ID:', id);
  const navigation = useNavigation();
  const { saveArticle, unsaveArticle, isArticleSaved } = useNewsStore();
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [commentSort, setCommentSort] = useState<CommentSortType>('Hot');
  const [newComment, setNewComment] = useState('');
  const [postPublicly, setPostPublicly] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{ sentiment: { label: SentimentLabel; confidence: number }; impact: ImpactLevel } | null>(null);

  // In real app, fetch article data based on id
  const article = mockArticleData;

  // Load or compute analysis on mount
  useEffect(() => {
    const articleId = id || article.id;
    let existing = newsAnalysisStore.getAnalysis(articleId);
    
    if (existing) {
      setAnalysis(existing);
      return;
    }

    // Compute analysis once
    setAnalysisLoading(true);
    
    // Simulate analysis computation (in real app, this would be an API call)
    setTimeout(() => {
      const sentimentMap: Record<string, SentimentLabel> = {
        'Bullish': 'BULL',
        'Bearish': 'BEAR',
        'Neutral': 'NEUTRAL',
      };
      
      const impactMap: Record<string, ImpactLevel> = {
        'Low': 'LOW',
        'Medium': 'MEDIUM',
        'High': 'HIGH',
      };

      const computed = {
        articleId,
        sentiment: {
          label: sentimentMap[article.ai.sentiment] || 'NEUTRAL',
          confidence: article.ai.confidence / 100,
        },
        impact: impactMap[article.ai.impact] || 'MEDIUM',
      };

      newsAnalysisStore.upsert(computed);
      setAnalysis(computed);
      setAnalysisLoading(false);
    }, 100);
  }, [id, article.id, article.ai.sentiment, article.ai.confidence, article.ai.impact]);

  const sortedComments = useMemo(() => {
    const comments = [...article.comments];
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
  }, [article.comments, commentSort]);

  const handleOpenOriginal = () => {
    Linking.openURL(article.original_url);
  };



  const handleSave = () => {
    // Convert ArticleData to FeedItem format for saving
    const feedItem: FeedItem = {
      id: article.id,
      published_at: new Date().toISOString(), // Use current time for saved articles
      title: article.title,
      url: article.original_url,
      source: article.source,
      tickers: [], // Articles don't have tickers in this format
      tags: { is_macro: false, fed: false, sec: false, earnings: false, social: false },
      classification: {
        rumor_level: 'Confirmed' as const,
        sentiment: article.ai.sentiment as 'Bullish' | 'Bearish' | 'Neutral',
        confidence: article.ai.confidence,
        impact: article.ai.impact as 'Low' | 'Medium' | 'High',
        summary_15: article.ai.summary,
      },
    };
    
    if (isArticleSaved(article.id)) {
      unsaveArticle(article.id);
    } else {
      saveArticle(feedItem);
    }
  };

  const handlePostComment = () => {
    const trimmedComment = newComment.trim();
    if (trimmedComment && trimmedComment.length <= 500) {
      // Post comment logic
      console.log('Post comment:', trimmedComment);
      setNewComment('');
    }
  };

  const handleVote = (commentId: string, type: 'up' | 'down') => {
    // Vote logic
    console.log(`Vote ${type} on comment ${commentId}`);
  };

  const handleReport = (commentId: string) => {
    if (commentId.trim()) {
      console.log('Report comment:', commentId);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => {
    if (!comment || !comment.id || !comment.user_handle.trim()) return null;
    
    return (
    <View key={comment.id} style={[styles.comment, isReply && styles.reply]}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentHandle}>{comment.user_handle}</Text>
        <Text style={styles.commentTime}>{comment.created_at}</Text>
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

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerStyle: {
            backgroundColor: theme.colors.bg,
          },
          headerTintColor: theme.colors.text,
          headerLeft: () => (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (navigation.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/');
                }
              }}
            >
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{article.title}</Text>
          <View style={styles.sourceRow}>
            <Text style={styles.sourceText}>
              Source: {article.source.name} • Published: {article.published_at}
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleOpenOriginal}>
              <ExternalLink size={16} color={theme.colors.text} />
              <Text style={styles.actionText}>Open Original</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
              <Bookmark 
                size={16} 
                color={isArticleSaved(article.id) ? theme.colors.activeCyan : theme.colors.text}
                fill={isArticleSaved(article.id) ? theme.colors.activeCyan : 'none'}
              />
              <Text style={[styles.actionText, isArticleSaved(article.id) && { color: theme.colors.activeCyan }]}>
                {isArticleSaved(article.id) ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Analysis */}
        <View style={styles.aiSection}>
          <View style={styles.aiBlock}>
            <Text style={styles.aiLabel}>AI SUMMARY</Text>
            <Text style={styles.aiText}>{article.ai.summary}</Text>
          </View>

          <View style={styles.aiBlock}>
            <Text style={styles.aiLabel}>AI OVERVIEW</Text>
            <Text style={styles.aiText}>{article.ai.overview}</Text>
          </View>

          <View style={styles.aiBlock}>
            <Text style={styles.aiLabel}>AI OPINION</Text>
            <Text style={styles.aiText}>{article.ai.opinion}</Text>
            {analysisLoading ? (
              <Text style={styles.confidence}>Computing analysis...</Text>
            ) : analysis ? (
              <View style={[styles.sentimentChip, { borderColor: SENTIMENT_COLORS[analysis.sentiment.label] }]}>
                <Text style={[styles.sentimentChipText, { color: SENTIMENT_COLORS[analysis.sentiment.label] }]}>
                  {analysis.sentiment.label} ({Math.round(analysis.sentiment.confidence * 100)}%)
                </Text>
              </View>
            ) : (
              <Text style={styles.confidence}>Confidence: {article.ai.confidence}%</Text>
            )}
          </View>

          {/* Impact & Verdict */}
          {analysis && (
            <View style={styles.impactRow}>
              <View style={[styles.impactPill, { backgroundColor: impactColors[article.ai.impact] }]}>
                <Text style={styles.impactText}>{analysis.impact}</Text>
              </View>
              <View style={styles.verdictContainer}>
                <Text style={styles.verdictText}>
                  Likely {analysis.sentiment.label === 'BULL' ? 'Bullish' : analysis.sentiment.label === 'BEAR' ? 'Bearish' : 'Neutral'}
                </Text>
                <Text style={styles.verdictConfidence}>{Math.round(analysis.sentiment.confidence * 100)}%</Text>
              </View>
            </View>
          )}

          {/* Source Link Pill */}
          {analysis && !analysisLoading && (
            <ArticleLinkPill
              url={article.original_url}
              label={`${article.source.name} ↗`}
              sentiment={analysis.sentiment.label}
            />
          )}

          <View style={styles.aiBlock}>
            <Text style={styles.aiLabel}>SHORT EXPLAINER</Text>
            <Text style={styles.aiText}>{article.ai.explainer}</Text>
          </View>
        </View>

        {/* Community Sentiment */}
        <View style={styles.sentimentSection}>
          <Text style={styles.sectionTitle}>COMMUNITY SENTIMENT</Text>
          <View style={styles.sentimentRow}>
            <Text style={styles.sentimentText}>
              Bullish {article.community_sentiment.bullish}% | 
              Neutral {article.community_sentiment.neutral}% | 
              Bearish {article.community_sentiment.bearish}%
            </Text>
          </View>
          <Text style={styles.sentimentSummary}>
            Community consensus leans Bearish ({article.community_sentiment.bearish}%).
          </Text>
          <View style={styles.aiSentimentRow}>
            <Text style={styles.aiSentimentText}>
              AI Sentiment: {article.ai.sentiment} — Confidence: {article.ai.confidence}%
            </Text>
          </View>
        </View>

        {/* Comments */}
        <View style={styles.commentsSection}>
          <TouchableOpacity
            style={styles.commentsHeader}
            onPress={() => setCommentsExpanded(!commentsExpanded)}
          >
            <Text style={styles.commentsTitle}>
              Comments • {article.comments.length}
            </Text>
            {commentsExpanded ? (
              <ChevronUp size={20} color={theme.colors.text} />
            ) : (
              <ChevronDown size={20} color={theme.colors.text} />
            )}
          </TouchableOpacity>

          {commentsExpanded && (
            <>
              {/* Comment Sort */}
              <View style={styles.sortRow}>
                {(['Hot', 'New', 'Top'] as CommentSortType[]).map((sort) => {
                  if (!sort.trim()) return null;
                  return (
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
                  );
                })}
              </View>

              {/* Comment Input */}
              <View style={styles.commentInput}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Add a comment..."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                />
                <View style={styles.inputActions}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setPostPublicly(!postPublicly)}
                  >
                    <View style={[styles.checkboxBox, postPublicly && styles.checkboxChecked]} />
                    <Text style={styles.checkboxText}>Post publicly under my handle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.postButton} onPress={handlePostComment}>
                    <Text style={styles.postButtonText}>Post</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Comments List */}
              <View style={styles.commentsList}>
                <Text style={styles.disclaimer}>
                  User comments are community content and not financial advice.
                </Text>
                {sortedComments.map(comment => {
                  if (!comment || !comment.id) return null;
                  return renderComment(comment);
                })}
              </View>
            </>
          )}
        </View>

        {/* Legal Disclaimer */}
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.sm,
  },
  sourceRow: {
    marginBottom: theme.spacing.md,
  },
  sourceText: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  backButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  actionText: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.text,
  },
  aiSection: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  aiBlock: {
    marginBottom: theme.spacing.sm,
  },
  aiLabel: {
    fontSize: theme.fontSize.tight,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
  },
  aiText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    lineHeight: 18,
  },
  confidence: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginVertical: theme.spacing.sm,
  },
  impactPill: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 4,
  },
  impactText: {
    fontSize: theme.fontSize.tight,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  verdictContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  verdictText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    fontWeight: '600',
  },
  verdictConfidence: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.textSecondary,
  },
  sentimentChip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  sentimentChipText: {
    fontSize: theme.fontSize.tight,
    fontWeight: '600',
  },
  sentimentSection: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: theme.fontSize.tight,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
  },
  sentimentRow: {
    marginBottom: theme.spacing.xs,
  },
  sentimentText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
  },
  sentimentSummary: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  aiSentimentRow: {
    marginTop: theme.spacing.xs,
  },
  aiSentimentText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
  },
  commentsSection: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  commentsTitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    fontWeight: '600',
  },
  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sortButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 4,
    backgroundColor: theme.colors.card,
  },
  sortButtonActive: {
    backgroundColor: theme.colors.activeCyan,
  },
  sortText: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.textSecondary,
  },
  sortTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  commentInput: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  textInput: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.fontSize.base,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  checkboxBox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 2,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.activeCyan,
    borderColor: theme.colors.activeCyan,
  },
  checkboxText: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.textSecondary,
  },
  postButton: {
    backgroundColor: theme.colors.activeCyan,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 4,
  },
  postButtonText: {
    fontSize: theme.fontSize.tight,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  commentsList: {
    paddingHorizontal: theme.spacing.lg,
  },
  disclaimer: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    fontStyle: 'italic',
  },
  comment: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  reply: {
    marginLeft: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.bg,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.border,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  commentHandle: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.activeCyan,
    fontWeight: '600',
  },
  commentTime: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.textSecondary,
  },
  commentBody: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  voteCount: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.textSecondary,
  },
  reportButton: {
    marginLeft: 'auto',
  },
  disclaimerText: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    padding: theme.spacing.lg,
    fontStyle: 'italic',
  },
});