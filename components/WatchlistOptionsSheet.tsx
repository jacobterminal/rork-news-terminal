import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { FolderPlus, Edit3, ArrowUpDown, ListPlus, Trash2 } from 'lucide-react-native';
import { useDropdown } from '../store/dropdownStore';

interface WatchlistOptionsSheetProps {
  visible: boolean;
  folderName: string;
  onClose: () => void;
  onCreateFolder: () => void;
  onRenameFolder: () => void;
  onConfigureOrder: () => void;
  onManageTickers: () => void;
  onDeleteFolder: () => void;
}

export default function WatchlistOptionsSheet({
  visible,
  folderName,
  onClose,
  onCreateFolder,
  onRenameFolder,
  onConfigureOrder,
  onManageTickers,
  onDeleteFolder,
}: WatchlistOptionsSheetProps) {
  const { registerDropdown, shouldCloseDropdown } = useDropdown();
  const dropdownId = 'watchlist-options-sheet';

  useEffect(() => {
    registerDropdown(dropdownId, visible);
  }, [visible, registerDropdown, dropdownId]);

  useEffect(() => {
    if (shouldCloseDropdown(dropdownId)) {
      onClose();
    }
  }, [shouldCloseDropdown, dropdownId, onClose]);

  const handleOptionPress = (action: () => void) => {
    onClose();
    setTimeout(action, 100);
  };

  const options = [
    {
      icon: FolderPlus,
      label: 'Create New Watchlist Folder',
      onPress: () => handleOptionPress(onCreateFolder),
      color: '#FFD75A',
    },
    {
      icon: Edit3,
      label: 'Edit Watchlist Name',
      subtitle: `Rename "${folderName}"`,
      onPress: () => handleOptionPress(onRenameFolder),
      color: '#00FF66',
    },
    {
      icon: ArrowUpDown,
      label: 'Configure Ticker Order',
      subtitle: 'Reorder tickers in this folder',
      onPress: () => handleOptionPress(onConfigureOrder),
      color: '#00D4FF',
    },
    {
      icon: ListPlus,
      label: 'Add or Remove Tickers',
      subtitle: 'Manage tickers in this folder',
      onPress: () => handleOptionPress(onManageTickers),
      color: '#FFFFFF',
    },
    {
      icon: Trash2,
      label: 'Delete This Folder',
      subtitle: `Delete "${folderName}"`,
      onPress: () => handleOptionPress(onDeleteFolder),
      color: '#FF4444',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.sheetContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Watchlist Options</Text>
          </View>

          <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
            {options.map((option, index) => {
              const Icon = option.icon;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.optionItem}
                  onPress={option.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconContainer, { backgroundColor: option.color + '20' }]}>
                    <Icon size={20} color={option.color} />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionLabel, { color: option.color }]}>
                      {option.label}
                    </Text>
                    {option.subtitle && (
                      <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#000000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#FFD75A',
    maxHeight: '70%',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F23',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD75A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionsList: {
    paddingVertical: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F23',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
});
