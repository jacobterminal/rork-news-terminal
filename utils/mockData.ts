import { EarningsItem, EconItem, FeedItem, CriticalAlert } from '../types/news';

const MOCK_SOURCES = [
  { name: 'Bloomberg', type: 'news' as const, reliability: 98, url: 'https://bloomberg.com' },
  { name: 'Reuters', type: 'news' as const, reliability: 95, url: 'https://reuters.com' },
  { name: 'WSJ', type: 'news' as const, reliability: 92, url: 'https://wsj.com' },
  { name: 'CNBC', type: 'news' as const, reliability: 85, url: 'https://cnbc.com' },
  { name: 'MarketWatch', type: 'news' as const, reliability: 80, url: 'https://marketwatch.com' },
  { name: 'SEC Filing', type: 'filing' as const, reliability: 100, url: 'https://sec.gov' },
  { name: 'Twitter', type: 'social' as const, reliability: 60, url: 'https://twitter.com' },
  { name: 'Reddit', type: 'social' as const, reliability: 45, url: 'https://reddit.com' },
];



const MOCK_HEADLINES = [
  {
    title: 'Apple iPhone 15 Sales Exceed Expectations in China Market',
    tickers: ['AAPL'],
    tags: { is_macro: false, fed: false, sec: false, earnings: false, social: false },
    sentiment: 'Bullish' as const,
    impact: 'Medium' as const,
    summary: 'Strong China demand drives iPhone 15 sales above analyst forecasts',
    dedupe_key: 'apple_iphone_sales_china',
  },
  {
    title: 'NVIDIA Data Center Revenue Surges 200% Year-Over-Year',
    tickers: ['NVDA'],
    tags: { is_macro: false, fed: false, sec: false, earnings: true, social: false },
    sentiment: 'Bullish' as const,
    impact: 'High' as const,
    summary: 'AI chip demand propels NVIDIA to record datacenter revenue growth',
  },
  {
    title: 'Tesla Cybertruck Production Ramp Faces Delays Until Q2 2024',
    tickers: ['TSLA'],
    tags: { is_macro: false, fed: false, sec: false, earnings: false, social: false },
    sentiment: 'Bearish' as const,
    impact: 'Medium' as const,
    summary: 'Manufacturing challenges push Cybertruck timeline back further',
  },
  {
    title: 'Fed Minutes Reveal Split on December Rate Decision',
    tickers: ['SPY', 'QQQ'],
    tags: { is_macro: true, fed: true, sec: false, earnings: false, social: false },
    sentiment: 'Neutral' as const,
    impact: 'High' as const,
    summary: 'FOMC members divided on timing of next rate adjustment',
  },
  {
    title: 'Microsoft Azure Cloud Revenue Beats Estimates by 15%',
    tickers: ['MSFT'],
    tags: { is_macro: false, fed: false, sec: false, earnings: true, social: false },
    sentiment: 'Bullish' as const,
    impact: 'High' as const,
    summary: 'Enterprise cloud adoption drives Azure growth acceleration',
  },
  {
    title: 'SEC Investigates Insider Trading at Major Tech Firms',
    tickers: ['GOOGL', 'META', 'AMZN'],
    tags: { is_macro: false, fed: false, sec: true, earnings: false, social: false },
    sentiment: 'Bearish' as const,
    impact: 'Medium' as const,
    summary: 'Regulatory probe targets executive stock transactions',
  },
  {
    title: 'Inflation Data Shows Continued Cooling in Core CPI',
    tickers: ['SPY', 'QQQ'],
    tags: { is_macro: true, fed: false, sec: false, earnings: false, social: false },
    sentiment: 'Bullish' as const,
    impact: 'High' as const,
    summary: 'Core inflation drops to 3.2%, supporting dovish Fed stance',
  },
  {
    title: 'AMD Launches New AI Chips to Compete with NVIDIA',
    tickers: ['AMD', 'NVDA'],
    tags: { is_macro: false, fed: false, sec: false, earnings: false, social: false },
    sentiment: 'Neutral' as const,
    impact: 'Medium' as const,
    summary: 'AMD enters AI accelerator market with competitive pricing',
  },
  {
    title: 'Netflix Password Sharing Crackdown Boosts Subscriber Growth',
    tickers: ['NFLX'],
    tags: { is_macro: false, fed: false, sec: false, earnings: false, social: false },
    sentiment: 'Bullish' as const,
    impact: 'Medium' as const,
    summary: 'Enforcement measures drive 8M new subscriber additions',
  },
  {
    title: 'Salesforce Announces Major Layoffs Amid AI Transformation',
    tickers: ['CRM'],
    tags: { is_macro: false, fed: false, sec: false, earnings: false, social: false },
    sentiment: 'Bearish' as const,
    impact: 'Medium' as const,
    summary: 'Company cuts 10% workforce while investing in AI capabilities',
  },
  // Duplicate for testing deduplication
  {
    title: 'Apple iPhone 15 China Sales Beat Forecasts Significantly',
    tickers: ['AAPL'],
    tags: { is_macro: false, fed: false, sec: false, earnings: false, social: false },
    sentiment: 'Bullish' as const,
    impact: 'Medium' as const,
    summary: 'Chinese market shows strong appetite for latest iPhone model',
    dedupe_key: 'apple_iphone_sales_china',
  },
  {
    title: 'Social Media Buzz: Tesla Cybertruck Spotted in Production',
    tickers: ['TSLA'],
    tags: { is_macro: false, fed: false, sec: false, earnings: false, social: true },
    sentiment: 'Bullish' as const,
    impact: 'Low' as const,
    summary: 'Unverified social posts claim Cybertruck production progress',
  },
  {
    title: 'Google Bard AI Update Challenges ChatGPT Dominance',
    tickers: ['GOOGL'],
    tags: { is_macro: false, fed: false, sec: false, earnings: false, social: false },
    sentiment: 'Bullish' as const,
    impact: 'Medium' as const,
    summary: 'Enhanced Bard capabilities target OpenAI market share',
  },
  {
    title: 'Meta Metaverse Division Reports $4B Quarterly Loss',
    tickers: ['META'],
    tags: { is_macro: false, fed: false, sec: false, earnings: true, social: false },
    sentiment: 'Bearish' as const,
    impact: 'High' as const,
    summary: 'Reality Labs continues heavy spending with limited revenue',
  },
  {
    title: 'Amazon Prime Day Sales Hit Record $12.7 Billion',
    tickers: ['AMZN'],
    tags: { is_macro: false, fed: false, sec: false, earnings: false, social: false },
    sentiment: 'Bullish' as const,
    impact: 'Medium' as const,
    summary: 'Two-day shopping event exceeds previous year by 18%',
  },
];

