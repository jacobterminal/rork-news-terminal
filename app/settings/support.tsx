import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, HelpCircle, ExternalLink, ChevronLeft } from 'lucide-react-native';
import { settingsNavigation } from '../../utils/navigationMemory';

interface SupportItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
}

function SupportItem({ icon, title, description, onPress }: SupportItemProps) {
  return (
    <TouchableOpacity style={styles.supportItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.supportItemIcon}>
        <View>{icon}</View>
      </View>
      <View style={styles.supportItemContent}>
        <Text style={styles.supportItemTitle}>{title}</Text>
        <Text style={styles.supportItemDescription}>{description}</Text>
      </View>
      <ExternalLink size={18} color="#666" />
    </TouchableOpacity>
  );
}

export default function SupportSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    const prevPage = settingsNavigation.goBack();
    if (prevPage) {
      router.replace(prevPage as any);
    } else {
      const destination = settingsNavigation.exitSettings();
      router.replace(`/${destination === 'index' ? '' : destination}`);
    }
  };

  const handleEmail = () => {
    Linking.openURL('mailto:contact@insidervega.com');
  };

  const handleFAQ = () => {
    Linking.openURL('https://example.com/faq');
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
        <Text style={styles.headerTitle}>Contact & Support</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GET IN TOUCH</Text>
          <SupportItem
            icon={<Mail size={24} color="#FFD600" />}
            title="Email Support"
            description="contact@insidervega.com"
            onPress={handleEmail}
          />
          <SupportItem
            icon={<HelpCircle size={24} color="#FFD600" />}
            title="FAQ"
            description="Find answers to common questions"
            onPress={handleFAQ}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>Support Hours</Text>
          <Text style={styles.infoBoxText}>
            Monday – Friday: 9:00 AM – 6:00 PM EST{'\n'}
            Sunday: 10:00 AM – 4:00 PM EST
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>Average Response Time</Text>
          <Text style={styles.infoBoxText}>
            Email: Within 24 hours
          </Text>
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
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  supportItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  supportItemContent: {
    flex: 1,
  },
  supportItemTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  supportItemDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
  infoBox: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 20,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
  },
  infoBoxTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFD600',
    marginBottom: 8,
  },
  infoBoxText: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
});
