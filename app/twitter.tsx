import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useScrollReset } from '@/utils/useScrollReset';
import UniversalBackButton from '../components/UniversalBackButton';


type TabKey = 'dashboard' | 'ruleBuilder' | 'targets' | 'analytics';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'ruleBuilder', label: 'Rule Builder' },
  { key: 'targets', label: 'Targets' },
  { key: 'analytics', label: 'Analytics' },
];

export default function TwitterTrackerPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  useScrollReset();

  const handleJoinWaitlist = () => {
    router.push('/twitter-waitlist');
  };

  const headerHeight = Platform.select({ web: 64, default: 56 });

  return (
    <View style={[styles.page, { paddingTop: insets.top + headerHeight }]}>
      <UniversalBackButton />
      
      <View nativeID="banner-anchor-point" style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Twitter Tracker</Text>
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
          
          <Text style={styles.lockTitle}>Twitter Tracker Access Restricted</Text>
          
          <Text style={styles.lockSubtext}>
            This feature is part of the Premium Suite available through the Insider Vega platform.{'\n'}
            Gain exclusive access to advanced analytics including Twitter Trackers, Crypto Wallet Trackers, Reddit Trackers, and Dark Pool institutional trading insights.
          </Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>Twitter Trackers — real-time AI sentiment scanners</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>Crypto Wallet Trackers — on-chain monitoring and alert system</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>Reddit Trackers — sentiment mapping engines</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureBullet}>•</Text>
              <Text style={styles.featureText}>Dark Pool Activity — institutional volume detection</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.waitlistButton} 
            onPress={handleJoinWaitlist}
            activeOpacity={0.8}
          >
            <Text style={styles.waitlistButtonText}>Join Waitlist</Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Access restricted — upgrade required for advanced market tracking modules.
          </Text>
        </View>
      </ScrollView>


    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#0B0B0B',
    paddingTop: 37,
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

  footerNote: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
    marginTop: 32,
    fontStyle: 'italic' as const,
  },
  waitlistButton: {
    backgroundColor: '#FFD43B',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 32,
    ...Platform.select({
      web: {
        boxShadow: '0 0 20px rgba(255, 212, 59, 0.4)',
      } as any,
    }),
  },
  waitlistButtonText: {
    fontSize: 15,
    color: '#0B0B0B',
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },

});
