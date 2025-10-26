import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useNewsStore } from '../store/newsStore';

interface WatchlistFolderPickerProps {
  symbol: string;
}

export default function WatchlistFolderPicker({ symbol }: WatchlistFolderPickerProps) {
  const [open, setOpen] = useState(false);
  const { state, addTickerToFolder, removeTickerFromFolder } = useNewsStore();

  const folders = state.watchlistFolders || [];
  
  const foldersWithStatus = folders.map(folder => ({
    id: folder.id,
    name: folder.name,
    contains: folder.tickers.includes(symbol),
  }));
  
  const toggleFolder = (folderId: string) => {
    const folder = foldersWithStatus.find(f => f.id === folderId);
    if (!folder) return;
    
    if (folder.contains) {
      removeTickerFromFolder(folderId, symbol);
    } else {
      addTickerToFolder(folderId, symbol);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={styles.addButton}
        activeOpacity={0.7}
      >
        <Text style={styles.addButtonText}>＋</Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setOpen(false)}
          />
          <View style={styles.sheetContainer}>
            <Text style={styles.sheetTitle}>Add {symbol} to folders</Text>
            <FlatList
              data={foldersWithStatus}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => toggleFolder(item.id)}
                  style={styles.folderRow}
                  activeOpacity={0.7}
                >
                  <Text style={styles.folderName}>{item.name}</Text>
                  <Text style={[
                    styles.folderStatus,
                    item.contains && styles.folderStatusAdded
                  ]}>
                    {item.contains ? 'Added' : 'Add'}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No folders yet. Create one in Watchlist ▸ manager (⋯).
                </Text>
              }
            />
            <TouchableOpacity
              onPress={() => setOpen(false)}
              style={styles.doneButton}
              activeOpacity={0.7}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  addButton: {
    borderWidth: 1,
    borderColor: '#E7C15F',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: '#E7C15F',
    fontWeight: '800' as const,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheetContainer: {
    backgroundColor: '#0B0B0B',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#3a2f14',
    maxHeight: '70%',
  },
  sheetTitle: {
    color: '#E7C15F',
    fontWeight: '700' as const,
    marginBottom: 8,
    fontSize: 16,
  },
  folderRow: {
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  folderName: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  folderStatus: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  folderStatusAdded: {
    color: '#8DD48C',
  },
  emptyText: {
    color: '#9aa0a6',
    paddingVertical: 8,
    fontSize: 13,
  },
  doneButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  doneButtonText: {
    color: '#E7C15F',
    fontSize: 15,
    fontWeight: '600' as const,
  },
});
