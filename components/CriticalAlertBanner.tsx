import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Text, StyleSheet, Animated, Platform, View, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CriticalAlertBannerProps {
  message: string | null;
  sentiment: 'bull' | 'bear' | 'neutral';
  onDismiss?: () => void;
}

export default function CriticalAlertBanner({ message, sentiment, onDismiss }: CriticalAlertBannerProps) {
  const insets = useSafeAreaInsets();
  const [bannerHeight, setBannerHeight] = useState(134 + insets.top);
  const [slideAnim] = useState(new Animated.Value(-bannerHeight));
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const bannerRef = useRef<View>(null);
  const panStartY = useRef(0);
  const isDismissing = useRef(false);

  useLayoutEffect(() => {
    if (Platform.OS === 'web' && isVisible) {
      const syncHeight = () => {
        const anchor = document.getElementById('banner-anchor-point');
        if (anchor) {
          const rect = anchor.getBoundingClientRect();
          const calculatedHeight = Math.max(0, Math.floor(rect.top));
          setBannerHeight(calculatedHeight);
        }
      };
      
      syncHeight();
      window.addEventListener('resize', syncHeight);
      window.addEventListener('scroll', syncHeight, { passive: true });
      
      return () => {
        window.removeEventListener('resize', syncHeight);
        window.removeEventListener('scroll', syncHeight);
      };
    }
  }, [isVisible]);

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

  const handleDismiss = () => {
    if (isDismissing.current) return;
    isDismissing.current = true;
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    Animated.timing(slideAnim, {
      toValue: -bannerHeight,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
      isDismissing.current = false;
      onDismiss?.();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 3;
      },
      onPanResponderGrant: (_, gestureState) => {
        panStartY.current = gestureState.y0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const swipeThreshold = 30;
        
        if (gestureState.dy < -swipeThreshold || gestureState.vy < -0.3) {
          handleDismiss();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

  if (!isVisible && !message) return null;

  const backgroundColor = '#000000';

  return (
    <Animated.View
      ref={bannerRef}
      style={[
        styles.banner,
        {
          backgroundColor,
          height: bannerHeight,
          paddingTop: insets.top,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.bannerText} numberOfLines={2}>
          {message}
        </Text>
        <View style={styles.swipeIndicator} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'fixed' as any,
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
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  swipeIndicator: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginTop: 12,
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
    lineHeight: 18,
  },
});
