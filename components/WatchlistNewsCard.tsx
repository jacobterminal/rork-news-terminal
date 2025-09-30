import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../constants/theme';
import { TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react-native';

interface WatchlistNewsItem {
  ticker: string;
  source: string;
  time: string;
  headline: string;
  summary: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  impact: 'Low' | 'Medium' | 'High';
}

interface WatchlistNewsCardProps {
  item: WatchlistNewsItem;
  onPress: (item: WatchlistNewsItem) => void;
  onTickerPress: (ticker: string) => void;
}

export default function WatchlistNewsCard({ item, onPress, onTickerPress }: WatchlistNewsCardProps) {
  const getSentimentIcon = (sentiment: string) => {
    const iconSize = 16;
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

  const getImpactPillStyle = (impact: string) => {
    switch (impact) {
      case 'High':
        return [styles.impactPill, styles.highImpactPill];
      case 'Medium':
        return [styles.impactPill, styles.mediumImpactPill];
      default:
        return [styles.impactPill, styles.lowImpactPill];
    }
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

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      {/* Header row: Source left, Time right */}
      <View style={styles.header}>
        <Text style={styles.sourceText}>{item.source}</Text>
        <View style={styles.timeContainer}>
          <Clock size={12} color={theme.colors.textDim} />
          <Text style={styles.timeText}>{formatTime(item.time)}</Text>
        </View>
      </View>

      {/* Headline */}
      <Text style={styles.headline} numberOfLines={2}>
        {item.headline}
      </Text>

      {/* Ticker chip */}
      <TouchableOpacity
        style={styles.tickerChip}
        onPress={() => onTickerPress(item.ticker)}
        activeOpacity={0.7}
      >
        <Text style={styles.tickerText}>{item.ticker}</Text>
      </TouchableOpacity>

      {/* Summary */}
      <Text style={styles.summary} numberOfLines={1}>
        {item.summary}
      </Text>

      {/* Bottom row: Sentiment left, Impact right */}
      <View style={styles.bottomRow}>
        <View style={styles.sentimentContainer}>
          {getSentimentIcon(item.sentiment)}
          <Text style={styles.sentimentText}>
            {item.sentiment} {item.confidence}%
          </Text>
        </View>
        <View style={getImpactPillStyle(item.impact)}>
          <Text style={styles.impactText}>{item.impact}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceText: {
    fontSize: 11,
    color: theme.colors.bullish,
    fontWeight: '600' as const,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: theme.colors.textDim,
  },
  headline: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: theme.colors.text,
    lineHeight: 18,
    marginBottom: 12,
  },
  tickerChip: {
    backgroundColor: theme.colors.bullish,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  tickerText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: theme.colors.bg,
  },
  summary: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sentimentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sentimentText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '600' as const,
  },
  impactPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  highImpactPill: {
    backgroundColor: '#FF1744',
  },
  mediumImpactPill: {
    backgroundColor: '#FF8C00',
  },
  lowImpactPill: {
    backgroundColor: '#6C757D',
  },
  impactText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
});