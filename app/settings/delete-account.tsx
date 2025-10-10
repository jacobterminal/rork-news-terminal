import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { settingsNavigation } from '../../utils/navigationMemory';

export default function DeleteAccountStep1() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [reason, setReason] = useState('');

  const handleBack = () => {
    const prevPage = settingsNavigation.popPage();
    if (prevPage) {
      router.back();
    } else {
      const destination = settingsNavigation.exitSettings();
      router.replace(`/${destination === 'index' ? '' : destination}`);
    }
  };

  const handleContinue = () => {
    settingsNavigation.pushPage('delete-account-confirm');
    router.push('/settings/delete-account-confirm' as any);
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
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Are you sure you want to cancel?</Text>
          
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Your membership will automatically end, with no refunds.
            </Text>
            <Text style={[styles.warningText, { marginTop: 12 }]}>
              All your data will be permanently erased — absolutely unretrievable.
            </Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Why are you cancelling? (Optional)</Text>
            <TextInput
              style={styles.textArea}
              value={reason}
              onChangeText={setReason}
              placeholder="Tell us why you're leaving..."
              placeholderTextColor="#777777"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue →</Text>
        </TouchableOpacity>
      </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFD75A',
    textAlign: 'center',
    marginBottom: 24,
  },
  warningBox: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  warningText: {
    fontSize: 14,
    color: '#EAEAEA',
    opacity: 0.85,
    lineHeight: 20,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFD75A',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 10,
    padding: 14,
    color: '#EAEAEA',
    fontSize: 14,
    minHeight: 120,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  continueButton: {
    backgroundColor: '#FFD75A',
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#FFD75A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#000000',
  },
});
