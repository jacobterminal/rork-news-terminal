import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Bookmark, ExternalLink } from 'lucide-react-native';
import { theme, impactColors } from '@/constants/theme';
import { FeedItem } from '@/types/news';
import { useNewsStore } from '@/store/newsStore';

interface SavedArticleCardProps {
  article: FeedItem;
}

export default function SavedArticleCard({ article }: SavedArticleCardProps) {
  const { unsaveArticle } = useNewsStore();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  const handlePress = () => {
    router.push(`/article/${article.id}`);
  };

  const handleUnsave = (e: any) => {
    e.stopPropagation();
    unsaveArticle(article.id);
  };

  const handleOpenOriginal = (e: any) => {
    e.stopPropagation();
    // Open original URL logic would go here
    console.log('Open original:', article.url);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.header}>
        <View style={styles.sourceRow}>
          <Text style={styles.sourceText}>
            {article.source.name} • {formatTime(article.published_at)}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleOpenOriginal}>
            <ExternalLink size={14} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleUnsave}>
            <Bookmark 
              size={14} 
              color={theme.colors.activeCyan}
              fill={theme.colors.activeCyan}
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.title} numberOfLines={2}>
        {article.title}
      </Text>
      
      <View style={styles.footer}>
        <View style={[styles.impactPill, { backgroundColor: impactColors[article.classification.impact] }]}>
          <Text style={styles.impactText}>{article.classification.impact}</Text>
        </View>
        <Text style={styles.summary} numberOfLines={1}>
          {article.classification.summary_15}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  sourceRow: {
    flex: 1,
  },
  sourceText: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    padding: theme.spacing.xs,
  },
  title: {
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    color: theme.colors.text,
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  impactPill: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: 3,
  },
  impactText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  summary: {
    fontSize: theme.fontSize.tight,
    color: theme.colors.textSecondary,
    flex: 1,
  },
});