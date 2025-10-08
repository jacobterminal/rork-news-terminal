import React, { useState, useEffect, useRef } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, Animated } from 'react-native';
import { theme, sentimentConfig, impactColors } from '../constants/theme';
import { FeedItem } from '../types/news';
import { formatTime } from '../utils/newsUtils';

interface MainFeedProps {
  items: FeedItem[];
  onTickerPress: (ticker: string) => void;
}

interface FeedCardProps {
  item: FeedItem;
  onTickerPress: (ticker: string) => void;
}

function FeedCard({ item, onTickerPress }: FeedCardProps) {
  const [summaryLoading] = useState(false);
  const flashAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const isHighImpact = item?.classification?.impact === 'High';
  const isNewItem = item?.id?.startsWith('rush_') || item?.id?.startsWith('trump_tariffs_');
  
  useEffect(() => {
    if (isNewItem && isHighImpact) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(flashAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1.02,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(flashAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [item?.id, isNewItem, isHighImpact, flashAnim, scaleAnim]);
  
  // Safe access to configurations
  const sentimentKey = item?.classification?.sentiment || 'Neutral';
  const sentiment = sentimentConfig[sentimentKey] || sentimentConfig.Neutral;
  const impactKey = item?.classification?.impact || 'Low';
  const impactColor = impactColors[impactKey] || impactColors.Low;
  
  const getPills = (): { text: string; color: string }[] => {
    const pills: { text: string; color: string }[] = [];
    
    if (!item) return pills;
    
    if (item.tags?.earnings && item.classification?.summary_15) {
      const verdict = item.classification.summary_15.toLowerCase();
      if (verdict.includes('beat')) {
        pills.push({ text: 'BEAT', color: theme.colors.green });
      } else if (verdict.includes('miss')) {
        pills.push({ text: 'MISS', color: theme.colors.red });
      }
    }
    
    if (item.tags?.fed) pills.push({ text: 'FED', color: theme.colors.amber });
    if (item.tags?.sec) pills.push({ text: 'SEC', color: theme.colors.info });
    
    if (item.classification?.rumor_level === 'Rumor') {
      pills.push({ text: 'RUMOR', color: theme.colors.textDim });
    } else if (item.classification?.rumor_level === 'Confirmed') {
      pills.push({ text: 'CONFIRMED', color: theme.colors.green });
    }
    
    return pills;
  };
  
  const pills = getPills();
  const primaryTicker = item?.tickers?.[0];
  
  const flashOpacity = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });
  
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      {isNewItem && isHighImpact && (
        <Animated.View 
          style={[
            styles.flashOverlay,
            { opacity: flashOpacity }
          ]} 
        />
      )}
      <Pressable style={[styles.card, isNewItem && isHighImpact && styles.cardHighlight]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.headline} numberOfLines={1}>
            {item?.title || ''}
          </Text>
          <View style={styles.pills}>
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
        
        <View style={styles.metaRow}>
          <View style={styles.summaryRow}>
            {summaryLoading ? (
              <Text style={styles.summaryLoading}>Summary pending...</Text>
            ) : (
              <Text style={styles.summary} numberOfLines={1}>
                {item?.classification?.summary_15 || ''}
              </Text>
            )}
            
            <View style={styles.sentimentContainer}>
              <Text style={[styles.sentimentIcon, { color: sentiment.color }]}>
                {sentiment.icon}
              </Text>
              <Text style={styles.confidenceText}>
                {Math.round(item?.classification?.confidence || 0)}%
              </Text>
            </View>
            
            <View style={[styles.impactDot, { backgroundColor: impactColor }]} />
          </View>
          
          {primaryTicker && (
            <Pressable
              style={styles.tickerButton}
              onPress={() => typeof onTickerPress === 'function' && onTickerPress(primaryTicker)}
            >
              <Text style={styles.tickerButtonText}>Open {primaryTicker}</Text>
            </Pressable>
          )}
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.sourceBadge}>
          <Text style={styles.sourceBadgeText}>{item?.source?.name || 'Unknown'}</Text>
        </View>
        
        <Text style={styles.timestamp}>{formatTime(item?.published_at || '')}</Text>
      </View>
      </Pressable>
    </Animated.View>
  );
}

export default function MainFeed({ items, onTickerPress }: MainFeedProps) {
  const renderItem = ({ item }: { item: FeedItem }) => (
    <FeedCard item={item} onTickerPress={onTickerPress} />
  );
  
  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>No items. Try All or remove filters.</Text>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  listContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    gap: theme.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  headline: {
    flex: 1,
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    fontWeight: '500',
    lineHeight: 18,
  },
  pills: {
    flexDirection: 'row',
    gap: 4,
    flexShrink: 0,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  summaryRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  summary: {
    flex: 1,
    fontSize: theme.fontSize.tight,
    color: theme.colors.textDim,
    lineHeight: 16,
  },
  summaryLoading: {
    flex: 1,
    fontSize: theme.fontSize.tight,
    color: theme.colors.textDim,
    fontStyle: 'italic',
  },
  sentimentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sentimentIcon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  confidenceText: {
    fontSize: 10,
    color: theme.colors.textDim,
    fontFamily: 'monospace',
  },
  impactDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tickerButton: {
    backgroundColor: theme.colors.info + '20',
    borderWidth: 1,
    borderColor: theme.colors.info,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tickerButtonText: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.info,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  sourceBadge: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  sourceBadgeText: {
    fontSize: 10,
    color: theme.colors.textDim,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 10,
    color: theme.colors.textDim,
    fontFamily: 'monospace',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textDim,
    textAlign: 'center',
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.red,
    borderRadius: 8,
    zIndex: 1,
  },
  cardHighlight: {
    borderColor: theme.colors.red,
    borderWidth: 2,
  },
});