import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useEarningsStore } from '../store/earningsStore';
import { useNewsStore } from '../store/newsStore';
import { Quarter } from '../types/earnings';

type Ev = { 
  datetime?: string | number | Date; 
  session?: 'AMC' | 'BMO'; 
  symbol?: string;
  scheduled_at?: string | number | Date;
  report_time?: string;
  ticker?: string;
  actual_eps?: number;
  cons_eps?: number;
  actual_rev?: number;
  cons_rev?: number;
  verdict?: 'Beat' | 'Miss' | 'Inline' | null;
};

interface ScheduledEarningsCardProps {
  symbol: string;
  companyFiscalStartMonth?: number;
  events: Ev[];
}

export default function ScheduledEarningsCard({
  symbol,
  companyFiscalStartMonth = 1,
  events,
}: ScheduledEarningsCardProps) {
  const now = useMemo(() => new Date(), []);
  const { backfillFromNews, getEarningsRecord, isHydrated } = useEarningsStore();
  const { state } = useNewsStore();

  const norm = (events ?? [])
    .map(e => {
      const dt = e.datetime ?? e.scheduled_at;
      if (!dt) return null;
      const d = new Date(dt);
      const { q, fy } = toFiscal(d, companyFiscalStartMonth);
      const session = e.session ?? e.report_time ?? guessSession(d);
      return { 
        d, 
        q, 
        fy, 
        session, 
        actual_eps: e.actual_eps,
        cons_eps: e.cons_eps,
        actual_rev: e.actual_rev,
        cons_rev: e.cons_rev,
        verdict: e.verdict,
      };
    })
    .filter((n): n is NonNullable<typeof n> => n !== null)
    .sort((a, b) => a.d.getTime() - b.d.getTime());

  const currentFY = 
    (norm.find(n => n.d >= new Date(now.getFullYear() - 1, 0, 1))?.fy) ?? 
    toFiscal(now, companyFiscalStartMonth).fy;

  useEffect(() => {
    if (!isHydrated) return;
    
    const attemptBackfill = async () => {
      const quarters: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];
      
      for (const q of quarters) {
        const m = norm.find(n => n.fy === currentFY && n.q === quarters.indexOf(q) + 1);
        const isReported = !!m && m.d < now;
        
        if (!isReported) {
          continue;
        }
        
        const record = getEarningsRecord(symbol, currentFY, q);
        const needsBackfill = !record || record.source === 'mock' || record.actualEps === null;
        
        if (needsBackfill) {
          console.log(`📥 Triggering backfill for ${symbol} ${currentFY} ${q}`);
          await backfillFromNews(symbol, currentFY, q, state.feedItems);
        }
      }
    };
    
    attemptBackfill();
  }, [isHydrated, symbol, currentFY, norm, state.feedItems, backfillFromNews, getEarningsRecord, now]);

  const fyRows = [1, 2, 3, 4].map(q => {
    const m = norm.find(n => n.fy === currentFY && n.q === q);
    const isReported = !!m && m.d < now;
    const status = !m ? '—' : (isReported ? 'Reported' : 'Not Reported');
    const dateStr = !m ? 'TBA' : fmt(m.d);
    const session = m?.session || '';
    
    const quarter: Quarter = `Q${q}` as Quarter;
    const cachedRecord = isHydrated ? getEarningsRecord(symbol, currentFY, quarter) : null;
    
    const estEps = m?.cons_eps !== undefined ? m.cons_eps.toFixed(2) : 'NA';
    const actualEps = cachedRecord?.actualEps !== null && cachedRecord?.actualEps !== undefined
      ? cachedRecord.actualEps.toFixed(2)
      : (m?.actual_eps !== undefined ? m.actual_eps.toFixed(2) : 'NA');
    
    let result = '—';
    let resultColor = '#9aa0a6';
    
    if (cachedRecord?.result && cachedRecord.result !== '—') {
      result = cachedRecord.result;
      resultColor = result === 'Beat' ? '#8DD48C' : result === 'Miss' ? '#FF6B6B' : '#9aa0a6';
    } else if (m?.verdict === 'Beat') {
      result = 'Beat';
      resultColor = '#8DD48C';
    } else if (m?.verdict === 'Miss') {
      result = 'Miss';
      resultColor = '#FF6B6B';
    } else if (m?.actual_eps !== undefined && m?.cons_eps !== undefined) {
      if (m.actual_eps > m.cons_eps) {
        result = 'Beat';
        resultColor = '#8DD48C';
      } else if (m.actual_eps < m.cons_eps) {
        result = 'Miss';
        resultColor = '#FF6B6B';
      } else {
        result = 'Inline';
        resultColor = '#9aa0a6';
      }
    }
    
    return { q, status, dateStr, session, isReported, estEps, actualEps, result, resultColor };
  });

  const allReported = fyRows.every(r => r.status === 'Reported');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Scheduled Earnings — FY{currentFY}
      </Text>
      {fyRows.map(r => (
        <View 
          key={r.q} 
          style={[
            styles.rowContainer,
            r.q === 1 && styles.rowContainerFirst,
          ]}
        >
          <View style={styles.row}>
            <View style={styles.leftSection}>
              <Text style={styles.quarter}>Q{r.q}</Text>
              <Text 
                style={[
                  styles.status,
                  r.isReported && styles.statusReported,
                  !r.isReported && r.status !== '—' && styles.statusNotReported,
                ]}
              >
                {r.status}
              </Text>
            </View>
            <View style={styles.rightSection}>
              <Text style={styles.dateText}>{r.dateStr}</Text>
              {r.session && <Text style={styles.sessionDot}> • </Text>}
              {r.session && <Text style={styles.sessionText}>{r.session}</Text>}
            </View>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsText}>
              <Text style={styles.detailLabel}>EST EPS: </Text>
              <Text style={styles.detailValue}>{r.estEps}</Text>
              <Text style={styles.detailSeparator}> • </Text>
              <Text style={styles.detailLabel}>Actual EPS: </Text>
              <Text style={styles.detailValue}>{r.actualEps}</Text>
              <Text style={styles.detailSeparator}> • </Text>
              <Text style={styles.detailLabel}>Result: </Text>
              <Text style={[styles.detailValue, { color: r.resultColor }]}>{r.result}</Text>
            </Text>
          </View>
        </View>
      ))}
      {allReported && (
        <Text style={styles.allReportedText}>
          All four earnings for FY{currentFY} are reported.
        </Text>
      )}
    </View>
  );
}

