import React from 'react';
import { View, StyleSheet, Image, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, User } from 'lucide-react-native';

export default function FixedHeader() {
  const insets = useSafeAreaInsets();

  const headerHeight = Platform.select({
    web: 72,
    default: 56,
  }) as number;

  return (
    <View 
      style={[
        styles.header, 
        { 
          height: headerHeight + insets.top,
          paddingTop: insets.top,
        }
      ]}
    >
      <View style={styles.leftGroup}>
        <Pressable 
          style={styles.actionButton}
          accessibilityLabel="Menu"
          onPress={() => console.log('Menu pressed')}
        >
          <View style={styles.menuIcon}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </View>
        </Pressable>
      </View>

      <View style={[styles.logoContainer, { height: headerHeight }]}>
        <Image
          source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/m8zj1f0s5gbesnifa0lun' }}
          style={styles.logo}
          resizeMode="contain"
          alt="Insider Vega logo"
        />
      </View>

      <View style={styles.rightGroup}>
        <Pressable 
          style={styles.actionButton}
          accessibilityLabel="Search"
          onPress={() => console.log('Search pressed')}
        >
          <Search size={20} color="#FFFFFF" />
        </Pressable>
        <Pressable 
          style={styles.actionButton}
          accessibilityLabel="Profile"
          onPress={() => console.log('Profile pressed')}
        >
          <User size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'relative',
    width: '100%',
    backgroundColor: 'rgba(11, 11, 12, 0.9)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(10px)',
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
    width: undefined,
    aspectRatio: 1920 / 200,
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
  menuIcon: {
    width: 18,
    height: 14,
    justifyContent: 'space-between',
  },
  menuLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
});
