export type Sentiment = 'bull' | 'bear' | 'neutral';

export const SENTIMENT_COLORS: Record<Sentiment, { text: string; border: string; bg: string }> = {
  bull:    { text: '#22C55E', border: '#16A34A', bg: 'rgba(34,197,94,0.10)' },
  bear:    { text: '#F87171', border: '#EF4444', bg: 'rgba(239,68,68,0.10)' },
  neutral: { text: '#FBBF24', border: '#F59E0B', bg: 'rgba(245,158,11,0.10)' },
};

export function getSentimentFromArticle(a: any): Sentiment {
  const raw = (
    a?.aiOpinionLabel ?? 
    a?.ai_opinion_label ?? 
    a?.aiOpinion ?? 
    a?.sentiment ?? 
    a?.sentimentLabel ?? 
    a?.classification?.sentiment ??
    ''
  ).toString().toLowerCase();

  if (/(neutral|neut)/.test(raw)) return 'neutral';
  if (/(bull|pos|up)/.test(raw)) return 'bull';
  if (/(bear|neg|down)/.test(raw)) return 'bear';

  const score = Number(
    a?.aiOpinionScore ?? 
    a?.ai_score ?? 
    a?.score ?? 
    a?.sentimentScore ?? 
    a?.classification?.confidence ?? 
    NaN
  );
  
  if (!Number.isNaN(score)) {
    if (score > 0.2) return 'bull';
    if (score < -0.2) return 'bear';
    return 'neutral';
  }

  const impact = (a?.impact ?? a?.aiImpact ?? a?.classification?.impact ?? '').toString().toLowerCase();
  if (impact === 'high' || impact === 'medium' || impact === 'low') return 'neutral';

  return 'neutral';
}

export function getSentimentColors(a: any) {
  const s = getSentimentFromArticle(a);
  return SENTIMENT_COLORS[s];
}
