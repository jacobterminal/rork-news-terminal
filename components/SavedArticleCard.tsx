import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bookmark, TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { FeedItem } from '@/types/news';
import { useNewsStore } from '@/store/newsStore';

interface SavedArticleCardProps {
  article: FeedItem;
}

export default function SavedArticleCard({ article }: SavedArticleCardProps) {
  const { unsaveArticle } = useNewsStore();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleUnsave = (e: any) => {
    e.stopPropagation();
    unsaveArticle(article.id);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Bullish': return theme.colors.bullish;
      case 'Bearish': return theme.colors.bearish;
      default: return theme.colors.neutral;
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    const iconSize = 14;
    const color = getSentimentColor(sentiment);
    
    switch (sentiment) {
      case 'Bullish':
        return <TrendingUp size={iconSize} color={color} />;
      case 'Bearish':
        return <TrendingDown size={iconSize} color={color} />;
      default:
        return <Minus size={iconSize} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sourceText}>{article.source.name}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.timeText}>{formatTime(article.published_at)}</Text>
          <TouchableOpacity 
            style={styles.unsaveButton} 
            onPress={handleUnsave}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Bookmark 
              size={14} 
              color={theme.colors.sectionTitle}
              fill={theme.colors.sectionTitle}
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.title} numberOfLines={2}>
        {article.title}
      </Text>
      
      <View style={styles.footer}>
        <View style={styles.sentimentRow}>
          {getSentimentIcon(article.classification.sentiment)}
          <Text style={[styles.sentimentText, { color: getSentimentColor(article.classification.sentiment) }]}>
            {article.classification.sentiment} {article.classification.confidence}%
          </Text>
        </View>
        
        {article.tickers && article.tickers.length > 0 && (
          <View style={styles.tickersRow}>
            {article.tickers.slice(0, 3).map((ticker, index) => (
              <View key={index} style={styles.tickerPill}>
                <Text style={styles.tickerText}>{ticker}</Text>
              </View>
            ))}
            {article.tickers.length > 3 && (
              <Text style={styles.moreTickersText}>+{article.tickers.length - 3}</Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0A0A',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 11,
    color: theme.colors.textDim,
  },
  unsaveButton: {
    padding: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    lineHeight: 17,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  sentimentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sentimentText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tickersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  tickerPill: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.sectionTitle,
  },
  tickerText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.sectionTitle,
  },
  moreTickersText: {
    fontSize: 10,
    color: theme.colors.textDim,
    fontWeight: '600',
  },
});