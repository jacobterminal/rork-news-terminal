import { FeedItem } from '../types/news';
import { EarningsHistory, Quarter, EarningsResult } from '../types/earnings';

export interface ParsedEarningsData {
  actualEps: number | null;
  revenueUsd: number | null;
  result: EarningsResult;
  confidence: number;
}

function extractQuarter(text: string): Quarter | null {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('q4') || lowerText.includes('fourth quarter')) return 'Q4';
  if (lowerText.includes('q3') || lowerText.includes('third quarter')) return 'Q3';
  if (lowerText.includes('q2') || lowerText.includes('second quarter')) return 'Q2';
  if (lowerText.includes('q1') || lowerText.includes('first quarter')) return 'Q1';
  
  return null;
}

function extractFiscalYear(text: string, publishedDate: Date): number {
  const fyMatch = text.match(/(?:fy|fiscal year)\s*(\d{4})/i);
  if (fyMatch) {
    return parseInt(fyMatch[1]);
  }
  
  const yearMatch = text.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    return parseInt(yearMatch[1]);
  }
  
  return publishedDate.getFullYear();
}

function extractActualEps(text: string): number | null {
  const patterns = [
    /eps\s+(?:of|at|was|came in at)\s+\$?([0-9]+(?:\.[0-9]+)?)/i,
    /reported\s+eps\s+\$?([0-9]+(?:\.[0-9]+)?)/i,
    /earnings\s+per\s+share\s+(?:of|at|was)\s+\$?([0-9]+(?:\.[0-9]+)?)/i,
    /\$?([0-9]+(?:\.[0-9]+)?)\s+per\s+share/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      if (!isNaN(value)) {
        return value;
      }
    }
  }
  
  return null;
}

function extractRevenue(text: string): number | null {
  const patterns = [
    /(revenue|sales)\s+(?:of|at|were|was|came in at)\s+\$?([0-9]+(?:\.[0-9]+)?)\s*([MB])?/i,
    /reported\s+(revenue|sales)\s+\$?([0-9]+(?:\.[0-9]+)?)\s*([MB])?/i,
    /\$?([0-9]+(?:\.[0-9]+)?)\s*([MB])?\s+in\s+(revenue|sales)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let value: number;
      let multiplierIndex: number;
      
      if (pattern.source.includes('in\\s+(revenue|sales)')) {
        value = parseFloat(match[1]);
        multiplierIndex = 2;
      } else {
        value = parseFloat(match[2]);
        multiplierIndex = 3;
      }
      
      if (isNaN(value)) continue;
      
      const multiplier = match[multiplierIndex];
      if (multiplier === 'B' || multiplier === 'b') {
        return value * 1_000_000_000;
      } else if (multiplier === 'M' || multiplier === 'm') {
        return value * 1_000_000;
      } else {
        if (value > 100) {
          return value * 1_000_000;
        }
        return value * 1_000_000_000;
      }
    }
  }
  
  return null;
}

function extractBeatMiss(text: string): { result: EarningsResult; confidence: number } {
  const lowerText = text.toLowerCase();
  
  const beatPatterns = [
    /beat\s+(?:wall street|analyst|street|consensus)\s+(?:estimates?|expectations?)/i,
    /beats?\s+estimates?/i,
    /exceeded\s+expectations?/i,
    /topped\s+estimates?/i,
    /surpassed\s+expectations?/i,
  ];
  
  const missPatterns = [
    /miss(?:ed)?\s+(?:wall street|analyst|street|consensus)\s+(?:estimates?|expectations?)/i,
    /miss(?:ed)?\s+estimates?/i,
    /fell short of\s+expectations?/i,
    /below\s+expectations?/i,
    /disappointed\s+(?:investors|analysts)/i,
  ];
  
  const inlinePatterns = [
    /(?:in-line|inline|in line)\s+with\s+(?:estimates?|expectations?)/i,
    /met\s+(?:estimates?|expectations?)/i,
    /matched\s+(?:estimates?|expectations?)/i,
  ];
  
  let beatScore = 0;
  let missScore = 0;
  let inlineScore = 0;
  
  beatPatterns.forEach(pattern => {
    if (pattern.test(lowerText)) beatScore++;
  });
  
  missPatterns.forEach(pattern => {
    if (pattern.test(lowerText)) missScore++;
  });
  
  inlinePatterns.forEach(pattern => {
    if (pattern.test(lowerText)) inlineScore++;
  });
  
  if (beatScore > missScore && beatScore > inlineScore) {
    return { result: 'Beat', confidence: Math.min(0.65 + (beatScore * 0.05), 0.85) };
  }
  
  if (missScore > beatScore && missScore > inlineScore) {
    return { result: 'Miss', confidence: Math.min(0.65 + (missScore * 0.05), 0.85) };
  }
  
  if (inlineScore > 0) {
    return { result: '—', confidence: 0.7 };
  }
  
  return { result: '—', confidence: 0.3 };
}

