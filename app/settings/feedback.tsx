import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Lightbulb, Bug, Sparkles, ChevronLeft } from 'lucide-react-native';
import { settingsNavigation } from '../../utils/navigationMemory';

interface FeedbackTypeProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
}

function FeedbackType({ icon, title, description, onPress }: FeedbackTypeProps) {
  return (
    <TouchableOpacity style={styles.feedbackType} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.feedbackTypeIcon}>
        <View>{icon}</View>
      </View>
      <View style={styles.feedbackTypeContent}>
        <Text style={styles.feedbackTypeTitle}>{title}</Text>
        <Text style={styles.feedbackTypeDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function FeedbackSettingsScreen() {
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

  const handleNavigateToSubpage = (page: string) => {
    settingsNavigation.pushPage(page);
    router.push(page as any);
  };

  const handleFeatureRequest = () => {
    handleNavigateToSubpage('/settings/feedback-feature');
  };

  const handleBugReport = () => {
    handleNavigateToSubpage('/settings/feedback-bug');
  };

  const handleAIImprovement = () => {
    handleNavigateToSubpage('/settings/feedback-ai');
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
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.pageTitle}>Requests & Feedback</Text>
        <Text style={styles.pageSubtitle}>We&apos;re here to help</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HOW CAN WE HELP?</Text>
          <FeedbackType
            icon={<Lightbulb size={24} color="#FFD600" />}
            title="Request New Feature"
            description="Suggest a new feature or improvement"
            onPress={handleFeatureRequest}
          />
          <FeedbackType
            icon={<Bug size={24} color="#FFD600" />}
            title="Report Bug / Issue"
            description="Let us know about any problems you&apos;re experiencing"
            onPress={handleBugReport}
          />
          <FeedbackType
            icon={<Sparkles size={24} color="#FFD600" />}
            title="Request AI Improvement"
            description="Help us improve our AI summaries and insights"
            onPress={handleAIImprovement}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>Your feedback matters</Text>
          <Text style={styles.infoBoxText}>
            We read every piece of feedback and use it to improve the app. Thank you for helping us build a better experience!
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
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#EAEAEA',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFD600',
    letterSpacing: 1,
    marginBottom: 12,
  },
  feedbackType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  feedbackTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  feedbackTypeContent: {
    flex: 1,
  },
  feedbackTypeTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  feedbackTypeDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
  infoBox: {
    marginHorizontal: 16,
    marginTop: 32,
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
