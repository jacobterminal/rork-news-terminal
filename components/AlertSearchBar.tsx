import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView, Text, Image, Platform } from 'react-native';
import { Search, X, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { FeedItem } from '../types/news';

interface SearchResult {
  type: 'ticker' | 'headline';
  ticker?: string;
  headline?: string;
  source?: string;
  time?: string;
}

interface AlertSearchBarProps {
  onTickerPress?: (ticker: string) => void;
  feedItems?: FeedItem[];
}

export default function AlertSearchBar({ onTickerPress, feedItems = [] }: AlertSearchBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

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
    if (result.type === 'ticker' && result.ticker && onTickerPress) {
      onTickerPress(result.ticker);
      handleCloseSearch();
    }
  };

  const headerHeight = Platform.select({ web: 64, default: 56 });
  const leftInset = Math.max(8, insets.left);
  const rightReserved = 88;

  return (
    <>
      <View style={[styles.container, { height: headerHeight, paddingTop: insets.top }]}>
        <View style={[styles.logoContainer, { left: leftInset, right: rightReserved }]}>
          <Image
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/d7axf3kzc3xyf59e2x2p0' }}
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
            onPress={() => {
              console.log('[AlertSearchBar] Navigate to settings');
              router.push('/settings');
            }}
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
                      <View style={styles.tickerChip}>
                        <Text style={styles.tickerText}>{result.ticker}</Text>
                      </View>
                      <Text style={styles.resultLabel}>Ticker</Text>
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative' as const,
    width: '100%',
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
  },
  tickerChip: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tickerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  resultLabel: {
    fontSize: 12,
    color: theme.colors.textDim,
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
});