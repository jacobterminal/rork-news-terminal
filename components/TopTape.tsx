import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme, sentimentConfig } from '../constants/theme';
import { FeedItem } from '../types/news';
import { formatTimeCompact, truncateText } from '../utils/newsUtils';

interface TopTapeProps {
  items: FeedItem[];
  onTickerPress: (ticker: string) => void;
}

interface TapeItemProps {
  item: FeedItem;
  onTickerPress: (ticker: string) => void;
}

function TapeItem({ item, onTickerPress }: TapeItemProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Safe access to sentiment configuration
  const sentimentKey = item?.classification?.sentiment || 'Neutral';
  const sentiment = sentimentConfig[sentimentKey] || sentimentConfig.Neutral;
  
  const getTagPill = () => {
    if (!item) return { text: 'UNKNOWN', color: theme.colors.textDim };
    
    if (item.tags?.earnings && item.classification?.summary_15) {
      const verdict = item.classification.summary_15.toLowerCase();
      if (verdict.includes('beat')) return { text: 'BEAT', color: theme.colors.green };
      if (verdict.includes('miss')) return { text: 'MISS', color: theme.colors.red };
    }
    if (item.tags?.fed) return { text: 'FED', color: theme.colors.amber };
    if (item.tags?.sec) return { text: 'SEC', color: theme.colors.info };
    if (item.classification?.rumor_level === 'Rumor') return { text: 'RUMOR', color: theme.colors.textDim };
    return { text: 'CONFIRMED', color: theme.colors.green };
  };
  
  const tagPill = getTagPill();
  
  return (
    <Pressable
      style={styles.tapeItem}
      onPressIn={() => setShowTooltip(true)}
      onPressOut={() => setShowTooltip(false)}
      onPress={() => item.tickers?.[0] && onTickerPress(item.tickers[0])}
    >
      <Text style={styles.tapeTime}>{formatTimeCompact(item?.published_at || '')}</Text>
      
      <View style={[styles.tagPill, { backgroundColor: tagPill.color + '20', borderColor: tagPill.color }]}>
        <Text style={[styles.tagPillText, { color: tagPill.color }]}>{tagPill.text}</Text>
      </View>
      
      <View style={styles.sourceBadge}>
        <Text style={styles.sourceBadgeText}>{item.source?.name || 'Unknown'}</Text>
      </View>
      
      <Text style={styles.tapeHeadline}>
        {truncateText(item?.title || '', 85)}
      </Text>
      
      <View style={styles.sentimentContainer}>
        <Text style={[styles.sentimentIcon, { color: sentiment.color }]}>
          {sentiment.icon}
        </Text>
        <Text style={styles.confidenceText}>
          {Math.round(item?.classification?.confidence || 0)}%
        </Text>
      </View>
      
      {item?.tickers && Array.isArray(item.tickers) && item.tickers.length > 0 && (
        <View style={styles.tickerChips}>
          {item.tickers.slice(0, 3).map(ticker => (
            <Pressable
              key={ticker}
              style={styles.tickerChip}
              onPress={() => typeof onTickerPress === 'function' && onTickerPress(ticker)}
            >
              <Text style={styles.tickerChipText}>{ticker}</Text>
            </Pressable>
          ))}
        </View>
      )}
      
      {showTooltip && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipTitle}>{item?.title || ''}</Text>
          <Text style={styles.tooltipSource}>
            {item?.source?.name || 'Unknown'} • Reliability: {item?.source?.reliability || 0}%
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export default function TopTape({ items, onTickerPress }: TopTapeProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Auto-scroll animation - disabled to prevent hydration issues
  // TODO: Re-enable after hydration is stable
  /*
  useEffect(() => {
    if (contentWidth <= containerWidth || items.length === 0) return;
    
    // Add delay to prevent hydration issues
    const initTimer = setTimeout(() => {
      const scrollDistance = contentWidth - containerWidth;
      const duration = scrollDistance * 50; // 50ms per pixel
      
      const animate = () => {
        Animated.sequence([
          Animated.timing(scrollX, {
            toValue: scrollDistance,
            duration,
            useNativeDriver: false,
          }),
          Animated.timing(scrollX, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ]).start(() => animate());
      };
      
      const timer = setTimeout(animate, 2000); // Increased delay
      return () => clearTimeout(timer);
    }, 3000); // Wait 3 seconds before starting autoscroll
    
    return () => clearTimeout(initTimer);
  }, [contentWidth, containerWidth, scrollX, items.length]);
  */
  
  // Update scroll position - disabled to prevent hydration issues
  // TODO: Re-enable after hydration is stable
  /*
  useEffect(() => {
    if (items.length === 0) return;
    
    const listener = scrollX.addListener(({ value }) => {
      scrollViewRef.current?.scrollTo({ x: value, animated: false });
    });
    
    return () => scrollX.removeListener(listener);
  }, [scrollX, items.length]);
  */
  
  const safeItems = Array.isArray(items) ? items : [];
  const latestItems = safeItems.slice(0, 20); // Show latest 20 items
  
  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}

        style={styles.scrollView}
      >
        <View style={styles.content}>
          {latestItems.map(item => (
            <TapeItem
              key={item.id}
              item={item}
              onTickerPress={onTickerPress}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 32,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  tapeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    position: 'relative',
  },
  tapeTime: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.textDim,
    fontFamily: 'monospace',
    minWidth: 60,
  },
  tagPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  tagPillText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
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
  tapeHeadline: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.text,
    maxWidth: 400,
  },
  sentimentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sentimentIcon: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  confidenceText: {
    fontSize: 10,
    color: theme.colors.textDim,
    fontFamily: 'monospace',
  },
  tickerChips: {
    flexDirection: 'row',
    gap: 4,
  },
  tickerChip: {
    backgroundColor: theme.colors.bg,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tickerChipText: {
    fontSize: 9,
    color: theme.colors.text,
    fontWeight: '600',
  },
  tooltip: {
    position: 'absolute',
    top: 35,
    left: 0,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6,
    padding: theme.spacing.sm,
    maxWidth: 300,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  tooltipTitle: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  tooltipSource: {
    fontSize: 10,
    color: theme.colors.textDim,
  },
});