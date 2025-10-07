import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { ArrowLeft, User, Mail, Lock, Link, Trash2 } from 'lucide-react-native';

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  isDestructive?: boolean;
}

function SettingItem({ icon, label, value, onPress, isDestructive }: SettingItemProps) {
  return (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.settingItemLeft}>
        <View>{icon}</View>
        <Text style={[styles.settingItemLabel, isDestructive && styles.destructiveText]}>
          {label}
        </Text>
      </View>
      {value && (
        <Text style={styles.settingItemValue}>{value}</Text>
      )}
    </TouchableOpacity>
  );
}

export default function AccountSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Password change functionality coming soon');
  };

  const handleLinkAccount = (provider: string) => {
    Alert.alert(`Link ${provider}`, `${provider} account linking coming soon`);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => console.log('Account deleted') }
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (navigation.canGoBack()) {
            router.back();
          } else {
            router.replace('/settings');
          }
        }} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileSection}>
          <View style={styles.profileImageLarge}>
            <User size={48} color="#FFD600" />
          </View>
          <TouchableOpacity style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROFILE INFORMATION</Text>
          <SettingItem
            icon={<User size={18} color="#FFD600" />}
            label="Username"
            value="johndoe"
          />
          <SettingItem
            icon={<Mail size={18} color="#FFD600" />}
            label="Email"
            value="john.doe@example.com"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SECURITY</Text>
          <SettingItem
            icon={<Lock size={18} color="#FFD600" />}
            label="Change Password"
            onPress={handleChangePassword}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LINKED ACCOUNTS</Text>
          <SettingItem
            icon={<Link size={18} color="#FFD600" />}
            label="Google"
            value="Not linked"
            onPress={() => handleLinkAccount('Google')}
          />
          <SettingItem
            icon={<Link size={18} color="#FFD600" />}
            label="Apple"
            value="Not linked"
            onPress={() => handleLinkAccount('Apple')}
          />
          <SettingItem
            icon={<Link size={18} color="#FFD600" />}
            label="Twitter"
            value="Not linked"
            onPress={() => handleLinkAccount('Twitter')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DANGER ZONE</Text>
          <SettingItem
            icon={<Trash2 size={18} color="#FF3B30" />}
            label="Delete Account"
            onPress={handleDeleteAccount}
            isDestructive
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  profileImageLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#111',
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  changePhotoButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#FFD600',
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
  settingItem: {
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
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingItemLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  settingItemValue: {
    fontSize: 14,
    color: '#888',
    marginLeft: 12,
  },
  destructiveText: {
    color: '#FF3B30',
  },
});
