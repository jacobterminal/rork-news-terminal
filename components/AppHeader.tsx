import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function AppHeader() {
  return (
    <View style={styles.header}>
      <Image 
        source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/op5e9ni4vdhndjpf309k6' }}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>INSIDER VEGA</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logo: {
    width: 32,
    height: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#2E3A8C',
    letterSpacing: 1.5,
    fontFamily: 'serif',
  },
});
