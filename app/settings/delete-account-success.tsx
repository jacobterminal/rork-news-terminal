import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CheckCircle } from 'lucide-react-native';

export default function DeleteAccountSuccess() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleDone = () => {
    console.log('[DeleteAccountSuccess] Navigating to login...');
    router.replace('/auth/login' as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <CheckCircle size={64} color="#FFD75A" strokeWidth={2} />
        </View>

        <Text style={styles.title}>Your account has been permanently deleted.</Text>
        
        <Text style={styles.subtitle}>
          We&apos;re sorry to see you go. You may create a new account anytime.
        </Text>
      </View>

      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity 
          style={styles.doneButton}
          onPress={handleDone}
          activeOpacity={0.8}
        >
          <Text style={styles.doneButtonText}>Done</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFD75A',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#EAEAEA',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#000000',
  },
  doneButton: {
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
  doneButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#000000',
  },
});
