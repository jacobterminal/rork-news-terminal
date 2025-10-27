import React from 'react';
import { TouchableOpacity, Text, View, Linking } from 'react-native';
import { SENTIMENT_COLORS, SentimentLabel } from '@/store/newsAnalysis';

type Props = {
  url: string;
  label?: string;
  sentiment?: SentimentLabel | string;
};

const colorFromSentiment = (t: SentimentLabel | string): string => {
  if (t === 'BULL') return SENTIMENT_COLORS.BULL;
  if (t === 'BEAR') return SENTIMENT_COLORS.BEAR;
  if (t === 'NEUTRAL') return SENTIMENT_COLORS.NEUTRAL;
  
  const s = (t || 'neutral').toLowerCase();
  if (s.includes('bull')) return SENTIMENT_COLORS.BULL;
  if (s.includes('bear')) return SENTIMENT_COLORS.BEAR;
  return SENTIMENT_COLORS.NEUTRAL;
};

export default function ArticleLinkPill({ url, label = 'Open Article', sentiment = 'neutral' }: Props) {
  const c = colorFromSentiment(sentiment);

  const open = async () => {
    try { await Linking.openURL(url); } catch {}
  };

  return (
    <TouchableOpacity
      accessibilityRole="link"
      accessibilityLabel={`Open source article: ${label}`}
      onPress={open}
      style={{
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: c,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 18,
        marginTop: 12,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ color: c, fontWeight: '600' }}>{label}</Text>
        <Text style={{ color: c, opacity: 0.9 }}>↗</Text>
      </View>
    </TouchableOpacity>
  );
}
