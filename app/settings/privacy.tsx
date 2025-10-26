import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ExternalLink, ChevronLeft } from 'lucide-react-native';
import { settingsNavigation } from '../../utils/navigationMemory';

interface LinkItemProps {
  title: string;
  onPress: () => void;
}

function LinkItem({ title, onPress }: LinkItemProps) {
  return (
    <TouchableOpacity style={styles.linkItem} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.linkItemTitle}>{title}</Text>
      <ExternalLink size={18} color="#666" />
    </TouchableOpacity>
  );
}

export default function PrivacySettingsScreen() {
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

  const handleTerms = () => {
    Linking.openURL('https://example.com/terms');
  };

  const handlePrivacy = () => {
    Linking.openURL('https://example.com/privacy');
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
        <Text style={styles.headerTitle}>Data & Privacy</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LEGAL</Text>
          <LinkItem
            title="Terms of Service"
            onPress={handleTerms}
          />
          <LinkItem
            title="Privacy Policy"
            onPress={handlePrivacy}
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
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFD600',
    letterSpacing: 1,
    marginBottom: 12,
  },
  linkItem: {
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
  linkItemTitle: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#FFFFFF',
  },
});
