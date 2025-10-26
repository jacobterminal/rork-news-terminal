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

export default function InAppNotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [earningsAlerts, setEarningsAlerts] = useState(true);
  const [cpiAlerts, setCpiAlerts] = useState(true);
  const [fedAlerts, setFedAlerts] = useState(true);
  const [watchlistAlerts, setWatchlistAlerts] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const stored = await AsyncStorage.getItem('settings.inApp');
        if (stored) {
          const prefs = JSON.parse(stored);
          setCriticalAlerts(prefs.critical ?? true);
          setEarningsAlerts(prefs.earnings ?? true);
          setCpiAlerts(prefs.cpi ?? true);
          setFedAlerts(prefs.fed ?? true);
          setWatchlistAlerts(prefs.watchlist ?? true);
        }
      } catch (error) {
        console.error('[InAppNotifications] Failed to load preferences:', error);
      }
    };
    loadPreferences();
  }, []);

  const updatePreference = async (key: string, value: boolean) => {
    try {
      const stored = await AsyncStorage.getItem('settings.inApp');
      const prefs = stored ? JSON.parse(stored) : {};
      prefs[key] = value;
      await AsyncStorage.setItem('settings.inApp', JSON.stringify(prefs));
      console.log('[InAppNotifications] Preference updated:', key, value);
    } catch (error) {
      console.error('[InAppNotifications] Failed to save preference:', error);
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
        <Text style={styles.headerTitle}>In-App Notifications</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.pageDescription}>
          Manage banners shown while using the app. These do not affect push notifications.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ALERT TYPES</Text>
          <ToggleItem
            label="Critical Alerts"
            value={criticalAlerts}
            onValueChange={(val) => {
              setCriticalAlerts(val);
              updatePreference('critical', val);
            }}
          />
          <ToggleItem
            label="Earnings"
            value={earningsAlerts}
            onValueChange={(val) => {
              setEarningsAlerts(val);
              updatePreference('earnings', val);
            }}
          />
          <ToggleItem
            label="CPI / Economic Events"
            value={cpiAlerts}
            onValueChange={(val) => {
              setCpiAlerts(val);
              updatePreference('cpi', val);
            }}
          />
          <ToggleItem
            label="Fed Updates"
            value={fedAlerts}
            onValueChange={(val) => {
              setFedAlerts(val);
              updatePreference('fed', val);
            }}
          />
          <ToggleItem
            label="Watchlist Alerts"
            value={watchlistAlerts}
            onValueChange={(val) => {
              setWatchlistAlerts(val);
              updatePreference('watchlist', val);
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
