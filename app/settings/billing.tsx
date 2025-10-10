import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Modal, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import SettingsBackHeader from '../../components/SettingsBackHeader';

type PlanTier = 'free' | 'core' | 'advanced' | 'premium';

interface Feature {
  name: string;
  included: boolean;
}

interface PlanCardProps {
  tier: PlanTier;
  name: string;
  price: string;
  badge: string;
  badgeColor: string;
  features: Feature[];
  borderColor: string;
  currentPlan: PlanTier;
  onSelect: () => void;
}

function PlanCard({ tier, name, price, badge, badgeColor, features, borderColor, currentPlan, onSelect }: PlanCardProps) {
  const isActive = tier === currentPlan;
  
  const getCardBackground = () => {
    switch (tier) {
      case 'core':
        return 'rgba(0, 46, 31, 0.9)';
      case 'advanced':
        return 'rgba(2, 12, 61, 0.88)';
      case 'premium':
        return 'rgba(42, 4, 4, 0.88)';
      default:
        return 'rgba(20, 20, 20, 0.6)';
    }
  };
  
  return (
    <View style={[styles.planCard, { borderColor, backgroundColor: getCardBackground() }]}>
      <View style={styles.planHeader}>
        <Text style={styles.planName}>{name}</Text>
        <View style={[styles.planBadge, { backgroundColor: badgeColor }]}>
          <Text style={styles.planBadgeText}>{isActive ? 'ACTIVE' : badge}</Text>
        </View>
      </View>
      
      <Text style={[styles.planPrice, { color: borderColor }]}>{price}</Text>
      
      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Text style={[styles.featureIcon, feature.included ? styles.featureIncluded : styles.featureExcluded]}>
              {feature.included ? '✓' : '✕'}
            </Text>
            <Text style={[styles.featureText, !feature.included && styles.featureTextExcluded]}>
              {feature.name}
            </Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity 
        style={[styles.selectButton, isActive && styles.selectButtonActive]} 
        onPress={onSelect}
        activeOpacity={0.7}
        disabled={isActive}
      >
        <Text style={[styles.selectButtonText, isActive && styles.selectButtonTextActive]}>
          {isActive ? 'CURRENT PLAN' : 'SELECT PLAN'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function BillingSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const [currentPlan, setCurrentPlan] = useState<PlanTier>('core');
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ tier: PlanTier; name: string; price: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectPlan = (tier: PlanTier, name: string, price: string) => {
    if (tier === currentPlan) return;
    setSelectedPlan({ tier, name, price });
    setShowModal(true);
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // TODO: StripePayment()
      // Placeholder for Stripe payment processing
      // const paymentResult = await processStripePayment(selectedPlan.tier, selectedPlan.price);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: SupabaseUpdate()
      // Placeholder for Supabase subscription update
      // await updateUserSubscription(userId, selectedPlan.tier);
      
      setCurrentPlan(selectedPlan.tier);
      setShowModal(false);
      
      setTimeout(() => {
        if (Platform.OS === 'web') {
          alert(`Plan activated successfully! Welcome to ${selectedPlan.name}.`);
        } else {
          Alert.alert(
            'Success',
            `Plan activated successfully! Welcome to ${selectedPlan.name}.`,
            [{ text: 'OK' }]
          );
        }
        setSelectedPlan(null);
        setIsProcessing(false);
      }, 300);
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      
      if (Platform.OS === 'web') {
        alert('Payment failed. Please try again.');
      } else {
        Alert.alert(
          'Error',
          'Payment failed. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <SettingsBackHeader />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Subscription Management</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.introSection}>
          <Text style={styles.sectionTitle}>Select Your Plan</Text>
          <Text style={styles.currentPlanText}>(Current Plan: {currentPlan === 'free' ? 'Free' : currentPlan === 'core' ? 'Core' : currentPlan === 'advanced' ? 'Advanced' : 'Premium'})</Text>
        </View>

        <PlanCard
          tier="core"
          name="CORE"
          price="$35 / month"
          badge="CORE"
          badgeColor="#00FF88"
          borderColor="#00FF88"
          currentPlan={currentPlan}
          features={[
            { name: 'Instant News Feed', included: true },
            { name: 'Watchlist News Tracking', included: true },
            { name: 'AI Opinion & Summary', included: true },
            { name: 'Overview & Forecast', included: true },
            { name: 'Key Phrases Analysis', included: true },
            { name: 'Upcoming Earnings & Economic Events', included: true },
            { name: 'Reddit Tracker', included: false },
            { name: 'Twitter Tracker', included: false },
            { name: 'Crypto Wallet Tracker', included: false },
            { name: 'Contact Support', included: true },
          ]}
          onSelect={() => handleSelectPlan('core', 'CORE', '$35 / month')}
        />

        <PlanCard
          tier="advanced"
          name="ADVANCED"
          price="$75 / month"
          badge="ADVANCED"
          badgeColor="#4AA8FF"
          borderColor="#4AA8FF"
          currentPlan={currentPlan}
          features={[
            { name: 'Instant News Feed', included: true },
            { name: 'Watchlist News Tracking', included: true },
            { name: 'AI Opinion & Summary', included: true },
            { name: 'Overview & Forecast', included: true },
            { name: 'Key Phrases Analysis', included: true },
            { name: 'Upcoming Earnings & Economic Events', included: true },
            { name: 'Reddit Tracker', included: true },
            { name: 'Twitter Tracker', included: false },
            { name: 'Crypto Wallet Tracker', included: false },
            { name: 'Contact Support', included: true },
          ]}
          onSelect={() => handleSelectPlan('advanced', 'ADVANCED', '$75 / month')}
        />

        <PlanCard
          tier="premium"
          name="PREMIUM"
          price="$95 / month"
          badge="PREMIUM"
          badgeColor="#FF3B3B"
          borderColor="#FF3B3B"
          currentPlan={currentPlan}
          features={[
            { name: 'Instant News Feed', included: true },
            { name: 'Watchlist News Tracking', included: true },
            { name: 'AI Opinion & Summary', included: true },
            { name: 'Overview & Forecast', included: true },
            { name: 'Key Phrases Analysis', included: true },
            { name: 'Upcoming Earnings & Economic Events', included: true },
            { name: 'Reddit Tracker', included: true },
            { name: 'Twitter Tracker', included: true },
            { name: 'Crypto Wallet Tracker', included: true },
            { name: 'Contact Support', included: true },
          ]}
          onSelect={() => handleSelectPlan('premium', 'PREMIUM', '$95 / month')}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>• All plans include full AI integration (summary, overview, opinion, forecast, key phrases)</Text>
          <Text style={styles.footerText}>• Cancel anytime from your account settings</Text>
          <Text style={styles.footerText}>• Prices billed monthly</Text>
          <Text style={styles.footerText}>• Upgrade instantly — no data loss between tiers</Text>
        </View>
      </ScrollView>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedPlan?.name}</Text>
            <Text style={styles.modalPrice}>{selectedPlan?.price}</Text>
            <Text style={styles.modalDescription}>
              Confirm your plan and continue to payment.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]} 
                onPress={() => {
                  if (!isProcessing) {
                    setShowModal(false);
                    setTimeout(() => setSelectedPlan(null), 300);
                  }
                }}
                activeOpacity={0.7}
                disabled={isProcessing}
              >
                <Text style={[styles.modalButtonTextCancel, isProcessing && styles.disabledText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonConfirm, isProcessing && styles.disabledButton]} 
                onPress={handleConfirmUpgrade}
                activeOpacity={0.7}
                disabled={isProcessing}
              >
                <Text style={[styles.modalButtonTextConfirm, isProcessing && styles.disabledText]}>
                  {isProcessing ? 'Processing...' : 'Confirm & Pay'}
                </Text>
              </TouchableOpacity>
            </View>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 26, 26, 0.6)',
    backgroundColor: '#000000',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#EAEAEA',
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      default: 'System',
    }),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  introSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#FFD75A',
    lineHeight: 28,
    marginBottom: 8,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      default: 'System',
    }),
  },
  currentPlanText: {
    fontSize: 13,
    color: '#888888',
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      default: 'System',
    }),
  },
  planCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 20,
    ...Platform.select({
      web: {
        boxShadow: 'inset 0 0 20px rgba(255, 215, 90, 0.15)',
        transition: 'transform 0.2s ease',
      } as any,
    }),
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#EAEAEA',
    letterSpacing: 0.5,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      default: 'System',
    }),
  },
  planBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#0B0B0B',
    letterSpacing: 0.5,
  },
  planPrice: {
    fontSize: 26,
    fontWeight: '700' as const,
    marginBottom: 16,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      default: 'System',
    }),
  },
  featuresContainer: {
    marginBottom: 20,
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  featureIcon: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginTop: 2,
    width: 20,
  },
  featureIncluded: {
    color: '#FFD75A',
  },
  featureExcluded: {
    color: '#5A5A5A',
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#EAEAEA',
    lineHeight: 22,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      default: 'System',
    }),
  },
  featureTextExcluded: {
    opacity: 0.7,
  },
  selectButton: {
    backgroundColor: '#FFD75A',
    borderRadius: 24,
    paddingVertical: 10,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 0 20px rgba(255, 215, 90, 0.4)',
        transition: 'all 0.2s ease',
      } as any,
    }),
  },
  selectButtonActive: {
    backgroundColor: '#1A1A1A',
    ...Platform.select({
      web: {
        boxShadow: 'none',
      } as any,
    }),
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    letterSpacing: 1,
    color: '#000000',
  },
  selectButtonTextActive: {
    color: '#888',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 32,
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#888888',
    lineHeight: 18,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      default: 'System',
    }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#0A0A0A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 90, 0.3)',
    padding: 24,
    width: '100%',
    maxWidth: 400,
    ...Platform.select({
      web: {
        boxShadow: '0 0 30px rgba(255, 215, 90, 0.2)',
      } as any,
    }),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#EAEAEA',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      default: 'System',
    }),
  },
  modalPrice: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFD75A',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      default: 'System',
    }),
  },
  modalDescription: {
    fontSize: 14,
    color: '#888888',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      default: 'System',
    }),
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 90, 0.6)',
  },
  modalButtonConfirm: {
    backgroundColor: '#FFD75A',
    ...Platform.select({
      web: {
        boxShadow: '0 0 15px rgba(255, 215, 90, 0.4)',
      } as any,
    }),
  },
  modalButtonTextCancel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#EAEAEA',
  },
  modalButtonTextConfirm: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#000000',
    letterSpacing: 0.5,
  },
});
