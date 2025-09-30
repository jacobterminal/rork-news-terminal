import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { WatchlistFolder } from '../types/news';
import WatchlistCard from './WatchlistCard';
import FolderMenu from './FolderMenu';

interface TickerNewsItem {
  time: string;
  source: string;
  headline: string;
  impact: 'Low' | 'Medium' | 'High';
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  isEarnings?: boolean;
  expectedEps?: number;
  actualEps?: number;
  expectedRev?: number;
  actualRev?: number;
  verdict?: 'Beat' | 'Miss' | 'Inline';
}

interface TickerData {
  ticker: string;
  company: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  todayNews: TickerNewsItem[];
}

interface FolderCardProps {
  folder: WatchlistFolder;
  tickerDataMap: Record<string, TickerData>;
  onToggleExpansion: (folderId: string) => void;
  onAddTicker: (folderId: string, ticker: string) => void;
  onRemoveTicker: (folderId: string, ticker: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onCreateFolder: (name: string) => void;
  onHeadlinePress: (headline: any) => void;
  availableTickers: string[];
}

export default function FolderCard({
  folder,
  tickerDataMap,
  onToggleExpansion,
  onAddTicker,
  onRemoveTicker,
  onRenameFolder,
  onDeleteFolder,
  onCreateFolder,
  onHeadlinePress,
  availableTickers,
}: FolderCardProps) {

  return (
    <View style={styles.folderContainer}>
      {/* Folder Header */}
      <View style={styles.folderHeader}>
        <TouchableOpacity
          style={styles.folderHeaderContent}
          onPress={() => onToggleExpansion(folder.id)}
          activeOpacity={0.7}
        >
          <View style={styles.folderLeft}>
            {folder.isExpanded ? (
              <ChevronDown size={20} color="#E6E6E6" />
            ) : (
              <ChevronRight size={20} color="#E6E6E6" />
            )}
            <Text style={styles.folderName}>{folder.name}</Text>
            

          </View>
        </TouchableOpacity>
        
        <FolderMenu
          folderId={folder.id}
          folderName={folder.name}
          onAddTicker={onAddTicker}
          onRemoveTicker={onRemoveTicker}
          onRenameFolder={onRenameFolder}
          onDeleteFolder={onDeleteFolder}
          onCreateFolder={onCreateFolder}
          availableTickers={availableTickers}
          folderTickers={folder.tickers}
        />
      </View>
      
      <View style={styles.folderDivider} />
      
      {/* Folder Content */}
      {folder.isExpanded && (
        <View style={styles.folderContent}>
          {folder.tickers.length === 0 ? (
            <View style={styles.emptyFolder}>
              <Text style={styles.emptyFolderText}>No tickers added yet</Text>
            </View>
          ) : (
            folder.tickers.map(ticker => {
              const tickerData = tickerDataMap[ticker];
              if (!tickerData) return null;
              
              return (
                <View key={ticker} style={styles.tickerCardContainer}>
                  <WatchlistCard
                    ticker={tickerData.ticker}
                    company={tickerData.company}
                    sentiment={tickerData.sentiment}
                    confidence={tickerData.confidence}
                    todayNews={tickerData.todayNews}
                    onHeadlinePress={onHeadlinePress}
                  />
                </View>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  folderContainer: {
    backgroundColor: '#121212',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F1F23',
  },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  folderHeaderContent: {
    flex: 1,
  },
  folderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  folderName: {
    color: '#E6E6E6',
    fontSize: 16,
    fontWeight: '700',
  },
  tickerCount: {
    backgroundColor: '#1F1F23',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  tickerCountText: {
    color: '#9FA6B2',
    fontSize: 12,
    fontWeight: '600',
  },
  folderDivider: {
    height: 1,
    backgroundColor: '#1F1F23',
    marginHorizontal: 16,
  },
  folderContent: {
    paddingBottom: 8,
  },
  emptyFolder: {
    padding: 20,
    alignItems: 'center',
  },
  emptyFolderText: {
    color: '#555A64',
    fontSize: 14,
    fontStyle: 'italic',
  },
  tickerCardContainer: {
    marginHorizontal: 8,
    marginTop: 8,
  },

});