import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { X } from 'lucide-react-native';
import { useDropdown } from '../store/dropdownStore';

interface CreateFolderModalProps {
  visible: boolean;
  mode: 'create' | 'rename';
  initialName?: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export default function CreateFolderModal({
  visible,
  mode,
  initialName = '',
  onClose,
  onSubmit,
}: CreateFolderModalProps) {
  const { registerDropdown, shouldCloseDropdown } = useDropdown();
  const dropdownId = 'create-folder-modal';
  const [name, setName] = useState(initialName);

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
      setName(initialName);
    }
  }, [visible, initialName]);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      Alert.alert('Error', 'Folder name cannot be empty');
      return;
    }
    
    if (trimmedName.length > 50) {
      Alert.alert('Error', 'Folder name must be 50 characters or less');
      return;
    }
    
    onSubmit(trimmedName);
    onClose();
    setName('');
  };

  const title = mode === 'create' ? 'Create New Folder' : 'Rename Folder';
  const placeholder = 'Enter folder name';
  const submitLabel = mode === 'create' ? 'Create' : 'Save';

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
        <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor="#555A64"
              value={name}
              onChangeText={setName}
              autoFocus
              maxLength={50}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
            <Text style={styles.characterCount}>{name.length}/50</Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, !name.trim() && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.7}
              disabled={!name.trim()}
            >
              <Text style={styles.submitButtonText}>{submitLabel}</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#000000',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD75A',
    width: '100%',
    maxWidth: 400,
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
    padding: 20,
  },
  input: {
    backgroundColor: '#0C0C0E',
    borderWidth: 1,
    borderColor: '#1F1F23',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  characterCount: {
    fontSize: 11,
    color: '#555A64',
    textAlign: 'right',
    marginTop: 6,
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
  submitButton: {
    flex: 1,
    backgroundColor: '#FFD75A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#555A64',
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
});
