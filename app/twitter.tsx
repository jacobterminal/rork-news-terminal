import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TextInput, Pressable, Platform, Modal, KeyboardAvoidingView, TouchableWithoutFeedback, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { Search, User, BadgeCheck, ExternalLink, Bell, ChevronRight, X } from 'lucide-react-native';

// Types
interface TweetCard {
  id: string;
  handle: string;
  displayName: string;
  verified?: boolean;
  avatarColor: string;
  text: string;
  time: string; // HH:MM
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number; // 0-100
  impact: 'Low' | 'Medium' | 'High';
}

interface WaitlistForm {
  email: string;
  username?: string;
  handles?: string;
}

interface TrackerState {
  overlayVisible: boolean;
  waitlistOpen: boolean;
  mockFeed: TweetCard[];
  submitted: boolean;
}

const featureFlag = { enabled: false } as const;

// Storage helpers
const storage = {
  getItem(key: string): string | null {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        return window.localStorage.getItem(key);
      }
      return memoryStore[key] ?? null;
    } catch (e) {
      console.log('storage.getItem error', e);
      return null;
    }
  },
  setItem(key: string, value: string) {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      } else {
        memoryStore[key] = value;
      }
    } catch (e) {
      console.log('storage.setItem error', e);
    }
  },
};
const memoryStore: Record<string, string> = {};

// Utils
function extractTickersFromText(text: string): string[] {
  const regex = /\$[A-Z]{1,5}/g;
  const matches = text.match(regex) ?? [];
  return Array.from(new Set(matches));
}

function truncate(text: string, n: number): string {
  if (text.length <= n) return text;
  return text.slice(0, Math.max(0, n - 1)) + '…';
}

function getMockFeed(): TweetCard[] {
  const items: TweetCard[] = [
    {
      id: '1', handle: '@elonmusk', displayName: 'Elon Musk', verified: true, avatarColor: '#3b82f6',
      text: 'Tesla production ramp continues at Giga Texas. Excited about new battery architecture. $TSLA', time: '09:12', sentiment: 'Bullish', confidence: 78, impact: 'High'
    },
    {
      id: '2', handle: '@CNBC', displayName: 'CNBC', verified: true, avatarColor: '#22c55e',
      text: 'Apple reportedly evaluating AI features for next iPhone cycle. Services revenue trend steady. $AAPL', time: '10:05', sentiment: 'Neutral', confidence: 62, impact: 'Medium'
    },
    {
      id: '3', handle: '@TheTerminal', displayName: 'Terminal Wire', verified: false, avatarColor: '#a855f7',
      text: 'Hearing increased chatter on semis orders into H2; watch leading-edge supply. $NVDA $AMD', time: '10:47', sentiment: 'Bullish', confidence: 71, impact: 'Medium'
    },
    {
      id: '4', handle: '@EnergyWatch', displayName: 'Energy Watch', verified: false, avatarColor: '#ef4444',
      text: 'Refinery maintenance extended; diesel spreads elevated regionally. $XOM $CVX', time: '11:21', sentiment: 'Neutral', confidence: 55, impact: 'Low'
    },
    {
      id: '5', handle: '@macroalpha', displayName: 'Macro Alpha', verified: true, avatarColor: '#14b8a6',
      text: 'FOMC path: language implies patience; QT discussions continue. $SPY context still range-bound.', time: '12:03', sentiment: 'Neutral', confidence: 64, impact: 'Medium'
    },
    {
      id: '6', handle: '@TeslaCharts', displayName: 'Tesla Charts', verified: false, avatarColor: '#f59e0b',
      text: 'Delivery estimates updated; mix effects key this quarter. $TSLA', time: '12:44', sentiment: 'Bearish', confidence: 58, impact: 'Medium'
    },
    {
      id: '7', handle: '@chipstack', displayName: 'Chip Stack', verified: false, avatarColor: '#06b6d4',
      text: 'Foundry utilization uptick signals backlog clearing; watch pricing power. $TSM $NVDA', time: '13:11', sentiment: 'Bullish', confidence: 66, impact: 'High'
    },
    {
      id: '8', handle: '@DailyFin', displayName: 'Daily Finance', verified: false, avatarColor: '#eab308',
      text: 'Big bank color suggests stable deposit trends into Q4. $JPM $BAC', time: '13:59', sentiment: 'Neutral', confidence: 52, impact: 'Low'
    },
    {
      id: '9', handle: '@spaceinsider', displayName: 'Space Insider', verified: false, avatarColor: '#0ea5e9',
      text: 'Launch window moved due to upper-level winds; manifest unchanged. $RKLB', time: '14:20', sentiment: 'Neutral', confidence: 49, impact: 'Low'
    },
    {
      id: '10', handle: '@AITrends', displayName: 'AI Trends', verified: true, avatarColor: '#10b981',
      text: 'Enterprise GPU clusters seeing fresh demand signals; cloud spend optimization persists. $NVDA $MSFT', time: '14:52', sentiment: 'Bullish', confidence: 73, impact: 'High'
    },
  ];
  return items;
}

