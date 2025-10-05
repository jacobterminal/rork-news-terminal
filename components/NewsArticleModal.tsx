import React, { useState, useMemo } from 'react';
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
} from 'lucide-react-native';
import { theme, impactColors } from '@/constants/theme';
import { FeedItem, Comment, CommentSortType } from '@/types/news';
import { useNewsStore } from '@/store/newsStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface NewsArticleModalProps {
  visible: boolean;
  article: FeedItem | null;
  onClose: () => void;
}

export default function NewsArticleModal({ visible, article, onClose }: NewsArticleModalProps) {
  const { saveArticle, unsaveArticle, isArticleSaved } = useNewsStore();
  const [translateY] = useState(new Animated.Value(SCREEN_HEIGHT));
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [commentSort, setCommentSort] = useState<CommentSortType>('Hot');

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
  }, [commentSort]);

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

  React.useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    }
  }, [visible]);

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
    if (article?.url) {
      Linking.openURL(article.url);
    }
  };

  const handleSave = () => {
    if (!article) return;
    
    if (isArticleSaved(article.id)) {
      unsaveArticle(article.id);
    } else {
      saveArticle(article);
    }
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
              <Text style={styles.title}>{article.title}</Text>
              
              <View style={styles.sourceRow}>
                <Text style={styles.sourceText}>
                  {article.source.name} • {formatTime(article.published_at)}
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton} onPress={handleOpenOriginal}>
                  <ExternalLink size={16} color={theme.colors.activeCyan} />
                  <Text style={styles.actionText}>Open Original</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
                  <Bookmark 
                    size={16} 
                    color={isArticleSaved(article.id) ? theme.colors.activeCyan : theme.colors.text}
                    fill={isArticleSaved(article.id) ? theme.colors.activeCyan : 'none'}
                  />
                  <Text style={[
                    styles.actionText, 
                    isArticleSaved(article.id) && { color: theme.colors.activeCyan }
                  ]}>
                    {isArticleSaved(article.id) ? 'Saved' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.aiSection}>
                <Text style={styles.sectionTitle}>AI SUMMARY</Text>
                <Text style={styles.aiText}>{article.classification.summary_15}</Text>
              </View>

              <View style={styles.metaRow}>
                <View style={[styles.impactPill, { backgroundColor: impactColors[article.classification.impact] }]}>
                  <Text style={styles.impactText}>{article.classification.impact}</Text>
                </View>
                <View style={styles.sentimentContainer}>
                  <Text style={styles.sentimentText}>
                    {article.classification.sentiment}
                  </Text>
                  <Text style={styles.confidenceText}>
                    {article.classification.confidence}%
                  </Text>
                </View>
              </View>

              {article.tickers && article.tickers.length > 0 && (
                <View style={styles.tickersSection}>
                  <Text style={styles.sectionTitle}>RELATED TICKERS</Text>
                  <View style={styles.tickersRow}>
                    {article.tickers.map((ticker, index) => (
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
    borderColor: theme.colors.activeCyan,
    height: SCREEN_HEIGHT * 0.9,
    shadowColor: theme.colors.activeCyan,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    color: theme.colors.activeCyan,
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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
    backgroundColor: theme.colors.activeCyan,
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
    backgroundColor: theme.colors.activeCyan,
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
    color: theme.colors.activeCyan,
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
