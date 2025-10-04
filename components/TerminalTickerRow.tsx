import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface TerminalTickerRowProps {
  ticker: string;
  company: string;
  performance: number;
  newsCount: number;
  hasActiveNews: boolean;
  onPress?: () => void;
}

export default function TerminalTickerRow({ 
  ticker, 
  company, 
  performance, 
  newsCount,
  hasActiveNews,
  onPress 
}: TerminalTickerRowProps) {
  const [isPressed, setIsPressed] = useState(false);
  const isPositive = performance >= 0;
  const tickerColor = isPositive ? '#00FF5A' : '#FF3131';
  const arrow = isPositive ? '▲' : '▼';
  
  const getStatusLabel = () => {
    if (hasActiveNews) return 'active news';
    if (newsCount > 0) return `${newsCount} alert${newsCount > 1 ? 's' : ''}`;
    return 'no recent updates';
  };

  return (
    <>
      <TouchableOpacity 
        style={[styles.row, isPressed && styles.rowPressed]}
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        activeOpacity={1}
      >
        <View style={styles.leftSection}>
          <Text style={[styles.ticker, { color: tickerColor }]}>{ticker}</Text>
          <Text style={styles.company}>{company}</Text>
        </View>
        
        <View style={styles.rightSection}>
          <View style={styles.performanceContainer}>
            <Text style={styles.arrow}>{arrow}</Text>
            <Text style={[styles.performance, { color: tickerColor }]}>
              {performance >= 0 ? '+' : ''}{performance.toFixed(2)}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>{getStatusLabel()}</Text>
      </View>
      
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
    gap: 12,
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
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  performanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrow: {
    fontSize: 10,
    color: '#CFCFCF',
  },
  performance: {
    fontSize: 14,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
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
});
