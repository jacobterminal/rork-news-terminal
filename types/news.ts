export interface NewsSource {
  name: string;
  type: 'news' | 'social' | 'filing' | 'earnings';
  reliability: number; // 0-100
  url?: string;
}

export interface NewsClassification {
  rumor_level: 'Confirmed' | 'Likely' | 'Rumor';
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number; // 0-100
  impact: 'Low' | 'Medium' | 'High';
  summary_15: string;
}

export interface NewsTags {
  is_macro: boolean;
  fed: boolean;
  sec: boolean;
  earnings: boolean;
  social: boolean;
}

export interface FeedItem {
  id: string;
  published_at: string;
  title: string;
  url: string;
  source: NewsSource;
  tickers: string[];
  tags: NewsTags;
  dedupe_key?: string;
  classification: NewsClassification;
  score?: number;
}

export interface EarningsItem {
  ticker: string;
  report_time: 'BMO' | 'AMC' | 'Intra';
  scheduled_at: string;
  actual_eps?: number;
  cons_eps?: number;
  actual_rev?: number;
  cons_rev?: number;
  surprise_eps?: number;
  surprise_rev?: number;
  verdict?: 'Beat' | 'Miss' | 'Inline' | null;
  article_id?: string;
}

export interface EconItem {
  id: string;
  name: string;
  country: string;
  scheduled_at: string;
  forecast?: number;
  previous?: number;
  actual?: number | null;
  impact: 'Low' | 'Medium' | 'High';
}

export interface AppFilters {
  all: boolean;
  watchlist: boolean;
  macro: boolean;
  earnings: boolean;
  sec: boolean;
  social: boolean;
  // Sector filters
  tech: boolean;
  finance: boolean;
  healthcare: boolean;
  energy: boolean;
  consumer: boolean;
  industrial: boolean;
}

export interface CriticalAlert {
  id: string;
  type: 'fed' | 'cpi' | 'earnings' | 'ppi' | 'nfp' | 'gdp' | 'fomc';
  headline: string;
  source: string;
  tickers: string[];
  forecast?: string;
  previous?: string;
  actual?: string;
  expected_eps?: number;
  expected_rev?: number;
  actual_eps?: number;
  actual_rev?: number;
  verdict?: string;
  impact: 'Low' | 'Medium' | 'High';
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  published_at: string;
  is_released: boolean;
}

export interface WatchlistFolder {
  id: string;
  name: string;
  tickers: string[];
  isExpanded: boolean;
}

export type CommentSortType = 'Hot' | 'New' | 'Top';

export interface ArticleAI {
  summary: string;
  overview: string;
  opinion: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  impact: 'Low' | 'Medium' | 'High';
  explainer: string;
}

export interface Comment {
  id: string;
  user_handle: string;
  body: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  flagged: boolean;
  parent_id?: string;
  replies?: Comment[];
}

export interface ArticleData {
  id: string;
  title: string;
  source: NewsSource;
  published_at: string;
  original_url: string;
  ai: ArticleAI;
  comments: Comment[];
  community_sentiment: {
    bullish: number;
    neutral: number;
    bearish: number;
  };
}

export interface AppState {
  feedItems: FeedItem[];
  earnings: EarningsItem[];
  econ: EconItem[];
  watchlist: string[];
  watchlistFolders: WatchlistFolder[];
  filters: AppFilters;
  notifications: FeedItem[];
  critical_alerts: CriticalAlert[];
  savedArticles: FeedItem[];
  ui: {
    tickerDrawer: {
      open: boolean;
      ticker: string | null;
    };
  };
}