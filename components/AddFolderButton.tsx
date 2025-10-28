import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Plus, X } from 'lucide-react-native';
import { BRAND_GOLD } from '@/constants/colors';

interface AddFolderButtonProps {
  onCreateFolder: (name: string) => void;
}

export default function AddFolderButton({ onCreateFolder }: AddFolderButtonProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [folderName, setFolderName] = useState('');

  const handleCreate = () => {
    if (folderName.trim()) {
      onCreateFolder(folderName.trim());
      setFolderName('');
      setModalVisible(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Plus size={20} color={BRAND_GOLD} />
        <Text style={styles.addButtonText}>Add Folder</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputTitle}>Create New Folder</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color="#9FA6B2" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.textInput}
              value={folderName}
              onChangeText={setFolderName}
              placeholder="Enter folder name"
              placeholderTextColor="#555A64"
              autoFocus
            />
            
            <View style={styles.inputButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={handleCreate}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0C0C0E',
    borderWidth: 2,
    borderColor: BRAND_GOLD,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    gap: 8,
  },
  addButtonText: {
    color: BRAND_GOLD,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    backgroundColor: '#0C0C0E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F1F23',
    width: '90%',
    maxWidth: 400,
    padding: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputTitle: {
    color: '#E6E6E6',
    fontSize: 16,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#1F1F23',
    borderRadius: 8,
    padding: 12,
    color: '#E6E6E6',
    fontSize: 14,
    marginBottom: 20,
  },
  inputButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#1F1F23',
  },
  createButton: {
    backgroundColor: BRAND_GOLD,
  },
  cancelButtonText: {
    color: '#9FA6B2',
    fontSize: 14,
    fontWeight: '600',
  },
  createButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
});