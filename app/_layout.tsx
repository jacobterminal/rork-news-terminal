// template
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tabs } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, Text } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { Newspaper, Calendar, Zap, Star } from "lucide-react-native";
import { theme } from "../constants/theme";
import { NewsStoreProvider, useNewsStore } from "../store/newsStore";
import DropBanner from "../components/DropBanner";

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
    </Tabs>
  );
}

function AppWithBanners() {
  const { getActiveBanners, dismissBanner, setHighlightedAlert } = useNewsStore();
  const activeBanners = getActiveBanners();
  
  const handleBannerNavigate = (alertId: string) => {
    // Set the alert to be highlighted in the Instant tab
    if (setHighlightedAlert) {
      setHighlightedAlert(alertId);
    }
  };
  
  return (
    <>
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
});
