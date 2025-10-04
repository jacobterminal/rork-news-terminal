import React, { useEffect, useRef } from 'react';
import { ScrollView, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';

export function useScrollReset() {
  const scrollViewRef = useRef<ScrollView>(null);
  
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    }, [])
  );
  
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, []);
  
  return scrollViewRef;
}
