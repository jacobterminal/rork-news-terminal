import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CreditCard, FileText, ChevronRight } from 'lucide-react-native';

interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoItemLabel}>{label}</Text>
      <Text style={styles.infoItemValue}>{value}</Text>
    </View>
  );
}

interface ActionItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}

function ActionItem({ icon, label, onPress }: ActionItemProps) {
  return (
    <TouchableOpacity style={styles.actionItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.actionItemLeft}>
        <View>{icon}</View>
        <Text style={styles.actionItemLabel}>{label}</Text>
      </View>
      <ChevronRight size={18} color="#666" />
    </TouchableOpacity>
  );
}

export default function BillingSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscriptions & Billing</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CURRENT PLAN</Text>
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Pro Plan</Text>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>ACTIVE</Text>
              </View>
            </View>
            <Text style={styles.planPrice}>$29.99/month</Text>
            <Text style={styles.planDescription}>
              Full access to all features, real-time alerts, and AI-powered insights
            </Text>
            <TouchableOpacity style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>Manage Subscription</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PAYMENT METHOD</Text>
          <ActionItem
            icon={<CreditCard size={18} color="#FFD600" />}
            label="•••• •••• •••• 4242"
            onPress={() => console.log('Manage payment method')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BILLING INFORMATION</Text>
          <InfoItem label="Next billing date" value="January 15, 2025" />
          <InfoItem label="Billing cycle" value="Monthly" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BILLING HISTORY</Text>
          <ActionItem
            icon={<FileText size={18} color="#FFD600" />}
            label="View all invoices"
            onPress={() => console.log('View billing history')}
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
  planCard: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#FFD600',
    borderRadius: 12,
    padding: 20,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  planBadge: {
    backgroundColor: '#FFD600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#000000',
    letterSpacing: 0.5,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFD600',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFD600',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  infoItemLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#FFFFFF',
  },
  infoItemValue: {
    fontSize: 14,
    color: '#888',
  },
  actionItem: {
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
  actionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionItemLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#FFFFFF',
    marginLeft: 12,
  },
});
