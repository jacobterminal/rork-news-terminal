export const theme = {
  colors: {
    // Base colors
    bg: '#000000',
    card: '#0C0C0E',
    border: '#1F1F23',
    
    // Text colors
    text: '#E6E6E6',
    textSecondary: '#9FA6B2',
    textDim: '#555A64',
    
    // Sentiment colors
    bullish: '#00FF5A',
    bearish: '#FF3131',
    neutral: '#F5C518',
    
    // UI accents
    activeCyan: '#00B8FF',
    inactiveGray: '#6E7582',
    searchGlow: '#8A2BE2',
    
    // Banner
    bannerBg: '#000000',
    
    // Section titles
    sectionTitle: '#F5C518',
    
    // Legacy aliases for compatibility
    green: '#00FF5A',
    red: '#FF3131',
    amber: '#F5C518',
    info: '#E6E6E6',
  },
  fontSize: {
    headline: 14,
    base: 13,
    tight: 12,
    label: 11,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
} as const;

export const sentimentConfig = {
  Bullish: { icon: '↑', color: theme.colors.bullish },
  Bearish: { icon: '↓', color: theme.colors.bearish },
  Neutral: { icon: '→', color: theme.colors.neutral },
} as const;

export const impactColors = {
  Low: '#6C757D',
  Medium: '#FF8C00',
  High: '#FF1744',
} as const;