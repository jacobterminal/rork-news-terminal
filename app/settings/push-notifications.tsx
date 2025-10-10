import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Switch, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { settingsNavigation } from '../../utils/navigationMemory';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ToggleItemProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function ToggleItem({ label, value, onValueChange }: ToggleItemProps) {
  return (
    <View style={styles.toggleItem}>
      <Text style={styles.toggleItemLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#222222', true: '#FFD75A' }}
        thumbColor={value ? '#000' : '#666'}
      />
    </View>
  );
}

export default function PushNotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [pushCriticalAlerts, setPushCriticalAlerts] = useState(true);
  const [pushEconomicEvents, setPushEconomicEvents] = useState(true);
  const [pushEarningsCoverage, setPushEarningsCoverage] = useState(true);
  const [pushWatchlistAlerts, setPushWatchlistAlerts] = useState(true);
  const [pushHighImpactOnly, setPushHighImpactOnly] = useState(false);

  useEffect(() => {
    const loadPushPreferences = async () => {
      try {
        const stored = await AsyncStorage.getItem('userSettings.pushPreferences');
        if (stored) {
          const prefs = JSON.parse(stored);
          setPushCriticalAlerts(prefs.criticalAlerts ?? true);
          setPushEconomicEvents(prefs.economicEvents ?? true);
          setPushEarningsCoverage(prefs.earningsCoverage ?? true);
          setPushWatchlistAlerts(prefs.watchlistAlerts ?? true);
          setPushHighImpactOnly(prefs.highImpactOnly ?? false);
        }
      } catch (error) {
        console.error('[PushNotifications] Failed to load preferences:', error);
      }
    };
    loadPushPreferences();
  }, []);

  const updatePushPreferences = async (key: string, value: boolean) => {
    try {
      const stored = await AsyncStorage.getItem('userSettings.pushPreferences');
      const prefs = stored ? JSON.parse(stored) : {};
      prefs[key] = value;
      await AsyncStorage.setItem('userSettings.pushPreferences', JSON.stringify(prefs));
      console.log('[PushNotifications] Preference updated:', key, value);
    } catch (error) {
      console.error('[PushNotifications] Failed to save preference:', error);
    }
  };

  const handleBack = () => {
    const prevPage = settingsNavigation.goBack();
    if (prevPage) {
      router.replace(prevPage as any);
    } else {
      const destination = settingsNavigation.exitSettings();
      if (destination === 'index') {
        router.replace('/');
      } else {
        router.replace(`/${destination}` as any);
      }
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.6}
        >
          <ChevronLeft size={22} color="#EAEAEA" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Push Notifications</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.pageDescription}>
          Configure background alerts when the app is closed
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BACKGROUND ALERTS</Text>
          <ToggleItem
            label="Critical Alerts"
            value={pushCriticalAlerts}
            onValueChange={(val) => {
              setPushCriticalAlerts(val);
              updatePushPreferences('criticalAlerts', val);
            }}
          />
          <ToggleItem
            label="Economic Events (CPI / Jobs / FOMC)"
            value={pushEconomicEvents}
            onValueChange={(val) => {
              setPushEconomicEvents(val);
              updatePushPreferences('economicEvents', val);
            }}
          />
          <ToggleItem
            label="Earnings Coverage"
            value={pushEarningsCoverage}
            onValueChange={(val) => {
              setPushEarningsCoverage(val);
              updatePushPreferences('earningsCoverage', val);
            }}
          />
          <ToggleItem
            label="Watchlist Alerts"
            value={pushWatchlistAlerts}
            onValueChange={(val) => {
              setPushWatchlistAlerts(val);
              updatePushPreferences('watchlistAlerts', val);
            }}
          />
          <ToggleItem
            label="High Impact Only Mode"
            value={pushHighImpactOnly}
            onValueChange={(val) => {
              setPushHighImpactOnly(val);
              updatePushPreferences('highImpactOnly', val);
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#EAEAEA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  pageDescription: {
    fontSize: 14,
    color: '#888',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFD75A',
    letterSpacing: 1,
    marginBottom: 12,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  toggleItemLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#FFFFFF',
  },
});
