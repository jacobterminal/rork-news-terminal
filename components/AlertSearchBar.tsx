import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView, Text, Image, Platform, Alert } from 'react-native';
import { Search, X, User, Plus } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { FeedItem } from '../types/news';
import { navigationMemory, AppRoute } from '../utils/navigationMemory';
import { useDropdown } from '../store/dropdownStore';
import { useNewsStore } from '../store/newsStore';

interface SearchResult {
  type: 'ticker' | 'headline';
  ticker?: string;
  headline?: string;
  source?: string;
  time?: string;
}

const COMPANY_NAMES: Record<string, string> = {
  'AAPL': 'Apple Inc.',
  'NVDA': 'NVIDIA Corp.',
  'TSLA': 'Tesla Inc.',
  'MSFT': 'Microsoft Corp.',
  'GOOGL': 'Alphabet Inc.',
  'META': 'Meta Platforms',
  'AMZN': 'Amazon.com Inc.',
  'JPM': 'JPMorgan Chase',
  'BAC': 'Bank of America',
  'WMT': 'Walmart Inc.',
};

interface AlertSearchBarProps {
  onTickerPress?: (ticker: string) => void;
  feedItems?: FeedItem[];
}

export default function AlertSearchBar({ onTickerPress, feedItems = [] }: AlertSearchBarProps) {
  const { registerDropdown, shouldCloseDropdown } = useDropdown();
  const dropdownId = 'alert-search-bar';
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showCreateFolderPrompt, setShowCreateFolderPrompt] = useState(false);
  const [pendingTicker, setPendingTicker] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  
  const { state, activeFolderId, createFolder, addTickerToFolder } = useNewsStore();
  const watchlistFolders = state.watchlistFolders || [];

  useEffect(() => {
    if (shouldCloseDropdown(dropdownId)) {
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [shouldCloseDropdown, dropdownId]);

  useEffect(() => {
    registerDropdown(dropdownId, showSearch);
  }, [showSearch, registerDropdown, dropdownId]);

  const handleSettingsPress = async () => {
    console.log('[AlertSearchBar] Navigate to settings, current path:', pathname);
    
    const routeMap: Record<string, AppRoute> = {
      '/': 'index',
      '/instant': 'instant',
      '/upcoming': 'upcoming',
      '/watchlist': 'watchlist',
      '/twitter': 'twitter',
    };
    
    const currentRoute = routeMap[pathname] || 'instant';
    await navigationMemory.saveLastRoute(currentRoute);
    router.push('/settings');
  };

  const handleSearchPress = () => {
    console.log('[AlertSearchBar] Open search');
    setShowSearch(true);
  };

  const handleCloseSearch = () => {
    console.log('[AlertSearchBar] Close search');
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    const tickers = new Set<string>();
    
    Object.keys(COMPANY_NAMES).forEach(ticker => {
      if (ticker.toLowerCase().includes(queryLower) || 
          COMPANY_NAMES[ticker].toLowerCase().includes(queryLower)) {
        tickers.add(ticker);
      }
    });
    
    feedItems.forEach(item => {
      if (item.tickers && item.tickers.length > 0) {
        item.tickers.forEach(ticker => {
          if (ticker.toLowerCase().includes(queryLower)) {
            tickers.add(ticker);
          }
        });
      }
    });

    tickers.forEach(ticker => {
      results.push({ type: 'ticker', ticker });
    });

    feedItems.forEach(item => {
      if (item.title.toLowerCase().includes(queryLower)) {
        const time = new Date(item.published_at).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

        results.push({
          type: 'headline',
          headline: item.title,
          source: item.source?.name ?? 'Unknown',
          time,
        });
      }
    });

    setSearchResults(results.slice(0, 10));
  };

  const handleResultPress = (result: SearchResult) => {
    if (result.type === 'ticker' && result.ticker) {
      const tickerUpper = result.ticker.toUpperCase();
      router.push(`/company/${tickerUpper}`);
      handleCloseSearch();
    } else if (result.type === 'headline') {
      // Do nothing for now, or you can open the article detail
    }
  };

  const handleAddTicker = async (ticker: string) => {
    if (watchlistFolders.length === 0) {
      setPendingTicker(ticker);
      setShowCreateFolderPrompt(true);
      return;
    }

    if (!activeFolderId) {
      Alert.alert('Error', 'No active folder selected');
      return;
    }

    const activeFolder = watchlistFolders.find(f => f.id === activeFolderId);
    if (!activeFolder) {
      Alert.alert('Error', 'Active folder not found');
      return;
    }

    if (activeFolder.tickers.includes(ticker)) {
      Alert.alert('Already in Watchlist', `${ticker} is already in "${activeFolder.name}"`);
      return;
    }

    await addTickerToFolder(activeFolderId, ticker);
    Alert.alert('Added to Watchlist', `${ticker} added to "${activeFolder.name}"`);
    handleCloseSearch();
  };

  const handleCreateFolderAndAddTicker = async () => {
    if (!newFolderName.trim() || !pendingTicker) return;

    const folderId = await createFolder(newFolderName.trim(), true);
    await addTickerToFolder(folderId, pendingTicker);
    
    Alert.alert('Success', `Folder "${newFolderName.trim()}" created with ${pendingTicker}`);
    
    setShowCreateFolderPrompt(false);
    setNewFolderName('');
    setPendingTicker(null);
    handleCloseSearch();
  };

  const leftInset = Math.max(8, insets.left);
  const rightReserved = 88;

  return (
    <>
      <View style={styles.container}>
        <View style={[styles.logoContainer, { left: leftInset, right: rightReserved }]}>
          <Image
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/w9s5asvkde871kmv8qzky' }}
            style={styles.logo}
            resizeMode="contain"
            alt="Insider Vega logo"
          />
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            testID="search-button"
            style={[styles.iconButton, showSearch && styles.iconButtonActive]}
            onPress={handleSearchPress}
          >
            <Search size={18} color={showSearch ? theme.colors.green : theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            testID="account-button"
            style={styles.iconButton}
            onPress={handleSettingsPress}
          >
            <User size={18} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showSearch}
        transparent
        animationType="slide"
        onRequestClose={handleCloseSearch}
      >
        <View style={styles.searchOverlay}>
          <View style={styles.searchContainer}>
            <View style={styles.searchHeader}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search tickers or keywords..."
                placeholderTextColor={theme.colors.textDim}
                value={searchQuery}
                onChangeText={handleSearchChange}
                autoFocus
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseSearch}
              >
                <X size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.resultsContainer}
              showsVerticalScrollIndicator={false}
            >
              {searchResults.map((result, index) => (
                <TouchableOpacity
                  key={`${result.type}-${index}`}
                  style={styles.resultItem}
                  onPress={() => handleResultPress(result)}
                >
                  {result.type === 'ticker' ? (
                    <View style={styles.tickerResult}>
                      <View style={styles.tickerLeft}>
                        <View style={styles.tickerChip}>
                          <Text style={styles.tickerText}>{result.ticker}</Text>
                        </View>
                        <Text style={styles.tickerCompany}>{result.ticker && COMPANY_NAMES[result.ticker] ? COMPANY_NAMES[result.ticker] : 'Unknown'}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.addButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          if (result.ticker) {
                            handleAddTicker(result.ticker);
                          }
                        }}
                      >
                        <Plus size={18} color="#00FF66" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.headlineResult}>
                      <Text style={styles.headlineText} numberOfLines={2}>
                        {result.headline}
                      </Text>
                      <View style={styles.headlineInfo}>
                        <Text style={styles.sourceText}>{result.source}</Text>
                        <Text style={styles.timeText}>{result.time}</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              ))}

              {searchQuery.length >= 2 && searchResults.length === 0 && (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>No results found</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCreateFolderPrompt}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateFolderPrompt(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowCreateFolderPrompt(false)}
        >
          <View style={styles.createFolderModal} onStartShouldSetResponder={() => true}>
            <Text style={styles.createFolderTitle}>Create a Watchlist Folder</Text>
            <Text style={styles.createFolderSubtitle}>
              Add {pendingTicker} to a new folder
            </Text>
            
            <TextInput
              style={styles.createFolderInput}
              placeholder="Enter folder name"
              placeholderTextColor="#555A64"
              value={newFolderName}
              onChangeText={setNewFolderName}
              autoFocus
            />
            
            <View style={styles.createFolderButtons}>
              <TouchableOpacity
                style={styles.createFolderCancel}
                onPress={() => {
                  setShowCreateFolderPrompt(false);
                  setNewFolderName('');
                  setPendingTicker(null);
                }}
              >
                <Text style={styles.createFolderCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createFolderSubmit, !newFolderName.trim() && styles.createFolderSubmitDisabled]}
                onPress={handleCreateFolderAndAddTicker}
                disabled={!newFolderName.trim()}
              >
                <Text style={styles.createFolderSubmitText}>Create & Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative' as const,
    width: '100%',
    height: Platform.select({ web: 64, default: 56 }),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  logoContainer: {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    zIndex: 10,
    pointerEvents: 'none' as const,
  },
  logo: {
    height: Platform.select({ web: '88%', default: '86%' }),
    width: '100%',
    objectFit: 'contain' as const,
    alignSelf: 'flex-start',
  },
  actionsRow: {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 20,
  },
  iconButton: {
    padding: theme.spacing.sm,
    borderRadius: 8,
    backgroundColor: theme.colors.border,
  },
  iconButtonActive: {
    backgroundColor: theme.colors.card,
  },
  searchOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  searchContainer: {
    backgroundColor: theme.colors.bg,
    margin: theme.spacing.md,
    borderRadius: 12,
    maxHeight: '80%',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: theme.spacing.sm,
  },
  closeButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  resultsContainer: {
    maxHeight: 400,
  },
  resultItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tickerResult: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  tickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  tickerChip: {
    backgroundColor: '#FFD75A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tickerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  tickerCompany: {
    fontSize: 13,
    color: theme.colors.text,
    flex: 1,
  },
  addButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 255, 102, 0.1)',
    borderRadius: 6,
  },
  headlineResult: {
    gap: theme.spacing.xs,
  },
  headlineText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  headlineInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 12,
    color: theme.colors.textDim,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    color: theme.colors.textDim,
  },
  noResults: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: theme.colors.textDim,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  createFolderModal: {
    backgroundColor: '#000000',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD75A',
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  createFolderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFD75A',
    textAlign: 'center',
    marginBottom: 8,
  },
  createFolderSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  createFolderInput: {
    backgroundColor: '#0C0C0E',
    borderWidth: 1,
    borderColor: '#1F1F23',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  createFolderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  createFolderCancel: {
    flex: 1,
    backgroundColor: '#1F1F23',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  createFolderCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  createFolderSubmit: {
    flex: 1,
    backgroundColor: '#FFD75A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  createFolderSubmitDisabled: {
    opacity: 0.5,
  },
  createFolderSubmitText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
});