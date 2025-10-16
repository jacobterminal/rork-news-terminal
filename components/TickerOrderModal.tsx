import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { GripVertical, X } from 'lucide-react-native';
import { useDropdown } from '../store/dropdownStore';

interface TickerOrderModalProps {
  visible: boolean;
  tickers: string[];
  onClose: () => void;
  onSave: (newOrder: string[]) => void;
}

export default function TickerOrderModal({
  visible,
  tickers,
  onClose,
  onSave,
}: TickerOrderModalProps) {
  const { registerDropdown, shouldCloseDropdown } = useDropdown();
  const dropdownId = 'ticker-order-modal';
  const [orderedTickers, setOrderedTickers] = useState<string[]>(tickers);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

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
      setOrderedTickers(tickers);
    }
  }, [visible, tickers]);

  const handleSave = () => {
    onSave(orderedTickers);
    onClose();
  };

  const moveTickerUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...orderedTickers];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setOrderedTickers(newOrder);
  };

  const moveTickerDown = (index: number) => {
    if (index === orderedTickers.length - 1) return;
    const newOrder = [...orderedTickers];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setOrderedTickers(newOrder);
  };

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
            <Text style={styles.headerTitle}>Configure Ticker Order</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {orderedTickers.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No tickers to reorder</Text>
              </View>
            ) : (
              orderedTickers.map((ticker, index) => (
                <View
                  key={ticker}
                  style={[
                    styles.tickerItem,
                    draggingIndex === index && styles.tickerItemDragging,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.dragHandle}
                    onPressIn={() => setDraggingIndex(index)}
                    onPressOut={() => setDraggingIndex(null)}
                    activeOpacity={0.7}
                  >
                    <GripVertical size={20} color="#555A64" />
                  </TouchableOpacity>
                  
                  <View style={styles.tickerChip}>
                    <Text style={styles.tickerText}>{ticker}</Text>
                  </View>
                  
                  <View style={styles.arrowButtons}>
                    <TouchableOpacity
                      style={[styles.arrowButton, index === 0 && styles.arrowButtonDisabled]}
                      onPress={() => moveTickerUp(index)}
                      disabled={index === 0}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.arrowText}>↑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.arrowButton, index === orderedTickers.length - 1 && styles.arrowButtonDisabled]}
                      onPress={() => moveTickerDown(index)}
                      disabled={index === orderedTickers.length - 1}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.arrowText}>↓</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {orderedTickers.length > 0 && (
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
                <Text style={styles.saveButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
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
    maxHeight: '80%',
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
  closeButton: {
    padding: 4,
  },
  content: {
    maxHeight: 400,
    paddingVertical: 8,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F23',
  },
  tickerItemDragging: {
    backgroundColor: 'rgba(255, 215, 90, 0.1)',
  },
  dragHandle: {
    padding: 8,
    marginRight: 8,
  },
  tickerChip: {
    backgroundColor: '#FFD75A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
  },
  tickerText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  arrowButtons: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 12,
  },
  arrowButton: {
    backgroundColor: '#1F1F23',
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowButtonDisabled: {
    opacity: 0.3,
  },
  arrowText: {
    fontSize: 18,
    color: '#FFD75A',
    fontWeight: '700',
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
