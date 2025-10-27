import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Switch, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { settingsNavigation } from '../../utils/navigationMemory';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNewsStore } from '../../store/newsStore';

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
  const [pushFedUpdates, setPushFedUpdates] = useState(true);
  const [pushWatchlistAlerts, setPushWatchlistAlerts] = useState(true);
  const [impactLevel, setImpactLevel] = useState<'high' | 'medium_high' | 'all'>('medium_high');
  const [scope, setScope] = useState<'watchlist' | 'all'>('all');
  const { updateImpactLevel } = useNewsStore();

  useEffect(() => {
    const loadPushPreferences = async () => {
      try {
        const stored = await AsyncStorage.getItem('notifications.push');
        if (stored) {
          try {
            const prefs = JSON.parse(stored);
            if (prefs && typeof prefs === 'object') {
              setImpactLevel(prefs.impactLevel ?? 'medium_high');
              setScope(prefs.scope ?? 'all');
              setPushCriticalAlerts(prefs.categories?.critical ?? true);
              setPushEconomicEvents(prefs.categories?.economic ?? true);
              setPushEarningsCoverage(prefs.categories?.earnings ?? true);
              setPushFedUpdates(prefs.categories?.fed ?? true);
              setPushWatchlistAlerts(prefs.categories?.watchlist ?? true);
            } else {
              console.warn('[PushNotifications] Invalid preferences format, resetting');
              await AsyncStorage.removeItem('notifications.push');
            }
          } catch (parseError) {
            console.error('[PushNotifications] Failed to parse preferences, resetting:', parseError);
            await AsyncStorage.removeItem('notifications.push');
          }
        }
      } catch (error) {
        console.error('[PushNotifications] Failed to load preferences:', error);
      }
    };
    loadPushPreferences();
  }, []);

  useEffect(() => {
    const updatePushPreferences = async () => {
      try {
        const prefs = {
          impactLevel,
          scope,
          categories: {
            critical: pushCriticalAlerts,
            economic: pushEconomicEvents,
            earnings: pushEarningsCoverage,
            fed: pushFedUpdates,
            watchlist: pushWatchlistAlerts,
          },
        };
        await AsyncStorage.setItem('notifications.push', JSON.stringify(prefs));
        console.log('[PushNotifications] Preferences updated:', prefs);
      } catch (error) {
        console.error('[PushNotifications] Failed to save preferences:', error);
      }
    };
    updatePushPreferences();
  }, [impactLevel, scope, pushCriticalAlerts, pushEconomicEvents, pushEarningsCoverage, pushFedUpdates, pushWatchlistAlerts]);

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
          <Text style={styles.sectionTitle}>IMPACT LEVEL</Text>
          <View style={styles.impactLevelRow}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                styles.segmentButtonLeft,
                impactLevel === 'high' && styles.segmentButtonActive
              ]}
              onPress={() => {
                setImpactLevel('high');
                updateImpactLevel('HIGH_ONLY');
              }}
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
              onPress={() => {
                setImpactLevel('medium_high');
                updateImpactLevel('MED_HIGH');
              }}
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
              onPress={() => {
                setImpactLevel('all');
                updateImpactLevel('ALL');
              }}
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
            value={pushCriticalAlerts}
            onValueChange={setPushCriticalAlerts}
          />
          <ToggleItem
            label="Economic Events (CPI / Jobs / FOMC)"
            value={pushEconomicEvents}
            onValueChange={setPushEconomicEvents}
          />
          <ToggleItem
            label="Earnings Coverage"
            value={pushEarningsCoverage}
            onValueChange={setPushEarningsCoverage}
          />
          <ToggleItem
            label="Fed Updates"
            value={pushFedUpdates}
            onValueChange={setPushFedUpdates}
          />
          <ToggleItem
            label="Watchlist Alerts"
            value={pushWatchlistAlerts}
            onValueChange={setPushWatchlistAlerts}
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
