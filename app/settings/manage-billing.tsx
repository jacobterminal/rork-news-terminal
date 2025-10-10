import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, CreditCard, Receipt, XCircle } from 'lucide-react-native';
import { settingsNavigation } from '../../utils/navigationMemory';

interface SettingRowProps {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
}

function SettingRow({ icon, title, onPress }: SettingRowProps) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingRowLeft}>
        {icon}
        <Text style={styles.settingRowTitle}>{title}</Text>
      </View>
      <ChevronRight size={20} color="#666" />
    </TouchableOpacity>
  );
}

export default function ManageBillingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    const prevPage = settingsNavigation.goBack();
    if (prevPage) {
      router.replace(prevPage as any);
    } else {
      const destination = settingsNavigation.exitSettings();
      if (destination === 'index') {
        router.replace('/');
      } else {
        router.replace(`/${destination}` as any);
      }
    }
  };

  const handleManageBillingMethod = () => {
    Alert.alert(
      'Billing Portal',
      'This section will allow you to update your payment method once billing integration is live.',
      [{ text: 'OK' }]
    );
  };

  const handleViewBillingHistory = () => {
    Alert.alert(
      'Billing History',
      'This section will display your billing history and receipts once billing integration is live.',
      [{ text: 'OK' }]
    );
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription?\n\nYour plan will remain active until the end of the current billing cycle.',
      [
        {
          text: 'Keep My Subscription',
          style: 'cancel',
        },
        {
          text: 'Confirm Cancellation',
          style: 'destructive',
          onPress: async () => {
            console.log('[ManageBilling] Subscription canceled (pending end of cycle)');
            Alert.alert('Subscription Canceled', 'Your subscription will remain active until the end of the current billing cycle.');
          },
        },
      ]
    );
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
        <Text style={styles.headerTitle}>Manage Billing & Subscription</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.pageDescription}>
          Payment method, receipts, and plan management
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BILLING OPTIONS</Text>
          <SettingRow
            icon={<CreditCard size={20} color="#FFD75A" />}
            title="Manage Billing Method"
            onPress={handleManageBillingMethod}
          />
          <SettingRow
            icon={<Receipt size={20} color="#FFD75A" />}
            title="View Billing History / Receipts"
            onPress={handleViewBillingHistory}
          />
          <SettingRow
            icon={<XCircle size={20} color="#FF0000" />}
            title="Cancel Subscription"
            onPress={handleCancelSubscription}
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
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#EAEAEA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  pageDescription: {
    fontSize: 14,
    color: '#888',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFD75A',
    letterSpacing: 1,
    marginBottom: 12,
  },
  settingRow: {
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
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingRowTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },
});
