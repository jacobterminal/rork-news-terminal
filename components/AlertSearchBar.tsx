import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView, Text, Image } from 'react-native';
import { Search, X, User, ArrowLeft } from 'lucide-react-native';
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

type AccountPreset = 'Watchlist-Based News' | 'Overall Incoming News';

export default function AlertSearchBar({ onTickerPress, feedItems = [] }: AlertSearchBarProps) {
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const [showAccount, setShowAccount] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('trader_007');
  const [email, setEmail] = useState<string>('user@example.com');
  const [password, setPassword] = useState<string>('hunter2');
  const [passwordEditable, setPasswordEditable] = useState<boolean>(false);
  const [preset, setPreset] = useState<AccountPreset>('Watchlist-Based News');
  const [plan, setPlan] = useState<string>('Free');

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

  const maskedPassword = useMemo(() => '•'.repeat(Math.max(password.length, 8)), [password.length]);

  return (
    <>
      <View style={styles.container}>
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
              console.log('[AlertSearchBar] Open account subpage');
              setShowAccount(true);
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

      <Modal
        visible={showAccount}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAccount(false)}
      >
        <View style={styles.accountOverlay}>
          <View style={styles.accountSheet}>
            <View style={styles.accountHeaderRow}>
              <TouchableOpacity
                testID="account-back"
                style={styles.backButton}
                onPress={() => setShowAccount(false)}
              >
                <ArrowLeft size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.accountTitle}>Account</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.accountContent} showsVerticalScrollIndicator={false}>
              <View style={styles.profileRow}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop' }}
                  style={styles.avatar}
                />
                <View style={styles.profileText}>
                  <Text style={styles.username}>{username}</Text>
                  <Text style={styles.email}>{email}</Text>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.sectionLabel}>Password</Text>
                {passwordEditable ? (
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                    placeholder="Enter new password"
                    placeholderTextColor="#888888"
                  />)
                : (
                  <View style={styles.passwordRow}>
                    <Text style={styles.passwordMasked}>{maskedPassword}</Text>
                    <TouchableOpacity style={styles.inlineButton} onPress={() => setPasswordEditable(true)}>
                      <Text style={styles.inlineButtonText}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Interface Presets</Text>
                <View style={styles.toggleRow}>
                  <TouchableOpacity
                    style={[styles.toggleOption, preset === 'Watchlist-Based News' && styles.toggleOptionActive]}
                    onPress={() => setPreset('Watchlist-Based News')}
                  >
                    <Text style={styles.toggleText}>Watchlist-Based News</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleOption, preset === 'Overall Incoming News' && styles.toggleOptionActive]}
                    onPress={() => setPreset('Overall Incoming News')}
                  >
                    <Text style={styles.toggleText}>Overall Incoming News</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Subscriptions</Text>
                <Text style={styles.subText}>Current Plan: {plan}</Text>
                <TouchableOpacity style={styles.primaryButton} testID="upgrade-button">
                  <Text style={styles.primaryButtonText}>Upgrade / Manage Subscription</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Info</Text>
                <TouchableOpacity style={styles.secondaryButton} testID="edit-account">
                  <Text style={styles.secondaryButtonText}>Edit Profile Details</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Alerts</Text>
                <View style={styles.list}>
                  {['Critical alerts', 'Earnings', 'CPI', 'Fed', 'Watchlist alerts'].map((label) => (
                    <TouchableOpacity key={label} style={styles.listItem}>
                      <Text style={styles.listItemText}>{label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact</Text>
                <TouchableOpacity style={styles.secondaryButton} testID="support-button">
                  <Text style={styles.secondaryButtonText}>Support / Contact</Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.bg,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
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
  accountOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  accountSheet: {
    backgroundColor: '#000000',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '88%',
  },
  accountHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F23',
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  accountContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1F1F23',
  },
  profileText: {
    flex: 1,
  },
  username: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  email: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 13,
    marginTop: 2,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  sectionLabel: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1F1F23',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    backgroundColor: '#0C0C0E',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#1F1F23',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#0C0C0E',
  },
  passwordMasked: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  inlineButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#1F1F23',
  },
  inlineButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#0C0C0E',
    borderWidth: 1,
    borderColor: '#1F1F23',
  },
  toggleOptionActive: {
    borderColor: '#FFD700',
  },
  toggleText: {
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
  },
  subText: {
    color: '#FFFFFF',
    fontSize: 13,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#0C0C0E',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F1F23',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    borderWidth: 1,
    borderColor: '#1F1F23',
    borderRadius: 10,
    overflow: 'hidden',
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#0C0C0E',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F23',
  },
  listItemText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
});