import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRight, User, Layout, Bell, CreditCard, MessageSquare, Mail, Shield } from 'lucide-react-native';

interface SettingRowProps {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
}

function SettingRow({ icon, title, onPress }: SettingRowProps) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingRowLeft}>
        <View>{icon}</View>
        <Text style={styles.settingRowTitle}>{title}</Text>
      </View>
      <ChevronRight size={20} color="#666" />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
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

        <View style={styles.settingsSection}>
          <SettingRow
            icon={<User size={20} color="#FFD600" />}
            title="Account Settings"
            onPress={() => router.push('/settings/account')}
          />
          <SettingRow
            icon={<Layout size={20} color="#FFD600" />}
            title="Interface & Layout"
            onPress={() => router.push('/settings/interface')}
          />
          <SettingRow
            icon={<Bell size={20} color="#FFD600" />}
            title="Alerts & Notifications"
            onPress={() => router.push('/settings/alerts')}
          />
          <SettingRow
            icon={<CreditCard size={20} color="#FFD600" />}
            title="Subscriptions & Billing"
            onPress={() => router.push('/settings/billing')}
          />
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
          <SettingRow
            icon={<Shield size={20} color="#FFD600" />}
            title="Data & Privacy"
            onPress={() => router.push('/settings/privacy')}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
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
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
});
