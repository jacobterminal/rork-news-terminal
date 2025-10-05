import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

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
  const router = useRouter();

  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [earningsAlerts, setEarningsAlerts] = useState(true);
  const [cpiAlerts, setCpiAlerts] = useState(true);
  const [fedAlerts, setFedAlerts] = useState(true);
  const [watchlistAlerts, setWatchlistAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [alertSound, setAlertSound] = useState(true);
  const [vibration, setVibration] = useState(true);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alerts & Notifications</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ALERT TYPES</Text>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    marginRight: 12,
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
