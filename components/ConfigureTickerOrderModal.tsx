import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Pressable,
  ScrollView,
} from 'react-native';
import { X, GripVertical } from 'lucide-react-native';

interface ConfigureTickerOrderModalProps {
  visible: boolean;
  tickers: string[];
  onClose: () => void;
  onSave: (newOrder: string[]) => void;
  onSuccess?: () => void;
}

export default function ConfigureTickerOrderModal({
  visible,
  tickers,
  onClose,
  onSave,
  onSuccess,
}: ConfigureTickerOrderModalProps) {
  const [orderedTickers, setOrderedTickers] = useState<string[]>(tickers);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      setOrderedTickers([...tickers]);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, tickers]);

  const handleSave = () => {
    onSave(orderedTickers);
    onClose();
    if (onSuccess) {
      setTimeout(() => onSuccess(), 100);
    }
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

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          style={[
            styles.modalContainer,
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
          <Pressable>
            <View style={styles.modal}>
              <View style={styles.header}>
                <Text style={styles.title}>CONFIGURE TICKER ORDER</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                <Text style={styles.instruction}>
                  Tap the arrows to reorder your tickers
                </Text>
                <ScrollView style={styles.tickerList} showsVerticalScrollIndicator={false}>
                  {orderedTickers.map((ticker, index) => (
                    <View key={ticker} style={styles.tickerRow}>
                      <View style={styles.tickerInfo}>
                        <GripVertical size={18} color="#555A64" />
                        <Text style={styles.tickerText}>{ticker}</Text>
                      </View>
                      <View style={styles.controlButtons}>
                        <TouchableOpacity
                          style={[styles.arrowButton, index === 0 && styles.arrowButtonDisabled]}
                          onPress={() => moveTickerUp(index)}
                          disabled={index === 0}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.arrowText, index === 0 && styles.arrowTextDisabled]}>
                            ↑
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.arrowButton,
                            index === orderedTickers.length - 1 && styles.arrowButtonDisabled,
                          ]}
                          onPress={() => moveTickerDown(index)}
                          disabled={index === orderedTickers.length - 1}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.arrowText,
                              index === orderedTickers.length - 1 && styles.arrowTextDisabled,
                            ]}
                          >
                            ↓
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveButtonText}>Save Order</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modal: {
    backgroundColor: '#000000',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD75A',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFD75A',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFD75A',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  instruction: {
    fontSize: 12,
    color: '#BFBFBF',
    marginBottom: 16,
  },
  tickerList: {
    maxHeight: 400,
  },
  tickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  tickerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tickerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  arrowButton: {
    width: 32,
    height: 32,
    backgroundColor: '#FFD75A',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowButtonDisabled: {
    backgroundColor: '#2A2A2A',
  },
  arrowText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  arrowTextDisabled: {
    color: '#555A64',
  },
  footer: {
    padding: 20,
    paddingTop: 0,
  },
  saveButton: {
    backgroundColor: '#FFD75A',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#FFD75A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
});