export function parseEarningsFromNews(newsItem: FeedItem): ParsedEarningsData | null {
  const title = newsItem.title || '';
  const summary = newsItem.classification?.summary_15 || '';
  const text = `${title} ${summary}`.toLowerCase();
  
  if (!text.includes('earnings') && 
      !text.includes('eps') && 
      !text.includes('revenue') && 
      !text.includes('results') &&
      !newsItem.tags?.earnings) {
    return null;
  }
  
  const actualEps = extractActualEps(text);
  const revenueUsd = extractRevenue(text);
  const beatMiss = extractBeatMiss(text);
  
  if (actualEps === null && revenueUsd === null && beatMiss.result === '—') {
    return null;
  }
  
  let confidence = beatMiss.confidence;
  
  if (actualEps !== null) {
    confidence = Math.min(confidence + 0.1, 0.9);
  }
  if (revenueUsd !== null) {
    confidence = Math.min(confidence + 0.05, 0.95);
  }
  
  if (newsItem.tags?.earnings) {
    confidence = Math.min(confidence + 0.05, 0.95);
  }
  if (newsItem.classification?.rumor_level === 'Confirmed') {
    confidence = Math.min(confidence + 0.05, 0.95);
  }
  
  return {
    actualEps,
    revenueUsd,
    result: beatMiss.result,
    confidence,
  };
}

export function searchRelevantEarningsNews(
  newsItems: FeedItem[],
  ticker: string,
  fiscalYear: number,
  quarter: Quarter
): FeedItem[] {
  const eighteenMonthsAgo = new Date();
  eighteenMonthsAgo.setMonth(eighteenMonthsAgo.getMonth() - 18);
  
  const earningsKeywords = ['earnings', 'results', 'eps', 'revenue'];
  const quarterVariants = [
    quarter.toLowerCase(),
    `q${quarter.charAt(1)}`,
    quarter === 'Q1' ? 'first quarter' :
    quarter === 'Q2' ? 'second quarter' :
    quarter === 'Q3' ? 'third quarter' : 'fourth quarter'
  ];
  
  console.log(`🔍 Searching earnings news for ${ticker} ${quarter} ${fiscalYear} (last 18 months)`);
  
  return newsItems
    .filter(item => {
      if (!item.tickers?.includes(ticker)) return false;
      
      const publishedDate = new Date(item.published_at);
      if (publishedDate < eighteenMonthsAgo) return false;
      
      const title = item.title?.toLowerCase() || '';
      const summary = item.classification?.summary_15?.toLowerCase() || '';
      const text = `${title} ${summary}`;
      
      const hasEarningsKeyword = earningsKeywords.some(keyword => text.includes(keyword));
      const hasQuarterMention = quarterVariants.some(variant => text.includes(variant));
      
      const hasYearMention = text.includes(fiscalYear.toString());
      
      const isTaggedAsEarnings = item.tags?.earnings || false;
      const isHighImpactEarnings = item.classification?.impact === 'High' && 
                                   title.toLowerCase().includes('earnings');
      
      if (isTaggedAsEarnings && hasQuarterMention) return true;
      if (isHighImpactEarnings && hasQuarterMention) return true;
      if (hasEarningsKeyword && hasQuarterMention && hasYearMention) return true;
      if (hasEarningsKeyword && hasQuarterMention) return true;
      
      return false;
    })
    .sort((a, b) => {
      const scoreA = calculateRelevanceScore(a, ticker, quarter);
      const scoreB = calculateRelevanceScore(b, ticker, quarter);
      return scoreB - scoreA;
    });
}

function calculateRelevanceScore(item: FeedItem, ticker: string, quarter: Quarter): number {
  let score = 0;
  
  const title = item.title?.toLowerCase() || '';
  const summary = item.classification?.summary_15?.toLowerCase() || '';
  const text = `${title} ${summary}`;
  
  if (item.tags?.earnings) score += 50;
  if (item.classification?.impact === 'High') score += 30;
  if (item.classification?.rumor_level === 'Confirmed') score += 20;
  
  const explicitQuarterVariants = [
    quarter.toLowerCase(),
    `q${quarter.charAt(1)}`,
    quarter === 'Q1' ? 'first quarter' :
    quarter === 'Q2' ? 'second quarter' :
    quarter === 'Q3' ? 'third quarter' : 'fourth quarter'
  ];
  
  if (explicitQuarterVariants.some(v => title.includes(v))) score += 40;
  else if (explicitQuarterVariants.some(v => summary.includes(v))) score += 20;
  
  if (text.includes('beat') || text.includes('miss')) score += 25;
  if (text.includes('eps')) score += 15;
  if (text.includes('revenue')) score += 10;
  
  const publishedDate = new Date(item.published_at);
  const ageInDays = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
  if (ageInDays < 7) score += 20;
  else if (ageInDays < 30) score += 10;
  else if (ageInDays < 90) score += 5;
  
  return score;
}

export function backfillEarningsFromNews(
  ticker: string,
  fiscalYear: number,
  quarter: Quarter,
  newsItems: FeedItem[]
): EarningsHistory | null {
  const relevantNews = searchRelevantEarningsNews(newsItems, ticker, fiscalYear, quarter);
  
  if (relevantNews.length === 0) {
    return null;
  }
  
  for (const newsItem of relevantNews) {
    const parsed = parseEarningsFromNews(newsItem);
    
    if (!parsed) continue;
    
    if (parsed.result !== '—' || parsed.actualEps !== null) {
      return {
        ticker,
        fiscalYear,
        quarter,
        actualEps: parsed.actualEps,
        revenueUsd: parsed.revenueUsd,
        session: 'TBA',
        result: parsed.result,
        source: 'news_parse',
        articleId: newsItem.id,
        confidence: parsed.confidence,
        updatedAt: new Date().toISOString(),
      };
    }
  }
  
  return null;
}
