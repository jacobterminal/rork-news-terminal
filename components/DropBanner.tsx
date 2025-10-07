import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { CriticalAlert } from '../types/news';

interface DropBannerProps {
  alerts: CriticalAlert[];
  onDismiss: (alertId: string) => void;
  onNavigate?: (alertId: string) => void;
}

const BANNER_HEIGHT = 50;
const ANIMATION_DURATION = 300;
const DISPLAY_DURATION = 5000;

export default function DropBanner({ alerts, onDismiss, onNavigate }: DropBannerProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const [currentAlert, setCurrentAlert] = useState<CriticalAlert | null>(null);
  const [alertQueue, setAlertQueue] = useState<CriticalAlert[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const displayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slideAnimation = useRef(new Animated.Value(-BANNER_HEIGHT - 50)).current;
  const swipeAnimation = useRef(new Animated.Value(0)).current;
  const opacityAnimation = useRef(new Animated.Value(1)).current;
  const isSwiping = useRef(false);
  const swipeStartTime = useRef(0);

  const dismissCurrentAlert = useCallback(() => {
    if (!currentAlert) return;
    
    if (displayTimer.current) {
      clearTimeout(displayTimer.current);
      displayTimer.current = null;
    }
    
    const alertId = currentAlert.id;
    
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: -BANNER_HEIGHT - insets.top - 20,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(alertId);
      setCurrentAlert(null);
      swipeAnimation.setValue(0);
      opacityAnimation.setValue(1);
      
      setAlertQueue(prev => {
        if (prev.length > 0) {
          const nextAlert = prev[0];
          setTimeout(() => {
            setCurrentAlert(nextAlert);
          }, 100);
          return prev.slice(1);
        } else {
          setIsVisible(false);
          return [];
        }
      });
    });
  }, [currentAlert, insets.top, onDismiss, slideAnimation, opacityAnimation, swipeAnimation]);

  // Auto-dismiss current alert after display duration
  useEffect(() => {
    if (currentAlert && isVisible) {
      displayTimer.current = setTimeout(() => {
        dismissCurrentAlert();
      }, DISPLAY_DURATION);
      
      return () => {
        if (displayTimer.current) {
          clearTimeout(displayTimer.current);
          displayTimer.current = null;
        }
      };
    }
  }, [currentAlert, isVisible, dismissCurrentAlert]);

  // Process new alerts
  useEffect(() => {
    if (alerts.length > 0) {
      if (!currentAlert && !isVisible) {
        // No alert currently showing, show the first one
        const [firstAlert, ...restAlerts] = alerts;
        setCurrentAlert(firstAlert);
        setAlertQueue(restAlerts);
        setIsVisible(true);
      } else if (currentAlert) {
        // Alert is showing, add new alerts to queue (avoid duplicates)
        const newAlerts = alerts.filter(
          alert => alert.id !== currentAlert.id && !alertQueue.some(q => q.id === alert.id)
        );
        if (newAlerts.length > 0) {
          setAlertQueue(prev => [...prev, ...newAlerts]);
        }
      }
    }
  }, [alerts, currentAlert, alertQueue, isVisible]);

  useEffect(() => {
    if (isVisible && currentAlert) {
      requestAnimationFrame(() => {
        slideAnimation.setValue(-BANNER_HEIGHT - insets.top - 20);
        opacityAnimation.setValue(0);
        
        Animated.parallel([
          Animated.timing(slideAnimation, {
            toValue: 0,
            duration: ANIMATION_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnimation, {
            toValue: 1,
            duration: ANIMATION_DURATION,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else if (!isVisible) {
      requestAnimationFrame(() => {
        slideAnimation.setValue(-BANNER_HEIGHT - insets.top - 20);
      });
    }
  }, [isVisible, currentAlert, slideAnimation, opacityAnimation, insets.top]);

  const handleBannerPress = useCallback(() => {
    if (!currentAlert || isSwiping.current) return;
    
    if (onNavigate) {
      onNavigate(currentAlert.id);
    }
    
    dismissCurrentAlert();
    
    setTimeout(() => {
      router.push('/instant');
    }, 100);
  }, [currentAlert, onNavigate, dismissCurrentAlert, router]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        swipeStartTime.current = Date.now();
        isSwiping.current = false;
        return false;
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const shouldSet = Math.abs(gestureState.dy) > 5 || Math.abs(gestureState.dx) > 5;
        if (shouldSet) {
          isSwiping.current = true;
        }
        return shouldSet;
      },
      onPanResponderGrant: () => {
        isSwiping.current = true;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0) {
          slideAnimation.setValue(gestureState.dy / 2);
        }
        if (Math.abs(gestureState.dx) > 10) {
          swipeAnimation.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const swipeDuration = Date.now() - swipeStartTime.current;
        const isQuickTap = swipeDuration < 200 && Math.abs(gestureState.dy) < 5 && Math.abs(gestureState.dx) < 5;
        
        if (isQuickTap) {
          isSwiping.current = false;
          return;
        }
        
        if (gestureState.dy < -30 || Math.abs(gestureState.dx) > 100) {
          dismissCurrentAlert();
        } else {
          Animated.parallel([
            Animated.spring(slideAnimation, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.spring(swipeAnimation, {
              toValue: 0,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setTimeout(() => {
              isSwiping.current = false;
            }, 100);
          });
        }
      },
      onPanResponderTerminate: () => {
        Animated.parallel([
          Animated.spring(slideAnimation, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(swipeAnimation, {
            toValue: 0,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setTimeout(() => {
            isSwiping.current = false;
          }, 100);
        });
      },
    })
  ).current;

  useEffect(() => {
    return () => {
      if (displayTimer.current) clearTimeout(displayTimer.current);
    };
  }, []);

  // Generate AI-style overview sentence (shortened for ticker)
  const generateTickerSentence = useCallback((alert: CriticalAlert): string => {
    try {
      // Robust input validation
      if (!alert || typeof alert !== 'object') {
        return 'Loading alert...';
      }
      
      if (!alert.type || !alert.sentiment || !alert.impact || !alert.source) {
        return 'Processing alert data...';
      }
      
      const ticker = (Array.isArray(alert.tickers) && alert.tickers.length > 0) ? alert.tickers[0] : 'Market';
      const source = typeof alert.source === 'string' ? alert.source.trim() : 'News';
      
      if (alert.type === 'earnings') {
        if (typeof alert.actual_eps === 'number' && typeof alert.expected_eps === 'number' && alert.expected_eps !== 0) {
          const beat = alert.actual_eps > alert.expected_eps ? 'Beat' : 'Miss';
          const percentage = Math.abs(((alert.actual_eps - alert.expected_eps) / alert.expected_eps) * 100).toFixed(0);
          return `${ticker} EPS ${alert.actual_eps.toFixed(2)} vs ${alert.expected_eps.toFixed(2)} est → ${beat} +${percentage}% [${source}]`;
        }
        return `${ticker} earnings ${alert.sentiment} [${source}]`;
      }
      
      if (alert.actual && alert.forecast) {
        return `${alert.type.toUpperCase()} ${alert.actual} vs ${alert.forecast} est → ${alert.sentiment}, ${alert.impact} Impact [${source}]`;
      }
      
      if (alert.type === 'fed' || alert.type === 'fomc') {
        return `Fed decision → ${alert.sentiment}, ${alert.impact} Impact [${source}]`;
      }
      
      return `${alert.type.toUpperCase()} ${alert.sentiment}, ${alert.impact} Impact [${source}]`;
    } catch (error) {
      console.warn('Error generating ticker sentence:', error);
      return 'Alert processing...';
    }
  }, []);

  const getSentimentIcon = (sentiment: string) => {
    const iconSize = 14;
    switch (sentiment) {
      case 'Bullish':
        return <TrendingUp size={iconSize} color={theme.colors.bullish} />;
      case 'Bearish':
        return <TrendingDown size={iconSize} color={theme.colors.bearish} />;
      default:
        return <Minus size={iconSize} color={theme.colors.neutral} />;
    }
  };

  const getImpactPillStyle = (impact: string) => {
    switch (impact) {
      case 'High':
        return styles.highImpactPill;
      case 'Medium':
        return styles.mediumImpactPill;
      default:
        return styles.lowImpactPill;
    }
  };

  if (!isVisible || !currentAlert || pathname === '/instant') return null;
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          transform: [{ translateY: slideAnimation }],
          opacity: opacityAnimation,
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={styles.banner}
        onPress={handleBannerPress}
        activeOpacity={0.9}
        {...panResponder.panHandlers}
      >
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ translateX: swipeAnimation }],
            },
          ]}
        >
          <View style={styles.leftContent}>
            {getSentimentIcon(currentAlert.sentiment)}
            <Text style={styles.tickerText} numberOfLines={2}>
              {generateTickerSentence(currentAlert)}
            </Text>
          </View>
          
          <View style={styles.rightContent}>
            <View style={[styles.impactPill, getImpactPillStyle(currentAlert.impact)]}>
              <Text style={styles.impactText}>{currentAlert.impact}</Text>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: theme.colors.bannerBg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  banner: {
    height: BANNER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.bannerBg,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  tickerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700' as const,
    color: theme.colors.text,
    lineHeight: 16,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  impactPill: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'center',
  },
  highImpactPill: {
    backgroundColor: '#FF1744',
  },
  mediumImpactPill: {
    backgroundColor: '#FF8C00',
  },
  lowImpactPill: {
    backgroundColor: '#6C757D',
  },
  impactText: {
    fontSize: 8,
    fontWeight: '700' as const,
    color: theme.colors.text,
    letterSpacing: 0.3,
  },
});