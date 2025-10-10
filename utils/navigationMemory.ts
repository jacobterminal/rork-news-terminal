import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_ROUTE_KEY = '@session_route';

export type AppRoute = 'instant' | 'index' | 'upcoming' | 'watchlist' | 'twitter';

export const navigationMemory = {
  async saveLastRoute(route: AppRoute): Promise<void> {
    try {
      await AsyncStorage.setItem(SESSION_ROUTE_KEY, route);
      console.log('[NavigationMemory] Saved last route:', route);
    } catch (error) {
      console.error('[NavigationMemory] Error saving route:', error);
    }
  },

  async getLastRoute(): Promise<AppRoute | null> {
    try {
      const route = await AsyncStorage.getItem(SESSION_ROUTE_KEY);
      console.log('[NavigationMemory] Retrieved last route:', route);
      return route as AppRoute | null;
    } catch (error) {
      console.error('[NavigationMemory] Error getting route:', error);
      return null;
    }
  },

  async clearLastRoute(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SESSION_ROUTE_KEY);
      console.log('[NavigationMemory] Cleared last route');
    } catch (error) {
      console.error('[NavigationMemory] Error clearing route:', error);
    }
  }
};
