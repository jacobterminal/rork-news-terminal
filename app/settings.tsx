import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { ChevronRight, User, Layout, Bell, CreditCard, MessageSquare, Mail, Shield, X } from 'lucide-react-native';

interface SettingRowProps {
  icon: React.ReactNode;
  title: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

function SettingRow({ icon, title, onPress, rightElement }: SettingRowProps) {
  const content = (
    <View style={styles.settingRowLeft}>
      <View>{icon}</View>
      <Text style={styles.settingRowTitle}>{title}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
        {content}
        {rightElement || <ChevronRight size={20} color="#666" />}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.settingRow}>
      {content}
      {rightElement}
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const [criticalAlerts, setCriticalAlerts] = React.useState(true);
  const [earningsAlerts, setEarningsAlerts] = React.useState(true);
  const [cpiAlerts, setCpiAlerts] = React.useState(true);
  const [fedAlerts, setFedAlerts] = React.useState(true);
  const [watchlistAlerts, setWatchlistAlerts] = React.useState(true);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
          activeOpacity={0.7}
        >
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity 
          style={styles.profileCard}
          onPress={() => router.push('/settings/account')}
          activeOpacity={0.7}
        >
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <User size={32} color="#FFD600" />
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileEmail}>john.doe@example.com</Text>
          </View>
          <ChevronRight size={20} color="#666" />
        </TouchableOpacity>

        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>INTERFACE PRESETS</Text>
        <View style={styles.settingsSection}>
          <SettingRow
            icon={<Layout size={20} color="#FFD600" />}
            title="Watchlist-Based News"
            rightElement={
              <View style={styles.presetBadge}>
                <Text style={styles.presetBadgeText}>ACTIVE</Text>
              </View>
            }
          />
          <SettingRow
            icon={<Layout size={20} color="#888" />}
            title="Overall Incoming News"
          />
        </View>

        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>SUBSCRIPTION MANAGEMENT</Text>
        <View style={styles.settingsSection}>
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <CreditCard size={20} color="#FFD600" />
              <Text style={styles.subscriptionTitle}>Current Plan: Base Tier</Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>ACTIVE</Text>
              </View>
            </View>
            <Text style={styles.subscriptionSubtext}>
              Includes: News Tracker, Instant News, Watchlist Tracking, Economic Calendar
            </Text>
            <TouchableOpacity 
              style={styles.upgradeButton}
              onPress={() => router.push('/settings/billing')}
              activeOpacity={0.7}
            >
              <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>INSTANT NEWS</Text>
        <Text style={styles.sectionDescription}>Configure what appears in the Instant News page</Text>
        <View style={styles.settingsSection}>
          <SettingRow
            icon={<Bell size={20} color="#FFD600" />}
            title="Critical Alerts"
            rightElement={
              <Switch
                value={criticalAlerts}
                onValueChange={setCriticalAlerts}
                trackColor={{ false: '#333', true: '#FFD600' }}
                thumbColor={criticalAlerts ? '#000' : '#666'}
              />
            }
          />
          <SettingRow
            icon={<Bell size={20} color="#FFD600" />}
            title="Earnings"
            rightElement={
              <Switch
                value={earningsAlerts}
                onValueChange={setEarningsAlerts}
                trackColor={{ false: '#333', true: '#FFD600' }}
                thumbColor={earningsAlerts ? '#000' : '#666'}
              />
            }
          />
          <SettingRow
            icon={<Bell size={20} color="#FFD600" />}
            title="CPI / Economic Events"
            rightElement={
              <Switch
                value={cpiAlerts}
                onValueChange={setCpiAlerts}
                trackColor={{ false: '#333', true: '#FFD600' }}
                thumbColor={cpiAlerts ? '#000' : '#666'}
              />
            }
          />
          <SettingRow
            icon={<Bell size={20} color="#FFD600" />}
            title="Fed Updates"
            rightElement={
              <Switch
                value={fedAlerts}
                onValueChange={setFedAlerts}
                trackColor={{ false: '#333', true: '#FFD600' }}
                thumbColor={fedAlerts ? '#000' : '#666'}
              />
            }
          />
          <SettingRow
            icon={<Bell size={20} color="#FFD600" />}
            title="Watchlist Alerts"
            rightElement={
              <Switch
                value={watchlistAlerts}
                onValueChange={setWatchlistAlerts}
                trackColor={{ false: '#333', true: '#FFD600' }}
                thumbColor={watchlistAlerts ? '#000' : '#666'}
              />
            }
          />
        </View>

        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>INTERFACE & LAYOUT</Text>
        <View style={styles.settingsSection}>
          <SettingRow
            icon={<Layout size={20} color="#FFD600" />}
            title="AI Summary"
            rightElement={
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ false: '#333', true: '#FFD600' }}
                thumbColor={'#000'}
              />
            }
          />
          <SettingRow
            icon={<Layout size={20} color="#FFD600" />}
            title="Feed Preset"
            onPress={() => router.push('/settings/interface')}
          />
        </View>

        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>SUPPORT & FEEDBACK</Text>
        <View style={styles.settingsSection}>
          <SettingRow
            icon={<MessageSquare size={20} color="#FFD600" />}
            title="Requests & Feedback"
            onPress={() => router.push('/settings/feedback')}
          />
          <SettingRow
            icon={<Mail size={20} color="#FFD600" />}
            title="Contact & Support"
            onPress={() => router.push('/settings/support')}
          />
        </View>

        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>DATA & PRIVACY</Text>
        <View style={styles.settingsSection}>
          <SettingRow
            icon={<Shield size={20} color="#FFD600" />}
            title="Data & Privacy"
            onPress={() => router.push('/settings/privacy')}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>AI summaries are generated for convenience. Not financial advice.</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 24,
  },
  profileImageContainer: {
    marginRight: 12,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#888',
  },
  settingsSection: {
    marginHorizontal: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingRowTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#1C1C1C',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFD600',
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  presetBadge: {
    backgroundColor: '#FFD600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  presetBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#000',
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 32,
  },
  footerText: {
    fontSize: 11,
    color: '#777',
    textAlign: 'center',
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  sectionDescription: {
    fontSize: 12,
    color: '#888',
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: -4,
  },
  subscriptionCard: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 12,
    padding: 16,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    flex: 1,
  },
  activeBadge: {
    backgroundColor: '#00FF00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#000',
    letterSpacing: 0.5,
  },
  subscriptionSubtext: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
    marginBottom: 12,
  },
  upgradeButton: {
    backgroundColor: '#FFD600',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#000',
    letterSpacing: 0.5,
  },
});
