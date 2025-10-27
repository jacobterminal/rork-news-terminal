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
  
  const [inAppCriticalAlerts, setInAppCriticalAlerts] = useState(true);
  const [inAppEconomicEvents, setInAppEconomicEvents] = useState(true);
  const [inAppEarningsCoverage, setInAppEarningsCoverage] = useState(true);
  const [inAppFedUpdates, setInAppFedUpdates] = useState(true);
  const [inAppWatchlistAlerts, setInAppWatchlistAlerts] = useState(true);
  const [impactLevel, setImpactLevel] = useState<'high' | 'medium_high' | 'all'>('medium_high');
  const [scope, setScope] = useState<'watchlist' | 'all'>('all');

  useEffect(() => {
    const loadInAppPreferences = async () => {
      try {
        const stored = await AsyncStorage.getItem('notifications.inapp');
        if (stored) {
          try {
            const prefs = JSON.parse(stored);
            if (prefs && typeof prefs === 'object') {
              setImpactLevel(prefs.impactLevel ?? 'medium_high');
              setScope(prefs.scope ?? 'all');
              setInAppCriticalAlerts(prefs.categories?.critical ?? true);
              setInAppEconomicEvents(prefs.categories?.economic ?? true);
              setInAppEarningsCoverage(prefs.categories?.earnings ?? true);
              setInAppFedUpdates(prefs.categories?.fed ?? true);
              setInAppWatchlistAlerts(prefs.categories?.watchlist ?? true);
            } else {
              console.warn('[InAppNotifications] Invalid preferences format, resetting');
              await AsyncStorage.removeItem('notifications.inapp');
            }
          } catch (parseError) {
            console.error('[InAppNotifications] Failed to parse preferences, resetting:', parseError);
            await AsyncStorage.removeItem('notifications.inapp');
          }
        }
      } catch (error) {
        console.error('[InAppNotifications] Failed to load preferences:', error);
      }
    };
    loadInAppPreferences();
  }, []);

  useEffect(() => {
    const updateInAppPreferences = async () => {
      try {
        const prefs = {
          impactLevel,
          scope,
          categories: {
            critical: inAppCriticalAlerts,
            economic: inAppEconomicEvents,
            earnings: inAppEarningsCoverage,
            fed: inAppFedUpdates,
            watchlist: inAppWatchlistAlerts,
          },
        };
        await AsyncStorage.setItem('notifications.inapp', JSON.stringify(prefs));
        console.log('[InAppNotifications] Preferences updated:', prefs);
      } catch (error) {
        console.error('[InAppNotifications] Failed to save preferences:', error);
      }
    };
    updateInAppPreferences();
  }, [impactLevel, scope, inAppCriticalAlerts, inAppEconomicEvents, inAppEarningsCoverage, inAppFedUpdates, inAppWatchlistAlerts]);

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
          <Text style={styles.sectionTitle}>IMPACT LEVEL</Text>
          <View style={styles.impactLevelRow}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                styles.segmentButtonLeft,
                impactLevel === 'high' && styles.segmentButtonActive
              ]}
              onPress={() => setImpactLevel('high')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.segmentButtonText,
                impactLevel === 'high' && styles.segmentButtonTextActive
              ]}>
                High only
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                styles.segmentButtonMiddle,
                impactLevel === 'medium_high' && styles.segmentButtonActive
              ]}
              onPress={() => setImpactLevel('medium_high')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.segmentButtonText,
                impactLevel === 'medium_high' && styles.segmentButtonTextActive
              ]}>
                Medium + High
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                styles.segmentButtonRight,
                impactLevel === 'all' && styles.segmentButtonActive
              ]}
              onPress={() => setImpactLevel('all')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.segmentButtonText,
                impactLevel === 'all' && styles.segmentButtonTextActive
              ]}>
                All
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ALERT CATEGORIES</Text>
          <ToggleItem
            label="Critical Alerts"
            value={inAppCriticalAlerts}
            onValueChange={setInAppCriticalAlerts}
          />
          <ToggleItem
            label="Economic Events (CPI / Jobs / FOMC)"
            value={inAppEconomicEvents}
            onValueChange={setInAppEconomicEvents}
          />
          <ToggleItem
            label="Earnings Coverage"
            value={inAppEarningsCoverage}
            onValueChange={setInAppEarningsCoverage}
          />
          <ToggleItem
            label="Fed Updates"
            value={inAppFedUpdates}
            onValueChange={setInAppFedUpdates}
          />
          <ToggleItem
            label="Watchlist Alerts"
            value={inAppWatchlistAlerts}
            onValueChange={setInAppWatchlistAlerts}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SCOPE</Text>
          <View style={styles.scopeRow}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                styles.segmentButtonLeft,
                scope === 'watchlist' && styles.segmentButtonActive
              ]}
              onPress={() => setScope('watchlist')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.segmentButtonText,
                scope === 'watchlist' && styles.segmentButtonTextActive
              ]}>
                Watchlist only
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                styles.segmentButtonRight,
                scope === 'all' && styles.segmentButtonActive
              ]}
              onPress={() => setScope('all')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.segmentButtonText,
                scope === 'all' && styles.segmentButtonTextActive
              ]}>
                All news
              </Text>
            </TouchableOpacity>
          </View>
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
  scopeRow: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 12,
    overflow: 'hidden',
  },
});