function toFiscal(d: Date, startMonth = 1) {
  const m = d.getMonth() + 1;
  const offset = (m - startMonth + 12) % 12;
  const q = Math.floor(offset / 3) + 1;
  const fy = (m >= startMonth) ? d.getFullYear() : d.getFullYear() - 1;
  return { q, fy };
}

function fmt(d: Date) {
  const mo = d.toLocaleString(undefined, { month: 'short' });
  const day = d.getDate();
  return `${mo} ${day}`;
}

function guessSession(d: Date): string {
  const h = d.getHours();
  return h < 12 ? 'BMO' : 'AMC';
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  title: {
    color: '#E7C15F',
    fontWeight: '700',
    marginBottom: 8,
    fontSize: 13,
  },
  rowContainer: {
    borderBottomWidth: 1,
    borderColor: '#3a2f14',
    paddingVertical: 10,
  },
  rowContainerFirst: {
    borderTopWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsRow: {
    marginTop: 2,
  },
  detailsText: {
    fontSize: 11,
    lineHeight: 16,
  },
  detailLabel: {
    color: '#777777',
    fontSize: 11,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  detailSeparator: {
    color: '#555555',
    fontSize: 11,
  },
  quarter: {
    color: '#fff',
    fontSize: 14,
  },
  status: {
    fontWeight: '600',
    fontSize: 14,
  },
  statusReported: {
    color: '#8DD48C',
  },
  statusNotReported: {
    color: '#9aa0a6',
  },
  dateText: {
    color: '#cfcfcf',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  sessionDot: {
    color: '#777777',
    fontSize: 14,
  },
  sessionText: {
    color: '#cfcfcf',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  allReportedText: {
    color: '#9aa0a6',
    marginTop: 8,
    fontSize: 12,
  },
});
