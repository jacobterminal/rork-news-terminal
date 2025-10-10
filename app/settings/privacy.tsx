import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { Download, Trash2, ExternalLink } from 'lucide-react-native';
import SettingsBackHeader from '../../components/SettingsBackHeader';

interface ActionItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
  isDestructive?: boolean;
}

function ActionItem({ icon, title, description, onPress, isDestructive }: ActionItemProps) {
  return (
    <TouchableOpacity style={styles.actionItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.actionItemLeft}>
        <View style={styles.actionItemIcon}>
          <View>{icon}</View>
        </View>
        <View style={styles.actionItemContent}>
          <Text style={[styles.actionItemTitle, isDestructive && styles.destructiveText]}>
            {title}
          </Text>
          <Text style={styles.actionItemDescription}>{description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

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
  const navigation = useNavigation();

  const handleExportData = () => {
    Alert.alert('Export Data', 'Your data export will be ready in 24 hours. We\'ll send you an email when it\'s ready.');
  };

  const handleDeleteHistory = () => {
    Alert.alert(
      'Delete Watch History',
      'Are you sure you want to delete your watch history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => console.log('History deleted') }
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear temporary files and may improve app performance.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: () => console.log('Cache cleared') }
      ]
    );
  };

  const handleTerms = () => {
    Linking.openURL('https://example.com/terms');
  };

  const handlePrivacy = () => {
    Linking.openURL('https://example.com/privacy');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <SettingsBackHeader />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Data & Privacy</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>YOUR DATA</Text>
          <ActionItem
            icon={<Download size={20} color="#FFD600" />}
            title="Export Account Data"
            description="Download a copy of your data"
            onPress={handleExportData}
          />
          <ActionItem
            icon={<Trash2 size={20} color="#FFD600" />}
            title="Delete Watch History"
            description="Remove all your viewing history"
            onPress={handleDeleteHistory}
          />
          <ActionItem
            icon={<Trash2 size={20} color="#FFD600" />}
            title="Clear Cache"
            description="Free up storage space"
            onPress={handleClearCache}
          />
        </View>

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

        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>Your Privacy Matters</Text>
          <Text style={styles.infoBoxText}>
            We take your privacy seriously. Your data is encrypted and never shared with third parties without your consent.
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
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
  actionItem: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionItemContent: {
    flex: 1,
  },
  actionItemTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionItemDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
  destructiveText: {
    color: '#FF3B30',
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
