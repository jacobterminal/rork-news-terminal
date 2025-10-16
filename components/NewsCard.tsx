import React from 'react';
import { View, Text, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Bookmark } from 'lucide-react-native';
import { FeedItem } from '../types/news';
import { theme, sentimentConfig } from '../constants/theme';
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
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const getSentimentColor = () => {
    const config = sentimentConfig[item.classification.sentiment];
    return config.color;
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

  const sentiment = item.classification.sentiment;
  const sentimentLabel = sentiment === 'Bullish' ? 'BULL' : sentiment === 'Bearish' ? 'BEAR' : 'NEUT';
  const sentimentColor = getSentimentColor();

  return (
    <Pressable style={styles.tableRow} onPress={handleCardPress}>
      <View style={styles.rowContent}>
        <View style={styles.topLine}>
          <Text style={styles.timeText}>{formatTime(item.published_at)}</Text>
          <Text style={styles.sourceText}>{item.source.name}</Text>
          <View style={[styles.pill, { borderColor: sentimentColor }]}>
            <Text style={[styles.pillText, { color: sentimentColor }]}>
              {sentimentLabel} {item.classification.confidence}%
            </Text>
          </View>
          <TouchableOpacity style={styles.saveIcon} onPress={handleSave}>
            <Bookmark 
              size={14} 
              color={isArticleSaved(item.id) ? theme.colors.neutral : theme.colors.textDim}
              fill={isArticleSaved(item.id) ? theme.colors.neutral : 'none'}
            />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.headline} numberOfLines={2}>
          {item.title}
        </Text>
        
        {item.tickers.length > 0 && (
          <View style={styles.tickersRow}>
            {item.tickers.slice(0, 5).map((ticker) => (
              <Pressable
                key={ticker}
                onPress={(e) => {
                  e.stopPropagation();
                  if (!ticker?.trim() || ticker.length > 10) return;
                  const tickerUpper = ticker.trim().toUpperCase();
                  router.push(`/company/${tickerUpper}`);
                }}
              >
                <Text style={styles.tickerTag}>{ticker}</Text>
              </Pressable>
            ))}
            {item.tickers.length > 5 && (
              <Text style={styles.moreText}>+{item.tickers.length - 5}</Text>
            )}
          </View>
        )}
        
        <Text style={styles.summary} numberOfLines={1}>
          {item.classification.summary_15}
        </Text>
        
        <View style={styles.dataGrid}>
          <View style={styles.dataCol}>
            <Text style={styles.dataLabel}>RUMOR</Text>
            <Text style={[
              styles.dataValue,
              item.classification.rumor_level === 'Confirmed' && styles.confirmedText,
              item.classification.rumor_level === 'Rumor' && styles.rumorText,
            ]}>
              {item.classification.rumor_level.toUpperCase()}
            </Text>
          </View>
          <View style={styles.dataCol}>
            <Text style={styles.dataLabel}>IMPACT</Text>
            <Text style={[
              styles.dataValue,
              item.classification.impact === 'High' && styles.highImpact,
              item.classification.impact === 'Medium' && styles.mediumImpact,
            ]}>
              {item.classification.impact.toUpperCase()}
            </Text>
          </View>
          {showTweet && (
            <View style={styles.dataCol}>
              <Text style={styles.dataLabel}>SOURCE</Text>
              <Text style={[styles.dataValue, { color: theme.colors.info }]}>TWEET</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.bg,
  },
  rowContent: {
    gap: 6,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: theme.colors.textDim,
    minWidth: 40,
  },
  sourceText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase' as const,
    flex: 1,
  },
  pill: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  pillText: {
    fontSize: 9,
    fontWeight: '700' as const,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  saveIcon: {
    padding: 2,
  },
  headline: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: theme.colors.text,
    lineHeight: 16,
  },
  tickersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  tickerTag: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: theme.colors.bullish,
    fontWeight: '700' as const,
  },
  moreText: {
    fontSize: 9,
    color: theme.colors.textDim,
  },
  summary: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 14,
  },
  dataGrid: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  dataCol: {
    minWidth: 60,
  },
  dataLabel: {
    fontSize: 8,
    color: theme.colors.textDim,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  dataValue: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: theme.colors.textSecondary,
    fontWeight: '600' as const,
  },
  confirmedText: {
    color: theme.colors.bullish,
  },
  rumorText: {
    color: theme.colors.bearish,
  },
  highImpact: {
    color: theme.colors.bearish,
  },
  mediumImpact: {
    color: theme.colors.neutral,
  },
});
