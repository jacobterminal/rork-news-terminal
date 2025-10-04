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

interface TickerState {
  alerts: CriticalAlert[];
  currentIndex: number;
  translateX: Animated.Value;
  opacity: Animated.Value;
  isScrolling: boolean;
}

const BANNER_HEIGHT = 118;
const ANIMATION_DURATION = 300;
const TICKER_DURATION = 3000;
const SCROLL_ANIMATION_DURATION = 500;
const MAX_QUEUE_SIZE = 5;

export default function DropBanner({ alerts, onDismiss, onNavigate }: DropBannerProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [tickerState, setTickerState] = useState<TickerState | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const tickerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slideAnimation = useRef(new Animated.Value(-BANNER_HEIGHT - 50)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;

  const dismissTicker = useCallback(() => {
    if (!tickerState) return;
    
    if (tickerTimer.current) {
      clearTimeout(tickerTimer.current);
      tickerTimer.current = null;
    }
    
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
    
    // Animate out
    Animated.parallel([
      Animated.timing(slideAnimation, {
        toValue: -BANNER_HEIGHT - insets.top,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      setTickerState(null);
      // Dismiss all alerts in the ticker
      tickerState.alerts.forEach(alert => onDismiss(alert.id));
    });
  }, [tickerState, insets.top, onDismiss, slideAnimation, opacityAnimation]);

  const startTicker = useCallback((state: TickerState) => {
    if (state.alerts.length <= 1) return;
    
    const cycleTicker = () => {
      if (!state || state.isScrolling) return;
      
      const nextIndex = (state.currentIndex + 1) % state.alerts.length;
      state.isScrolling = true;
      
      // Animate to next alert
      Animated.timing(state.translateX, {
        toValue: -nextIndex * 300, // Approximate width for smooth scroll
        duration: SCROLL_ANIMATION_DURATION,
        useNativeDriver: true,
      }).start(() => {
        state.currentIndex = nextIndex;
        state.isScrolling = false;
        
        // Schedule next cycle or dismiss if completed full loop
        if (nextIndex === 0) {
          // Completed full cycle - dismiss after showing first item again
          dismissTimer.current = setTimeout(() => {
            dismissTicker();
          }, TICKER_DURATION) as ReturnType<typeof setTimeout>;
        } else {
          tickerTimer.current = setTimeout(cycleTicker, TICKER_DURATION) as ReturnType<typeof setTimeout>;
        }
      });
    };
    
    // Start the ticker cycle
    tickerTimer.current = setTimeout(cycleTicker, TICKER_DURATION) as ReturnType<typeof setTimeout>;
  }, [dismissTicker]);

  // Process new alerts into ticker
  useEffect(() => {
    if (alerts.length > 0 && !tickerState) {
      // Limit to max queue size, keep most recent
      const limitedAlerts = alerts.slice(-MAX_QUEUE_SIZE);
      
      const newTickerState: TickerState = {
        alerts: limitedAlerts,
        currentIndex: 0,
        translateX: new Animated.Value(0),
        opacity: new Animated.Value(1),
        isScrolling: false,
      };
      
      setTickerState(newTickerState);
      setIsVisible(true);
      
      // Animate in
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
      
      // Start ticker if multiple alerts
      if (limitedAlerts.length > 1) {
        startTicker(newTickerState);
      } else {
        // Single alert - auto dismiss after delay
        dismissTimer.current = setTimeout(() => {
          dismissTicker();
        }, TICKER_DURATION) as ReturnType<typeof setTimeout>;
      }
    }
    
    // Cleanup function for memory leak prevention
    return () => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
        dismissTimer.current = null;
      }
      if (tickerTimer.current) {
        clearTimeout(tickerTimer.current);
        tickerTimer.current = null;
      }
    };
  }, [alerts, tickerState, slideAnimation, opacityAnimation, dismissTicker, startTicker]);

  const handleTickerPress = () => {
    if (!tickerState) return;
    
    const currentAlert = tickerState.alerts[tickerState.currentIndex];
    
    // Navigate to instant tab and notify parent for highlighting
    router.push('/instant');
    if (onNavigate) {
      onNavigate(currentAlert.id);
    }
    dismissTicker();
  };

  // Pan responder for swipe up to dismiss
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 10 && gestureState.dy < 0; // Only respond to upward swipes
    },
    onPanResponderMove: (_, gestureState) => {
      // Skip manual animation during pan to avoid conflicts
      // Let the pan responder handle the visual feedback
    },
    onPanResponderRelease: (_, gestureState) => {
      if (tickerState) {
        if (gestureState.dy < -30) {
          // Swipe up threshold met - dismiss
          dismissTicker();
        } else {
          // Snap back to original position
          Animated.parallel([
            Animated.spring(slideAnimation, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.spring(opacityAnimation, {
              toValue: 1,
              useNativeDriver: true,
            }),
          ]).start();
        }
      }
    },
  });

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      if (tickerTimer.current) clearTimeout(tickerTimer.current);
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

  if (!isVisible || !tickerState) return null;
  
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
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={styles.banner}
        onPress={handleTickerPress}
        activeOpacity={0.9}
      >
        <View style={styles.content}>
          <View style={styles.tickerContainer}>
            <Animated.View
              style={[
                styles.tickerContent,
                {
                  transform: [{ translateX: tickerState.translateX }],
                },
              ]}
            >
              {tickerState.alerts.map((alert, index) => {
                const isActive = index === tickerState.currentIndex;
                return (
                  <View key={alert.id} style={styles.tickerItem}>
                    <View style={styles.leftContent}>
                      {getSentimentIcon(alert.sentiment)}
                      <Text 
                        style={[
                          styles.tickerText,
                          { opacity: isActive ? 1 : 0.7 }
                        ]} 
                        numberOfLines={2}
                      >
                        {generateTickerSentence(alert)}
                      </Text>
                    </View>
                    
                    <View style={styles.rightContent}>
                      <View style={[styles.impactPill, getImpactPillStyle(alert.impact)]}>
                        <Text style={styles.impactText}>{alert.impact}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </Animated.View>
          </View>
        </View>
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
    zIndex: 1000,
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
  },
  tickerContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  tickerContent: {
    flexDirection: 'row',
  },
  tickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 300, // Fixed width for smooth scrolling
    paddingRight: 12,
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