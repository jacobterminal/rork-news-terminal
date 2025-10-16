import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { X, Plus, Trash2, Search } from 'lucide-react-native';
import { useDropdown } from '../store/dropdownStore';

interface ManageTickersModalProps {
  visible: boolean;
  folderName: string;
  currentTickers: string[];
  allAvailableTickers: string[];
  onClose: () => void;
  onSave: (tickers: string[]) => void;
}

export default function ManageTickersModal({
  visible,
  folderName,
  currentTickers,
  allAvailableTickers,
  onClose,
  onSave,
}: ManageTickersModalProps) {
  const { registerDropdown, shouldCloseDropdown } = useDropdown();
  const dropdownId = 'manage-tickers-modal';
  const [selectedTickers, setSelectedTickers] = useState<Set<string>>(new Set(currentTickers));
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    registerDropdown(dropdownId, visible);
  }, [visible, registerDropdown, dropdownId]);

  useEffect(() => {
    if (shouldCloseDropdown(dropdownId)) {
      onClose();
    }
  }, [shouldCloseDropdown, dropdownId, onClose]);

  useEffect(() => {
    if (visible) {
      setSelectedTickers(new Set(currentTickers));
      setSearchQuery('');
    }
  }, [visible, currentTickers]);

  const handleToggleTicker = (ticker: string) => {
    const newSelected = new Set(selectedTickers);
    if (newSelected.has(ticker)) {
      newSelected.delete(ticker);
    } else {
      newSelected.add(ticker);
    }
    setSelectedTickers(newSelected);
  };

  const handleSave = () => {
    onSave(Array.from(selectedTickers));
    onClose();
  };

  const filteredTickers = allAvailableTickers.filter(ticker =>
    ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addedCount = selectedTickers.size;
  const removedCount = currentTickers.filter(t => !selectedTickers.has(t)).length;

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
        <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Manage Tickers</Text>
              <Text style={styles.headerSubtitle}>{folderName}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search size={16} color="#555A64" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tickers..."
              placeholderTextColor="#555A64"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="characters"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color="#555A64" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.statsBar}>
            <Text style={styles.statsText}>
              {selectedTickers.size} selected
            </Text>
            {(addedCount !== currentTickers.length || removedCount > 0) && (
              <Text style={styles.changesText}>
                {removedCount > 0 && `${removedCount} removed`}
              </Text>
            )}
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {filteredTickers.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No tickers found</Text>
              </View>
            ) : (
              filteredTickers.map(ticker => {
                const isSelected = selectedTickers.has(ticker);
                const wasOriginal = currentTickers.includes(ticker);
                
                return (
                  <TouchableOpacity
                    key={ticker}
                    style={[
                      styles.tickerItem,
                      isSelected && styles.tickerItemSelected,
                    ]}
                    onPress={() => handleToggleTicker(ticker)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.tickerChip}>
                      <Text style={[styles.tickerText, isSelected && styles.tickerTextSelected]}>
                        {ticker}
                      </Text>
                    </View>
                    
                    <View style={styles.tickerActions}>
                      {!wasOriginal && isSelected && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>NEW</Text>
                        </View>
                      )}
                      {wasOriginal && !isSelected && (
                        <View style={[styles.badge, styles.badgeRemove]}>
                          <Text style={styles.badgeText}>REMOVE</Text>
                        </View>
                      )}
                      {isSelected ? (
                        <View style={styles.actionButton}>
                          <Trash2 size={16} color="#FF4444" />
                        </View>
                      ) : (
                        <View style={styles.actionButton}>
                          <Plus size={16} color="#00FF66" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.7}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
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
  modalContainer: {
    backgroundColor: '#000000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#FFD75A',
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  headerSubtitle: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C0C0E',
    borderWidth: 1,
    borderColor: '#1F1F23',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  statsText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  changesText: {
    fontSize: 12,
    color: '#FF4444',
    fontWeight: '500',
  },
  content: {
    maxHeight: 400,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#555A64',
  },
  tickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F23',
  },
  tickerItemSelected: {
    backgroundColor: 'rgba(255, 215, 90, 0.05)',
  },
  tickerChip: {
    backgroundColor: '#1F1F23',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tickerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tickerTextSelected: {
    color: '#FFD75A',
    fontWeight: '700',
  },
  tickerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#00FF6620',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeRemove: {
    backgroundColor: '#FF444420',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#00FF66',
  },
  actionButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1F1F23',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#1F1F23',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FFD75A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
});
