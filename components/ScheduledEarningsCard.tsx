import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EarningsItem } from '../types/news';

interface ScheduledEarningsCardProps {
  symbol: string;
  companyFiscalStartMonth?: number;
  events: EarningsItem[];
}

export default function ScheduledEarningsCard({
  symbol,
  companyFiscalStartMonth = 1,
  events,
}: ScheduledEarningsCardProps) {
  const now = Date.now();
  
  const upcomingEvents = events
    .filter(e => e.ticker === symbol)
    .filter(e => {
      const eventTime = new Date(e.scheduled_at).getTime();
      return eventTime >= now;
    })
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 3);

  if (upcomingEvents.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SCHEDULED EARNINGS</Text>
      <View style={styles.eventsContainer}>
        {upcomingEvents.map((event, index) => {
          const scheduledDate = new Date(event.scheduled_at);
          const dateStr = scheduledDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric',
          });
          
          return (
            <View key={index} style={styles.eventRow}>
              <View style={styles.eventLeft}>
                <View style={styles.tickerChip}>
                  <Text style={styles.tickerText}>{event.ticker}</Text>
                </View>
                <View style={styles.sessionPill}>
                  <Text style={styles.sessionText}>{event.report_time}</Text>
                </View>
              </View>
              
              <View style={styles.eventRight}>
                <Text style={styles.dateText}>{dateStr}</Text>
              </View>
            </View>
          );
        })}
      </View>
      
      {upcomingEvents.length > 0 && (
        <View style={styles.metricsSection}>
          {upcomingEvents[0].cons_eps !== undefined && (
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Expected EPS</Text>
              <Text style={styles.metricValue}>${upcomingEvents[0].cons_eps.toFixed(2)}</Text>
            </View>
          )}
          {upcomingEvents[0].cons_rev !== undefined && (
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Expected Revenue</Text>
              <Text style={styles.metricValue}>${upcomingEvents[0].cons_rev.toFixed(1)}B</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#FFD75A',
    borderBottomWidth: 1,
    borderBottomColor: '#FFD75A',
    marginBottom: 12,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD75A',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  eventsContainer: {
    gap: 8,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  eventLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tickerChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 215, 90, 0.15)',
    borderRadius: 4,
  },
  tickerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFD75A',
    fontFamily: 'monospace',
  },
  sessionPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 215, 90, 0.08)',
    borderRadius: 3,
  },
  sessionText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFD75A',
    fontFamily: 'monospace',
  },
  eventRight: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 11,
    color: '#777777',
    fontFamily: 'monospace',
  },
  metricsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#222222',
    gap: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#666666',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
});
