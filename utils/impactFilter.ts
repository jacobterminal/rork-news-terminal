import AsyncStorage from '@react-native-async-storage/async-storage';
import { FeedItem, CriticalAlert } from '../types/news';

export type ImpactLevel = 'HIGH' | 'MEDIUM_HIGH';

export interface NotificationPreferences {
  impactLevel: ImpactLevel;
  critical: boolean;
  economic: boolean;
  earnings: boolean;
  watchlist: boolean;
}

const STORAGE_KEY = 'userSettings.pushPreferences';

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const prefs = JSON.parse(stored);
      return {
        impactLevel: prefs.impactLevel ?? 'HIGH',
        critical: prefs.critical ?? true,
        economic: prefs.economic ?? true,
        earnings: prefs.earnings ?? true,
        watchlist: prefs.watchlist ?? true,
      };
    }
  } catch (error) {
    console.error('[ImpactFilter] Failed to load preferences:', error);
  }
  
  return {
    impactLevel: 'HIGH',
    critical: true,
    economic: true,
    earnings: true,
    watchlist: true,
  };
}

export function passesImpactFilter(
  item: FeedItem | CriticalAlert,
  impactLevel: ImpactLevel
): boolean {
  const itemImpact = 'classification' in item 
    ? item.classification?.impact 
    : item.impact;

  if (!itemImpact) return false;

  if (impactLevel === 'HIGH') {
    return itemImpact === 'High';
  } else {
    return itemImpact === 'High' || itemImpact === 'Medium';
  }
}

export function determineCategory(item: FeedItem | CriticalAlert): string | null {
  if ('classification' in item) {
    const feedItem = item as FeedItem;
    
    if (feedItem.classification?.impact === 'High') {
      return 'critical';
    }
    
    if (feedItem.tags?.is_macro || feedItem.tags?.fed) {
      return 'economic';
    }
    
    if (feedItem.tags?.earnings) {
      return 'earnings';
    }
    
    return 'watchlist';
  } else {
    const alert = item as CriticalAlert;
    
    if (alert.type === 'fed' || alert.type === 'cpi' || alert.type === 'ppi' || 
        alert.type === 'nfp' || alert.type === 'gdp' || alert.type === 'fomc') {
      return 'economic';
    }
    
    if (alert.type === 'earnings') {
      return 'earnings';
    }
    
    return 'critical';
  }
}

export function passesCategoryFilter(
  item: FeedItem | CriticalAlert,
  prefs: NotificationPreferences,
  watchlist: string[]
): boolean {
  const category = determineCategory(item);
  
  if (!category) return false;
  
  switch (category) {
    case 'critical':
      return prefs.critical;
    case 'economic':
      return prefs.economic;
    case 'earnings':
      return prefs.earnings;
    case 'watchlist':
      if (!prefs.watchlist) return false;
      const itemTickers = 'tickers' in item ? item.tickers : [];
      return itemTickers.some(ticker => watchlist.includes(ticker));
    default:
      return false;
  }
}

export function shouldDeliverNotification(
  item: FeedItem | CriticalAlert,
  prefs: NotificationPreferences,
  watchlist: string[]
): boolean {
  const categoryPasses = passesCategoryFilter(item, prefs, watchlist);
  if (!categoryPasses) return false;
  
  const impactPasses = passesImpactFilter(item, prefs.impactLevel);
  return impactPasses;
}

export function filterFeedItems(
  items: FeedItem[],
  impactLevel: ImpactLevel
): FeedItem[] {
  return items.filter(item => passesImpactFilter(item, impactLevel));
}

export function filterCriticalAlerts(
  alerts: CriticalAlert[]
): CriticalAlert[] {
  return alerts.filter(alert => alert.impact === 'High');
}
