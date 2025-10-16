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
  Alert,
} from 'react-native';
import { X } from 'lucide-react-native';

interface EditWatchlistNameModalProps {
  visible: boolean;
  currentName: string;
  onClose: () => void;
  onSubmit: (newName: string) => void;
  onSuccess?: () => void;
}

export default function EditWatchlistNameModal({
  visible,
  currentName,
  onClose,
  onSubmit,
  onSuccess,
}: EditWatchlistNameModalProps) {
  const [folderName, setFolderName] = useState(currentName);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      setFolderName(currentName);
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
  }, [visible, currentName]);

  const handleSubmit = () => {
    if (!folderName.trim()) {
      Alert.alert('Error', 'Please enter a watchlist name');
      return;
    }
    onSubmit(folderName.trim());
    onClose();
    if (onSuccess) {
      setTimeout(() => onSuccess(), 100);
    }
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
                <Text style={styles.title}>EDIT WATCHLIST NAME</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                <Text style={styles.label}>Watchlist name</Text>
                <TextInput
                  style={styles.input}
                  value={folderName}
                  onChangeText={setFolderName}
                  placeholder="Enter new name"
                  placeholderTextColor="#555A64"
                  autoFocus
                />
              </View>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSubmit}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
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
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 0,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    flex: 1,
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
