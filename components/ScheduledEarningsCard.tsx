import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Ev = { 
  datetime: string | number | Date; 
  session?: 'AMC' | 'BMO'; 
  symbol: string;
  scheduled_at?: string | number | Date;
  report_time?: string;
  ticker?: string;
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
  const now = new Date();

  const norm = (events ?? [])
    .map(e => {
      const dt = e.datetime ?? e.scheduled_at;
      if (!dt) return null;
      const d = new Date(dt);
      const { q, fy } = toFiscal(d, companyFiscalStartMonth);
      const session = e.session ?? e.report_time ?? guessSession(d);
      return { d, q, fy, session };
    })
    .filter((n): n is NonNullable<typeof n> => n !== null)
    .sort((a, b) => a.d.getTime() - b.d.getTime());

  const currentFY = 
    (norm.find(n => n.d >= new Date(now.getFullYear() - 1, 0, 1))?.fy) ?? 
    toFiscal(now, companyFiscalStartMonth).fy;

  const fyRows = [1, 2, 3, 4].map(q => {
    const m = norm.find(n => n.fy === currentFY && n.q === q);
    const status = !m ? '—' : (m.d < now ? 'Reported' : 'Upcoming');
    const when = !m ? 'TBA' : fmt(m.d) + ' · ' + m.session;
    return { q, status, when };
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
            styles.row,
            r.q === 1 && styles.rowFirst,
          ]}
        >
          <Text style={styles.quarter}>Q{r.q}</Text>
          <Text 
            style={[
              styles.status,
              r.status === 'Upcoming' && styles.statusUpcoming,
              r.status === 'Reported' && styles.statusReported,
            ]}
          >
            {r.status}
          </Text>
          <Text style={styles.when}>{r.when}</Text>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#3a2f14',
  },
  rowFirst: {
    borderTopWidth: 1,
  },
  quarter: {
    color: '#fff',
    fontSize: 14,
  },
  status: {
    fontWeight: '600',
    fontSize: 14,
  },
  statusUpcoming: {
    color: '#E7C15F',
  },
  statusReported: {
    color: '#8DD48C',
  },
  when: {
    color: '#cfcfcf',
    fontSize: 14,
  },
  allReportedText: {
    color: '#9aa0a6',
    marginTop: 8,
    fontSize: 12,
  },
});
