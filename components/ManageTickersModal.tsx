import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
  Pressable,
  ScrollView,
} from 'react-native';
import { X, Plus, Minus, Search } from 'lucide-react-native';

interface ManageTickersModalProps {
  visible: boolean;
  currentTickers: string[];
  onClose: () => void;
  onSave: (tickers: string[]) => void;
  onSuccess?: () => void;
}

const AVAILABLE_TICKERS = [
  'AAPL',
  'NVDA',
  'TSLA',
  'MSFT',
  'GOOGL',
  'META',
  'AMZN',
  'JPM',
  'BAC',
  'WMT',
  'AMD',
  'NFLX',
  'INTC',
  'DIS',
  'COIN',
  'PLTR',
  'RIOT',
  'MARA',
  'HOOD',
  'SQ',
];

export default function ManageTickersModal({
  visible,
  currentTickers,
  onClose,
  onSave,
  onSuccess,
}: ManageTickersModalProps) {
  const [tickers, setTickers] = useState<string[]>(currentTickers);
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      setTickers([...currentTickers]);
      setSearchQuery('');
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
  }, [visible, currentTickers]);

  const handleSave = () => {
    onSave(tickers);
    onClose();
    if (onSuccess) {
      setTimeout(() => onSuccess(), 100);
    }
  };

  const addTicker = (ticker: string) => {
    if (!tickers.includes(ticker)) {
      setTickers([...tickers, ticker]);
    }
  };

  const removeTicker = (ticker: string) => {
    setTickers(tickers.filter(t => t !== ticker));
  };

  const filteredAvailableTickers = AVAILABLE_TICKERS.filter(
    ticker =>
      !tickers.includes(ticker) &&
      ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <Text style={styles.title}>ADD OR REMOVE TICKERS</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>CURRENT TICKERS</Text>
                  <ScrollView style={styles.tickerListCurrent} showsVerticalScrollIndicator={false}>
                    {tickers.length === 0 ? (
                      <Text style={styles.emptyText}>No tickers added yet</Text>
                    ) : (
                      tickers.map(ticker => (
                        <View key={ticker} style={styles.tickerRow}>
                          <Text style={styles.tickerText}>{ticker}</Text>
                          <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => removeTicker(ticker)}
                            activeOpacity={0.7}
                          >
                            <Minus size={16} color="#FF4444" />
                          </TouchableOpacity>
                        </View>
                      ))
                    )}
                  </ScrollView>
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>ADD TICKER</Text>
                  <View style={styles.searchContainer}>
                    <Search size={16} color="#555A64" />
                    <TextInput
                      style={styles.searchInput}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="Search for ticker..."
                      placeholderTextColor="#555A64"
                    />
                  </View>
                  <ScrollView style={styles.tickerListAdd} showsVerticalScrollIndicator={false}>
                    {filteredAvailableTickers.length === 0 ? (
                      <Text style={styles.emptyText}>
                        {searchQuery ? 'No tickers found' : 'All tickers added'}
                      </Text>
                    ) : (
                      filteredAvailableTickers.map(ticker => (
                        <View key={ticker} style={styles.tickerRow}>
                          <Text style={styles.tickerText}>{ticker}</Text>
                          <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => addTicker(ticker)}
                            activeOpacity={0.7}
                          >
                            <Plus size={16} color="#00FF5A" />
                          </TouchableOpacity>
                        </View>
                      ))
                    )}
                  </ScrollView>
                </View>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
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
    width: '90%',
    maxWidth: 450,
    maxHeight: '85%',
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
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD75A',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  tickerListCurrent: {
    maxHeight: 150,
  },
  tickerListAdd: {
    maxHeight: 200,
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
  tickerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  removeButton: {
    width: 28,
    height: 28,
    backgroundColor: '#2A1A1A',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 28,
    height: 28,
    backgroundColor: '#1A2A1A',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#555A64',
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
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
