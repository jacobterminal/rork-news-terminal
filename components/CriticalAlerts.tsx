import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../constants/theme';
import { CriticalAlert } from '../types/news';
import { TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react-native';

interface CriticalAlertsProps {
  alerts: CriticalAlert[];
  onAlertPress: (alert: CriticalAlert) => void;
  highlightedAlertId?: string | null;
  onHighlightClear?: () => void;
}

export default function CriticalAlerts({ alerts, onAlertPress, highlightedAlertId, onHighlightClear }: CriticalAlertsProps) {
  // Handle highlighting clear after timeout
  useEffect(() => {
    if (highlightedAlertId && onHighlightClear) {
      const timeout = setTimeout(() => {
        onHighlightClear();
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [highlightedAlertId, onHighlightClear]);
  
  if (alerts.length === 0) return null;

  const getSentimentIcon = (sentiment: string, confidence: number) => {
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

  const getImpactPillStyle = (impact: string, isReleased: boolean) => {
    if (isReleased) {
      return [styles.impactPill, styles.releasedPill];
    }
    
    switch (impact) {
      case 'High':
        return [styles.impactPill, styles.highImpactPill];
      case 'Medium':
        return [styles.impactPill, styles.mediumImpactPill];
      default:
        return [styles.impactPill, styles.lowImpactPill];
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderEconomicData = (alert: CriticalAlert) => {
    if (alert.type === 'earnings') {
      return (
        <View style={styles.dataRow}>
          {alert.expected_eps && (
            <Text style={styles.dataText}>
              EPS: {alert.expected_eps.toFixed(2)} (est)
              {alert.actual_eps && (
                <Text style={styles.actualText}>
                  {' → '}{alert.actual_eps.toFixed(2)} 
                  <Text style={alert.actual_eps > alert.expected_eps ? styles.beatText : styles.missText}>
                    ({alert.actual_eps > alert.expected_eps ? 'Beat' : 'Miss'})
                  </Text>
                </Text>
              )}
            </Text>
          )}
          {alert.expected_rev && (
            <Text style={styles.dataText}>
              Rev: {(alert.expected_rev / 1000).toFixed(1)}B (est)
              {alert.actual_rev && (
                <Text style={styles.actualText}>
                  {' → '}{(alert.actual_rev / 1000).toFixed(1)}B
                </Text>
              )}
            </Text>
          )}
        </View>
      );
    }

    if (alert.forecast || alert.previous || alert.actual) {
      return (
        <View style={styles.dataRow}>
          <Text style={styles.dataText}>
            {alert.forecast && `Forecast: ${alert.forecast}`}
            {alert.previous && ` | Previous: ${alert.previous}`}
            {alert.actual && (
              <Text style={styles.actualText}>
                {' | Actual: '}{alert.actual}
                {alert.verdict && (
                  <Text style={styles.verdictText}> ({alert.verdict})</Text>
                )}
              </Text>
            )}
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>CRITICAL ALERTS</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.alertsContainer}
      >
        {alerts.map((alert) => {
          const isHighlighted = highlightedAlertId === alert.id;
          
          return (
            <View
              key={alert.id}
              style={[
                styles.alertCardContainer,
                isHighlighted && {
                  shadowColor: theme.colors.bullish,
                  shadowOpacity: 0.8,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 0 },
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.alertCard,
                  isHighlighted && {
                    borderColor: theme.colors.bullish,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => onAlertPress(alert)}
                activeOpacity={0.8}
              >
            <View style={styles.alertHeader}>
              <View style={getImpactPillStyle(alert.impact, alert.is_released)}>
                <Text style={styles.pillText}>
                  {alert.is_released ? 'RELEASED' : 'CRITICAL'}
                </Text>
              </View>
              <View style={styles.timeContainer}>
                <Clock size={12} color={theme.colors.textDim} />
                <Text style={styles.timeText}>{formatTime(alert.published_at)}</Text>
              </View>
            </View>

            <View style={styles.sourceContainer}>
              <Text style={styles.sourceText}>{alert.source}</Text>
            </View>

            <Text style={styles.headline} numberOfLines={2}>
              {alert.headline}
            </Text>

            {alert.tickers.length > 0 && (
              <View style={styles.tickersContainer}>
                {alert.tickers.slice(0, 3).map((ticker) => (
                  <View key={ticker} style={styles.tickerChip}>
                    <Text style={styles.tickerText}>{ticker}</Text>
                  </View>
                ))}
                {alert.tickers.length > 3 && (
                  <Text style={styles.moreTickersText}>+{alert.tickers.length - 3}</Text>
                )}
              </View>
            )}

            {renderEconomicData(alert)}

            <View style={styles.sentimentRow}>
              <View style={styles.sentimentContainer}>
                {getSentimentIcon(alert.sentiment, alert.confidence)}
                <Text style={styles.sentimentText}>
                  {alert.sentiment} {alert.confidence}%
                </Text>
              </View>
              <Text style={styles.impactText}>{alert.impact} Impact</Text>
            </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.bg,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: theme.colors.sectionTitle,
    paddingHorizontal: 16,
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  alertsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  alertCardContainer: {
    // Container for animated highlighting
  },
  alertCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 16,
    width: 280,
    minHeight: 160,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  impactPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  releasedPill: {
    backgroundColor: '#FF1744',
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
  pillText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: theme.colors.text,
    letterSpacing: 0.5,
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
  sourceContainer: {
    marginBottom: theme.spacing.xs,
  },
  sourceText: {
    fontSize: 11,
    color: theme.colors.bullish,
    fontWeight: '600' as const,
  },
  headline: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: theme.colors.text,
    lineHeight: 18,
    marginBottom: 12,
  },
  tickersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
    alignItems: 'center',
  },
  tickerChip: {
    backgroundColor: theme.colors.bullish,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tickerText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: theme.colors.bg,
  },
  moreTickersText: {
    fontSize: 11,
    color: theme.colors.textDim,
    alignSelf: 'center',
  },
  dataRow: {
    marginBottom: 12,
  },
  dataText: {
    fontSize: 12,
    color: theme.colors.textDim,
    lineHeight: 16,
    fontFamily: 'monospace',
  },
  actualText: {
    color: theme.colors.text,
    fontWeight: '600' as const,
  },
  beatText: {
    color: theme.colors.bullish,
  },
  missText: {
    color: theme.colors.bearish,
  },
  verdictText: {
    color: theme.colors.bullish,
    fontStyle: 'italic' as const,
  },
  sentimentRow: {
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
  impactText: {
    fontSize: 11,
    color: theme.colors.textDim,
    fontWeight: '500' as const,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: 16,
    marginTop: 12,
  },
});