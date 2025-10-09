import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu, Search, User } from 'lucide-react-native';

export default function TerminalHeader() {
  const insets = useSafeAreaInsets();

  const headerHeight = Platform.select({
    web: typeof window !== 'undefined' && window.innerWidth >= 768 ? 72 : 56,
    default: 56,
  });

  return (
    <View
      style={[
        styles.headerWrapper,
        {
          height: headerHeight,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.leftGroup}>
        <TouchableOpacity
          style={styles.actionButton}
          accessibilityLabel="Menu"
          activeOpacity={0.7}
        >
          <Menu size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/logoHero.png')}
          style={styles.logo}
          resizeMode="contain"
          alt="Insider Vega logo"
        />
      </View>

      <View style={styles.rightGroup}>
        <TouchableOpacity
          style={styles.actionButton}
          accessibilityLabel="Search"
          activeOpacity={0.7}
        >
          <Search size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          accessibilityLabel="Profile"
          activeOpacity={0.7}
        >
          <User size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    position: 'relative',
    width: '100%',
    backgroundColor: 'rgba(11, 11, 12, 0.9)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      },
      default: {},
    }),
  },
  leftGroup: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 20,
  },
  rightGroup: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 20,
  },
  logoContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    transform: [{ translateX: '-50%' }],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    pointerEvents: 'none',
  },
  logo: {
    height: '100%',
    width: 'auto',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
