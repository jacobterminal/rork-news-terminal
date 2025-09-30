import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, useWindowDimensions } from 'react-native';
import { AlertTriangle, Clock, TrendingUp, TrendingDown } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { FeedItem } from '../types/news';

interface CriticalNewsTrackerProps {
  feedItems: FeedItem[];
  onItemPress?: (item: FeedItem) => void;
}

interface CriticalNewsItem extends FeedItem {
  timeAgo: string;
  urgencyLevel: 'critical' | 'high' | 'medium';
}

export default function CriticalNewsTracker({ feedItems, onItemPress }: CriticalNewsTrackerProps) {
  const { width } = useWindowDimensions();
  const [criticalItems, setCriticalItems] = useState<CriticalNewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Filter and process critical news items
    const processedItems = feedItems
      .filter(item => 
        item.classification.impact === 'High' || 
        item.classification.confidence >= 90 ||
        item.tags.fed ||
        item.classification.rumor_level === 'Confirmed'
      )
      .slice(0, 10) // Limit to 10 most recent critical items
      .map(item => {
        const publishedTime = new Date(item.published_at);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - publishedTime.getTime()) / (1000 * 60));
        
        let timeAgo: string;
        let urgencyLevel: 'critical' | 'high' | 'medium';
        
        if (diffMinutes < 1) {
          timeAgo = 'NOW';
          urgencyLevel = 'critical';
        } else if (diffMinutes < 5) {
          timeAgo = `${diffMinutes}m`;
          urgencyLevel = 'critical';
        } else if (diffMinutes < 15) {
          timeAgo = `${diffMinutes}m`;
          urgencyLevel = 'high';
        } else if (diffMinutes < 60) {
          timeAgo = `${diffMinutes}m`;
          urgencyLevel = 'medium';
        } else {
          const diffHours = Math.floor(diffMinutes / 60);
          timeAgo = `${diffHours}h`;
          urgencyLevel = 'medium';
        }
        
        return {
          ...item,
          timeAgo,
          urgencyLevel
        };
      })
      .sort((a, b) => {
        // Sort by urgency first, then by time
        const urgencyOrder = { critical: 0, high: 1, medium: 2 };
        if (urgencyOrder[a.urgencyLevel] !== urgencyOrder[b.urgencyLevel]) {
          return urgencyOrder[a.urgencyLevel] - urgencyOrder[b.urgencyLevel];
        }
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      });

    setCriticalItems(processedItems);
  }, [feedItems]);

  useEffect(() => {
    if (criticalItems.length <= 1) return;

    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Change item
        setCurrentIndex(prev => (prev + 1) % criticalItems.length);
        
        // Slide in from right
        slideAnim.setValue(width);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          })
        ]).start();
      });
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [criticalItems, fadeAnim, slideAnim, width]);

  if (criticalItems.length === 0) return null;

  const currentItem = criticalItems[currentIndex];
  if (!currentItem) return null;

  const getUrgencyColor = (level: 'critical' | 'high' | 'medium') => {
    switch (level) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff6600';
      case 'medium': return '#ffaa00';
      default: return '#ffaa00';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'Bullish': return <TrendingUp size={14} color="#0aff00" />;
      case 'Bearish': return <TrendingDown size={14} color="#ff0000" />;
      default: return null;
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onItemPress?.(currentItem)}
      activeOpacity={0.8}
    >
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }]
          }
        ]}
      >
        <View style={styles.header}>
          <View style={styles.urgencyContainer}>
            <AlertTriangle 
              size={12} 
              color={getUrgencyColor(currentItem.urgencyLevel)} 
            />
            <Text style={[
              styles.urgencyText,
              { color: getUrgencyColor(currentItem.urgencyLevel) }
            ]}>
              CRITICAL
            </Text>
          </View>
          
          <View style={styles.timeContainer}>
            <Clock size={12} color="#666" />
            <Text style={styles.timeText}>{currentItem.timeAgo}</Text>
          </View>
        </View>
        
        <View style={styles.newsContent}>
          <View style={styles.sourceContainer}>
            <Text style={styles.sourceText}>{currentItem.source.name}</Text>
            {getSentimentIcon(currentItem.classification.sentiment)}
          </View>
          
          <Text style={styles.titleText} numberOfLines={2}>
            {currentItem.title}
          </Text>
          
          <View style={styles.tickersContainer}>
            {currentItem.tickers.slice(0, 3).map((ticker, index) => (
              <View key={ticker} style={styles.tickerChip}>
                <Text style={styles.tickerText}>{ticker}</Text>
              </View>
            ))}
            {currentItem.tickers.length > 3 && (
              <Text style={styles.moreTickersText}>+{currentItem.tickers.length - 3}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          {criticalItems.map((item, index) => (
            <View 
              key={`${item.id}-${index}`}
              style={[
                styles.progressDot,
                { 
                  backgroundColor: index === currentIndex ? '#0aff00' : '#333',
                  opacity: index === currentIndex ? 1 : 0.5
                }
              ]} 
            />
          ))}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111',
    borderRadius: 8,
    marginHorizontal: theme.spacing.sm,
    marginVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  content: {
    padding: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  urgencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  newsContent: {
    marginBottom: theme.spacing.xs,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 11,
    color: '#0aff00',
    fontWeight: '600',
  },
  titleText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: theme.spacing.xs,
  },
  tickersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tickerChip: {
    backgroundColor: '#222',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#444',
  },
  tickerText: {
    fontSize: 10,
    color: '#0aff00',
    fontWeight: '600',
  },
  moreTickersText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: theme.spacing.xs,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});