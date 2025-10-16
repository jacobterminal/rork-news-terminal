import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
  Pressable,
  Alert,
} from 'react-native';
import { X } from 'lucide-react-native';

interface CreateWatchlistModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export default function CreateWatchlistModal({
  visible,
  onClose,
  onSubmit,
}: CreateWatchlistModalProps) {
  const [folderName, setFolderName] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];

  React.useEffect(() => {
    if (visible) {
      setFolderName('');
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
  }, [visible]);

  const handleSubmit = () => {
    if (!folderName.trim()) {
      Alert.alert('Error', 'Please enter a watchlist name');
      return;
    }
    onSubmit(folderName.trim());
    onClose();
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
                <Text style={styles.title}>CREATE WATCHLIST</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                <Text style={styles.label}>Enter watchlist name</Text>
                <TextInput
                  style={styles.input}
                  value={folderName}
                  onChangeText={setFolderName}
                  placeholder="e.g., Tech Stocks"
                  placeholderTextColor="#555A64"
                  autoFocus
                />
              </View>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleSubmit}
                  activeOpacity={0.8}
                >
                  <Text style={styles.createButtonText}>Create</Text>
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
    fontSize: 14,
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
  label: {
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 12,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#FFFFFF',
  },
  footer: {
    padding: 20,
    paddingTop: 0,
  },
  createButton: {
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
  createButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
});
