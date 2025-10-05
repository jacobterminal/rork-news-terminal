import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScrollReset } from '@/utils/useScrollReset';
import { Settings } from 'lucide-react-native';

type TabKey = 'dashboard' | 'ruleBuilder' | 'targets' | 'analytics';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'ruleBuilder', label: 'Rule Builder' },
  { key: 'targets', label: 'Targets' },
  { key: 'analytics', label: 'Analytics' },
];

export default function TwitterTrackerPage() {
  const insets = useSafeAreaInsets();
  useScrollReset();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleApply = () => {
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
    }, 3000);
  };

  return (
    <View style={[styles.page, { paddingTop: insets.top }]}>
      <View style={styles.reservedSpace} />
      <View nativeID="banner-anchor-point" style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Twitter Tracker</Text>
          <View style={styles.betaPill}>
            <Text style={styles.betaPillText}>BETA</Text>
          </View>
          <View style={styles.flex1} />
          <TouchableOpacity style={styles.settingsButton} activeOpacity={0.7}>
            <Settings size={18} color="#888888" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.subnav}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subnavContent}
        >
          {TABS.map((tab) => (
            <View
              key={tab.key}
              style={styles.disabledTab}
            >
              <Text style={styles.disabledTabText}>{tab.label}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.lockPanel}>
          <View style={styles.lockIconContainer}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
          
          <Text style={styles.lockTitle}>Twitter Tracker is currently locked</Text>
          
          <Text style={styles.lockSubtext}>
            This feature is part of the Nova Premium Analytics Suite.{'\n'}
            Upgrade to unlock full access to real-time signal detection, feed sentiment, and social analytics.
          </Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>Twitter Tracker — live AI feed scanner</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>Crypto Wallet Tracker — on-chain alert system</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>Reddit Tracker — sentiment mapping engine</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>Dark Pool Trading Activity — institutional volume detector</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.formTitle}>APPLY FOR ACCESS</Text>

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
              <Text style={styles.inputLabel}>Reason for Request (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={reason}
                onChangeText={setReason}
                placeholder="Tell us why you need access"
                placeholderTextColor="#444444"
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity 
              style={styles.applyButton} 
              onPress={handleApply}
              activeOpacity={0.8}
            >
              <Text style={styles.applyButtonText}>APPLY FOR ACCESS</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerNote}>
            Access restricted — upgrade required for advanced market tracking modules.
          </Text>
        </View>
      </ScrollView>

      {showConfirmation && (
        <View style={styles.confirmationBanner}>
          <Text style={styles.confirmationText}>
            ✅ Application submitted. Our team will review your request shortly.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  reservedSpace: {
    height: 50,
    backgroundColor: '#0B0B0B',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 212, 59, 0.2)',
    backgroundColor: '#0B0B0B',
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...Platform.select({
      web: {
        boxShadow: '0 0 20px rgba(255, 212, 59, 0.1)',
      } as any,
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 16,
    color: '#EAEAEA',
    letterSpacing: 0.5,
    fontWeight: '500' as const,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      default: 'System',
    }),
  },
  betaPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#222222',
  },
  betaPillText: {
    fontSize: 10,
    color: '#888888',
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  flex1: {
    flex: 1,
  },
  settingsButton: {
    padding: 6,
  },
  subnav: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 212, 59, 0.2)',
    backgroundColor: '#0B0B0B',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  subnavContent: {
    flexDirection: 'row',
    gap: 10,
  },
  disabledTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 212, 59, 0.15)',
    backgroundColor: 'rgba(255, 212, 59, 0.05)',
    opacity: 0.4,
  },
  disabledTabText: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '500' as const,
  },
  content: {
    flex: 1,
  },
  lockPanel: {
    margin: 20,
    padding: 32,
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 212, 59, 0.3)',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 0 30px rgba(255, 212, 59, 0.15)',
        backdropFilter: 'blur(10px)',
      } as any,
    }),
  },
  lockIconContainer: {
    marginBottom: 20,
  },
  lockIcon: {
    fontSize: 48,
  },
  lockTitle: {
    fontSize: 22,
    color: '#EAEAEA',
    fontWeight: '600' as const,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      default: 'System',
    }),
  },
  lockSubtext: {
    fontSize: 14,
    color: '#888888',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
    maxWidth: 500,
  },
  featureList: {
    width: '100%',
    maxWidth: 600,
    gap: 12,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureBullet: {
    fontSize: 16,
    color: '#FFD43B',
    fontWeight: '700' as const,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#EAEAEA',
    lineHeight: 20,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 212, 59, 0.2)',
    marginVertical: 32,
  },
  formTitle: {
    fontSize: 13,
    color: '#FFD43B',
    fontWeight: '700' as const,
    letterSpacing: 1,
    marginBottom: 24,
  },
  formContainer: {
    width: '100%',
    maxWidth: 500,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500' as const,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: '#0B0B0B',
    borderWidth: 1,
    borderColor: 'rgba(255, 212, 59, 0.3)',
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  applyButton: {
    backgroundColor: '#FFD43B',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 0 20px rgba(255, 212, 59, 0.4)',
      } as any,
    }),
  },
  applyButtonText: {
    fontSize: 14,
    color: '#0B0B0B',
    fontWeight: '700' as const,
    letterSpacing: 1,
  },

  footerNote: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
    marginTop: 32,
    fontStyle: 'italic' as const,
  },
  confirmationBanner: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.95)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 1)',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 20px rgba(34, 197, 94, 0.3)',
      } as any,
    }),
  },
  confirmationText: {
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500' as const,
  },
});
