import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CriticalAlertBannerProps {
  message: string | null;
  sentiment: 'bull' | 'bear' | 'neutral';
  onDismiss?: () => void;
}

export default function CriticalAlertBanner({ message, sentiment, onDismiss }: CriticalAlertBannerProps) {
  const insets = useSafeAreaInsets();
  const bannerHeight = 108 + insets.top;
  const [slideAnim] = useState(new Animated.Value(-bannerHeight));
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }).start();

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -bannerHeight,
          duration: 320,
          useNativeDriver: true,
        }).start(() => {
          setIsVisible(false);
          onDismiss?.();
        });
      }, 5000);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [message, slideAnim, onDismiss, bannerHeight]);

  const handlePress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    Animated.timing(slideAnim, {
      toValue: -bannerHeight,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
      onDismiss?.();
    });
  };

  if (!isVisible && !message) return null;

  const backgroundColor = '#000000';

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor,
          height: bannerHeight,
          paddingTop: insets.top,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Pressable 
        onPress={handlePress}
        style={styles.pressable}
      >
        <Text style={styles.bannerText} numberOfLines={1}>
          {message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 9999,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 4,
        elevation: 10,
      },
    }),
  },
  pressable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
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
