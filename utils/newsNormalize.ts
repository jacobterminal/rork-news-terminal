import { FeedItem, CriticalAlert, NewsClassification } from '@/types/news';
import { SentimentLabel, ImpactLevel, ArticleAnalysis } from '@/store/newsAnalysis';

export type NormalizedSentiment = 'bull' | 'bear' | 'neutral';
export type NormalizedImpact = 'low' | 'medium' | 'high';

export interface NormalizedNewsItem {
  sentiment: NormalizedSentiment;
  sentimentLabel: SentimentLabel;
  impact: NormalizedImpact;
  impactLabel: ImpactLevel;
  confidence: number;
  uiBorderColor: string;
  uiTextColor: string;
}

const COLORS = {
  BULL: '#00D26A',
  BEAR: '#FF4D4F',
  NEUTRAL: '#FFD75A',
  HIGH_IMPACT: '#FF4D4F',
  MEDIUM_IMPACT: '#FFD75A',
  LOW_IMPACT: '#00D26A',
} as const;

export function normalizeSentiment(sentiment: string): NormalizedSentiment {
  const s = (sentiment || 'neutral').toLowerCase();
  if (s.includes('bull')) return 'bull';
  if (s.includes('bear')) return 'bear';
  return 'neutral';
}

export function normalizeSentimentLabel(sentiment: string): SentimentLabel {
  const s = normalizeSentiment(sentiment);
  switch (s) {
    case 'bull': return 'BULL';
    case 'bear': return 'BEAR';
    case 'neutral': return 'NEUTRAL';
  }
}

export function normalizeImpact(impact: string): NormalizedImpact {
  const i = (impact || 'low').toLowerCase();
  if (i === 'high') return 'high';
  if (i === 'medium') return 'medium';
  return 'low';
}

export function normalizeImpactLabel(impact: string): ImpactLevel {
  const i = normalizeImpact(impact);
  switch (i) {
    case 'high': return 'HIGH';
    case 'medium': return 'MEDIUM';
    case 'low': return 'LOW';
  }
}

export function sentimentColor(sentiment: NormalizedSentiment | SentimentLabel | string): string {
  const s = String(sentiment || 'neutral').toLowerCase();
  if (s.includes('bull')) return COLORS.BULL;
  if (s.includes('bear')) return COLORS.BEAR;
  return COLORS.NEUTRAL;
}

export function sentimentLabel(sentiment: NormalizedSentiment | SentimentLabel | string): 'BULL' | 'BEAR' | 'NEUTRAL' {
  const s = String(sentiment || 'neutral').toLowerCase();
  if (s.includes('bull')) return 'BULL';
  if (s.includes('bear')) return 'BEAR';
  return 'NEUTRAL';
}

export function impactColor(impact: NormalizedImpact | ImpactLevel | string): string {
  const i = typeof impact === 'string' ? impact.toLowerCase() : impact;
  if (i === 'high' || i === 'HIGH') return COLORS.HIGH_IMPACT;
  if (i === 'medium' || i === 'MEDIUM') return COLORS.MEDIUM_IMPACT;
  return COLORS.LOW_IMPACT;
}

export function normalizeNewsItem(
  item: FeedItem | CriticalAlert,
  classification?: NewsClassification
): NormalizedNewsItem {
  let sentiment: string;
  let impact: string;
  let confidence: number;

  if ('classification' in item) {
    sentiment = item.classification.sentiment;
    impact = item.classification.impact;
    confidence = item.classification.confidence;
  } else if (classification) {
    sentiment = classification.sentiment;
    impact = classification.impact;
    confidence = classification.confidence;
  } else {
    sentiment = item.sentiment || 'Neutral';
    impact = item.impact || 'Medium';
    confidence = item.confidence || 0;
  }

  const normalizedSentiment = normalizeSentiment(sentiment);
  const normalizedImpact = normalizeImpact(impact);

  return {
    sentiment: normalizedSentiment,
    sentimentLabel: normalizeSentimentLabel(sentiment),
    impact: normalizedImpact,
    impactLabel: normalizeImpactLabel(impact),
    confidence: confidence / 100,
    uiBorderColor: sentimentColor(normalizedSentiment),
    uiTextColor: sentimentColor(normalizedSentiment),
  };
}

export function normalizeToAnalysis(
  item: FeedItem | CriticalAlert,
  articleId: string
): ArticleAnalysis {
  const normalized = normalizeNewsItem(item);
  
  return {
    articleId,
    sentiment: {
      label: normalized.sentimentLabel,
      confidence: normalized.confidence,
    },
    impact: normalized.impactLabel,
  };
}

export const COLOR_PALETTE = {
  bullish: COLORS.BULL,
  bearish: COLORS.BEAR,
  neutral: COLORS.NEUTRAL,
  green: COLORS.BULL,
  red: COLORS.BEAR,
  gold: COLORS.NEUTRAL,
  highImpact: COLORS.HIGH_IMPACT,
  mediumImpact: COLORS.MEDIUM_IMPACT,
  lowImpact: COLORS.LOW_IMPACT,
} as const;

export const SENTIMENT_COLORS = COLORS;
