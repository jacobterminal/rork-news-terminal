import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

interface DevControlsProps {
  onInjectFed: () => void;
  onInjectEarnings: () => void;
}

export default function DevControls({ 
  onInjectFed, 
  onInjectEarnings
}: DevControlsProps) {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dev Controls</Text>
      
      <View style={styles.buttons}>
        <Pressable style={styles.button} onPress={onInjectFed}>
          <Text style={styles.buttonText}>Inject Fed News</Text>
        </Pressable>
        
        <Pressable style={styles.button} onPress={onInjectEarnings}>
          <Text style={styles.buttonText}>Inject Earnings Beat</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  buttons: {
    gap: theme.spacing.sm,
  },
  button: {
    backgroundColor: theme.colors.info + '20',
    borderWidth: 1,
    borderColor: theme.colors.info,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: 4,
  },
  buttonText: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.info,
    fontWeight: '500',
    textAlign: 'center',
  },
});