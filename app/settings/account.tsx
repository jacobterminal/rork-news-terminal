import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { ArrowLeft, User, Mail, Lock, Trash2, X } from 'lucide-react-native';

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

  const [username, setUsername] = useState<string>('johndoe');
  const [email, setEmail] = useState<string>('john.doe@example.com');
  const [isEditingUsername, setIsEditingUsername] = useState<boolean>(false);
  const [tempUsername, setTempUsername] = useState<string>('');

  const [emailModalVisible, setEmailModalVisible] = useState<boolean>(false);
  const [currentEmail, setCurrentEmail] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');

  const [passwordModalVisible, setPasswordModalVisible] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const handleUsernameEdit = () => {
    setTempUsername(username);
    setIsEditingUsername(true);
  };

  const handleUsernameSave = () => {
    if (tempUsername.trim().length > 0) {
      console.log('Verifying username availability:', tempUsername);
      setUsername(tempUsername);
      setIsEditingUsername(false);
      Alert.alert('Success', 'Username updated successfully');
    } else {
      Alert.alert('Error', 'Username cannot be empty');
    }
  };

  const handleUsernameCancel = () => {
    setIsEditingUsername(false);
    setTempUsername('');
  };

  const handleEmailPress = () => {
    setCurrentEmail('');
    setNewEmail('');
    setEmailModalVisible(true);
  };

  const handleEmailSubmit = () => {
    if (!currentEmail || !newEmail) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    console.log('Updating email in database:', { currentEmail, newEmail });
    setEmail(newEmail);
    setEmailModalVisible(false);
    Alert.alert('Success', 'Email updated successfully');
  };

  const handlePasswordPress = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordModalVisible(true);
  };

  const handlePasswordSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    console.log('Updating password in database');
    setPasswordModalVisible(false);
    Alert.alert('Success', 'Password updated successfully');
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
          {isEditingUsername ? (
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <User size={18} color="#FFD600" />
                <TextInput
                  style={styles.usernameInput}
                  value={tempUsername}
                  onChangeText={setTempUsername}
                  autoFocus
                  placeholder="Enter username"
                  placeholderTextColor="#666"
                />
              </View>
              <View style={styles.usernameActions}>
                <TouchableOpacity onPress={handleUsernameSave} style={styles.saveButton}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleUsernameCancel} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <SettingItem
              icon={<User size={18} color="#FFD600" />}
              label="Username"
              value={username}
              onPress={handleUsernameEdit}
            />
          )}
          <SettingItem
            icon={<Mail size={18} color="#FFD600" />}
            label="Email"
            value={email}
            onPress={handleEmailPress}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SECURITY</Text>
          <SettingItem
            icon={<Lock size={18} color="#FFD600" />}
            label="Change Password"
            onPress={handlePasswordPress}
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

      <Modal
        visible={emailModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setEmailModalVisible(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Change Email</Text>
            <TouchableOpacity onPress={() => setEmailModalVisible(false)} style={styles.closeButton}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Email</Text>
              <TextInput
                style={styles.pillInput}
                value={currentEmail}
                onChangeText={setCurrentEmail}
                placeholder="Enter current email"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Email</Text>
              <TextInput
                style={styles.pillInput}
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="Enter new email"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity 
              style={[styles.submitButton, (!currentEmail || !newEmail) && styles.submitButtonDisabled]} 
              onPress={handleEmailSubmit}
              disabled={!currentEmail || !newEmail}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TouchableOpacity onPress={() => setPasswordModalVisible(false)} style={styles.closeButton}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                style={styles.pillInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor="#666"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.pillInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor="#666"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.pillInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#666"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <Text style={styles.errorText}>Passwords do not match</Text>
            )}
            <TouchableOpacity 
              style={[
                styles.submitButton, 
                (!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword) && styles.submitButtonDisabled
              ]} 
              onPress={handlePasswordSubmit}
              disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  usernameInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  usernameActions: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FFD600',
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#000000',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#222',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFD600',
    marginBottom: 8,
  },
  pillInput: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 15,
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#FFD600',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000000',
  },
  errorText: {
    fontSize: 13,
    color: '#FF3B30',
    marginTop: -12,
    marginBottom: 8,
  },
});
