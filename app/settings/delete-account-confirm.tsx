import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { settingsNavigation } from '../../utils/navigationMemory';

const CONFIRMATION_PHRASE = "I understand that deleting my account will permanently remove my data and end all access.";

export default function DeleteAccountStep2() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [inputText, setInputText] = useState('');

  const isValid = inputText.trim() === CONFIRMATION_PHRASE;

  const handleBack = () => {
    const prevPage = settingsNavigation.popPage();
    if (prevPage) {
      router.back();
    } else {
      const destination = settingsNavigation.exitSettings();
      router.replace(`/${destination === 'index' ? '' : destination}`);
    }
  };

  const handleDelete = async () => {
    if (!isValid) return;

    console.log('[DeleteAccount] Executing account deletion...');
    
    router.replace('/settings/delete-account-success' as any);
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
          <Text style={styles.title}>Type this phrase to confirm deletion</Text>
          
          <Text style={styles.instructionText}>
            In order to delete your account, type the following to confirm you understand the loss of access:
          </Text>

          <View style={styles.phraseBox}>
            <Text style={styles.phraseText}>{CONFIRMATION_PHRASE}</Text>
          </View>

          <View style={styles.inputSection}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type the phrase exactly..."
              placeholderTextColor="#777777"
              multiline
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {inputText.length > 0 && !isValid && (
            <Text style={styles.errorText}>
              The phrase must match exactly
            </Text>
          )}
        </View>
      </ScrollView>

      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity 
          style={[styles.deleteButton, !isValid && styles.deleteButtonDisabled]}
          onPress={handleDelete}
          activeOpacity={isValid ? 0.8 : 1}
          disabled={!isValid}
        >
          <Text style={[styles.deleteButtonText, !isValid && styles.deleteButtonTextDisabled]}>
            Delete My Account Permanently
          </Text>
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
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    color: '#EAEAEA',
    opacity: 0.85,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  phraseBox: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  phraseText: {
    fontSize: 13,
    color: '#FFD75A',
    lineHeight: 20,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 10,
    padding: 14,
    color: '#EAEAEA',
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B3B',
    textAlign: 'center',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  deleteButton: {
    backgroundColor: '#FF0000',
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  deleteButtonDisabled: {
    backgroundColor: '#333333',
    shadowOpacity: 0,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  deleteButtonTextDisabled: {
    color: '#666666',
  },
});
