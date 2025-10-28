import React from 'react';
import { TouchableOpacity, Text, View, Linking } from 'react-native';
import { getSentimentColors } from '@/app/lib/sentiment';

type Props = {
  url: string;
  label?: string;
  sentiment?: string;
};

export default function ArticleLinkPill({ url, label = 'Open Article', sentiment = 'neutral' }: Props) {
  const colors = getSentimentColors({ sentiment });
  const c = colors.border;

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
