import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';

type TabKey = 'dashboard' | 'ruleBuilder' | 'targets' | 'analytics' | 'settings';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'ruleBuilder', label: 'Rule Builder' },
  { key: 'targets', label: 'Targets' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'settings', label: 'Settings' },
];

export default function TwitterTrackerPage() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  return (
    <View style={[styles.page, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Twitter Tracker</Text>
          <View style={styles.pill}>
            <Text style={styles.pillText}>BETA</Text>
          </View>
          <View style={styles.flex1} />
          <TouchableOpacity style={styles.pill} activeOpacity={0.7}>
            <Text style={styles.pillText}>⌘K</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.subnav}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subnavContent}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.pill,
                styles.tabPill,
                activeTab === tab.key && styles.pillActive,
              ]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  activeTab === tab.key && styles.pillTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        <Panel title={TABS.find((t) => t.key === activeTab)?.label || ''} />
      </View>
    </View>
  );
}

function Panel({ title }: { title: string }) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>{title}</Text>
      </View>

      <View style={styles.panelToolbar}>
        <View style={styles.toolbarContent} />
      </View>

      <ScrollView style={styles.panelBody} contentContainerStyle={styles.panelBodyContent}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Coming next…</Text>
        </View>
      </ScrollView>

      <View style={styles.panelFooter}>
        <View style={styles.footerContent} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 0 0 1px var(--border), 0 6px 14px rgba(0,0,0,.35)',
      } as any,
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 13,
    color: theme.colors.text,
    letterSpacing: 0.5,
    fontWeight: '500' as const,
  },
  flex1: {
    flex: 1,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  pillText: {
    fontSize: 12,
    color: theme.colors.textDim,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  pillActive: {
    backgroundColor: theme.colors.border,
  },
  pillTextActive: {
    color: theme.colors.text,
  },
  subnav: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  subnavContent: {
    flexDirection: 'row',
    gap: 8,
  },
  tabPill: {
    minHeight: 36,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 12,
    overflow: 'hidden' as any,
  },
  panel: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6,
  },
  panelHeader: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  panelTitle: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '500' as const,
  },
  panelToolbar: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
  },
  toolbarContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  panelBody: {
    flex: 1,
  },
  panelBodyContent: {
    padding: 12,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  panelFooter: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
  },
  footerContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
});
