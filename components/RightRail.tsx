import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme, impactColors, sentimentConfig } from '../constants/theme';
import { EarningsItem, EconItem, FeedItem } from '../types/news';
import { formatTime, formatTimeCountdown } from '../utils/newsUtils';

interface RightRailProps {
  isOpen: boolean;
  onToggle: () => void;
  earnings: EarningsItem[];
  econ: EconItem[];
  watchlistNews: FeedItem[];
  onTickerPress: (ticker: string) => void;
}

interface EarningsCardProps {
  item: EarningsItem;
  onTickerPress: (ticker: string) => void;
}

function EarningsCard({ item, onTickerPress }: EarningsCardProps) {
  const isUpcoming = !item.verdict;
  const scheduledTime = new Date(item.scheduled_at);
  const now = new Date();
  const isPast = scheduledTime < now;
  
  return (
    <Pressable 
      style={styles.earningsCard}
      onPress={() => onTickerPress(item.ticker)}
    >
      <View style={styles.earningsHeader}>
        <Text style={styles.earningsTicker}>{item.ticker}</Text>
        <Text style={styles.earningsTime}>
          {item.report_time}
        </Text>
      </View>
      
      {isUpcoming ? (
        <View style={styles.earningsUpcoming}>
          <Text style={styles.earningsCountdown}>
            {isPast ? 'Now' : formatTimeCountdown(item.scheduled_at)}
          </Text>
          <Text style={styles.earningsConsensus}>
            EPS: ${(item.cons_eps || 0).toFixed(2)} • Rev: ${(item.cons_rev || 0).toFixed(1)}B
          </Text>
        </View>
      ) : (
        <View style={styles.earningsResults}>
          <View style={[
            styles.verdictBadge,
            {
              backgroundColor: item.verdict === 'Beat' ? theme.colors.green + '20' : 
                             item.verdict === 'Miss' ? theme.colors.red + '20' : 
                             theme.colors.textDim + '20',
              borderColor: item.verdict === 'Beat' ? theme.colors.green : 
                          item.verdict === 'Miss' ? theme.colors.red : 
                          theme.colors.textDim,
            }
          ]}>
            <Text style={[
              styles.verdictText,
              {
                color: item.verdict === 'Beat' ? theme.colors.green : 
                       item.verdict === 'Miss' ? theme.colors.red : 
                       theme.colors.textDim,
              }
            ]}>
              {item.verdict}
            </Text>
          </View>
          
          {item.surprise_eps && (
            <Text style={[
              styles.surpriseText,
              { color: item.surprise_eps > 0 ? theme.colors.green : theme.colors.red }
            ]}>
              EPS: {item.surprise_eps > 0 ? '+' : ''}{item.surprise_eps.toFixed(1)}%
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

interface EconCardProps {
  item: EconItem;
}

function EconCard({ item }: EconCardProps) {
  const scheduledTime = new Date(item.scheduled_at);
  const now = new Date();
  const isPast = scheduledTime < now;
  const impactColor = impactColors[item.impact];
  
  const getSurpriseColor = () => {
    if (!item.actual || !item.forecast) return theme.colors.textDim;
    const surprise = ((item.actual - item.forecast) / item.forecast) * 100;
    return surprise > 0 ? theme.colors.green : theme.colors.red;
  };
  
  return (
    <View style={styles.econCard}>
      <View style={styles.econHeader}>
        <Text style={styles.econName}>{item.name}</Text>
        <View style={[styles.impactDot, { backgroundColor: impactColor }]} />
      </View>
      
      <Text style={styles.econTime}>
        {isPast ? formatTime(item.scheduled_at) : formatTimeCountdown(item.scheduled_at)}
      </Text>
      
      <View style={styles.econData}>
        {item.actual !== null ? (
          <Text style={[styles.econActual, { color: getSurpriseColor() }]}>
            Actual: {item.actual}
          </Text>
        ) : (
          <Text style={styles.econForecast}>
            Forecast: {item.forecast || 0}
          </Text>
        )}
        
        {item.previous !== undefined && (
          <Text style={styles.econPrevious}>
            Previous: {item.previous}
          </Text>
        )}
      </View>
    </View>
  );
}

interface WatchlistNewsCardProps {
  item: FeedItem;
  onTickerPress: (ticker: string) => void;
}

function WatchlistNewsCard({ item, onTickerPress }: WatchlistNewsCardProps) {
  const sentiment = sentimentConfig[item.classification?.sentiment || 'Neutral'];
  const primaryTicker = item.tickers?.[0];
  
  return (
    <Pressable 
      style={styles.watchlistCard}
      onPress={() => primaryTicker && onTickerPress(primaryTicker)}
    >
      <Text style={styles.watchlistHeadline} numberOfLines={1}>
        {item.title || ''}
      </Text>
      
      <View style={styles.watchlistMeta}>
        <Text style={styles.watchlistSummary} numberOfLines={1}>
          {item.classification?.summary_15 || ''}
        </Text>
        
        <View style={styles.watchlistSentiment}>
          <Text style={[styles.sentimentIcon, { color: sentiment.color }]}>
            {sentiment.icon}
          </Text>
          <Text style={styles.confidenceText}>
            {Math.round(item.classification?.confidence || 0)}%
          </Text>
        </View>
      </View>
      
      <View style={styles.watchlistFooter}>
        <Text style={styles.watchlistTickers}>
          {item.tickers?.slice(0, 2).join(', ') || ''}
        </Text>
        <Text style={styles.watchlistTime}>
          {formatTime(item.published_at || '')}
        </Text>
      </View>
    </Pressable>
  );
}

export default function RightRail({ 
  isOpen, 
  onToggle, 
  earnings, 
  econ, 
  watchlistNews, 
  onTickerPress 
}: RightRailProps) {
  const safeEarnings = Array.isArray(earnings) ? earnings : [];
  const safeEcon = Array.isArray(econ) ? econ : [];
  const safeWatchlistNews = Array.isArray(watchlistNews) ? watchlistNews : [];
  
  const upcomingEarnings = safeEarnings
    .filter(e => e && !e.verdict)
    .sort((a, b) => new Date(a.scheduled_at || '').getTime() - new Date(b.scheduled_at || '').getTime())
    .slice(0, 6);
  
  const recentEarnings = safeEarnings
    .filter(e => e && e.verdict)
    .sort((a, b) => new Date(b.scheduled_at || '').getTime() - new Date(a.scheduled_at || '').getTime())
    .slice(0, 3);
  
  const todayEcon = safeEcon
    .filter(e => e && e.scheduled_at)
    .sort((a, b) => new Date(a.scheduled_at || '').getTime() - new Date(b.scheduled_at || '').getTime())
    .slice(0, 5);
  
  const latestWatchlistNews = safeWatchlistNews.slice(0, 8);
  
  if (!isOpen) {
    return (
      <Pressable style={styles.toggleButton} onPress={onToggle}>
        <ChevronLeft size={16} color={theme.colors.textDim} />
      </Pressable>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.toggleButton} onPress={onToggle}>
          <ChevronRight size={16} color={theme.colors.textDim} />
        </Pressable>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Earnings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings</Text>
          
          {upcomingEarnings.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Next 12h</Text>
              {upcomingEarnings.map(item => (
                <EarningsCard 
                  key={item.ticker} 
                  item={item} 
                  onTickerPress={onTickerPress}
                />
              ))}
            </View>
          )}
          
          {recentEarnings.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Recent</Text>
              {recentEarnings.map(item => (
                <EarningsCard 
                  key={item.ticker} 
                  item={item} 
                  onTickerPress={onTickerPress}
                />
              ))}
            </View>
          )}
        </View>
        
        {/* Economic Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Econ Today</Text>
          {todayEcon.map(item => (
            <EconCard key={item.id} item={item} />
          ))}
        </View>
        
        {/* Watchlist News Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Watchlist News</Text>
          {latestWatchlistNews.map(item => (
            <WatchlistNewsCard 
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
    width: 320,
    backgroundColor: theme.colors.card,
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.border,
  },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  toggleButton: {
    padding: theme.spacing.sm,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  subsection: {
    marginBottom: theme.spacing.md,
  },
  subsectionTitle: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.textDim,
    fontWeight: '500',
    marginBottom: theme.spacing.sm,
  },
  earningsCard: {
    backgroundColor: theme.colors.bg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  earningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  earningsTicker: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    fontWeight: '600',
  },
  earningsTime: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.textDim,
    fontFamily: 'monospace',
  },
  earningsUpcoming: {
    gap: 2,
  },
  earningsCountdown: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.amber,
    fontWeight: '500',
  },
  earningsConsensus: {
    fontSize: 10,
    color: theme.colors.textDim,
  },
  earningsResults: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  verdictBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  verdictText: {
    fontSize: 10,
    fontWeight: '600',
  },
  surpriseText: {
    fontSize: 10,
    fontWeight: '500',
  },
  econCard: {
    backgroundColor: theme.colors.bg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  econHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  econName: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.text,
    fontWeight: '500',
    flex: 1,
  },
  econTime: {
    fontSize: 10,
    color: theme.colors.textDim,
    marginBottom: 4,
  },
  econData: {
    gap: 2,
  },
  econActual: {
    fontSize: 10,
    fontWeight: '500',
  },
  econForecast: {
    fontSize: 10,
    color: theme.colors.textDim,
  },
  econPrevious: {
    fontSize: 10,
    color: theme.colors.textDim,
  },
  watchlistCard: {
    backgroundColor: theme.colors.bg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  watchlistHeadline: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.text,
    fontWeight: '500',
    marginBottom: 4,
    lineHeight: 16,
  },
  watchlistMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: 4,
  },
  watchlistSummary: {
    flex: 1,
    fontSize: 10,
    color: theme.colors.textDim,
    lineHeight: 14,
  },
  watchlistSentiment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  watchlistFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  watchlistTickers: {
    fontSize: 10,
    color: theme.colors.info,
    fontWeight: '500',
  },
  watchlistTime: {
    fontSize: 10,
    color: theme.colors.textDim,
    fontFamily: 'monospace',
  },
  impactDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sentimentIcon: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  confidenceText: {
    fontSize: 9,
    color: theme.colors.textDim,
    fontFamily: 'monospace',
  },
});