import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { ArrowLeft, Lightbulb, Bug, Sparkles } from 'lucide-react-native';

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
  const navigation = useNavigation();

  const handleFeatureRequest = () => {
    Alert.alert('Feature Request', 'Feature request form coming soon');
  };

  const handleBugReport = () => {
    Alert.alert('Bug Report', 'Bug report form coming soon');
  };

  const handleAIImprovement = () => {
    Alert.alert('AI Improvement', 'AI improvement request form coming soon');
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
        <Text style={styles.headerTitle}>Requests & Feedback</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
            description="Let us know about any problems you're experiencing"
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
