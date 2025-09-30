import { X } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme, sentimentConfig } from '../constants/theme';
import { FeedItem } from '../types/news';
import { formatTime } from '../utils/newsUtils';

interface TickerDrawerProps {
  isOpen: boolean;
  ticker: string | null;
  onClose: () => void;
  headlines: FeedItem[];
}

interface TickerHeadlineProps {
  item: FeedItem;
}

function TickerHeadline({ item }: TickerHeadlineProps) {
  const sentimentKey = item && item.classification && item.classification.sentiment 
    ? item.classification.sentiment 
    : 'Neutral';
  const sentiment = sentimentConfig[sentimentKey] || sentimentConfig.Neutral;
  
  const getPills = () => {
    const pills: { text: string; color: string }[] = [];
    
    if (!item || !item.tags || !item.classification) return pills;
    
    if (item.tags.earnings && item.classification.summary_15) {
      const verdict = item.classification.summary_15.toLowerCase();
      if (verdict.includes('beat')) {
        pills.push({ text: 'BEAT', color: theme.colors.green });
      } else if (verdict.includes('miss')) {
        pills.push({ text: 'MISS', color: theme.colors.red });
      } else {
        pills.push({ text: 'INLINE', color: theme.colors.textDim });
      }
    }
    
    if (item.tags.fed) pills.push({ text: 'FED', color: theme.colors.amber });
    if (item.tags.sec) pills.push({ text: 'SEC', color: theme.colors.info });
    
    return pills;
  };
  
  const pills = getPills();
  
  return (
    <View style={styles.headlineCard}>
      <View style={styles.headlineHeader}>
        <Text style={styles.headlineTitle} numberOfLines={1}>
          {item.title || ''}
        </Text>
        <View style={styles.headlinePills}>
          {pills.map((pill, pillIndex) => (
            <View
              key={`${item.id}-pill-${pillIndex}`}
              style={[styles.pill, { backgroundColor: pill.color + '20', borderColor: pill.color }]}
            >
              <Text style={[styles.pillText, { color: pill.color }]}>
                {pill.text}
              </Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.headlineMeta}>
        <Text style={styles.headlineSummary} numberOfLines={1}>
          {item.classification?.summary_15 || ''}
        </Text>
        
        <View style={styles.headlineSentiment}>
          <Text style={[styles.sentimentIcon, { color: sentiment.color }]}>
            {sentiment.icon}
          </Text>
          <Text style={styles.confidenceText}>
            {Math.round(item.classification?.confidence || 0)}%
          </Text>
        </View>
      </View>
      
      <View style={styles.headlineFooter}>
        <Text style={styles.headlineSource}>{item.source?.name || 'Unknown'}</Text>
        <Text style={styles.headlineTime}>{formatTime(item.published_at || '')}</Text>
      </View>
    </View>
  );
}

export default function TickerDrawer({ isOpen, ticker, onClose, headlines }: TickerDrawerProps) {
  // Handle escape key - only on web
  useEffect(() => {
    if (typeof window === 'undefined' || !isOpen) return;
    
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!event) return;
      
      try {
        if (event.key === 'Escape' && typeof onClose === 'function') {
          onClose();
        }
      } catch (error) {
        console.warn('Error handling escape key:', error);
      }
    };
    
    try {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    } catch (error) {
      console.warn('Error setting up escape key handler:', error);
    }
  }, [isOpen, onClose]);
  
  if (!ticker) return null;
  
  const safeHeadlines = Array.isArray(headlines) ? headlines : [];
  
  // Calculate latest sentiment with safe access
  const latestSentiment = safeHeadlines.length > 0 && safeHeadlines[0] && safeHeadlines[0].classification 
    ? safeHeadlines[0].classification.sentiment || 'Neutral' 
    : 'Neutral';
  
  const avgConfidence = safeHeadlines.length > 0 
    ? Math.round(safeHeadlines.reduce((sum, h) => {
        if (!h || !h.classification || typeof h.classification.confidence !== 'number') return sum;
        return sum + h.classification.confidence;
      }, 0) / safeHeadlines.length)
    : 0;
  
  // Get latest earnings verdict if any
  const latestEarnings = safeHeadlines.find(h => h && h.tags && h.tags.earnings);
  const earningsVerdict = latestEarnings && latestEarnings.classification && latestEarnings.classification.summary_15 ? (
    latestEarnings.classification.summary_15.toLowerCase().includes('beat') ? 'Beat' :
    latestEarnings.classification.summary_15.toLowerCase().includes('miss') ? 'Miss' : 'Inline'
  ) : null;
  
  const sentiment = sentimentConfig[latestSentiment] || sentimentConfig.Neutral;
  
  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.tickerTitle}>{ticker}</Text>
            <Text style={styles.companyName}>Company Name</Text>
          </View>
          
          <Pressable style={styles.closeButton} onPress={onClose}>
            <X size={20} color={theme.colors.textDim} />
          </Pressable>
        </View>
        
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Sentiment</Text>
            <View style={styles.sentimentContainer}>
              <Text style={[styles.sentimentIcon, { color: sentiment.color }]}>
                {sentiment.icon}
              </Text>
              <Text style={[styles.sentimentText, { color: sentiment.color }]}>
                {latestSentiment}
              </Text>
              <Text style={styles.confidenceText}>{avgConfidence}%</Text>
            </View>
          </View>
          
          {earningsVerdict && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Latest Earnings</Text>
              <View style={[
                styles.earningsBadge,
                {
                  backgroundColor: earningsVerdict === 'Beat' ? theme.colors.green + '20' : 
                                 earningsVerdict === 'Miss' ? theme.colors.red + '20' : 
                                 theme.colors.textDim + '20',
                  borderColor: earningsVerdict === 'Beat' ? theme.colors.green : 
                              earningsVerdict === 'Miss' ? theme.colors.red : 
                              theme.colors.textDim,
                }
              ]}>
                <Text style={[
                  styles.earningsText,
                  {
                    color: earningsVerdict === 'Beat' ? theme.colors.green : 
                           earningsVerdict === 'Miss' ? theme.colors.red : 
                           theme.colors.textDim,
                  }
                ]}>
                  {earningsVerdict}
                </Text>
              </View>
            </View>
          )}
        </View>
        
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Recent Headlines</Text>
          
          <ScrollView style={styles.headlinesList} showsVerticalScrollIndicator={false}>
            {safeHeadlines.length > 0 ? (
              safeHeadlines.map(headline => {
                if (!headline || !headline.id) return null;
                return (
                  <TickerHeadline key={headline.id} item={headline} />
                );
              }).filter(Boolean)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No recent headlines for {ticker || 'Unknown'}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
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
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  tickerTitle: {
    fontSize: 24,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  companyName: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textDim,
    marginTop: 2,
  },
  closeButton: {
    padding: theme.spacing.sm,
    borderRadius: 6,
    backgroundColor: theme.colors.card,
  },
  summary: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.textDim,
    marginBottom: 4,
  },
  sentimentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sentimentIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sentimentText: {
    fontSize: theme.fontSize.base,
    fontWeight: '600',
  },
  confidenceText: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.textDim,
    fontFamily: 'monospace',
  },
  earningsBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  earningsText: {
    fontSize: theme.fontSize.tight,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  headlinesList: {
    flex: 1,
  },
  headlineCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  headlineHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  headlineTitle: {
    flex: 1,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    fontWeight: '500',
    lineHeight: 18,
  },
  headlinePills: {
    flexDirection: 'row',
    gap: 4,
  },
  pill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  headlineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  headlineSummary: {
    flex: 1,
    fontSize: theme.fontSize.tight,
    color: theme.colors.textDim,
    lineHeight: 16,
  },
  headlineSentiment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  headlineFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  headlineSource: {
    fontSize: 10,
    color: theme.colors.textDim,
    fontWeight: '500',
  },
  headlineTime: {
    fontSize: 10,
    color: theme.colors.textDim,
    fontFamily: 'monospace',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textDim,
    textAlign: 'center',
  },
});