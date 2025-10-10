import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter, useNavigation } from 'expo-router';
import { navigationMemory } from '../utils/navigationMemory';

interface SettingsBackHeaderProps {
  onPress?: () => void;
  showLabel?: boolean;
}

export default function SettingsBackHeader({ onPress, showLabel = true }: SettingsBackHeaderProps) {
  const router = useRouter();
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;
  const shouldShowLabel = showLabel && screenWidth >= 360;

  const handlePress = async () => {
    if (onPress) {
      onPress();
      return;
    }

    if (navigation.canGoBack()) {
      router.back();
    } else {
      const lastRoute = await navigationMemory.getLastRoute();
      if (lastRoute) {
        router.replace(`/${lastRoute === 'index' ? '' : lastRoute}`);
      } else {
        router.replace('/instant');
      }
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.6}
    >
      <View style={styles.iconContainer}>
        <ChevronLeft size={20} color="#EAEAEA" strokeWidth={2.5} />
      </View>
      {shouldShowLabel && (
        <Text style={styles.label}>Back</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: 'rgba(17, 17, 17, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#EAEAEA',
    marginLeft: 8,
  },
});
