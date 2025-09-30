import React from 'react';
import { View, Text, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Bookmark } from 'lucide-react-native';
import { FeedItem } from '../types/news';
import { theme, sentimentConfig, impactColors } from '../constants/theme';
import { useNewsStore } from '../store/newsStore';

interface NewsCardProps {
  item: FeedItem;
  onTickerPress?: (ticker: string) => void;
  showTweet?: boolean;
  onPress?: () => void;
}

export default function NewsCard({ item, onTickerPress, showTweet = false, onPress }: NewsCardProps) {
  const { saveArticle, unsaveArticle, isArticleSaved } = useNewsStore();
  
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSentimentIcon = () => {
    const config = sentimentConfig[item.classification.sentiment];
    return config.icon;
  };

  const getSentimentColor = () => {
    const config = sentimentConfig[item.classification.sentiment];
    return config.color;
  };

  const getImpactColor = () => {
    return impactColors[item.classification.impact];
  };

  const getRumorBadgeColor = () => {
    switch (item.classification.rumor_level) {
      case 'Confirmed': return theme.colors.bullish;
      case 'Likely': return theme.colors.neutral;
      case 'Rumor': return theme.colors.bearish;
      default: return theme.colors.textDim;
    }
  };

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/article/${item.id}`);
    }
  };
  
  const handleSave = (e: any) => {
    e.stopPropagation(); // Prevent card press when saving
    if (isArticleSaved(item.id)) {
      unsaveArticle(item.id);
    } else {
      saveArticle(item);
    }
  };

  return (
    <Pressable style={styles.card} onPress={handleCardPress}>
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.sourceRow}>
          <View style={[styles.sourceBadge, { backgroundColor: theme.colors.border }]}>
            <Text style={styles.sourceText}>{item.source.name}</Text>
          </View>
          {showTweet && (
            <View style={[styles.tweetBadge, { backgroundColor: theme.colors.info }]}>
              <Text style={styles.tweetText}>TWEET</Text>
            </View>
          )}
          <View style={[styles.rumorBadge, { backgroundColor: getRumorBadgeColor() }]}>
            <Text style={styles.rumorText}>{item.classification.rumor_level.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.timestamp}>{formatTime(item.published_at)}</Text>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>

      {/* Ticker Chips */}
      {item.tickers.length > 0 && (
        <View style={styles.tickerRow}>
          {item.tickers.slice(0, 4).map((ticker) => (
            <Pressable
              key={ticker}
              style={styles.tickerChip}
              onPress={() => {
                if (!ticker?.trim() || ticker.length > 10) return;
                onTickerPress?.(ticker.trim());
              }}
            >
              <Text style={styles.tickerText}>{ticker}</Text>
            </Pressable>
          ))}
          {item.tickers.length > 4 && (
            <Text style={styles.moreText}>+{item.tickers.length - 4}</Text>
          )}
        </View>
      )}

      {/* AI Summary */}
      <Text style={styles.summary} numberOfLines={1}>
        {item.classification.summary_15}
      </Text>

      {/* Bottom Row */}
      <View style={styles.bottomRow}>
        <View style={styles.indicators}>
          <View style={styles.sentimentContainer}>
            <Text style={[styles.sentimentIcon, { color: getSentimentColor() }]}>
              {getSentimentIcon()}
            </Text>
            <Text style={styles.confidence}>{item.classification.confidence}%</Text>
          </View>
          <View style={[styles.impactDot, { backgroundColor: getImpactColor() }]} />
          <Text style={styles.impactText}>{item.classification.impact}</Text>
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Bookmark 
            size={16} 
            color={isArticleSaved(item.id) ? '#FFD700' : theme.colors.textDim}
            fill={isArticleSaved(item.id) ? '#FFD700' : 'none'}
          />
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sourceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sourceText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tweetBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tweetText: {
    color: theme.colors.text,
    fontSize: 10,
    fontWeight: '600',
  },
  rumorBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rumorText: {
    color: theme.colors.text,
    fontSize: 10,
    fontWeight: '600',
  },
  timestamp: {
    color: theme.colors.textDim,
    fontSize: 11,
  },
  title: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700' as const,
    lineHeight: 18,
    marginBottom: 12,
  },
  tickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  tickerChip: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tickerText: {
    color: theme.colors.info,
    fontSize: 11,
    fontWeight: '600',
  },
  moreText: {
    color: theme.colors.textDim,
    fontSize: 11,
  },
  summary: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontStyle: 'normal' as const,
    marginBottom: 12,
    lineHeight: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sentimentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sentimentIcon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  confidence: {
    color: theme.colors.textDim,
    fontSize: 11,
  },
  impactDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  impactText: {
    color: theme.colors.textDim,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  saveButton: {
    padding: 4,
  },
});
