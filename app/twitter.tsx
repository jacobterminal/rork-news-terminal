import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TwitterScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.page, { paddingTop: insets.top }]}>
      <View style={styles.centered}>
        <View style={styles.textCenter}>
          <Text style={styles.value}>Twitter Tracker is blank.</Text>
          <Text style={styles.label}>We&apos;ll add sections here next.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    height: '100%' as any,
    width: '100%' as any,
    overflow: 'hidden' as any,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCenter: {
    alignItems: 'center',
  },
  value: {
    fontSize: 13,
    fontFamily: 'ui-monospace, Menlo, Consolas, monospace' as any,
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    opacity: 0.6,
  },
});
