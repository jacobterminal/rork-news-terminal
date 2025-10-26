export type EarningsSession = 'BMO' | 'AMC' | 'TBA';
export type EarningsResult = 'Beat' | 'Miss' | '—';
export type EarningsSource = 'api' | 'news_parse' | 'mock';
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface EarningsHistory {
  ticker: string;
  fiscalYear: number;
  quarter: Quarter;
  actualEps: number | null;
  revenueUsd: number | null;
  session: EarningsSession;
  result: EarningsResult;
  source: EarningsSource;
  articleId: string | null;
  confidence: number;
  updatedAt: string;
}

export interface EarningsHistoryMap {
  [key: string]: EarningsHistory;
}
