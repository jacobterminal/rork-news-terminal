import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Pressable,
} from 'react-native';
import { MoreVertical, X } from 'lucide-react-native';
import { useDropdown } from '../store/dropdownStore';

interface WatchlistConfigMenuProps {
  onCreateFolder: () => void;
  onEditName: () => void;
  onConfigureOrder: () => void;
  onManageTickers: () => void;
}

export default function WatchlistConfigMenu({
  onCreateFolder,
  onEditName,
  onConfigureOrder,
  onManageTickers,
}: WatchlistConfigMenuProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const { registerDropdown, shouldCloseDropdown } = useDropdown();
  const dropdownId = 'watchlist-config-menu';

  useEffect(() => {
    registerDropdown(dropdownId, menuVisible);
  }, [menuVisible, registerDropdown]);

  useEffect(() => {
    if (shouldCloseDropdown(dropdownId)) {
      setMenuVisible(false);
    }
  }, [shouldCloseDropdown]);

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setMenuVisible(false);
    });
  };

  const handleMenuItemPress = (action: () => void) => {
    closeMenu();
    setTimeout(() => {
      action();
    }, 250);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={openMenu}
        activeOpacity={0.7}
      >
        <MoreVertical size={20} color="#FFD75A" />
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.backdrop} onPress={closeMenu}>
          <Animated.View
            style={[
              styles.menuContainer,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.menu}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>WATCHLIST OPTIONS</Text>
                <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
                  <X size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuItemPress(onCreateFolder)}
                activeOpacity={0.7}
              >
                <Text style={styles.menuItemText}>Create New Watchlist Folder</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuItemPress(onEditName)}
                activeOpacity={0.7}
              >
                <Text style={styles.menuItemText}>Edit Watchlist Name</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuItemPress(onConfigureOrder)}
                activeOpacity={0.7}
              >
                <Text style={styles.menuItemText}>Configure Ticker Order</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuItemPress(onManageTickers)}
                activeOpacity={0.7}
              >
                <Text style={styles.menuItemText}>Add or Remove Tickers</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    padding: 8,
    borderRadius: 6,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: '85%',
    maxWidth: 360,
  },
  menu: {
    backgroundColor: '#000000',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD75A',
    overflow: 'hidden',
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#FFD75A',
  },
  menuTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFD75A',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 4,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  menuItemText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#1A1A1A',
    marginHorizontal: 16,
  },
});
