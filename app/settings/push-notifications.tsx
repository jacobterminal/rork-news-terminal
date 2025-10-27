import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Switch, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { settingsNavigation } from '../../utils/navigationMemory';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNewsStore } from '../../store/newsStore';
import { ImpactLevel } from '../../utils/impactFilter';

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
  
  const [enabled, setEnabled] = useState(true);
  const [pushCriticalAlerts, setPushCriticalAlerts] = useState(true);
  const [pushEconomicEvents, setPushEconomicEvents] = useState(true);
  const [pushEarningsCoverage, setPushEarningsCoverage] = useState(true);
  const [pushWatchlistAlerts, setPushWatchlistAlerts] = useState(true);
  const [impactLevel, setImpactLevel] = useState<ImpactLevel>('MED_HIGH');
  const { updateImpactLevel } = useNewsStore();

  useEffect(() => {
    const loadPushPreferences = async () => {
      try {
        const stored = await AsyncStorage.getItem('settings.push');
        if (stored) {
          const prefs = JSON.parse(stored);
          
          let loadedImpactLevel: ImpactLevel = prefs.impactLevel ?? 'MED_HIGH';
          
          if (prefs.highImpactOnly !== undefined && !prefs.impactLevel) {
            loadedImpactLevel = prefs.highImpactOnly ? 'HIGH_ONLY' : 'MED_HIGH';
            prefs.impactLevel = loadedImpactLevel;
            await AsyncStorage.setItem('settings.push', JSON.stringify(prefs));
            console.log('[PushNotifications] Migrated legacy highImpactOnly to impactLevel:', loadedImpactLevel);
          }
          
          setEnabled(prefs.enabled ?? true);
          setPushCriticalAlerts(prefs.critical ?? true);
          setPushEconomicEvents(prefs.economic ?? true);
          setPushEarningsCoverage(prefs.earnings ?? true);
          setPushWatchlistAlerts(prefs.watchlist ?? true);
          setImpactLevel(loadedImpactLevel);
        }
      } catch (error) {
        console.error('[PushNotifications] Failed to load preferences:', error);
      }
    };
    loadPushPreferences();
  }, []);

  const updatePushPreferences = async (key: string, value: boolean | string) => {
    try {
      const stored = await AsyncStorage.getItem('settings.push');
      const prefs = stored ? JSON.parse(stored) : {};
      prefs[key] = value;
      await AsyncStorage.setItem('settings.push', JSON.stringify(prefs));
      console.log('[PushNotifications] Preference updated:', key, value);
    } catch (error) {
      console.error('[PushNotifications] Failed to save preference:', error);
    }
  };

  const handleEnabledToggle = (value: boolean) => {
    setEnabled(value);
    updatePushPreferences('enabled', value);
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
          <Text style={styles.sectionTitle}>MASTER CONTROL</Text>
          <ToggleItem
            label="Enable alerts"
            value={enabled}
            onValueChange={handleEnabledToggle}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IMPACT LEVEL</Text>
          <View style={styles.impactLevelRow}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                styles.segmentButtonLeft,
                impactLevel === 'HIGH_ONLY' && styles.segmentButtonActive
              ]}
              onPress={async () => {
                setImpactLevel('HIGH_ONLY');
                await updatePushPreferences('impactLevel', 'HIGH_ONLY');
                await updateImpactLevel('HIGH_ONLY');
              }}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.segmentButtonText,
                impactLevel === 'HIGH_ONLY' && styles.segmentButtonTextActive
              ]}>
                High only
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                styles.segmentButtonMiddle,
                impactLevel === 'MED_HIGH' && styles.segmentButtonActive
              ]}
              onPress={async () => {
                setImpactLevel('MED_HIGH');
                await updatePushPreferences('impactLevel', 'MED_HIGH');
                await updateImpactLevel('MED_HIGH');
              }}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.segmentButtonText,
                impactLevel === 'MED_HIGH' && styles.segmentButtonTextActive
              ]}>
                Medium + High
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                styles.segmentButtonRight,
                impactLevel === 'ALL' && styles.segmentButtonActive
              ]}
              onPress={async () => {
                setImpactLevel('ALL');
                await updatePushPreferences('impactLevel', 'ALL');
                await updateImpactLevel('ALL');
              }}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.segmentButtonText,
                impactLevel === 'ALL' && styles.segmentButtonTextActive
              ]}>
                All
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.impactLevelCaption}>
            Controls which alerts and lists you receive/see.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BACKGROUND ALERTS</Text>
          <ToggleItem
            label="Critical Alerts"
            value={pushCriticalAlerts}
            onValueChange={(val) => {
              setPushCriticalAlerts(val);
              updatePushPreferences('critical', val);
            }}
          />
          <ToggleItem
            label="Economic Events (CPI / Jobs / FOMC)"
            value={pushEconomicEvents}
            onValueChange={(val) => {
              setPushEconomicEvents(val);
              updatePushPreferences('economic', val);
            }}
          />
          <ToggleItem
            label="Earnings Coverage"
            value={pushEarningsCoverage}
            onValueChange={(val) => {
              setPushEarningsCoverage(val);
              updatePushPreferences('earnings', val);
            }}
          />
          <ToggleItem
            label="Watchlist Alerts"
            value={pushWatchlistAlerts}
            onValueChange={(val) => {
              setPushWatchlistAlerts(val);
              updatePushPreferences('watchlist', val);
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
  impactLevelRow: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  segmentButtonLeft: {
    borderRightWidth: 1,
    borderRightColor: '#222',
  },
  segmentButtonMiddle: {
    borderLeftWidth: 0,
    borderRightWidth: 1,
    borderRightColor: '#222',
  },
  segmentButtonRight: {
    borderLeftWidth: 0,
  },
  segmentButtonActive: {
    backgroundColor: '#FFD75A',
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#888',
  },
  segmentButtonTextActive: {
    color: '#000',
  },
  impactLevelCaption: {
    fontSize: 13,
    color: '#666',
    paddingHorizontal: 4,
    lineHeight: 18,
  },
});
