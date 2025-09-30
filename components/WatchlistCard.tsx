import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react-native';

interface WatchlistCardProps {
  ticker: string;
  company: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  todayNews: {
    time: string;
    source: string;
    headline: string;
    impact: 'Low' | 'Medium' | 'High';
    sentiment: 'Bullish' | 'Bearish' | 'Neutral';
    confidence: number;
    isEarnings?: boolean;
    expectedEps?: number;
    actualEps?: number;
    expectedRev?: number;
    actualRev?: number;
    verdict?: 'Beat' | 'Miss' | 'Inline';
  }[];
  onHeadlinePress?: (headline: any) => void;
}

export default function WatchlistCard({ 
  ticker, 
  company, 
  sentiment, 
  confidence, 
  todayNews, 
  onHeadlinePress 
}: WatchlistCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSentimentIcon = (sent: 'Bullish' | 'Bearish' | 'Neutral') => {
    switch (sent) {
      case 'Bullish':
        return <TrendingUp size={14} color="#00FF5A" />;
      case 'Bearish':
        return <TrendingDown size={14} color="#FF3131" />;
      default:
        return <Minus size={14} color="#F5C518" />;
    }
  };

  const getSentimentColor = (sent: 'Bullish' | 'Bearish' | 'Neutral') => {
    switch (sent) {
      case 'Bullish':
        return '#00FF5A';
      case 'Bearish':
        return '#FF3131';
      default:
        return '#F5C518';
    }
  };

  const getImpactColor = (impact: 'Low' | 'Medium' | 'High') => {
    switch (impact) {
      case 'High':
        return '#FF1744';
      case 'Medium':
        return '#FF8C00';
      default:
        return '#6C757D';
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

  const formatNumber = (num: number) => {
    if (num >= 1e9) {
      return `${(num / 1e9).toFixed(1)}B`;
    } else if (num >= 1e6) {
      return `${(num / 1e6).toFixed(1)}M`;
    }
    return num.toFixed(2);
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.tickerChip}>
            <Text style={styles.tickerText}>{ticker}</Text>
          </View>
          <Text style={styles.companyName}>{company}</Text>
        </View>
        
        <View style={styles.headerRight}>
          <View style={styles.newsCount}>
            <Text style={styles.newsCountText}>{todayNews.length}</Text>
          </View>
          
          <View style={styles.sentimentContainer}>
            {getSentimentIcon(sentiment)}
            <Text style={[styles.confidenceText, { color: getSentimentColor(sentiment) }]}>
              {confidence}%
            </Text>
          </View>
          
          {isExpanded ? (
            <ChevronUp size={20} color="#9FA6B2" />
          ) : (
            <ChevronDown size={20} color="#9FA6B2" />
          )}
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.dropdown}>
          {todayNews.length === 0 ? (
            <Text style={styles.noNewsText}>No headlines today</Text>
          ) : (
            <ScrollView style={styles.headlinesList} showsVerticalScrollIndicator={false}>
              {todayNews.map((news, index) => (
                <TouchableOpacity
                  key={`${news.headline}-${index}`}
                  style={[styles.headlineRow, index > 0 && styles.headlineRowBorder]}
                  onPress={() => onHeadlinePress?.(news)}
                  activeOpacity={0.7}
                >
                  <View style={styles.headlineLeft}>
                    <Text style={styles.timeText}>{formatTime(news.time)}</Text>
                  </View>
                  
                  <View style={styles.headlineContent}>
                    <Text style={styles.headlineText} numberOfLines={2}>
                      {news.headline}
                    </Text>
                    
                    <View style={styles.headlineMeta}>
                      <Text style={styles.sourceText}>{news.source}</Text>
                      
                      <View style={[styles.impactPill, { backgroundColor: getImpactColor(news.impact) + '20' }]}>
                        <Text style={[styles.impactText, { color: getImpactColor(news.impact) }]}>
                          {news.impact}
                        </Text>
                      </View>
                      
                      <View style={styles.sentimentRow}>
                        {getSentimentIcon(news.sentiment)}
                        <Text style={[styles.confidenceSmall, { color: getSentimentColor(news.sentiment) }]}>
                          {news.confidence}%
                        </Text>
                      </View>
                    </View>
                    
                    {news.isEarnings && (
                      <View style={styles.earningsInfo}>
                        <Text style={styles.earningsText}>
                          EPS: {news.expectedEps?.toFixed(2)} (est) → {news.actualEps?.toFixed(2)} ({news.verdict})
                        </Text>
                        <Text style={styles.earningsText}>
                          Rev: {news.expectedRev ? formatNumber(news.expectedRev) : 'N/A'} (est) → {news.actualRev ? formatNumber(news.actualRev) : 'N/A'}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0C0C0E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F1F23',
    marginHorizontal: 16,
    marginVertical: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tickerChip: {
    backgroundColor: '#00FF5A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  tickerText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  companyName: {
    color: '#E6E6E6',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  newsCount: {
    backgroundColor: '#1F1F23',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  newsCountText: {
    color: '#E6E6E6',
    fontSize: 12,
    fontWeight: '600',
  },
  sentimentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dropdown: {
    borderTopWidth: 1,
    borderTopColor: '#1F1F23',
    paddingBottom: 12,
  },
  headlinesList: {
    maxHeight: 300,
  },
  noNewsText: {
    color: '#555A64',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  headlineRow: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 16,
  },
  headlineRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#1F1F23',
  },
  headlineLeft: {
    width: 50,
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  timeText: {
    color: '#555A64',
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '600',
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
    gap: 12,
    flexWrap: 'wrap',
  },
  sourceText: {
    color: '#9FA6B2',
    fontSize: 11,
    fontWeight: '500',
  },
  impactPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  impactText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sentimentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  confidenceSmall: {
    fontSize: 10,
    fontWeight: '600',
  },
  earningsInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#1F1F23',
    borderRadius: 6,
  },
  earningsText: {
    color: '#E6E6E6',
    fontSize: 11,
    fontFamily: 'monospace',
  },
});