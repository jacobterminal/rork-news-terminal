// template
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tabs, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, Text, View, Platform } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { Newspaper, Calendar, Zap, Star } from "lucide-react-native";
import { theme } from "../constants/theme";
import { NewsStoreProvider, useNewsStore } from "../store/newsStore";
import DropBanner from "../components/DropBanner";
import AlertSearchBar from "../components/AlertSearchBar";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    const handleInitialNavigation = async () => {
      if (hasNavigated) return;
      
      const currentPath = `/${segments.join('/')}`;
      console.log('[RootLayoutNav] Current path:', currentPath);
      
      if (currentPath === '/' || currentPath === '') {
        console.log('[RootLayoutNav] App relaunch detected, navigating to instant');
        setHasNavigated(true);
        setTimeout(() => {
          router.replace('/instant');
        }, 0);
      } else {
        setHasNavigated(true);
      }
    };

    handleInitialNavigation();
  }, [segments, hasNavigated, router]);
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.bg,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
          height: 60 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 6),
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.colors.activeCyan,
        tabBarInactiveTintColor: theme.colors.inactiveGray,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          fontFamily: 'monospace',
          letterSpacing: 0.5,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="upcoming"
        options={{
          title: "Upcoming",
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size * 1.15} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "News",
          tabBarIcon: ({ color, size }) => (
            <Newspaper size={size * 1.15} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="instant"
        options={{
          title: "Instant",
          tabBarIcon: ({ color, focused }) => (
            <Zap 
              size={24 * 1.15} 
              color={focused ? '#FFD700' : theme.colors.inactiveGray}
              fill={focused ? '#FFD700' : 'none'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="twitter"
        options={{
          title: "TRACKER",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size * 1.15, color, fontWeight: 'bold' }}>𝕏</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="watchlist"
        options={{
          title: "Watchlist",
          tabBarIcon: ({ color, size }) => (
            <Star size={size * 1.15} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="article/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="event/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings/account"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings/interface"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings/alerts"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings/billing"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings/feedback"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings/support"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings/privacy"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings/feedback-feature"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings/feedback-bug"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings/feedback-ai"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

function AppWithBanners() {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const { getActiveBanners, dismissBanner, setHighlightedAlert, state } = useNewsStore();
  const activeBanners = getActiveBanners();
  const headerHeight = Platform.select({ web: 64, default: 56 });
  
  const currentPath = `/${segments.join('/')}`;
  const isSettingsRoute = currentPath.startsWith('/settings');
  
  const handleBannerNavigate = (alertId: string) => {
    if (setHighlightedAlert) {
      setHighlightedAlert(alertId);
    }
  };
  
  const handleTickerPress = (ticker: string) => {
    console.log('[AppWithBanners] Ticker pressed:', ticker);
  };
  
  return (
    <>
      {!isSettingsRoute && (
        <View style={[styles.fixedHeader, { paddingTop: insets.top, height: headerHeight + insets.top }]}>
          <AlertSearchBar 
            onTickerPress={handleTickerPress}
            feedItems={state.feedItems}
          />
        </View>
      )}
      <RootLayoutNav />
      <DropBanner 
        alerts={activeBanners} 
        onDismiss={dismissBanner} 
        onNavigate={handleBannerNavigate}
      />
    </>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('SplashScreen hide error:', e);
      } finally {
        setIsReady(true);
      }
    };

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NewsStoreProvider>
          <GestureHandlerRootView style={styles.container}>
            <AppWithBanners />
          </GestureHandlerRootView>
        </NewsStoreProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#000000',
  },
});
