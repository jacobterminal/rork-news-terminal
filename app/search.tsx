import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, X } from 'lucide-react-native';
import { theme } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigationStore } from '../store/navigationStore';

const COMPANY_NAMES: Record<string, string> = {
  'AAPL': 'Apple Inc.',
  'NVDA': 'NVIDIA Corporation',
  'TSLA': 'Tesla Inc.',
  'MSFT': 'Microsoft Corporation',
  'GOOGL': 'Alphabet Inc.',
  'META': 'Meta Platforms Inc.',
  'AMZN': 'Amazon.com Inc.',
  'JPM': 'JPMorgan Chase & Co.',
  'BAC': 'Bank of America Corp.',
  'WMT': 'Walmart Inc.',
  'AMD': 'Advanced Micro Devices',
  'NFLX': 'Netflix Inc.',
  'CRM': 'Salesforce Inc.',
  'DIS': 'The Walt Disney Company',
  'PYPL': 'PayPal Holdings',
  'INTC': 'Intel Corporation',
  'CSCO': 'Cisco Systems',
  'ORCL': 'Oracle Corporation',
  'IBM': 'International Business Machines',
  'QCOM': 'QUALCOMM Incorporated',
};

const RECENT_SEARCHES_KEY = '@recent_ticker_searches';
const MAX_RECENT_SEARCHES = 10;

interface TickerResult {
  ticker: string;
  name: string;
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { setReturnContext } = useNavigationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<TickerResult[]>([]);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toUpperCase();
    const results: TickerResult[] = [];

    Object.entries(COMPANY_NAMES).forEach(([ticker, name]) => {
      if (ticker.includes(query) || name.toUpperCase().includes(query)) {
        results.push({ ticker, name });
      }
    });

    setSearchResults(results.slice(0, 8));
  }, [searchQuery]);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored && typeof stored === 'string' && stored.trim().length > 0) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setRecentSearches(parsed.filter(item => typeof item === 'string'));
          } else {
            console.warn('Invalid recent searches format, clearing...');
            await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
            setRecentSearches([]);
          }
        } catch (parseError) {
          console.error('Failed to parse recent searches, clearing corrupted data:', parseError);
          await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
          setRecentSearches([]);
        }
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
      setRecentSearches([]);
    }
  };

  const saveRecentSearch = async (ticker: string) => {
    try {
      const updated = [ticker, ...recentSearches.filter(t => t !== ticker)].slice(0, MAX_RECENT_SEARCHES);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  };

  const removeRecentSearch = async (ticker: string) => {
    try {
      const updated = recentSearches.filter(t => t !== ticker);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to remove recent search:', error);
    }
  };

  const handleTickerPress = (ticker: string) => {
    saveRecentSearch(ticker);
    Keyboard.dismiss();
    
    setReturnContext({
      routeName: 'search',
      scrollOffset: 0,
      searchQuery: searchQuery,
    });
    
    router.push(`/company/${ticker}` as any);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={8}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search tickers</Text>
      </View>

      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tickers"
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {searchQuery.trim().length === 0 ? (
          <>
            {recentSearches.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                {recentSearches.map((ticker) => (
                  <TouchableOpacity
                    key={ticker}
                    style={styles.recentCard}
                    onPress={() => handleTickerPress(ticker)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.tickerChip}>
                      <Text style={styles.tickerText}>{ticker}</Text>
                    </View>
                    <Text style={styles.companyName} numberOfLines={1}>
                      {COMPANY_NAMES[ticker] || ticker}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        removeRecentSearch(ticker);
                      }}
                      hitSlop={8}
                    >
                      <X size={18} color="#777" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        ) : (
          <>
            {searchResults.length > 0 ? (
              searchResults.map((result) => (
                <TouchableOpacity
                  key={result.ticker}
                  style={styles.resultCard}
                  onPress={() => handleTickerPress(result.ticker)}
                  activeOpacity={0.7}
                >
                  <View style={styles.tickerChip}>
                    <Text style={styles.tickerText}>{result.ticker}</Text>
                  </View>
                  <Text style={styles.companyName} numberOfLines={1}>
                    {result.name}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>No tickers found</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  searchBarContainer: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  searchInput: {
    backgroundColor: '#0C0C0E',
    borderWidth: 1,
    borderColor: '#FFD75A',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFD75A',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C0C0E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F1F23',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C0C0E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F1F23',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  tickerChip: {
    backgroundColor: '#FFD75A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 12,
  },
  tickerText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  companyName: {
    flex: 1,
    color: '#E6E6E6',
    fontSize: 14,
    fontWeight: '500' as const,
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
  noResults: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
});
