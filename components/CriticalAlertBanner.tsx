import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, Animated, Platform } from 'react-native';
import { theme } from '../constants/theme';

interface CriticalAlertBannerProps {
  message: string | null;
  sentiment: 'bull' | 'bear' | 'neutral';
  onDismiss?: () => void;
}

export default function CriticalAlertBanner({ message, sentiment, onDismiss }: CriticalAlertBannerProps) {
  const [slideAnim] = useState(new Animated.Value(-100));
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 350,
          useNativeDriver: true,
        }).start(() => {
          setIsVisible(false);
          onDismiss?.();
        });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message, slideAnim, onDismiss]);

  if (!isVisible && !message) return null;

  const backgroundColor = 
    sentiment === 'bull' ? theme.colors.bullish :
    sentiment === 'bear' ? theme.colors.bearish :
    theme.colors.neutral;

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.bannerText} numberOfLines={1}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 9999,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
      },
    }),
  },
  bannerText: {
    fontSize: 13,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    color: '#FFFFFF',
    fontWeight: '600' as const,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
