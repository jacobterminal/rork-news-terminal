import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Modal } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { CriticalAlert } from '../types/news';

interface CriticalAlertsProps {
  alerts: CriticalAlert[];
  onAlertPress: (alert: CriticalAlert) => void;
  highlightedAlertId?: string | null;
  onHighlightClear?: () => void;
}

interface MonthOption {
  value: number;
  label: string;
  year: number;
}

export default function CriticalAlerts({ alerts, onAlertPress, highlightedAlertId, onHighlightClear }: CriticalAlertsProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const monthScrollRef = useRef<ScrollView>(null);
  const glowAnimation = useRef(new Animated.Value(0)).current;
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState<boolean>(false);
  const [monthOptions, setMonthOptions] = useState<MonthOption[]>([]);
  
  useEffect(() => {
    const currentDate = new Date();
    const options: MonthOption[] = [];
    
    for (let i = -12; i <= 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      options.push({
        value: date.getMonth(),
        label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        year: date.getFullYear()
      });
    }
    
    setMonthOptions(options);
  }, []);
  
  useEffect(() => {
    if (showMonthPicker && monthScrollRef.current && monthOptions.length > 0) {
      const selectedMonthIndex = monthOptions.findIndex(
        option => option.value === selectedMonth && option.year === selectedYear
      );
      
      if (selectedMonthIndex !== -1) {
        setTimeout(() => {
          const itemHeight = 56;
          const visibleHeight = 300;
          const scrollY = Math.max(0, (selectedMonthIndex * itemHeight) - (visibleHeight / 2) + (itemHeight / 2));
          
          monthScrollRef.current?.scrollTo({
            y: scrollY,
            animated: false,
          });
        }, 100);
      }
    }
  }, [showMonthPicker, monthOptions, selectedMonth, selectedYear]);
  
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
  
  const filteredAlerts = alerts.filter(alert => {
    const alertDate = new Date(alert.published_at);
    return alertDate.getMonth() === selectedMonth && alertDate.getFullYear() === selectedYear;
  });
  
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

  const handleMonthSelect = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setShowMonthPicker(false);
  };
  
  return (
    <View style={styles.container}>
      <View nativeID="banner-anchor-point" style={styles.sectionHeader}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>CRITICAL ALERTS</Text>
          <TouchableOpacity 
            style={styles.monthPill}
            onPress={() => setShowMonthPicker(true)}
          >
            <Text style={styles.monthPillText}>
              {new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </Text>
            <ChevronDown size={12} color={theme.colors.textDim} />
          </TouchableOpacity>
        </View>
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
      
      <Modal
        visible={showMonthPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMonthPicker(false)}
        >
          <View style={styles.monthPickerModal}>
            <Text style={styles.modalTitle}>Select Month</Text>
            <ScrollView 
              ref={monthScrollRef} 
              style={styles.monthList}
              showsVerticalScrollIndicator={false}
            >
              {monthOptions.map((month) => {
                const currentDate = new Date();
                const currentMonth = currentDate.getMonth();
                const currentYear = currentDate.getFullYear();
                const monthDate = new Date(month.year, month.value, 1);
                const currentMonthDate = new Date(currentYear, currentMonth, 1);
                
                const isCurrentMonth = month.value === currentMonth && month.year === currentYear;
                const isPastMonth = monthDate < currentMonthDate;
                const isFutureMonth = monthDate > currentMonthDate;
                const isSelected = selectedMonth === month.value && selectedYear === month.year;
                
                return (
                  <TouchableOpacity
                    key={`${month.year}-${month.value}`}
                    style={[styles.monthOption, isSelected && styles.selectedMonthOption]}
                    onPress={() => handleMonthSelect(month.value, month.year)}
                  >
                    <Text style={[
                      styles.monthOptionText,
                      isCurrentMonth && styles.currentMonthText,
                      isPastMonth && styles.pastMonthText,
                      isFutureMonth && styles.futureMonthText
                    ]}>
                      {month.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.bg,
    marginTop: 8,
  },
  sectionHeader: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.sectionTitle,
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  monthPillText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: theme.colors.text,
    textTransform: 'uppercase' as const,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: theme.colors.sectionTitle,
    letterSpacing: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthPickerModal: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  monthList: {
    maxHeight: 300,
  },
  monthOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedMonthOption: {
    backgroundColor: theme.colors.border,
  },
  monthOptionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  currentMonthText: {
    color: theme.colors.bullish,
  },
  pastMonthText: {
    color: theme.colors.textSecondary,
  },
  futureMonthText: {
    color: theme.colors.text,
  },
});
