import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';

interface NewsHeadline {
  time: string;
  source: string;
  headline: string;
  impact: 'Low' | 'Medium' | 'High';
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
}

interface TerminalTickerRowProps {
  ticker: string;
  company: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  newsCount: number;
  hasActiveNews: boolean;
  newsHeadlines: NewsHeadline[];
  onPress?: () => void;
  onHeadlinePress?: (headline: NewsHeadline) => void;
}

export default function TerminalTickerRow({ 
  ticker, 
  company, 
  sentiment,
  newsCount,
  hasActiveNews,
  newsHeadlines,
  onPress,
  onHeadlinePress
}: TerminalTickerRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [isPressed, setIsPressed] = useState(false);
  
  const tickerColor = sentiment === 'Bullish' ? '#00FF5A' : sentiment === 'Bearish' ? '#FF3131' : '#F5C518';
  
  const getStatusLabel = () => {
    if (hasActiveNews) return 'active news';
    if (newsCount > 0) return `${newsCount} alert${newsCount > 1 ? 's' : ''}`;
    return 'no recent updates';
  };

  const getSentimentColor = (sent: 'Bullish' | 'Bearish' | 'Neutral') => {
    switch (sent) {
      case 'Bullish': return '#00FF5A';
      case 'Bearish': return '#FF3131';
      default: return '#F5C518';
    }
  };

  const getImpactColor = (impact: 'Low' | 'Medium' | 'High') => {
    switch (impact) {
      case 'High': return '#FF1744';
      case 'Medium': return '#FF8C00';
      default: return '#6C757D';
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch {
      return timeStr;
    }
  };

  const toggleExpansion = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    
    Animated.timing(animation, {
      toValue,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const handleTickerPress = () => {
    router.push(`/company/${ticker.toUpperCase()}`);
  };

  return (
    <>
      <TouchableOpacity 
        style={[styles.row, isPressed && styles.rowPressed]}
        onPress={toggleExpansion}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        activeOpacity={1}
      >
        <View style={styles.leftSection}>
          <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
            <ChevronRight size={14} color="#777777" />
          </Animated.View>
          <TouchableOpacity onPress={handleTickerPress} activeOpacity={0.7}>
            <Text style={[styles.ticker, { color: tickerColor }]}>{ticker}</Text>
          </TouchableOpacity>
          <Text style={styles.company}>{company}</Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>{getStatusLabel()}</Text>
      </View>
      
      {isExpanded && newsHeadlines.length > 0 && (
        <View style={styles.dropdownContainer}>
          {newsHeadlines.map((headline, index) => (
            <TouchableOpacity
              key={`${headline.headline}-${index}`}
              style={[styles.headlineRow, index > 0 && styles.headlineRowBorder]}
              onPress={() => onHeadlinePress?.(headline)}
              activeOpacity={0.7}
            >
              <View style={styles.headlineLeft}>
                <Text style={styles.timeText}>{formatTime(headline.time)}</Text>
              </View>
              
              <View style={styles.headlineContent}>
                <Text style={styles.headlineText} numberOfLines={2}>
                  {headline.headline}
                </Text>
                
                <View style={styles.headlineMeta}>
                  <Text style={styles.sourceText}>{headline.source}</Text>
                  
                  <View style={[styles.impactPill, { backgroundColor: getImpactColor(headline.impact) + '20' }]}>
                    <Text style={[styles.impactText, { color: getImpactColor(headline.impact) }]}>
                      {headline.impact}
                    </Text>
                  </View>
                  
                  <View style={[styles.sentimentPill, { backgroundColor: getSentimentColor(headline.sentiment) + '20' }]}>
                    <Text style={[styles.sentimentText, { color: getSentimentColor(headline.sentiment) }]}>
                      {headline.sentiment}
                    </Text>
                  </View>
                  
                  <Text style={[styles.confidenceText, { color: getSentimentColor(headline.sentiment) }]}>
                    {headline.confidence}%
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity style={styles.viewFullStory} onPress={handleTickerPress}>
            <Text style={styles.viewFullStoryText}>View Company Profile →</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {isExpanded && newsHeadlines.length === 0 && (
        <View style={styles.dropdownContainer}>
          <Text style={styles.noNewsText}>No recent headlines</Text>
        </View>
      )}
      
      <View style={styles.divider} />
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#000000',
  },
  rowPressed: {
    backgroundColor: '#202020',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  ticker: {
    fontSize: 15,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  company: {
    fontSize: 13,
    color: '#CFCFCF',
    fontWeight: '400' as const,
    flex: 1,
  },
  statusRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#000000',
  },
  statusLabel: {
    fontSize: 11,
    color: '#777777',
    fontWeight: '400' as const,
  },
  divider: {
    height: 1,
    backgroundColor: '#1E1E1E',
  },
  dropdownContainer: {
    backgroundColor: '#000000',
    paddingBottom: 8,
  },
  headlineRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#000000',
  },
  headlineRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#1E1E1E',
  },
  headlineLeft: {
    width: 50,
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  timeText: {
    color: '#555A64',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600' as const,
  },
  headlineContent: {
    flex: 1,
    marginLeft: 12,
  },
  headlineText: {
    color: '#E6E6E6',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  headlineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  sourceText: {
    color: '#9FA6B2',
    fontSize: 11,
    fontWeight: '500' as const,
  },
  impactPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  impactText: {
    fontSize: 9,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
  },
  sentimentPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sentimentText: {
    fontSize: 9,
    fontWeight: '600' as const,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  viewFullStory: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  viewFullStoryText: {
    color: '#777777',
    fontSize: 11,
    fontWeight: '500' as const,
  },
  noNewsText: {
    color: '#555A64',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 16,
    fontStyle: 'italic',
  },
});
