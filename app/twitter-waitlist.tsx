import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';

export default function TwitterWaitlistPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleSubmit = () => {
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Full name is required');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Email address is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (!reason.trim()) {
      setErrorMessage('Please tell us why you want to join');
      return;
    }

    const wordCount = getWordCount(reason);
    if (wordCount < 20) {
      setErrorMessage(`Reason must be at least 20 words (currently ${wordCount} words)`);
      return;
    }

    console.log('[TwitterWaitlist] Form submitted:', { fullName, email, reason });
    setShowSuccess(true);
  };

  const handleReturnHome = () => {
    router.replace('/instant');
  };

  const headerHeight = Platform.select({ web: 64, default: 56 });

  if (showSuccess) {
    return (
      <View style={[styles.page, { paddingTop: insets.top }]}>
        <View style={styles.successContainer}>
          <View style={styles.checkIconContainer}>
            <Check size={80} color="#FFD75A" strokeWidth={3} />
          </View>
          
          <Text style={styles.successTitle}>THANK YOU!</Text>
          
          <Text style={styles.successMessage}>
            Your submission has been received.{'\n'}
            You&apos;ll be notified once access is available.
          </Text>

          <TouchableOpacity 
            style={styles.returnButton} 
            onPress={handleReturnHome}
            activeOpacity={0.8}
          >
            <Text style={styles.returnButtonText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.page, { paddingTop: insets.top + headerHeight }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Join Waitlist</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formPanel}>
          <Text style={styles.formTitle}>Join the Insider Vega Waitlist</Text>
          
          <Text style={styles.formSubtext}>
            Complete the form below to request early access.{'\n'}
            Members will be notified once Premium analytics features become available.
          </Text>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor="#444444"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#444444"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Why do you want to join?</Text>
                <Text style={styles.wordCount}>
                  {getWordCount(reason)} / 20 words minimum
                </Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={reason}
                onChangeText={setReason}
                placeholder="Tell us why you want to join (minimum 20 words)"
                placeholderTextColor="#444444"
                multiline
                numberOfLines={6}
              />
            </View>

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
              </View>
            ) : null}

            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>Submit Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 90, 0.2)',
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    color: '#FFD75A',
    letterSpacing: 0.5,
    fontWeight: '600' as const,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      default: 'System',
    }),
  },
  content: {
    flex: 1,
  },
  formPanel: {
    margin: 20,
    padding: 32,
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 90, 0.3)',
    ...Platform.select({
      web: {
        boxShadow: '0 0 30px rgba(255, 215, 90, 0.15)',
        backdropFilter: 'blur(10px)',
      } as any,
    }),
  },
  formTitle: {
    fontSize: 20,
    color: '#FFD75A',
    fontWeight: '700' as const,
    letterSpacing: 0.5,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      default: 'System',
    }),
  },
  formSubtext: {
    fontSize: 14,
    color: '#888888',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
  },
  formContainer: {
    width: '100%',
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500' as const,
    letterSpacing: 0.3,
  },
  wordCount: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '400' as const,
  },
  input: {
    backgroundColor: '#0B0B0B',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 90, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#EAEAEA',
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#FFD75A',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 0 20px rgba(255, 215, 90, 0.4)',
      } as any,
    }),
  },
  submitButtonText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 6,
    padding: 12,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#000000',
  },
  checkIconContainer: {
    marginBottom: 32,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 215, 90, 0.1)',
    borderWidth: 2,
    borderColor: '#FFD75A',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 0 40px rgba(255, 215, 90, 0.3)',
      } as any,
    }),
  },
  successTitle: {
    fontSize: 28,
    color: '#FFD75A',
    fontWeight: '700' as const,
    letterSpacing: 1.5,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      default: 'System',
    }),
  },
  successMessage: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 48,
    maxWidth: 400,
  },
  returnButton: {
    backgroundColor: '#FFD75A',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 0 20px rgba(255, 215, 90, 0.4)',
      } as any,
    }),
  },
  returnButtonText: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
});
