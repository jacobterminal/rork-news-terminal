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

export interface InAppSettings {
  critical: boolean;
  earnings: boolean;
  cpi: boolean;
  fed: boolean;
  watchlist: boolean;
  highImpactOnly: boolean;
}

const IN_APP_STORAGE_KEY = 'settings.inApp';

export async function getInAppSettings(): Promise<InAppSettings> {
  try {
    const stored = await AsyncStorage.getItem(IN_APP_STORAGE_KEY);
    if (stored) {
      const prefs = JSON.parse(stored);
      return {
        critical: prefs.critical ?? true,
        earnings: prefs.earnings ?? true,
        cpi: prefs.cpi ?? true,
        fed: prefs.fed ?? true,
        watchlist: prefs.watchlist ?? true,
        highImpactOnly: prefs.highImpactOnly ?? false,
      };
    }
  } catch (error) {
    console.error('[ImpactFilter] Failed to load in-app settings:', error);
  }
  
  return {
    critical: true,
    earnings: true,
    cpi: true,
    fed: true,
    watchlist: true,
    highImpactOnly: false,
  };
}

export async function shouldShowInAppBanner(
  item: FeedItem,
  watchlist: string[]
): Promise<boolean> {
  try {
    const inAppSettings = await getInAppSettings();
    
    const category = determineCategory(item);
    if (!category) return false;
    
    let categoryPasses = false;
    switch (category) {
      case 'critical':
        categoryPasses = inAppSettings.critical;
        break;
      case 'economic':
        categoryPasses = inAppSettings.cpi || inAppSettings.fed;
        break;
      case 'earnings':
        categoryPasses = inAppSettings.earnings;
        break;
      case 'watchlist':
        if (!inAppSettings.watchlist) return false;
        const itemTickers = item.tickers || [];
        categoryPasses = itemTickers.some(ticker => watchlist.includes(ticker));
        break;
      default:
        return false;
    }
    
    if (!categoryPasses) return false;
    
    if (inAppSettings.highImpactOnly) {
      const passesHighImpactGate = 
        item.aiImpact === 'High' || 
        (item.impactScore !== undefined && item.impactScore >= 0.70);
      
      if (!passesHighImpactGate) {
        console.log('[InAppBanner] Suppressed by High Impact AI filter:', item.title?.substring(0, 50));
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('[ImpactFilter] Error in shouldShowInAppBanner:', error);
    return false;
  }
}
