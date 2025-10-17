import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ExternalLink, Bookmark, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNewsStore } from '@/store/newsStore';

const SENTIMENT_COLORS = {
  Bullish: '#00FF00' as const,
  Bearish: '#FF0000' as const,
  Neutral: '#FFD75A' as const,
};

const GOLD = '#FFD75A' as const;
const BLACK = '#000000' as const;
const WHITE = '#FFFFFF' as const;

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { state, saveArticle, unsaveArticle, isArticleSaved } = useNewsStore();

  const article = useMemo(() => {
    return state.feedItems.find((item) => item.id === id);
  }, [state.feedItems, id]);

  const sentiment = article?.classification.sentiment;
  const borderColor = sentiment ? SENTIMENT_COLORS[sentiment] : GOLD;
  const isSaved = article ? isArticleSaved(article.id) : false;

  const confidenceLevel = article && article.classification.confidence >= 75 ? 'High' : 'Medium';
  const confidencePercentage = article?.classification.confidence || 0;

  const keyPhrases = useMemo(() => {
    if (!article) return [];
    const phrases: string[] = [];
    if (article.tags.is_macro) phrases.push('MACRO');
    if (article.tags.fed) phrases.push('FED');
    if (article.tags.sec) phrases.push('SEC');
    if (article.tags.earnings) phrases.push('EARNINGS');
    if (article.tags.social) phrases.push('SOCIAL');
    if (article.classification.impact) phrases.push(article.classification.impact.toUpperCase());
    return phrases;
  }, [article]);

  const handleOpenOriginal = () => {
    if (article?.url) {
      Linking.openURL(article.url);
    }
  };

  const handleSave = () => {
    if (!article) return;
    if (isSaved) {
      unsaveArticle(article.id);
    } else {
      saveArticle(article);
    }
  };

  const handleClose = () => {
    router.back();
  };

  if (!article) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Article not found</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <X size={28} color={WHITE} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.cardContainer, { borderColor, shadowColor: borderColor }]}>
        <TouchableOpacity
          style={styles.closeButtonTop}
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <X size={28} color={WHITE} />
        </TouchableOpacity>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <Text style={styles.title}>{article.title}</Text>
            
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                {article.source.name} • {new Date(article.published_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </Text>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleOpenOriginal}
                activeOpacity={0.7}
              >
                <ExternalLink size={14} color={WHITE} />
                <Text style={styles.actionText}>Open Original</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSave}
                activeOpacity={0.7}
              >
                <Bookmark
                  size={14}
                  color={isSaved ? GOLD : WHITE}
                  fill={isSaved ? GOLD : 'none'}
                />
                <Text style={[styles.actionText, isSaved && { color: GOLD }]}>
                  {isSaved ? 'Saved' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.contentSection}>
            <Text style={styles.sectionHeader}>AI SUMMARY</Text>
            <Text style={styles.bodyText}>{article.classification.summary_15}</Text>
          </View>

          <View style={styles.contentSection}>
            <Text style={styles.sectionHeader}>AI OVERVIEW</Text>
            <Text style={styles.bodyText}>
              This article covers {article.source.name} reporting on {article.tickers.length > 0 ? article.tickers.join(', ') : 'market developments'}. 
              The analysis indicates a {sentiment?.toLowerCase()} sentiment with {article.classification.impact.toLowerCase()} market impact. 
              Key indicators suggest this development may influence trading decisions across related sectors.
            </Text>
          </View>

          <View style={styles.contentSection}>
            <Text style={styles.sectionHeader}>AI OPINION</Text>
            <Text style={styles.opinionHeader}>
              ({confidenceLevel} Confidence) {' '}
              <Text style={[styles.sentimentText, { color: borderColor }]}>
                {sentiment} {confidencePercentage}%
              </Text>
            </Text>
            <Text style={styles.bodyTextSmall}>
              Market sentiment appears {sentiment?.toLowerCase()} based on the content and timing of this development.
            </Text>
          </View>

          <View style={styles.contentSection}>
            <Text style={styles.sectionHeader}>AI FORECAST</Text>
            <Text style={styles.bodyText}>
              Expected to see {sentiment === 'Bullish' ? 'upward' : sentiment === 'Bearish' ? 'downward' : 'neutral'} pressure 
              on related assets in the near term. Volatility may increase as markets digest this information.
            </Text>
          </View>

          <View style={styles.contentSection}>
            <Text style={styles.sectionHeader}>IMPACT CONFIDENCE</Text>
            <View style={styles.confidenceBarContainer}>
              <View style={styles.confidenceBar}>
                {[1, 2, 3, 4, 5].map((segment) => (
                  <View
                    key={segment}
                    style={[
                      styles.confidenceSegment,
                      segment <= Math.ceil(confidencePercentage / 20) && {
                        backgroundColor: borderColor,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.confidencePercentage}>{confidencePercentage}%</Text>
            </View>
          </View>

          {keyPhrases.length > 0 && (
            <View style={styles.contentSection}>
              <Text style={styles.sectionHeader}>KEY PHRASES</Text>
              <View style={styles.tagsRow}>
                {keyPhrases.map((phrase, index) => (
                  <View key={index} style={styles.keyPhraseTag}>
                    <Text style={styles.keyPhraseText}>{phrase}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {article.tickers.length > 0 && (
            <View style={styles.contentSection}>
              <Text style={styles.sectionHeader}>RELATED TICKERS</Text>
              <View style={styles.tagsRow}>
                {article.tickers.map((ticker: string, index: number) => (
                  <View
                    key={index}
                    style={[styles.tickerTag, { backgroundColor: borderColor }]}
                  >
                    <Text style={styles.tickerText}>{ticker}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.footerSection}>
            <Text style={styles.disclaimerText}>
              AI summaries are generated for convenience. Not financial advice.
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)' as const,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: BLACK,
    borderRadius: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 2,
    marginTop: 40,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 0 20px rgba(255, 215, 90, 0.3)' as any,
      },
    }),
  },
  closeButtonTop: {
    position: 'absolute' as const,
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: WHITE,
    lineHeight: 24,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  metaRow: {
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#999999' as const,
  },
  actionsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    gap: 20,
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  actionText: {
    fontSize: 12,
    color: WHITE,
  },
  divider: {
    height: 1,
    backgroundColor: GOLD,
    marginVertical: 12,
  },
  contentSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: GOLD,
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 13,
    color: WHITE,
    lineHeight: 20,
    opacity: 0.9,
  },
  bodyTextSmall: {
    fontSize: 12,
    color: WHITE,
    lineHeight: 18,
    marginTop: 4,
  },
  opinionHeader: {
    fontSize: 13,
    color: '#999999' as const,
    marginBottom: 6,
  },
  sentimentText: {
    fontWeight: 'bold' as const,
  },
  confidenceBarContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  confidenceBar: {
    flex: 1,
    flexDirection: 'row' as const,
    gap: 4,
  },
  confidenceSegment: {
    flex: 1,
    height: 12,
    backgroundColor: '#1F1F23' as const,
    borderRadius: 2,
  },
  confidencePercentage: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: WHITE,
    minWidth: 45,
  },
  tagsRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 10,
  },
  keyPhraseTag: {
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: BLACK,
  },
  keyPhraseText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: WHITE,
    textTransform: 'uppercase' as const,
  },
  tickerTag: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tickerText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
    color: BLACK,
    textTransform: 'uppercase' as const,
  },
  footerSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'center' as const,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#808080' as const,
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: WHITE,
    marginBottom: 20,
  },
  closeButton: {
    padding: 12,
  },
});
