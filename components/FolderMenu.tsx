import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { MoreHorizontal, Plus, Edit3, Trash2, X } from 'lucide-react-native';

interface FolderMenuProps {
  folderId: string;
  folderName: string;
  onAddTicker: (folderId: string, ticker: string) => void;
  onRemoveTicker: (folderId: string, ticker: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onCreateFolder: (name: string) => void;
  availableTickers: string[];
  folderTickers: string[];
}

export default function FolderMenu({
  folderId,
  folderName,
  onAddTicker,
  onRemoveTicker,
  onRenameFolder,
  onDeleteFolder,
  onCreateFolder,
  availableTickers,
  folderTickers,
}: FolderMenuProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [addTickerVisible, setAddTickerVisible] = useState(false);
  const [removeTickerVisible, setRemoveTickerVisible] = useState(false);
  const [renameVisible, setRenameVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [createFolderVisible, setCreateFolderVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState(folderName);
  const [newTicker, setNewTicker] = useState('');
  const [newFolderNameInput, setNewFolderNameInput] = useState('');

  const handleRename = () => {
    if (newFolderName.trim() && newFolderName.trim() !== folderName) {
      onRenameFolder(folderId, newFolderName.trim());
    }
    setRenameVisible(false);
    setMenuVisible(false);
  };

  const handleDelete = () => {
    setDeleteConfirmVisible(true);
    setMenuVisible(false);
  };

  const confirmDelete = () => {
    onDeleteFolder(folderId);
    setDeleteConfirmVisible(false);
  };

  const handleAddTicker = () => {
    if (newTicker.trim() && !folderTickers.includes(newTicker.trim().toUpperCase())) {
      onAddTicker(folderId, newTicker.trim().toUpperCase());
      setNewTicker('');
    }
    setAddTickerVisible(false);
    setMenuVisible(false);
  };
  
  const handleCreateFolder = () => {
    if (newFolderNameInput.trim()) {
      onCreateFolder(newFolderNameInput.trim());
      setNewFolderNameInput('');
    }
    setCreateFolderVisible(false);
    setMenuVisible(false);
  };

  const handleRemoveTicker = (ticker: string) => {
    if (!ticker?.trim() || ticker.length > 20) return;
    const sanitizedTicker = ticker.trim();
    onRemoveTicker(folderId, sanitizedTicker);
    setRemoveTickerVisible(false);
    setMenuVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setMenuVisible(true)}
        activeOpacity={0.7}
      >
        <MoreHorizontal size={16} color="#9FA6B2" />
      </TouchableOpacity>

      {/* Main Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setCreateFolderVisible(true);
                setMenuVisible(false);
              }}
            >
              <Plus size={16} color="#E6E6E6" />
              <Text style={styles.menuText}>Add Folder</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setAddTickerVisible(true);
                setMenuVisible(false);
              }}
            >
              <Plus size={16} color="#E6E6E6" />
              <Text style={styles.menuText}>Add Ticker</Text>
            </TouchableOpacity>

            {folderTickers.length > 0 && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setRemoveTickerVisible(true);
                  setMenuVisible(false);
                }}
              >
                <Trash2 size={16} color="#E6E6E6" />
                <Text style={styles.menuText}>Remove Ticker</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setNewFolderName(folderName);
                setRenameVisible(true);
                setMenuVisible(false);
              }}
            >
              <Edit3 size={16} color="#E6E6E6" />
              <Text style={styles.menuText}>Rename Folder</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
              <Trash2 size={16} color="#FF3131" />
              <Text style={[styles.menuText, { color: '#FF3131' }]}>Delete Folder</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Ticker Modal */}
      <Modal
        visible={addTickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddTickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputTitle}>Add Ticker to {folderName}</Text>
              <TouchableOpacity onPress={() => setAddTickerVisible(false)}>
                <X size={20} color="#9FA6B2" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.textInput}
              value={newTicker}
              onChangeText={setNewTicker}
              placeholder="Enter ticker symbol (e.g., AAPL)"
              placeholderTextColor="#555A64"
              autoCapitalize="characters"
              autoFocus
            />
            
            <View style={styles.inputButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setAddTickerVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={handleAddTicker}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Remove Ticker Modal */}
      <Modal
        visible={removeTickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRemoveTickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputTitle}>Remove Ticker from {folderName}</Text>
              <TouchableOpacity onPress={() => setRemoveTickerVisible(false)}>
                <X size={20} color="#9FA6B2" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.tickerList}>
              {folderTickers.map(ticker => (
                <TouchableOpacity
                  key={ticker}
                  style={styles.tickerItem}
                  onPress={() => handleRemoveTicker(ticker)}
                >
                  <Text style={styles.tickerText}>{ticker}</Text>
                  <Trash2 size={16} color="#FF3131" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Rename Folder Modal */}
      <Modal
        visible={renameVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRenameVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputTitle}>Rename Folder</Text>
              <TouchableOpacity onPress={() => setRenameVisible(false)}>
                <X size={20} color="#9FA6B2" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.textInput}
              value={newFolderName}
              onChangeText={setNewFolderName}
              placeholder="Enter folder name"
              placeholderTextColor="#555A64"
              autoFocus
            />
            
            <View style={styles.inputButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setRenameVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={handleRename}
              >
                <Text style={styles.addButtonText}>Rename</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Folder Modal */}
      <Modal
        visible={createFolderVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateFolderVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputTitle}>Create New Folder</Text>
              <TouchableOpacity onPress={() => setCreateFolderVisible(false)}>
                <X size={20} color="#9FA6B2" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.textInput}
              value={newFolderNameInput}
              onChangeText={setNewFolderNameInput}
              placeholder="Enter folder name"
              placeholderTextColor="#555A64"
              autoFocus
            />
            
            <View style={styles.inputButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setCreateFolderVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={handleCreateFolder}
              >
                <Text style={styles.addButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputTitle}>Delete Folder</Text>
              <TouchableOpacity onPress={() => setDeleteConfirmVisible(false)}>
                <X size={20} color="#9FA6B2" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.confirmText}>
              Are you sure you want to delete &quot;{folderName}&quot;?
            </Text>
            
            <View style={styles.inputButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setDeleteConfirmVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    padding: 8,
    borderRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#0C0C0E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F1F23',
    minWidth: 200,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuText: {
    color: '#E6E6E6',
    fontSize: 14,
    fontWeight: '500',
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
  addButton: {
    backgroundColor: '#00B8FF',
  },
  cancelButtonText: {
    color: '#9FA6B2',
    fontSize: 14,
    fontWeight: '600',
  },
  addButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmText: {
    color: '#9FA6B2',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  deleteButton: {
    backgroundColor: '#FF3131',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tickerList: {
    gap: 8,
  },
  tickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1F1F23',
    padding: 12,
    borderRadius: 8,
  },
  tickerText: {
    color: '#E6E6E6',
    fontSize: 14,
    fontWeight: '600',
  },
});