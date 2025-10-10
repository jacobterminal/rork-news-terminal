import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRight, User, Bell, BellRing, CreditCard, MessageSquare, Mail, Shield, ChevronLeft } from 'lucide-react-native';
import { navigationMemory, settingsNavigation } from '../utils/navigationMemory';

interface SettingCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function SettingCard({ icon, title, subtitle, onPress }: SettingCardProps) {
  return (
    <TouchableOpacity style={styles.settingCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingCardIcon}>
        {icon}
      </View>
      <View style={styles.settingCardContent}>
        <Text style={styles.settingCardTitle}>{title}</Text>
        <Text style={styles.settingCardSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={20} color="#666" />
    </TouchableOpacity>
  );
}

interface SettingRowProps {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
}

function SettingRow({ icon, title, onPress }: SettingRowProps) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingRowLeft}>
        {icon}
        <Text style={styles.settingRowTitle}>{title}</Text>
      </View>
      <ChevronRight size={20} color="#666" />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    const initializeStack = async () => {
      const lastRoute = await navigationMemory.getLastRoute();
      const fromPage = lastRoute || 'instant';
      settingsNavigation.enterSettings(fromPage);
    };
    initializeStack();
  }, []);



  const handleClose = () => {
    const destination = settingsNavigation.exitSettings();
    console.log('[Settings] Exiting to:', destination);
    if (destination === 'index') {
      router.replace('/');
    } else {
      router.replace(`/${destination}` as any);
    }
  };

  const handleNavigateToSubpage = (page: string) => {
    settingsNavigation.pushPage(page);
    router.push(page as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleClose}
          activeOpacity={0.6}
        >
          <ChevronLeft size={22} color="#EAEAEA" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.pageTitle}>Account Settings</Text>
        <Text style={styles.pageSubtitle}>Manage your profile and preferences</Text>

        <TouchableOpacity 
          style={styles.profileCard}
          onPress={() => handleNavigateToSubpage('/settings/account')}
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
              onPress={() => handleNavigateToSubpage('/settings/billing')}
              activeOpacity={0.7}
            >
              <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>NOTIFICATIONS & BILLING</Text>
        <View style={styles.settingsSection}>
          <SettingCard
            icon={<Bell size={20} color="#FFD75A" />}
            title="In-App Notifications"
            subtitle="Manage which alerts appear while using the app."
            onPress={() => handleNavigateToSubpage('/settings/in-app-notifications')}
          />
          <SettingCard
            icon={<BellRing size={20} color="#FFD75A" />}
            title="Push Notifications"
            subtitle="Configure background alerts when the app is closed."
            onPress={() => handleNavigateToSubpage('/settings/push-notifications')}
          />
          <SettingCard
            icon={<CreditCard size={20} color="#FFD75A" />}
            title="Manage Billing & Subscription"
            subtitle="Payment method, receipts, and plan management."
            onPress={() => handleNavigateToSubpage('/settings/manage-billing')}
          />
        </View>

        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>SUPPORT & FEEDBACK</Text>
        <View style={styles.settingsSection}>
          <SettingRow
            icon={<MessageSquare size={20} color="#FFD600" />}
            title="Requests & Feedback"
            onPress={() => handleNavigateToSubpage('/settings/feedback')}
          />
          <SettingRow
            icon={<Mail size={20} color="#FFD600" />}
            title="Contact & Support"
            onPress={() => handleNavigateToSubpage('/settings/support')}
          />
        </View>

        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>DATA & PRIVACY</Text>
        <View style={styles.settingsSection}>
          <SettingRow
            icon={<Shield size={20} color="#FFD600" />}
            title="Data & Privacy"
            onPress={() => handleNavigateToSubpage('/settings/privacy')}
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
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#EAEAEA',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 16,
    paddingHorizontal: 16,
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
    gap: 12,
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
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingCardContent: {
    flex: 1,
  },
  settingCardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingCardSubtitle: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
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
