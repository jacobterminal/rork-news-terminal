import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
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
const SWIPE_ANIMATION_DURATION = 400;

export default function DropBanner({ alerts, onDismiss, onNavigate }: DropBannerProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [currentAlert, setCurrentAlert] = useState<CriticalAlert | null>(null);
  const [alertQueue, setAlertQueue] = useState<CriticalAlert[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const displayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(false);
  const slideAnimation = useRef<Animated.Value | null>(null);
  const swipeAnimation = useRef<Animated.Value | null>(null);
  const opacityAnimation = useRef<Animated.Value | null>(null);
  
  if (!slideAnimation.current) {
    slideAnimation.current = new Animated.Value(-BANNER_HEIGHT - 50);
  }
  if (!swipeAnimation.current) {
    swipeAnimation.current = new Animated.Value(0);
  }
  if (!opacityAnimation.current) {
    opacityAnimation.current = new Animated.Value(1);
  }

  const dismissCurrentAlert = useCallback(() => {
    if (!currentAlert || !swipeAnimation.current || !opacityAnimation.current || !slideAnimation.current) return;
    
    if (displayTimer.current) {
      clearTimeout(displayTimer.current);
      displayTimer.current = null;
    }
    
    const swipeAnim = swipeAnimation.current;
    const opacityAnim = opacityAnimation.current;
    const slideAnim = slideAnimation.current;
    const alertId = currentAlert.id;
    
    // Swipe out to the right with fade
    Animated.parallel([
      Animated.timing(swipeAnim, {
        toValue: 400,
        duration: SWIPE_ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: SWIPE_ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(alertId);
      setCurrentAlert(null);
      swipeAnim.setValue(0);
      opacityAnim.setValue(1);
      
      // Check if there are more alerts in queue
      setAlertQueue(prev => {
        if (prev.length > 0) {
          const nextAlert = prev[0];
          setCurrentAlert(nextAlert);
          return prev.slice(1);
        } else {
          // No more alerts, hide banner
          Animated.timing(slideAnim, {
            toValue: -BANNER_HEIGHT - insets.top,
            duration: ANIMATION_DURATION,
            useNativeDriver: true,
          }).start(() => {
            setIsVisible(false);
          });
          return [];
        }
      });
    });
  }, [currentAlert, insets.top, onDismiss]);

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

  // Animate banner in when it becomes visible
  useEffect(() => {
    if (isVisible && currentAlert && isMounted.current && slideAnimation.current) {
      requestAnimationFrame(() => {
        if (isMounted.current && slideAnimation.current) {
          Animated.timing(slideAnimation.current, {
            toValue: 0,
            duration: ANIMATION_DURATION,
            useNativeDriver: true,
          }).start();
        }
      });
    } else if (!isVisible && isMounted.current && slideAnimation.current) {
      requestAnimationFrame(() => {
        if (isMounted.current && slideAnimation.current) {
          slideAnimation.current.setValue(-BANNER_HEIGHT - 50);
        }
      });
    }
  }, [isVisible, currentAlert]);

  const handleBannerPress = () => {
    if (!currentAlert) return;
    
    // Navigate to instant tab and notify parent for highlighting
    router.push('/instant');
    if (onNavigate) {
      onNavigate(currentAlert.id);
    }
    dismissCurrentAlert();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10 && gestureState.dy < 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0 && slideAnimation.current) {
          slideAnimation.current.setValue(gestureState.dy / 2);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -30) {
          dismissCurrentAlert();
        } else if (slideAnimation.current) {
          Animated.spring(slideAnimation.current, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Mount tracking and cleanup
  useEffect(() => {
    isMounted.current = true;
    requestAnimationFrame(() => {
      if (isMounted.current && slideAnimation.current) {
        slideAnimation.current.setValue(-BANNER_HEIGHT - 50);
      }
    });
    return () => {
      isMounted.current = false;
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

  if (!isVisible || !currentAlert) return null;
  
  if (!slideAnimation.current || !swipeAnimation.current || !opacityAnimation.current) {
    return null;
  }
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          transform: [{ translateY: slideAnimation.current }],
        },
      ]}
      pointerEvents="box-none"
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={styles.banner}
        onPress={handleBannerPress}
        activeOpacity={0.9}
      >
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ translateX: swipeAnimation.current }],
              opacity: opacityAnimation.current,
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