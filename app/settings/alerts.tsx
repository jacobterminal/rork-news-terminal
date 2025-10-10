import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Switch, Platform, Linking, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import SettingsBackHeader from '../../components/SettingsBackHeader';

interface ToggleItemProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function ToggleItem({ label, description, value, onValueChange }: ToggleItemProps) {
  return (
    <View style={styles.toggleItem}>
      <View style={styles.toggleItemLeft}>
        <Text style={styles.toggleItemLabel}>{label}</Text>
        {description && (
          <Text style={styles.toggleItemDescription}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#333', true: '#FFD600' }}
        thumbColor={value ? '#FFFFFF' : '#888'}
      />
    </View>
  );
}

export default function AlertsSettingsScreen() {
  const insets = useSafeAreaInsets();

  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [earningsAlerts, setEarningsAlerts] = useState(true);
  const [cpiAlerts, setCpiAlerts] = useState(true);
  const [fedAlerts, setFedAlerts] = useState(true);
  const [watchlistAlerts, setWatchlistAlerts] = useState(true);
  
  const [offAppCriticalAlerts, setOffAppCriticalAlerts] = useState(false);
  const [offAppEarningsAlerts, setOffAppEarningsAlerts] = useState(false);
  const [offAppCpiAlerts, setOffAppCpiAlerts] = useState(false);
  const [offAppFedAlerts, setOffAppFedAlerts] = useState(false);
  const [offAppWatchlistAlerts, setOffAppWatchlistAlerts] = useState(false);
  
  const [pushNotifications, setPushNotifications] = useState(true);
  const [alertSound, setAlertSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  
  const [notificationPermission, setNotificationPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [showPermissionBanner, setShowPermissionBanner] = useState(false);

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    if (Platform.OS === 'web') {
      setNotificationPermission('granted');
      return;
    }

    const { status } = await Notifications.getPermissionsAsync();
    setNotificationPermission(status);
    setShowPermissionBanner(status !== 'granted');
  };

  const requestNotificationPermission = async () => {
    if (Platform.OS === 'web') return;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    if (existingStatus === 'denied') {
      Alert.alert(
        'Notifications Disabled',
        'Please enable notifications in your device settings to receive alerts.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    setNotificationPermission(status);
    setShowPermissionBanner(status !== 'granted');
  };

  const handleOffAppToggle = async (
    value: boolean,
    setter: (value: boolean) => void,
    topic: string
  ) => {
    if (Platform.OS === 'web') {
      setter(value);
      return;
    }

    if (value && notificationPermission !== 'granted') {
      await requestNotificationPermission();
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
    }

    setter(value);

    if (value) {
      await registerPushTopic(topic);
    } else {
      await unregisterPushTopic(topic);
    }
  };

  const registerPushTopic = async (topic: string) => {
    if (Platform.OS === 'web') return;

    console.log(`[Push] Registering topic: ${topic}`);
    
    if (Platform.OS === 'ios') {
      await Notifications.setNotificationCategoryAsync(topic, [
        {
          identifier: 'view',
          buttonTitle: 'View',
          options: { opensAppToForeground: true },
        },
      ]);
    }
  };

  const unregisterPushTopic = async (topic: string) => {
    if (Platform.OS === 'web') return;

    console.log(`[Push] Unregistering topic: ${topic}`);
    
    if (Platform.OS === 'ios') {
      await Notifications.setNotificationCategoryAsync(topic, []);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <SettingsBackHeader />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alerts & Notifications</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {showPermissionBanner && (
          <View style={styles.permissionBanner}>
            <Text style={styles.permissionBannerText}>
              Enable notifications in Settings to receive alerts when you&apos;re not in the app.
            </Text>
            <TouchableOpacity 
              style={styles.permissionButton}
              onPress={requestNotificationPermission}
            >
              <Text style={styles.permissionButtonText}>Enable Notifications</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INSTANT NEWS PRESETS</Text>
          <ToggleItem
            label="Critical Alerts"
            description="Breaking news and market-moving events"
            value={criticalAlerts}
            onValueChange={setCriticalAlerts}
          />
          <ToggleItem
            label="Earnings Reports"
            description="Company earnings announcements"
            value={earningsAlerts}
            onValueChange={setEarningsAlerts}
          />
          <ToggleItem
            label="CPI & Economic Data"
            description="Consumer Price Index and economic indicators"
            value={cpiAlerts}
            onValueChange={setCpiAlerts}
          />
          <ToggleItem
            label="Federal Reserve"
            description="Fed announcements and policy changes"
            value={fedAlerts}
            onValueChange={setFedAlerts}
          />
          <ToggleItem
            label="Watchlist Alerts"
            description="News for tickers in your watchlist"
            value={watchlistAlerts}
            onValueChange={setWatchlistAlerts}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OFF-APP NOTIFICATIONS</Text>
          <Text style={styles.sectionDescription}>
            Receive push notifications when you&apos;re not using the app
          </Text>
          <ToggleItem
            label="Critical Alerts"
            description="Breaking news and market-moving events"
            value={offAppCriticalAlerts}
            onValueChange={(value) => handleOffAppToggle(value, setOffAppCriticalAlerts, 'critical_alerts')}
          />
          <ToggleItem
            label="Earnings"
            description="Company earnings announcements"
            value={offAppEarningsAlerts}
            onValueChange={(value) => handleOffAppToggle(value, setOffAppEarningsAlerts, 'earnings')}
          />
          <ToggleItem
            label="CPI / Economic Events"
            description="Consumer Price Index and economic indicators"
            value={offAppCpiAlerts}
            onValueChange={(value) => handleOffAppToggle(value, setOffAppCpiAlerts, 'cpi_economic')}
          />
          <ToggleItem
            label="Fed Updates"
            description="Federal Reserve announcements and policy changes"
            value={offAppFedAlerts}
            onValueChange={(value) => handleOffAppToggle(value, setOffAppFedAlerts, 'fed_updates')}
          />
          <ToggleItem
            label="Watchlist Alerts"
            description="News for tickers in your watchlist"
            value={offAppWatchlistAlerts}
            onValueChange={(value) => handleOffAppToggle(value, setOffAppWatchlistAlerts, 'watchlist')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICATION SETTINGS</Text>
          <ToggleItem
            label="Push Notifications"
            description="Receive notifications on your device"
            value={pushNotifications}
            onValueChange={setPushNotifications}
          />
          <ToggleItem
            label="Alert Sound"
            description="Play sound for new alerts"
            value={alertSound}
            onValueChange={setAlertSound}
          />
          <ToggleItem
            label="Vibration"
            description="Vibrate on new alerts"
            value={vibration}
            onValueChange={setVibration}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFD600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
    lineHeight: 18,
  },
  permissionBanner: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#FFD600',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
  },
  permissionBannerText: {
    fontSize: 14,
    color: '#EAEAEA',
    lineHeight: 20,
    marginBottom: 12,
  },
  permissionButton: {
    backgroundColor: '#FFD600',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  permissionButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#000000',
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
  toggleItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  toggleItemLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  toggleItemDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
});