// Use current time as base for realistic calendar display
const BASE_TIME = Date.now();

const MOCK_EARNINGS: EarningsItem[] = [
  {
    ticker: 'AAPL',
    report_time: 'AMC',
    scheduled_at: new Date(BASE_TIME + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from base (today)
    cons_eps: 1.45,
    cons_rev: 89.5,
  },
  {
    ticker: 'NVDA',
    report_time: 'AMC',
    scheduled_at: new Date(BASE_TIME - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    actual_eps: 0.75,
    cons_eps: 0.70,
    actual_rev: 18.1,
    cons_rev: 16.2,
    surprise_eps: 7.1,
    surprise_rev: 11.7,
    verdict: 'Beat',
  },
  {
    ticker: 'TSLA',
    report_time: 'AMC',
    scheduled_at: new Date(BASE_TIME + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    cons_eps: 0.85,
    cons_rev: 24.3,
  },
  {
    ticker: 'MSFT',
    report_time: 'BMO',
    scheduled_at: new Date(BASE_TIME + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
    cons_eps: 2.65,
    cons_rev: 56.1,
  },
  {
    ticker: 'GOOGL',
    report_time: 'AMC',
    scheduled_at: new Date(BASE_TIME + 72 * 60 * 60 * 1000).toISOString(), // 3 days from now
    cons_eps: 1.25,
    cons_rev: 74.3,
  },
  {
    ticker: 'META',
    report_time: 'AMC',
    scheduled_at: new Date(BASE_TIME - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    actual_eps: 3.20,
    cons_eps: 3.05,
    actual_rev: 34.1,
    cons_rev: 33.8,
    surprise_eps: 4.9,
    surprise_rev: 0.9,
    verdict: 'Beat',
  },
];

const MOCK_ECON: EconItem[] = [
  {
    id: 'cpi_nov_2024',
    name: 'Consumer Price Index',
    country: 'US',
    scheduled_at: new Date(BASE_TIME + 4 * 60 * 60 * 1000).toISOString(), // Today
    forecast: 3.3,
    previous: 3.7,
    impact: 'High',
  },
  {
    id: 'unemployment_nov_2024',
    name: 'Unemployment Rate',
    country: 'US',
    scheduled_at: new Date(BASE_TIME + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    forecast: 3.9,
    previous: 3.7,
    impact: 'High',
  },
  {
    id: 'retail_sales_oct_2024',
    name: 'Retail Sales',
    country: 'US',
    scheduled_at: new Date(BASE_TIME - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    forecast: 0.3,
    previous: 0.7,
    actual: 0.1,
    impact: 'Medium',
  },
  {
    id: 'fomc_meeting_dec_2024',
    name: 'FOMC Meeting Decision',
    country: 'US',
    scheduled_at: new Date(BASE_TIME + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
    forecast: 5.25,
    previous: 5.50,
    impact: 'High',
  },
  {
    id: 'gdp_q3_2024',
    name: 'GDP Growth Rate',
    country: 'US',
    scheduled_at: new Date(BASE_TIME + 72 * 60 * 60 * 1000).toISOString(), // 3 days from now
    forecast: 2.8,
    previous: 3.0,
    impact: 'High',
  },
  {
    id: 'ppi_oct_2024',
    name: 'Producer Price Index',
    country: 'US',
    scheduled_at: new Date(BASE_TIME - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    forecast: 2.1,
    previous: 2.2,
    actual: 1.9,
    impact: 'Medium',
  },
  {
    id: 'ism_manufacturing_nov_2024',
    name: 'ISM Manufacturing PMI',
    country: 'US',
    scheduled_at: new Date(BASE_TIME + 96 * 60 * 60 * 1000).toISOString(), // 4 days from now
    forecast: 49.2,
    previous: 48.7,
    impact: 'Medium',
  },
];

const MOCK_CRITICAL_ALERTS: CriticalAlert[] = [
  {
    id: 'critical_trump_tariff_1',
    type: 'fomc',
    headline: 'Trump Threatens 100% Tariffs on China Amid Trade Tensions',
    source: 'Bloomberg',
    tickers: ['SPY', 'QQQ', 'BABA', 'JD', 'FXI'],
    forecast: '25%',
    previous: '25%',
    actual: '100%',
    verdict: 'Escalation in Trade War Rhetoric',
    impact: 'High',
    sentiment: 'Bearish',
    confidence: 88,
    published_at: new Date(BASE_TIME - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    is_released: true,
  },
  {
    id: 'critical_fed_1',
    type: 'fomc',
    headline: 'Fed Raises Rates by 25bps, Signals Pause in December',
    source: 'CNBC',
    tickers: ['SPY', 'QQQ', 'TLT'],
    forecast: '5.25%',
    previous: '5.00%',
    actual: '5.25%',
    verdict: 'Hawkish vs Forecast',
    impact: 'High',
    sentiment: 'Bearish',
    confidence: 85,
    published_at: new Date(BASE_TIME - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    is_released: true,
  },
  {
    id: 'critical_cpi_1',
    type: 'cpi',
    headline: 'Core CPI Rises 0.3% MoM, Above 0.2% Estimate',
    source: 'Bloomberg',
    tickers: ['SPY', 'QQQ', 'DXY'],
    forecast: '0.2%',
    previous: '0.3%',
    actual: '0.3%',
    verdict: 'Hotter than Expected',
    impact: 'High',
    sentiment: 'Bearish',
    confidence: 92,
    published_at: new Date(BASE_TIME - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    is_released: true,
  },
  {
    id: 'critical_earnings_1',
    type: 'earnings',
    headline: 'NVIDIA Beats Q3 Earnings, Revenue Up 206% YoY',
    source: 'Reuters',
    tickers: ['NVDA', 'AMD', 'SMCI'],
    expected_eps: 0.70,
    actual_eps: 0.81,
    expected_rev: 16200,
    actual_rev: 18120,
    verdict: 'Strong Beat on Both EPS and Revenue',
    impact: 'High',
    sentiment: 'Bullish',
    confidence: 95,
    published_at: new Date(BASE_TIME - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    is_released: true,
  },
  {
    id: 'critical_nfp_1',
    type: 'nfp',
    headline: 'Non-Farm Payrolls: 150K Jobs Added vs 180K Expected',
    source: 'MarketWatch',
    tickers: ['SPY', 'QQQ', 'IWM'],
    forecast: '180K',
    previous: '336K',
    actual: '150K',
    verdict: 'Weaker than Expected',
    impact: 'High',
    sentiment: 'Neutral',
    confidence: 88,
    published_at: new Date(BASE_TIME - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    is_released: true,
  },
  {
    id: 'critical_upcoming_1',
    type: 'fomc',
    headline: 'FOMC Meeting Decision Scheduled for 2:00 PM ET',
    source: 'WSJ',
    tickers: ['SPY', 'QQQ', 'TLT', 'DXY'],
    forecast: '5.50%',
    previous: '5.25%',
    verdict: 'Market expects 25bps hike',
    impact: 'High',
    sentiment: 'Neutral',
    confidence: 75,
    published_at: new Date(BASE_TIME + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    is_released: false,
  },
];

export function generateMockData(): { feedItems: FeedItem[]; earnings: EarningsItem[]; econ: EconItem[]; critical_alerts: CriticalAlert[] } {
  try {
    if (!Array.isArray(MOCK_HEADLINES) || !Array.isArray(MOCK_SOURCES)) {
      console.error('Mock data arrays are not properly initialized');
      return {
        feedItems: [],
        earnings: [],
        econ: [],
        critical_alerts: [],
      };
    }
    
    const feedItems: FeedItem[] = [];
    
    for (let index = 0; index < MOCK_HEADLINES.length; index++) {
      const headline = MOCK_HEADLINES[index];
      
      if (!headline || typeof headline !== 'object') {
        console.warn(`Invalid headline at index ${index}`);
        continue;
      }
      
      try {
        // Use deterministic time offsets instead of random
        const publishedTime = BASE_TIME - (index * 15 * 60 * 1000) - ((index * 7) % 10) * 60 * 1000;
        // Use deterministic source selection
        const source = MOCK_SOURCES[index % MOCK_SOURCES.length];
        
        if (!source || typeof source !== 'object') {
          console.warn(`Invalid source at index ${index}`);
          continue;
        }
        
        const feedItem: FeedItem = {
          id: `mock_${index}`,
          published_at: new Date(publishedTime).toISOString(),
          title: headline.title || 'Untitled',
          url: `https://example.com/article/${index}`,
          source,
          tickers: Array.isArray(headline.tickers) ? headline.tickers : [],
          tags: headline.tags || { is_macro: false, fed: false, sec: false, earnings: false, social: false },
          dedupe_key: headline.dedupe_key,
          classification: {
            rumor_level: source.type === 'social' ? 'Rumor' : 'Confirmed',
            sentiment: headline.sentiment || 'Neutral',
            confidence: Math.max(0, Math.min(100, 70 + ((index * 3) % 25))), // Deterministic confidence 70-95%
            impact: headline.impact || 'Low',
            summary_15: headline.summary || 'No summary available',
          },
        };
        
        feedItems.push(feedItem);
      } catch (itemError) {
        console.warn(`Error creating feed item at index ${index}:`, itemError);
      }
    }

    const result = {
      feedItems: Array.isArray(feedItems) ? feedItems : [],
      earnings: Array.isArray(MOCK_EARNINGS) ? MOCK_EARNINGS : [],
      econ: Array.isArray(MOCK_ECON) ? MOCK_ECON : [],
      critical_alerts: Array.isArray(MOCK_CRITICAL_ALERTS) ? MOCK_CRITICAL_ALERTS : [],
    };
    
    console.log('Generated mock data:', {
      feedItemsCount: result.feedItems.length,
      earningsCount: result.earnings.length,
      econCount: result.econ.length,
      criticalAlertsCount: result.critical_alerts.length,
    });
    
    return result;
  } catch (error) {
    console.error('Error generating mock data:', error);
    return {
      feedItems: [],
      earnings: [],
      econ: [],
      critical_alerts: [],
    };
  }
}