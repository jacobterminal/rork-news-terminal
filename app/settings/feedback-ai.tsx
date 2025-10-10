import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { settingsNavigation } from '../../utils/navigationMemory';

const AI_MODULES = ['AI Summary', 'AI Opinion', 'AI Forecast', 'Key Phrases'];

export default function RequestAIImprovementScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [moduleName, setModuleName] = useState('');
  const [description, setDescription] = useState('');
  const [example, setExample] = useState('');
  const [showModulePicker, setShowModulePicker] = useState(false);

  const handleBack = () => {
    const prevPage = settingsNavigation.goBack();
    if (prevPage) {
      router.replace(prevPage as any);
    } else {
      const destination = settingsNavigation.exitSettings();
      router.replace(`/${destination === 'index' ? '' : destination}`);
    }
  };

  const handleSubmit = async () => {
    if (!moduleName || !description.trim()) {
      Alert.alert('Missing Information', 'Please select a module and describe the improvement.');
      return;
    }

    // SubmitFeedback('ai_improvement', { moduleName, description, example })
    // SaveToSupabase(table: "feedback")
    
    Alert.alert('Success', 'AI improvement request submitted successfully.', [
      { text: 'OK', onPress: handleBack }
    ]);
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
        <Text style={styles.pageTitle}>Request AI Improvement</Text>
        <Text style={styles.pageSubtitle}>Help us make AI smarter</Text>

        <View style={styles.formSection}>
          <Text style={styles.fieldLabel}>MODULE NAME</Text>
          <TouchableOpacity 
            style={styles.pickerButton}
            onPress={() => setShowModulePicker(!showModulePicker)}
            activeOpacity={0.7}
          >
            <Text style={moduleName ? styles.pickerButtonTextSelected : styles.pickerButtonText}>
              {moduleName || 'Select an AI module'}
            </Text>
          </TouchableOpacity>
          
          {showModulePicker && (
            <View style={styles.pickerOptions}>
              {AI_MODULES.map((module) => (
                <TouchableOpacity
                  key={module}
                  style={styles.pickerOption}
                  onPress={() => {
                    setModuleName(module);
                    setShowModulePicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pickerOptionText}>{module}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.fieldLabel}>DESCRIBE THE IMPROVEMENT</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="What would you like to see improved? How should it work?"
            placeholderTextColor="#777777"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.fieldLabel}>EXAMPLE (OPTIONAL)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Provide a specific example or use case"
            placeholderTextColor="#777777"
            value={example}
            onChangeText={setExample}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <View style={[styles.submitContainer, { paddingBottom: Math.max(insets.bottom, 28) }]}>
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Submit AI Improvement</Text>
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
  pickerButton: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 10,
    padding: 14,
  },
  pickerButtonText: {
    fontSize: 15,
    color: '#777777',
  },
  pickerButtonTextSelected: {
    fontSize: 15,
    color: '#EAEAEA',
  },
  pickerOptions: {
    marginTop: 8,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 10,
    overflow: 'hidden',
  },
  pickerOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  pickerOptionText: {
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
