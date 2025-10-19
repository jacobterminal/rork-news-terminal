import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_ROUTE_KEY = '@session_route';
const COMPANY_NAV_MEMORY_KEY = '@company_nav_memory';

export type AppRoute = 'instant' | 'index' | 'upcoming' | 'watchlist' | 'twitter';

interface CompanyNavigationMemory {
  lastRoute: string;
  routeParams?: Record<string, any>;
  scrollPosition?: number;
  timestamp: number;
}

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

let settingsStack: string[] = [];
let lastMainPage: string = 'instant';

export const settingsNavigation = {
  enterSettings(fromPage: string): void {
    lastMainPage = fromPage;
    settingsStack = ['settings'];
    console.log('[SettingsNav] Entered Settings from:', fromPage);
  },

  pushPage(page: string): void {
    settingsStack.push(page);
    console.log('[SettingsNav] Pushed page:', page, '| Stack:', settingsStack);
  },

  popPage(): string | null {
    if (settingsStack.length > 1) {
      settingsStack.pop();
      const prevPage = settingsStack[settingsStack.length - 1];
      console.log('[SettingsNav] Popped page, now at:', prevPage, '| Stack:', settingsStack);
      return prevPage;
    }
    console.log('[SettingsNav] At root');
    return null;
  },

  goBack(): string | null {
    if (settingsStack.length > 1) {
      settingsStack.pop();
      const prevPage = settingsStack[settingsStack.length - 1];
      console.log('[SettingsNav] Going back to:', prevPage, '| Stack:', settingsStack);
      return prevPage;
    }
    console.log('[SettingsNav] At root, exiting to:', lastMainPage);
    return null;
  },

  exitSettings(): string {
    const destination = lastMainPage;
    settingsStack = [];
    console.log('[SettingsNav] Exiting Settings to:', destination);
    return destination;
  },

  isAtRoot(): boolean {
    return settingsStack.length <= 1;
  },

  getCurrentStack(): string[] {
    return [...settingsStack];
  },

  reset(): void {
    settingsStack = [];
    lastMainPage = 'instant';
    console.log('[SettingsNav] Reset stack');
  }
};

export const companyNavigation = {
  async saveNavigationMemory(memory: Omit<CompanyNavigationMemory, 'timestamp'>): Promise<void> {
    try {
      const data: CompanyNavigationMemory = {
        ...memory,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(COMPANY_NAV_MEMORY_KEY, JSON.stringify(data));
      console.log('[CompanyNav] Saved navigation memory:', data);
    } catch (error) {
      console.error('[CompanyNav] Error saving navigation memory:', error);
    }
  },

  async getNavigationMemory(): Promise<CompanyNavigationMemory | null> {
    try {
      const data = await AsyncStorage.getItem(COMPANY_NAV_MEMORY_KEY);
      if (!data) return null;
      
      const memory: CompanyNavigationMemory = JSON.parse(data);
      const age = Date.now() - memory.timestamp;
      
      if (age > 5 * 60 * 1000) {
        console.log('[CompanyNav] Memory too old, clearing');
        await this.clearNavigationMemory();
        return null;
      }
      
      console.log('[CompanyNav] Retrieved navigation memory:', memory);
      return memory;
    } catch (error) {
      console.error('[CompanyNav] Error getting navigation memory:', error);
      return null;
    }
  },

  async clearNavigationMemory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(COMPANY_NAV_MEMORY_KEY);
      console.log('[CompanyNav] Cleared navigation memory');
    } catch (error) {
      console.error('[CompanyNav] Error clearing navigation memory:', error);
    }
  }
};
