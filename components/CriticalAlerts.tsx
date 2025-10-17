import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { theme } from '../constants/theme';
import { CriticalAlert } from '../types/news';

interface CriticalAlertsProps {
  alerts: CriticalAlert[];
  onAlertPress: (alert: CriticalAlert) => void;
  highlightedAlertId?: string | null;
  onHighlightClear?: () => void;
}

export default function CriticalAlerts({ alerts, onAlertPress, highlightedAlertId, onHighlightClear }: CriticalAlertsProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const glowAnimation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (highlightedAlertId) {
      const highlightedIndex = alerts.findIndex(alert => alert.id === highlightedAlertId);
      
      if (highlightedIndex !== -1 && scrollViewRef.current) {
        const scrollOffset = highlightedIndex * 300;
        scrollViewRef.current.scrollTo({ x: scrollOffset, animated: true });
      }
      
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: false,
        }),
      ]).start();
      
      if (onHighlightClear) {
        const timeout = setTimeout(() => {
          onHighlightClear();
        }, 1500);
        
        return () => clearTimeout(timeout);
      }
    }
  }, [highlightedAlertId, onHighlightClear, alerts, glowAnimation]);
  
  const filteredAlerts = alerts;
  
  if (alerts.length === 0) return null;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getSentimentPill = (sentiment: string, confidence: number) => {
    const label = sentiment === 'Bullish' ? 'BULL' : sentiment === 'Bearish' ? 'BEAR' : 'NEUT';
    const color = sentiment === 'Bullish' ? theme.colors.bullish : 
                  sentiment === 'Bearish' ? theme.colors.bearish : theme.colors.neutral;
    return { label, color };
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.divider} />
        <View nativeID="banner-anchor-point" style={styles.sectionHeaderContent}>
          <Text style={styles.sectionTitle}>CRITICAL ALERTS</Text>
        </View>
        <View style={styles.divider} />
      </View>
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tableContainer}
      >
        {filteredAlerts.map((alert) => {
          const isHighlighted = highlightedAlertId === alert.id;
          const sentiment = getSentimentPill(alert.sentiment, alert.confidence);
          
          const glowColor = glowAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(255, 215, 0, 0)', 'rgba(255, 215, 0, 0.3)'],
          });
          
          return (
            <Animated.View
              key={alert.id}
              style={[
                styles.tableRow,
                isHighlighted && {
                  backgroundColor: glowColor,
                  shadowColor: '#FFD700',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 8,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.rowContent}
                onPress={() => onAlertPress(alert)}
                activeOpacity={0.7}
              >
              <View style={styles.contentWrapper}>
                <View style={styles.topLine}>
                  <Text style={styles.timeText}>{formatTime(alert.published_at)}</Text>
                  <Text style={styles.sourceText}>{alert.source}</Text>
                  <View style={[styles.pill, { borderColor: sentiment.color }]}>
                    <Text style={[styles.pillText, { color: sentiment.color }]}>
                      {sentiment.label} {alert.confidence}%
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.headline} numberOfLines={2}>
                  {alert.headline}
                </Text>
                
                {alert.tickers.length > 0 && (
                  <View style={styles.tickersRow}>
                    {alert.tickers.slice(0, 4).map((ticker) => (
                      <Text key={ticker} style={styles.tickerTag}>{ticker}</Text>
                    ))}
                    {alert.tickers.length > 4 && (
                      <Text style={styles.moreText}>+{alert.tickers.length - 4}</Text>
                    )}
                  </View>
                )}
                
                {(alert.forecast || alert.actual) && (
                  <View style={styles.dataGrid}>
                    <View style={styles.dataCol}>
                      <Text style={styles.dataLabel}>FORECAST</Text>
                      <Text style={styles.dataValue}>{alert.forecast || '--'}</Text>
                    </View>
                    <View style={styles.dataCol}>
                      <Text style={styles.dataLabel}>ACTUAL</Text>
                      <Text style={[styles.dataValue, alert.actual && styles.actualValue]}>
                        {alert.actual || '--'}
                      </Text>
                    </View>
                    <View style={styles.dataCol}>
                      <Text style={styles.dataLabel}>IMPACT</Text>
                      <Text style={[
                        styles.dataValue,
                        alert.impact === 'High' && styles.highImpact,
                        alert.impact === 'Medium' && styles.mediumImpact,
                      ]}>
                        {alert.impact.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                )}
                
                {alert.type === 'earnings' && (alert.expected_eps || alert.actual_eps) && (
                  <View style={styles.dataGrid}>
                    <View style={styles.dataCol}>
                      <Text style={styles.dataLabel}>EPS EST</Text>
                      <Text style={styles.dataValue}>
                        {alert.expected_eps ? alert.expected_eps.toFixed(2) : '--'}
                      </Text>
                    </View>
                    <View style={styles.dataCol}>
                      <Text style={styles.dataLabel}>EPS ACT</Text>
                      <Text style={[styles.dataValue, alert.actual_eps && styles.actualValue]}>
                        {alert.actual_eps ? alert.actual_eps.toFixed(2) : '--'}
                      </Text>
                    </View>
                    <View style={styles.dataCol}>
                      <Text style={styles.dataLabel}>VERDICT</Text>
                      <Text style={[
                        styles.dataValue,
                        alert.verdict?.includes('Beat') && styles.beatText,
                        alert.verdict?.includes('Miss') && styles.missText,
                      ]}>
                        {alert.verdict || '--'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.bg,
  },
  sectionHeader: {
    backgroundColor: theme.colors.bg,
  },
  sectionHeaderContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.bg,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.sectionTitle,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: theme.colors.sectionTitle,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  tableContainer: {
    paddingHorizontal: 12,
    paddingVertical: 0,
    gap: 0,
  },
  tableRow: {
    width: 300,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: theme.colors.bg,
  },
  highlightedRow: {
    backgroundColor: '#0A1A0A',
    borderBottomColor: theme.colors.bullish,
  },
  rowContent: {
    flex: 1,
  },
  contentWrapper: {
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
  headline: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: theme.colors.text,
    lineHeight: 16,
  },
  tickersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
  },
  tickerTag: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: theme.colors.bullish,
    fontWeight: '700' as const,
  },
  moreText: {
    fontSize: 9,
    color: theme.colors.textDim,
  },
  dataGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  dataCol: {
    flex: 1,
  },
  dataLabel: {
    fontSize: 8,
    color: theme.colors.textDim,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  dataValue: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: theme.colors.textSecondary,
    fontWeight: '600' as const,
  },
  actualValue: {
    color: theme.colors.text,
  },
  highImpact: {
    color: theme.colors.bearish,
  },
  mediumImpact: {
    color: theme.colors.neutral,
  },
  beatText: {
    color: theme.colors.bullish,
  },
  missText: {
    color: theme.colors.bearish,
  },
});
