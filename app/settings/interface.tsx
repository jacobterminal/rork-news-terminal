import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';

interface ToggleItemProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function ToggleItem({ label, description, value, onValueChange }: ToggleItemProps) {
  return (
    <View style={styles.toggleItem}>
      <View style={styles.toggleItemLeft}>
        <Text style={styles.toggleItemLabel}>{label}</Text>
        {description && (
          <Text style={styles.toggleItemDescription}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#333', true: '#FFD600' }}
        thumbColor={value ? '#FFFFFF' : '#888'}
      />
    </View>
  );
}

interface SelectItemProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function SelectItem({ label, selected, onPress }: SelectItemProps) {
  return (
    <TouchableOpacity 
      style={[styles.selectItem, selected && styles.selectItemSelected]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.selectItemLabel, selected && styles.selectItemLabelSelected]}>
        {label}
      </Text>
      {selected && <Check size={18} color="#FFD600" />}
    </TouchableOpacity>
  );
}

export default function InterfaceSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();

  const [feedPreset, setFeedPreset] = useState<'watchlist' | 'overall'>('watchlist');
  const [darkMode, setDarkMode] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [aiDetailLevel, setAiDetailLevel] = useState<'brief' | 'standard' | 'detailed'>('standard');

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
        <Text style={styles.headerTitle}>Interface & Layout</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FEED PRESET</Text>
          <SelectItem
            label="Watchlist-based feed"
            selected={feedPreset === 'watchlist'}
            onPress={() => setFeedPreset('watchlist')}
          />
          <SelectItem
            label="Overall incoming feed"
            selected={feedPreset === 'overall'}
            onPress={() => setFeedPreset('overall')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APPEARANCE</Text>
          <ToggleItem
            label="Dark Mode"
            description="Use dark theme throughout the app"
            value={darkMode}
            onValueChange={setDarkMode}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DISPLAY</Text>
          <ToggleItem
            label="Compact Mode"
            description="Show more content with reduced spacing"
            value={compactMode}
            onValueChange={setCompactMode}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FONT SIZE</Text>
          <SelectItem
            label="Small"
            selected={fontSize === 'small'}
            onPress={() => setFontSize('small')}
          />
          <SelectItem
            label="Medium"
            selected={fontSize === 'medium'}
            onPress={() => setFontSize('medium')}
          />
          <SelectItem
            label="Large"
            selected={fontSize === 'large'}
            onPress={() => setFontSize('large')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI SUMMARY DETAIL LEVEL</Text>
          <SelectItem
            label="Brief"
            selected={aiDetailLevel === 'brief'}
            onPress={() => setAiDetailLevel('brief')}
          />
          <SelectItem
            label="Standard"
            selected={aiDetailLevel === 'standard'}
            onPress={() => setAiDetailLevel('standard')}
          />
          <SelectItem
            label="Detailed"
            selected={aiDetailLevel === 'detailed'}
            onPress={() => setAiDetailLevel('detailed')}
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
  toggleItem: {
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
  toggleItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  toggleItemLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  toggleItemDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
  selectItem: {
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
  selectItemSelected: {
    borderColor: '#FFD600',
    backgroundColor: '#111',
  },
  selectItemLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#FFFFFF',
  },
  selectItemLabelSelected: {
    color: '#FFD600',
  },
});
