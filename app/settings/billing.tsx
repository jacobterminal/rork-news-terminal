import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Modal, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

type PlanTier = 'free' | 'core' | 'advanced' | 'premium';

interface PlanCardProps {
  tier: PlanTier;
  name: string;
  price: string;
  badge: string;
  badgeColor: string;
  features: string[];
  borderColor: string;
  currentPlan: PlanTier;
  onSelect: () => void;
}

function PlanCard({ tier, name, price, badge, badgeColor, features, borderColor, currentPlan, onSelect }: PlanCardProps) {
  const isActive = tier === currentPlan;
  
  return (
    <View style={[styles.planCard, { borderColor }]}>
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
            <Text style={styles.featureBullet}>•</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity 
        style={[styles.selectButton, isActive && styles.selectButtonActive, { borderColor }]} 
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
        <Text style={styles.headerTitle}>Subscription Plans</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Unlock advanced AI modules and real-time news intelligence.</Text>
          <Text style={styles.currentPlanText}>(Current Plan: {currentPlan === 'free' ? 'Free' : currentPlan === 'core' ? 'Core' : currentPlan === 'advanced' ? 'Advanced' : 'Premium'})</Text>
        </View>

        <PlanCard
          tier="core"
          name="CORE"
          price="$35 / month"
          badge="CORE"
          badgeColor="#22C55E"
          borderColor="#22C55E"
          currentPlan={currentPlan}
          features={[
            'Instant News Feed',
            'Watchlist News Tracking',
            'AI Opinion & Summary',
            'Overview & Forecast',
            'Key Phrases Analysis',
            'Upcoming Earnings & Economic Events',
            'Contact Support',
          ]}
          onSelect={() => handleSelectPlan('core', 'CORE', '$35 / month')}
        />

        <PlanCard
          tier="advanced"
          name="ADVANCED"
          price="$75 / month"
          badge="ADVANCED"
          badgeColor="#3B82F6"
          borderColor="#3B82F6"
          currentPlan={currentPlan}
          features={[
            'Everything in Core',
            'Reddit Tracker',
          ]}
          onSelect={() => handleSelectPlan('advanced', 'ADVANCED', '$75 / month')}
        />

        <PlanCard
          tier="premium"
          name="PREMIUM"
          price="$95 / month"
          badge="PREMIUM"
          badgeColor="#EF4444"
          borderColor="#EF4444"
          currentPlan={currentPlan}
          features={[
            'Everything in Advanced',
            'Twitter Tracker',
            'Crypto Wallet Tracker',
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
    backgroundColor: '#0B0B0B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 212, 59, 0.2)',
  },
  backButton: {
    marginRight: 12,
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
  introTitle: {
    fontSize: 15,
    color: '#EAEAEA',
    lineHeight: 22,
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
    backgroundColor: 'rgba(20, 20, 20, 0.6)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 0 20px rgba(255, 212, 59, 0.1)',
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
    fontSize: 28,
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
  featureBullet: {
    fontSize: 14,
    color: '#FFD43B',
    fontWeight: '700' as const,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    color: '#EAEAEA',
    lineHeight: 20,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      default: 'System',
    }),
  },
  selectButton: {
    backgroundColor: '#FFD43B',
    borderWidth: 2,
    borderColor: '#FFD43B',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 0 15px rgba(255, 212, 59, 0.3)',
      } as any,
    }),
  },
  selectButtonActive: {
    backgroundColor: '#111',
    borderColor: '#333',
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
    color: '#0B0B0B',
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#0B0B0B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 212, 59, 0.3)',
    padding: 24,
    width: '100%',
    maxWidth: 400,
    ...Platform.select({
      web: {
        boxShadow: '0 0 30px rgba(255, 212, 59, 0.2)',
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
    color: '#FFD43B',
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
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalButtonConfirm: {
    backgroundColor: '#FFD43B',
    borderWidth: 1,
    borderColor: '#FFD43B',
  },
  modalButtonTextCancel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#EAEAEA',
  },
  modalButtonTextConfirm: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#0B0B0B',
    letterSpacing: 0.5,
  },
});
