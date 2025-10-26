import { create } from 'zustand';
import { combine } from 'zustand/middleware';

export interface NavigationContext {
  origin: string;
  originParams?: any;
  restoreKey?: string;
  routeName?: string;
  scrollOffset?: number;
  timeRange?: string;
  customTimeRange?: any;
  filters?: any;
  selectedDate?: string;
  selectedMonth?: number;
  selectedYear?: number;
  searchQuery?: string;
}

export const useNavigationStore = create(
  combine(
    {
      returnContext: null as NavigationContext | null,
    },
    (set) => ({
      setReturnContext: (context: NavigationContext | null) => set({ returnContext: context }),
      clearReturnContext: () => set({ returnContext: null }),
    })
  )
);
