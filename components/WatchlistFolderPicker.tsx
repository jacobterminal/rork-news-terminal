import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Plus, Folder as FolderIcon } from 'lucide-react-native';
import { useDropdown } from '../store/dropdownStore';

interface Folder {
  id: string;
  name: string;
  tickerCount: number;
}

interface WatchlistFolderPickerProps {
  visible: boolean;
  folders: Folder[];
  activeFolderId: string | null;
  onSelectFolder: (folderId: string) => void;
  onCreateFolder: () => void;
  onClose: () => void;
}

export default function WatchlistFolderPicker({
  visible,
  folders,
  activeFolderId,
  onSelectFolder,
  onCreateFolder,
  onClose,
}: WatchlistFolderPickerProps) {
  const { registerDropdown, shouldCloseDropdown } = useDropdown();
  const dropdownId = 'watchlist-folder-picker';

  useEffect(() => {
    registerDropdown(dropdownId, visible);
  }, [visible, registerDropdown, dropdownId]);

  useEffect(() => {
    if (shouldCloseDropdown(dropdownId)) {
      onClose();
    }
  }, [shouldCloseDropdown, dropdownId, onClose]);

  const handleSelectFolder = (folderId: string) => {
    onSelectFolder(folderId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.sheetContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select Folder</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => {
                onClose();
                onCreateFolder();
              }}
              activeOpacity={0.7}
            >
              <Plus size={16} color="#FFD75A" />
              <Text style={styles.createButtonText}>New Folder</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.folderList} showsVerticalScrollIndicator={false}>
            {folders.map(folder => {
              const isActive = folder.id === activeFolderId;
              return (
                <TouchableOpacity
                  key={folder.id}
                  style={[styles.folderItem, isActive && styles.folderItemActive]}
                  onPress={() => handleSelectFolder(folder.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.folderLeft}>
                    <FolderIcon 
                      size={18} 
                      color={isActive ? '#FFD75A' : '#FFFFFF'} 
                      fill={isActive ? '#FFD75A' : 'transparent'}
                    />
                    <Text style={[styles.folderName, isActive && styles.folderNameActive]}>
                      {folder.name}
                    </Text>
                  </View>
                  <View style={styles.folderBadge}>
                    <Text style={styles.folderBadgeText}>{folder.tickerCount}</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sheetContainer: {
    backgroundColor: '#000000',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD75A',
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F23',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD75A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  createButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFD75A',
  },
  folderList: {
    maxHeight: 400,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F23',
  },
  folderItemActive: {
    backgroundColor: 'rgba(255, 215, 90, 0.1)',
  },
  folderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  folderName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  folderNameActive: {
    color: '#FFD75A',
    fontWeight: '700',
  },
  folderBadge: {
    backgroundColor: '#1F1F23',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    minWidth: 28,
    alignItems: 'center',
  },
  folderBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
