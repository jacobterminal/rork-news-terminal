import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Upload } from 'lucide-react-native';

export default function ReportBugScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deviceInfo, setDeviceInfo] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const handleAttachScreenshot = () => {
    setScreenshot('placeholder.jpg');
    Alert.alert('Screenshot', 'File picker coming soon');
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Missing Information', 'Please fill in both title and description.');
      return;
    }

    // SubmitFeedback('bug', { title, description, deviceInfo, screenshot })
    // SaveToSupabase(table: "feedback")
    
    Alert.alert('Success', 'Bug report submitted successfully.', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
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
        <Text style={styles.pageTitle}>Report Bug / Issue</Text>
        <Text style={styles.pageSubtitle}>Help us fix what&apos;s broken</Text>

        <View style={styles.formSection}>
          <Text style={styles.fieldLabel}>BUG TITLE</Text>
          <TextInput
            style={styles.input}
            placeholder="Brief description of the issue"
            placeholderTextColor="#777777"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.fieldLabel}>DESCRIPTION / STEPS TO REPRODUCE</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="What happened? What were you doing when the bug occurred?"
            placeholderTextColor="#777777"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.fieldLabel}>DEVICE INFO (OPTIONAL)</Text>
          <TextInput
            style={styles.input}
            placeholder={`e.g., ${Platform.OS === 'ios' ? 'iPhone 14 Pro, iOS 17' : 'Samsung Galaxy S23, Android 14'}`}
            placeholderTextColor="#777777"
            value={deviceInfo}
            onChangeText={setDeviceInfo}
            maxLength={100}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.fieldLabel}>ATTACH SCREENSHOT (OPTIONAL)</Text>
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={handleAttachScreenshot}
            activeOpacity={0.7}
          >
            <Upload size={20} color="#FFD75A" />
            <Text style={styles.uploadButtonText}>
              {screenshot ? 'Screenshot attached' : 'Choose file'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.submitContainer, { paddingBottom: Math.max(insets.bottom, 28) }]}>
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Report Bug</Text>
        </TouchableOpacity>
      </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 120,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#EAEAEA',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 32,
  },
  formSection: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFD75A',
    letterSpacing: 1,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#EAEAEA',
  },
  textArea: {
    minHeight: 140,
    paddingTop: 14,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 10,
    padding: 14,
    gap: 10,
  },
  uploadButtonText: {
    fontSize: 15,
    color: '#EAEAEA',
  },
  submitContainer: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  submitButton: {
    backgroundColor: '#FFD75A',
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: 'rgba(255, 215, 90, 0.35)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#000000',
    letterSpacing: 0.5,
  },
});