// Beta state initializer
function initTrackerBeta(): TrackerState {
  const hideOverlay = storage.getItem('tt_hide_overlay_session') === 'true';
  const overlayVisible = featureFlag.enabled ? false : !hideOverlay;
  return {
    overlayVisible,
    waitlistOpen: false,
    mockFeed: getMockFeed(),
    submitted: false,
  };
}

function useToast() {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState('');
  const opacity = useRef(new Animated.Value(0)).current;

  const show = useCallback((t: string) => {
    setText(t);
    setVisible(true);
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start(() => {
      setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => setVisible(false));
      }, 1500);
    });
  }, [opacity]);

  return { visible, text, opacity, show };
}

export default function TwitterScreen() {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<TrackerState>(initTrackerBeta());
  const [learnMoreOpen, setLearnMoreOpen] = useState<boolean>(false);
  const [form, setForm] = useState<WaitlistForm>({ email: '', username: '', handles: '' });
  const [trackHover, setTrackHover] = useState<boolean>(false);
  const toast = useToast();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLearnMoreOpen(false);
        setState(s => ({ ...s, waitlistOpen: false }));
      }
    };
    if (Platform.OS === 'web') {
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
    return undefined;
  }, []);

  const openWaitlistModal = useCallback(() => {
    setState(s => ({ ...s, waitlistOpen: true }));
  }, []);
  const closeWaitlistModal = useCallback(() => {
    setState(s => ({ ...s, waitlistOpen: false }));
  }, []);

  const submitWaitlist = useCallback(() => {
    const email = form.email.trim();
    const isValid = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
    if (!isValid) {
      toast.show('Please enter a valid email.');
      return;
    }
    const now = new Date().toISOString();
    const key = 'tt_waitlist_submissions';
    const existingRaw = storage.getItem(key);
    let arr: Array<{ email: string; username?: string; handles?: string; ts: string }>;
    try {
      arr = existingRaw ? JSON.parse(existingRaw) : [];
    } catch {
      arr = [];
    }
    arr.push({ email, username: form.username?.trim() || undefined, handles: form.handles?.trim() || undefined, ts: now });
    storage.setItem(key, JSON.stringify(arr));
    setState(s => ({ ...s, submitted: true }));
    toast.show('Added to waitlist — we’ll notify you on launch.');
    closeWaitlistModal();
  }, [form.email, form.username, form.handles, toast, closeWaitlistModal]);

  const handleRemindLater = useCallback(() => {
    storage.setItem('tt_hide_overlay_session', 'true');
    setState(s => ({ ...s, overlayVisible: false }));
  }, []);

  const disabledReason = 'Feature locked during beta.';

  const headerRight = (
    <View style={styles.headerIcons}>
      <Pressable accessibilityRole="button" testID="search-icon" style={styles.iconButton}>
        <Search size={18} color={theme.colors.text} />
      </Pressable>
      <Pressable accessibilityRole="button" testID="account-icon" style={[styles.iconButton, { marginLeft: 8 }]}>
        <User size={18} color={theme.colors.text} />
      </Pressable>
    </View>
  );

  const feed = useMemo(() => state.mockFeed, [state.mockFeed]);

  const renderCard = (t: TweetCard) => {
    const tickers = extractTickersFromText(t.text);
    const arrow = t.sentiment === 'Bullish' ? '↑' : t.sentiment === 'Bearish' ? '↓' : '→';
    const impactColor = t.impact === 'High' ? '#FF1744' : t.impact === 'Medium' ? '#FF8C00' : '#6C757D';

    return (
      <View key={t.id} style={styles.card} testID={`tweet-card-${t.id}`}>
        <View style={styles.mockPill}><Text style={styles.mockPillText}>MOCK</Text></View>
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: t.avatarColor }]} />
          <View style={styles.headerTextWrap}>
            <View style={styles.handleRow}>
              <Text style={styles.displayName} numberOfLines={1}>{t.displayName}</Text>
              {t.verified && <BadgeCheck size={14} color={theme.colors.info} />}
            </View>
            <Text style={styles.handle} numberOfLines={1}>{t.handle}</Text>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.timeText}>{t.time}</Text>
            <Text style={styles.sourceText}>X</Text>
          </View>
        </View>
        <Text style={styles.tweetText} numberOfLines={2}>{truncate(t.text, 160)}</Text>
        <View style={styles.rowBetween}>
          <View style={styles.tickerWrap}>
            {tickers.map((tk) => (
              <View key={tk} style={styles.tickerChip}><Text style={styles.tickerText}>{tk}</Text></View>
            ))}
          </View>
          <View style={styles.sentimentWrap}>
            <Text style={[styles.sentimentArrow, t.sentiment === 'Bullish' ? styles.bull : t.sentiment === 'Bearish' ? styles.bear : styles.neutral]}>
              {arrow}
            </Text>
            <Text style={styles.confidenceText}>{t.confidence}%</Text>
            <View style={[styles.impactPill, { borderColor: impactColor }]}>
              <Text style={[styles.impactText, { color: impactColor }]}>{t.impact}</Text>
            </View>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Pressable disabled style={styles.footerBtn}>
            <Bell size={14} color={theme.colors.textDim} />
            <Text style={styles.footerBtnText}>Alert</Text>
          </Pressable>
          <Pressable disabled style={styles.footerBtn}>
            <ExternalLink size={14} color={theme.colors.textDim} />
            <Text style={styles.footerBtnText}>Open on X</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Twitter Tracker (Beta)</Text>
        {headerRight}
      </View>

      {/* Hero / Status Strip */}
      <Pressable onPress={() => setLearnMoreOpen(true)} style={styles.banner} testID="beta-banner">
        <Text style={styles.bannerText}>Beta Preview — Feature locked. Join the waitlist for early access. </Text>
        <Text style={styles.bannerCta}>Learn more</Text>
        <ChevronRight size={14} color={theme.colors.info} />
      </Pressable>

      {/* Content */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Add / Track Accounts (disabled) */}
        <View style={styles.addWrap}>
          <TextInput
            editable={featureFlag.enabled}
            placeholder="Add Twitter @handle (coming soon)"
            placeholderTextColor={theme.colors.textDim}
            style={[styles.input, !featureFlag.enabled && styles.inputDisabled]}
            value={''}
            onChangeText={() => {}}
            testID="add-handle-input"
          />
          <Pressable
            onHoverIn={() => setTrackHover(true)}
            onHoverOut={() => setTrackHover(false)}
            disabled={!featureFlag.enabled}
            style={[styles.trackBtn, !featureFlag.enabled && styles.trackBtnDisabled]}
            testID="track-button"
          >
            <Text style={styles.trackBtnText}>Track</Text>
          </Pressable>
          {!featureFlag.enabled && trackHover && (
            <View style={styles.tooltip} pointerEvents="none">
              <Text style={styles.tooltipText}>Available after launch</Text>
            </View>
          )}
          <Text style={styles.helperText}>You can list desired handles when joining the waitlist.</Text>
        </View>

        {/* Preview Feed (Mock) */}
        <View>
          {feed.map(renderCard)}
        </View>
      </ScrollView>

      {/* Locked Overlay */}
      {state.overlayVisible && (
        <View style={styles.overlay} testID="beta-overlay">
          <View style={styles.overlayCard}>
            <Text style={styles.overlayTitle}>Twitter Tracker — Not Yet Live</Text>
            <Text style={styles.overlaySubtitle}>Join the waitlist to get early access when we activate real-time tracking.</Text>
            <View style={styles.bullets}>
              <Text style={styles.bulletText}>• Instant alerts for selected accounts</Text>
              <Text style={styles.bulletText}>• Ticker detection ($TSLA, $AAPL, $SPY)</Text>
              <Text style={styles.bulletText}>• AI summaries + direction/impact</Text>
            </View>
            <Pressable onPress={openWaitlistModal} style={styles.primaryBtn} testID="join-waitlist-btn">
              <Text style={styles.primaryBtnText}>Join Waitlist</Text>
            </Pressable>
            <Pressable onPress={handleRemindLater} style={styles.secondaryLink} testID="remind-later-link">
              <Text style={styles.secondaryLinkText}>Remind me later</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Waitlist Modal */}
      <Modal visible={state.waitlistOpen} transparent animationType="slide" onRequestClose={closeWaitlistModal}>
        <TouchableWithoutFeedback onPress={closeWaitlistModal}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalWrap}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Pressable onPress={closeWaitlistModal} style={styles.modalCloseBtn} accessibilityRole="button">
                <X size={18} color={theme.colors.text} />
              </Pressable>
              <Text style={styles.modalTitle}>Join Waitlist</Text>
            </View>
            <View style={styles.formField}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="you@example.com"
                placeholderTextColor={theme.colors.textDim}
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(v) => setForm(f => ({ ...f, email: v }))}
                testID="email-input"
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.label}>Username (optional)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="username"
                placeholderTextColor={theme.colors.textDim}
                autoCapitalize="none"
                value={form.username}
                onChangeText={(v) => setForm(f => ({ ...f, username: v }))}
                testID="username-input"
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.label}>Desired @handles (optional)</Text>
              <TextInput
                style={[styles.modalInput, styles.textarea]}
                placeholder="@elonmusk, @CNBC"
                placeholderTextColor={theme.colors.textDim}
                multiline
                value={form.handles}
                onChangeText={(v) => setForm(f => ({ ...f, handles: v }))}
                testID="handles-input"
              />
            </View>
            <Text style={styles.privacyNote}>Used only for early-access notification.</Text>
            <View style={styles.modalActions}>
              <Pressable onPress={closeWaitlistModal} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={submitWaitlist} style={styles.modalSubmitBtn} testID="submit-waitlist-btn">
                <Text style={styles.modalSubmitText}>Submit</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Learn more Modal */}
      <Modal visible={learnMoreOpen} transparent animationType="fade" onRequestClose={() => setLearnMoreOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setLearnMoreOpen(false)}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>
        <View style={styles.learnMoreWrap}>
          <View style={styles.learnMoreCard}>
            <Text style={styles.learnTitle}>Beta Preview</Text>
            <Text style={styles.learnBody}>This page previews our upcoming Twitter Tracker. Core functions are disabled until launch. Join the waitlist to be notified.</Text>
            <Pressable onPress={() => setLearnMoreOpen(false)} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Toast */}
      {toast.visible && (
        <Animated.View style={[styles.toast, { opacity: toast.opacity }]}>
          <Text style={styles.toastText}>{toast.text}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  bannerText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 12,
  },
  bannerCta: {
    color: theme.colors.info,
    fontSize: 12,
    marginRight: 6,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addWrap: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  input: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    color: theme.colors.text,
    backgroundColor: theme.colors.bg,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  trackBtn: {
    marginTop: 8,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.sectionTitle,
  },
  trackBtnDisabled: {
    backgroundColor: '#6E758299',
  },
  trackBtnText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  tooltip: {
    position: 'absolute',
    right: 12,
    top: 52,
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tooltipText: {
    color: theme.colors.textDim,
    fontSize: 12,
  },
  helperText: {
    marginTop: 6,
    color: theme.colors.textDim,
    fontSize: 12,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  mockPill: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#6C757D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  mockPillText: {
    color: '#E6E6E6',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  headerTextWrap: {
    flex: 1,
  },
  handleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  displayName: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },
  handle: {
    color: theme.colors.textDim,
    fontSize: 12,
  },
  metaRight: {
    alignItems: 'flex-end',
  },
  timeText: {
    color: theme.colors.textDim,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  sourceText: {
    color: theme.colors.info,
    fontSize: 10,
    marginTop: 2,
  },
  tweetText: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tickerWrap: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
  },
  tickerChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tickerText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '600',
  },
  sentimentWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sentimentArrow: {
    fontSize: 13,
    fontWeight: '700',
  },
  bull: { color: '#00FF5A' },
  bear: { color: '#FF3131' },
  neutral: { color: '#F5C518' },
  confidenceText: {
    color: theme.colors.textDim,
    fontSize: 11,
  },
  impactPill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  impactText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.6,
  },
  footerBtnText: {
    color: theme.colors.textDim,
    fontSize: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  overlayCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    maxWidth: 520,
    width: '100%',
  },
  overlayTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  overlaySubtitle: {
    color: theme.colors.textDim,
    fontSize: 13,
    marginBottom: 12,
  },
  bullets: {
    gap: 4,
    marginBottom: 12,
  },
  bulletText: {
    color: theme.colors.text,
    fontSize: 13,
  },
  primaryBtn: {
    backgroundColor: theme.colors.sectionTitle,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  primaryBtnText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryLink: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  secondaryLinkText: {
    color: theme.colors.info,
    fontSize: 13,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  formField: {
    marginTop: 12,
  },
  label: {
    color: theme.colors.textDim,
    fontSize: 12,
    marginBottom: 6,
  },
  modalInput: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    color: theme.colors.text,
    backgroundColor: theme.colors.bg,
  },
  textarea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  privacyNote: {
    marginTop: 8,
    color: theme.colors.textDim,
    fontSize: 11,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  modalCancelBtn: {
    height: 40,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalCancelText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  modalSubmitBtn: {
    height: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: theme.colors.sectionTitle,
  },
  modalSubmitText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  learnMoreWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  learnMoreCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    maxWidth: 520,
  },
  learnTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  learnBody: {
    color: theme.colors.textDim,
    fontSize: 13,
    marginBottom: 12,
  },
  toast: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  toastText: {
    color: theme.colors.text,
    fontSize: 13,
    textAlign: 'center',
  },
});