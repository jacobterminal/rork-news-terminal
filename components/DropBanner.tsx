import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder } from 'react-native';
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
const ANIMATION_DURATION = 160;
const DISPLAY_DURATION = 3000;
const DISMISS_THRESHOLD_Y = -32;
const DISMISS_VELOCITY = -300;
const SPRING_BACK_TENSION = 100;
const SPRING_BACK_FRICTION = 8;

export default function DropBanner({ alerts, onDismiss, onNavigate }: DropBannerProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const [currentAlert, setCurrentAlert] = useState<CriticalAlert | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const displayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slideAnimation = useRef(new Animated.Value(-BANNER_HEIGHT - 50)).current;
  const opacityAnimation = useRef(new Animated.Value(1)).current;
  const isSwiping = useRef(false);
  const swipeStartTime = useRef(0);
  const isPaused = useRef(false);
  const pauseStartTime = useRef(0);
  const remainingTime = useRef(DISPLAY_DURATION);

  const dismissCurrentAlert = useCallback(() => {
    if (!currentAlert || isDismissing) return;
    
    setIsDismissing(true);
    
    if (displayTimer.current) {
      clearTimeout(displayTimer.current);
      displayTimer.current = null;
    }
    
    const alertId = currentAlert.id;
    
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: -(BANNER_HEIGHT + insets.top + 50),
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
      setIsDismissing(false);
      opacityAnimation.setValue(1);
      remainingTime.current = DISPLAY_DURATION;
      
      if (alertQueueRef.current.length > 0) {
        const nextAlert = alertQueueRef.current[0];
        alertQueueRef.current = alertQueueRef.current.slice(1);
        setTimeout(() => {
          setCurrentAlert(nextAlert);
        }, 100);
      } else {
        setIsVisible(false);
        alertQueueRef.current = [];
      }
    });
  }, [currentAlert, isDismissing, insets.top, onDismiss, slideAnimation, opacityAnimation]);

  useEffect(() => {
    if (currentAlert && isVisible && !isDismissing && !isPaused.current) {
      displayTimer.current = setTimeout(() => {
        dismissCurrentAlert();
      }, remainingTime.current);
      
      return () => {
        if (displayTimer.current) {
          clearTimeout(displayTimer.current);
          displayTimer.current = null;
        }
      };
    }
  }, [currentAlert, isVisible, isDismissing, dismissCurrentAlert]);

  const alertQueueRef = useRef<CriticalAlert[]>([]);
  
  useEffect(() => {
    if (alerts.length > 0) {
      if (!currentAlert && !isVisible && !isDismissing) {
        const [firstAlert, ...restAlerts] = alerts;
        setCurrentAlert(firstAlert);
        alertQueueRef.current = restAlerts;
        setIsVisible(true);
      } else if (currentAlert && !isDismissing) {
        const newAlerts = alerts.filter(
          alert => alert.id !== currentAlert.id && !alertQueueRef.current.some(q => q.id === alert.id)
        );
        if (newAlerts.length > 0) {
          alertQueueRef.current = [...alertQueueRef.current, ...newAlerts];
        }
      }
    }
  }, [alerts, currentAlert, isVisible, isDismissing]);

  useEffect(() => {
    if (isVisible && currentAlert) {
      slideAnimation.setValue(-BANNER_HEIGHT - insets.top - 20);
      opacityAnimation.setValue(0);
      
      requestAnimationFrame(() => {
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
      slideAnimation.setValue(-BANNER_HEIGHT - insets.top - 20);
    }
  }, [isVisible, currentAlert, slideAnimation, opacityAnimation, insets.top]);

  const handleBannerPress = useCallback(() => {
    if (!currentAlert || isSwiping.current || isDismissing) return;
    
    if (onNavigate) {
      onNavigate(currentAlert.id);
    }
    
    dismissCurrentAlert();
    
    setTimeout(() => {
      router.push('/instant');
    }, 100);
  }, [currentAlert, isDismissing, onNavigate, dismissCurrentAlert, router]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        swipeStartTime.current = Date.now();
        isSwiping.current = false;
        
        if (displayTimer.current && !isPaused.current) {
          clearTimeout(displayTimer.current);
          displayTimer.current = null;
          isPaused.current = true;
          pauseStartTime.current = Date.now();
        }
        
        return true;
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const shouldSet = Math.abs(gestureState.dy) > 5;
        if (shouldSet) {
          isSwiping.current = true;
        }
        return shouldSet;
      },
      onPanResponderGrant: () => {
        swipeStartTime.current = Date.now();
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0) {
          slideAnimation.setValue(gestureState.dy);
          const opacity = Math.max(0, Math.min(1, 1 + gestureState.dy / 80));
          opacityAnimation.setValue(opacity);
          isSwiping.current = true;
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const swipeDuration = Date.now() - swipeStartTime.current;
        const isQuickTap = swipeDuration < 200 && Math.abs(gestureState.dy) < 10;
        
        if (isQuickTap && !isSwiping.current) {
          isSwiping.current = false;
          handleBannerPress();
          return;
        }
        
        if (gestureState.dy <= DISMISS_THRESHOLD_Y || gestureState.vy <= DISMISS_VELOCITY / 1000) {
          dismissCurrentAlert();
        } else {
          Animated.parallel([
            Animated.spring(slideAnimation, {
              toValue: 0,
              useNativeDriver: true,
              tension: SPRING_BACK_TENSION,
              friction: SPRING_BACK_FRICTION,
            }),
            Animated.spring(opacityAnimation, {
              toValue: 1,
              useNativeDriver: true,
              tension: SPRING_BACK_TENSION,
              friction: SPRING_BACK_FRICTION,
            }),
          ]).start(() => {
            if (isPaused.current) {
              const elapsed = Date.now() - pauseStartTime.current;
              remainingTime.current = Math.max(0, remainingTime.current - elapsed);
              isPaused.current = false;
              
              if (remainingTime.current > 0) {
                displayTimer.current = setTimeout(() => {
                  dismissCurrentAlert();
                }, remainingTime.current);
              }
            }
            
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
            tension: SPRING_BACK_TENSION,
            friction: SPRING_BACK_FRICTION,
          }),
          Animated.spring(opacityAnimation, {
            toValue: 1,
            useNativeDriver: true,
            tension: SPRING_BACK_TENSION,
            friction: SPRING_BACK_FRICTION,
          }),
        ]).start(() => {
          if (isPaused.current) {
            const elapsed = Date.now() - pauseStartTime.current;
            remainingTime.current = Math.max(0, remainingTime.current - elapsed);
            isPaused.current = false;
            
            if (remainingTime.current > 0) {
              displayTimer.current = setTimeout(() => {
                dismissCurrentAlert();
              }, remainingTime.current);
            }
          }
          
          setTimeout(() => {
            isSwiping.current = false;
          }, 100);
        });
      },
    })
  ).current;

  const prevPathname = useRef(pathname);
  
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      if (currentAlert && isVisible && !isDismissing) {
        dismissCurrentAlert();
      }
    }
  }, [pathname, currentAlert, isVisible, isDismissing, dismissCurrentAlert]);
  
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
      pointerEvents="auto"
    >
      <View
        style={styles.banner}
        {...panResponder.panHandlers}
      >
        <View style={styles.content}>
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
        </View>
        <View style={styles.grabIndicator} />
      </View>
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
  grabIndicator: {
    position: 'absolute',
    bottom: 4,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});