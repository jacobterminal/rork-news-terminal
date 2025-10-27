export type SentimentLabel = 'BULL' | 'BEAR' | 'NEUTRAL';
export type ImpactLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type ArticleAnalysis = {
  articleId: string;
  sentiment: { label: SentimentLabel; confidence: number };
  impact: ImpactLevel;
};

export const SENTIMENT_COLORS = {
  BULL: '#1DB954',
  BEAR: '#E3413A',
  NEUTRAL: '#FFC53D',
};

class NewsAnalysisStore {
  private store: Map<string, ArticleAnalysis> = new Map();

  getAnalysis(articleId: string): ArticleAnalysis | undefined {
    return this.store.get(articleId);
  }

  setAnalysis(analysis: ArticleAnalysis): void {
    this.store.set(analysis.articleId, analysis);
  }

  upsert(analysis: ArticleAnalysis): void {
    const existing = this.store.get(analysis.articleId);
    
    if (!existing) {
      this.setAnalysis(analysis);
      return;
    }

    const isNewer = 
      existing.sentiment.label !== analysis.sentiment.label ||
      existing.sentiment.confidence !== analysis.sentiment.confidence ||
      existing.impact !== analysis.impact;

    if (isNewer) {
      this.setAnalysis(analysis);
    }
  }

  clear(): void {
    this.store.clear();
  }
}

export const newsAnalysisStore = new NewsAnalysisStore();

export const getAnalysis = (articleId: string) => newsAnalysisStore.getAnalysis(articleId);
export const setAnalysis = (analysis: ArticleAnalysis) => newsAnalysisStore.setAnalysis(analysis);
export const upsert = (analysis: ArticleAnalysis) => newsAnalysisStore.upsert(analysis);
