import { FeedItem } from '../types/news';

export function calculateScore(item: FeedItem, watchlist: string[]): number {
  if (!item || typeof item !== 'object') {
    return 0;
  }
  
  if (!item.published_at || !item.source || !item.classification || !item.tags) {
    return 0;
  }
  
  try {
    const now = Date.now();
    const publishedTime = new Date(item.published_at).getTime();
    
    if (isNaN(publishedTime) || isNaN(now)) {
      return 0;
    }
    
    const ageHours = (now - publishedTime) / (1000 * 60 * 60);
    
    // Scoring components with safe defaults and type checking
    const reliability = (typeof item.source?.reliability === 'number' ? item.source.reliability : 0) / 100;
    const freshness = Math.max(0, 1 - Math.abs(ageHours) / 24);
    const safeWatchlist = Array.isArray(watchlist) ? watchlist : [];
    const safeTickers = Array.isArray(item.tickers) ? item.tickers : [];
    const tickerMatch = safeTickers.some(t => typeof t === 'string' && safeWatchlist.includes(t)) ? 1 : 0.3;
    const confidence = typeof item.classification?.confidence === 'number' ? item.classification.confidence : 0;
    const surprise = confidence > 80 ? 1 : confidence / 100;
    const macroWeight = (item.tags?.is_macro || item.tags?.fed) ? 1.2 : 1;
    
    // Weighted score with bounds checking
    const score = (
      0.28 * Math.max(0, Math.min(1, reliability)) +
      0.22 * Math.max(0, Math.min(1, freshness)) +
      0.20 * Math.max(0, Math.min(1, tickerMatch)) +
      0.15 * Math.max(0, Math.min(1, surprise)) +
      0.15 * Math.max(0, Math.min(2, macroWeight))
    ) * 100;
    
    return Math.round(Math.max(0, score) * 100) / 100;
  } catch (error) {
    console.warn('Error calculating score:', error);
    return 0;
  }
}

export function deduplicateItems(items: FeedItem[]): FeedItem[] {
  if (!items || !Array.isArray(items)) {
    return [];
  }
  
  const deduped: FeedItem[] = [];
  const seenKeys = new Set<string>();
  const titleGroups = new Map<string, FeedItem[]>();
  
  // First pass: group by dedupe_key
  for (const item of items) {
    if (!item || !item.title) continue;
    
    if (item.dedupe_key) {
      if (seenKeys.has(item.dedupe_key)) {
        continue; // Skip duplicate
      }
      seenKeys.add(item.dedupe_key);
    }
    
    // Group by title similarity for trigram matching
    const titleKey = generateTitleKey(item.title || '');
    if (!titleGroups.has(titleKey)) {
      titleGroups.set(titleKey, []);
    }
    titleGroups.get(titleKey)!.push(item);
  }
  
  // Second pass: dedupe by title similarity within groups
  for (const group of titleGroups.values()) {
    if (group.length === 1) {
      deduped.push(group[0]);
      continue;
    }
    
    // Find the highest reliability item in the group
    const bestItem = group.reduce((best, current) => {
      const currentReliability = current?.source?.reliability || 0;
      const bestReliability = best?.source?.reliability || 0;
      return currentReliability > bestReliability ? current : best;
    });
    
    deduped.push(bestItem);
  }
  
  return deduped.sort((a, b) => (b.score || 0) - (a.score || 0));
}

function generateTitleKey(title: string): string {
  if (!title || typeof title !== 'string') {
    return 'unknown';
  }
  
  // Simple trigram-like approach: use first 3 significant words
  const words = title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word && word.length > 2 && !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she', 'use', 'way', 'who', 'oil', 'sit', 'set'].includes(word));
  
  return words.slice(0, 3).join('_') || 'unknown';
}

export function formatTime(timestamp: string): string {
  if (!timestamp || typeof timestamp !== 'string') return '01/01/2024 00:00:00';
  
  try {
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '01/01/2024 00:00:00';
    }
    
    // Use consistent formatting with date and time
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.warn('Error formatting time:', error);
    return '01/01/2024 00:00:00';
  }
}

export function formatTimeCompact(timestamp: string): string {
  if (!timestamp || typeof timestamp !== 'string') return '00:00:00';
  
  try {
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '00:00:00';
    }
    
    // Use consistent formatting with proper error handling
    const hours = String(date.getHours() || 0).padStart(2, '0');
    const minutes = String(date.getMinutes() || 0).padStart(2, '0');
    const seconds = String(date.getSeconds() || 0).padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.warn('Error formatting compact time:', error);
    return '00:00:00';
  }
}

export function formatTimeCountdown(timestamp: string): string {
  if (!timestamp || typeof timestamp !== 'string') return '0m';
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    
    // Check if dates are valid
    if (isNaN(date.getTime()) || isNaN(now.getTime())) {
      return '0m';
    }
    
    const diffMs = date.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return 'Now';
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      return `${Math.max(0, diffMinutes)}m`;
    }
  } catch (error) {
    console.warn('Error formatting countdown time:', error);
    return '0m';
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}