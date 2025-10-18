// template
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tabs, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, Text, View, Platform } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { Newspaper, Calendar, Zap, Star } from "lucide-react-native";
import { theme } from "../constants/theme";
import { NewsStoreProvider, useNewsStore } from "../store/newsStore";
import { DropdownProvider } from "../store/dropdownStore";
import DropBanner from "../components/DropBanner";
import AlertSearchBar from "../components/AlertSearchBar";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const insets = useSafeAreaInsets();
  
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
        name="company/[ticker]"
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
      <Tabs.Screen
        name="settings/delete-account"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings/delete-account-confirm"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings/delete-account-success"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="auth/login"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="auth/signup"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings/in-app-notifications"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings/push-notifications"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings/manage-billing"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="twitter-waitlist"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

function AppWithBanners() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const { getActiveBanners, dismissBanner, setHighlightedAlert, state } = useNewsStore();
  const activeBanners = getActiveBanners();
  const headerHeight = Platform.select({ web: 64, default: 56 });
  
  const currentPath = `/${segments.join('/')}`;
  const isSettingsRoute = currentPath.startsWith('/settings');
  const isAuthRoute = currentPath.startsWith('/auth');
  const isSearchRoute = currentPath === '/search';
  
  const handleBannerNavigate = (alertId: string) => {
    if (setHighlightedAlert) {
      setHighlightedAlert(alertId);
    }
  };
  
  const handleTickerPress = (ticker: string) => {
    console.log('[AppWithBanners] Ticker pressed:', ticker);
    const tickerUpper = ticker.toUpperCase();
    router.push(`/company/${tickerUpper}` as any);
  };
  
  return (
    <>
      {!isSettingsRoute && !isAuthRoute && !isSearchRoute && (
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
  useEffect(() => {
    const prepare = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('SplashScreen hide error:', e);
      }
    };

    prepare();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NewsStoreProvider>
          <DropdownProvider>
            <GestureHandlerRootView style={styles.container}>
              <AppWithBanners />
            </GestureHandlerRootView>
          </DropdownProvider>
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
