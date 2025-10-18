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

let settingsStack: string[] = [];
let lastMainPage: string = 'instant';

interface UpcomingPageState {
  selectedDate: Date;
  selectedMonth: number;
  selectedYear: number;
  scrollPosition: number;
}

let upcomingPageState: UpcomingPageState | null = null;

export const upcomingPageMemory = {
  saveState(state: UpcomingPageState): void {
    upcomingPageState = {
      selectedDate: new Date(state.selectedDate),
      selectedMonth: state.selectedMonth,
      selectedYear: state.selectedYear,
      scrollPosition: state.scrollPosition
    };
    console.log('[UpcomingMemory] Saved state:', upcomingPageState);
  },

  getState(): UpcomingPageState | null {
    console.log('[UpcomingMemory] Retrieved state:', upcomingPageState);
    return upcomingPageState ? {
      ...upcomingPageState,
      selectedDate: new Date(upcomingPageState.selectedDate)
    } : null;
  },

  clearState(): void {
    upcomingPageState = null;
    console.log('[UpcomingMemory] Cleared state');
  }
};

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
