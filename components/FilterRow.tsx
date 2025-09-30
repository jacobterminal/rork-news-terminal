import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { AppFilters } from '../types/news';

interface FilterRowProps {
  filters: AppFilters;
  onFiltersChange: (filters: Partial<AppFilters>) => void;
}

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  shortcut?: string;
}

function FilterChip({ label, active, onPress, shortcut }: FilterChipProps) {
  return (
    <Pressable
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
      {shortcut && (
        <Text style={[styles.shortcut, active && styles.shortcutActive]}>
          {shortcut}
        </Text>
      )}
    </Pressable>
  );
}

export default function FilterRow({ filters, onFiltersChange }: FilterRowProps) {
  // Ensure filters is defined with safe defaults
  const safeFilters = filters || {
    all: true,
    watchlist: false,
    macro: false,
    earnings: false,
    sec: false,
    social: false,
    tech: false,
    finance: false,
    healthcare: false,
    energy: false,
    consumer: false,
    industrial: false,
  };
  
  // Use safe filters for all operations
  const activeFilters = safeFilters;
  // Keyboard shortcuts - only on web
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!event || !event.target) return;
      if (event.target instanceof HTMLInputElement) return; // Don't interfere with input fields
      
      try {
        switch (event.key.toLowerCase()) {
          case 'w':
            event.preventDefault();
            if (typeof onFiltersChange === 'function') {
              onFiltersChange({ 
                all: false, 
                watchlist: !activeFilters.watchlist,
                macro: false,
                earnings: false,
                sec: false,
                social: false,
                tech: false,
                finance: false,
                healthcare: false,
                energy: false,
                consumer: false,
                industrial: false,
              });
            }
            break;
          case 'e':
            event.preventDefault();
            if (typeof onFiltersChange === 'function') {
              onFiltersChange({ 
                all: false, 
                watchlist: false,
                macro: false,
                earnings: !activeFilters.earnings,
                sec: false,
                social: false,
                tech: false,
                finance: false,
                healthcare: false,
                energy: false,
                consumer: false,
                industrial: false,
              });
            }
            break;
          case 'm':
            event.preventDefault();
            if (typeof onFiltersChange === 'function') {
              onFiltersChange({ 
                all: false, 
                watchlist: false,
                macro: !activeFilters.macro,
                earnings: false,
                sec: false,
                social: false,
                tech: false,
                finance: false,
                healthcare: false,
                energy: false,
                consumer: false,
                industrial: false,
              });
            }
            break;
        }
      } catch (error) {
        console.warn('Error handling keyboard shortcut:', error);
      }
    };
    
    try {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    } catch (error) {
      console.warn('Error setting up keyboard shortcuts:', error);
    }
  }, [activeFilters, onFiltersChange]);
  
  const handleChipPress = (filterKey: keyof AppFilters) => {
    if (typeof onFiltersChange !== 'function') {
      console.warn('onFiltersChange is not a function');
      return;
    }
    
    try {
      if (filterKey === 'all') {
        onFiltersChange({
          all: true,
          watchlist: false,
          macro: false,
          earnings: false,
          sec: false,
          social: false,
          tech: false,
          finance: false,
          healthcare: false,
          energy: false,
          consumer: false,
          industrial: false,
        });
      } else {
        // Toggle the specific filter and turn off 'all'
        const newFilters = {
          all: false,
          [filterKey]: !activeFilters[filterKey],
        };
        
        // If no filters are active, default to 'all'
        const hasActiveFilter = Object.entries(newFilters)
          .filter(([key]) => key !== 'all')
          .some(([, value]) => value);
        
        if (!hasActiveFilter) {
          newFilters.all = true;
        }
        
        onFiltersChange(newFilters);
      }
    } catch (error) {
      console.error('Error handling chip press:', error);
    }
  };
  
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <FilterChip
          label="All"
          active={activeFilters.all}
          onPress={() => handleChipPress('all')}
        />
        <FilterChip
          label="Watchlist"
          active={activeFilters.watchlist}
          onPress={() => handleChipPress('watchlist')}
          shortcut="W"
        />
        <FilterChip
          label="Tech"
          active={activeFilters.tech}
          onPress={() => handleChipPress('tech')}
        />
        <FilterChip
          label="Finance"
          active={activeFilters.finance}
          onPress={() => handleChipPress('finance')}
        />
        <FilterChip
          label="Healthcare"
          active={activeFilters.healthcare}
          onPress={() => handleChipPress('healthcare')}
        />
        <FilterChip
          label="Energy"
          active={activeFilters.energy}
          onPress={() => handleChipPress('energy')}
        />
        <FilterChip
          label="Consumer"
          active={activeFilters.consumer}
          onPress={() => handleChipPress('consumer')}
        />
        <FilterChip
          label="Industrial"
          active={activeFilters.industrial}
          onPress={() => handleChipPress('industrial')}
        />
        <FilterChip
          label="Macro"
          active={activeFilters.macro}
          onPress={() => handleChipPress('macro')}
          shortcut="M"
        />
        <FilterChip
          label="Earnings"
          active={activeFilters.earnings}
          onPress={() => handleChipPress('earnings')}
          shortcut="E"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 60,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    gap: 4,
  },
  chipActive: {
    backgroundColor: theme.colors.info + '20',
    borderColor: theme.colors.info,
  },
  chipText: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.textDim,
    fontWeight: '500',
  },
  chipTextActive: {
    color: theme.colors.info,
    fontWeight: '600',
  },
  shortcut: {
    fontSize: 10,
    color: theme.colors.textDim,
    backgroundColor: theme.colors.border,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    fontFamily: 'monospace',
  },
  shortcutActive: {
    color: theme.colors.info,
    backgroundColor: theme.colors.info + '20',
  },
});