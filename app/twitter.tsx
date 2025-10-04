import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';

type TabKey = 'dashboard' | 'ruleBuilder' | 'targets' | 'analytics' | 'settings';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'ruleBuilder', label: 'Rule Builder' },
  { key: 'targets', label: 'Targets' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'settings', label: 'Settings' },
];

type TrackedHandle = {
  id: string;
  handle: string;
  verified: boolean;
  followers: number;
  tags: string[];
  postsPerDay: number;
  lastSeenMins: number;
};

type Post = {
  id: string;
  handle: string;
  ts: number;
  text: string;
  hasMedia: boolean;
  hasLink: boolean;
  isReply: boolean;
  isRepost: boolean;
  isQuote: boolean;
  verified: boolean;
  likes: number;
  reposts: number;
  comments: number;
};

type Entities = {
  cashtags: string[];
  hashtags: string[];
  mentions: string[];
  domains: string[];
};

type RuleSubject = 'account' | 'group' | 'keyword' | 'cashtag' | 'domain' | 'language' | 'time window';
type RuleChannel = 'toast' | 'inbox' | 'email' | 'webhook';

const MOCK_HANDLES: TrackedHandle[] = [
  { id: '1', handle: '@flofeed', verified: true, followers: 45000, tags: ['Semis', 'Supply Chain'], postsPerDay: 12, lastSeenMins: 5 },
  { id: '2', handle: '@semi_digest', verified: true, followers: 32000, tags: ['Chips', 'AI'], postsPerDay: 8, lastSeenMins: 15 },
  { id: '3', handle: '@techsupply', verified: false, followers: 18000, tags: ['Logistics'], postsPerDay: 6, lastSeenMins: 45 },
  { id: '4', handle: '@aiinfra', verified: true, followers: 67000, tags: ['AI', 'Datacenter'], postsPerDay: 15, lastSeenMins: 2 },
];

const MOCK_FEED: Post[] = Array.from({ length: 30 }).map((_, i) => ({
  id: String(i + 1),
  handle: i % 4 === 0 ? '@flofeed' : i % 4 === 1 ? '@semi_digest' : i % 4 === 2 ? '@techsupply' : '@aiinfra',
  ts: Date.now() - i * 60000 * (Math.random() * 10 + 1),
  text: i % 5 === 0
    ? `$NVDA supply chain checks: LA/LB routing normalizing; H200 allocations tightening into Q4. #AI #Chips`
    : i % 5 === 1
    ? `H100 lead times stabilizing; Blackwell eval boards spotted with vendors. Watching NVLink/PCIe chatter. $AMD $INTC`
    : i % 5 === 2
    ? `@elonmusk Tesla AI Day 3 confirmed for Q1. Dojo updates expected. https://tesla.com/ai-day $TSLA`
    : i % 5 === 3
    ? `Breaking: #OpenAI GPT-5 training run underway. Compute cluster size unprecedented. $MSFT backing.`
    : `Datacenter power constraints easing in Northern Virginia. New substations online Q4. Good for $NVDA $AMD hyperscale demand.`,
  hasMedia: i % 7 === 0,
  hasLink: i % 6 === 0,
  isReply: i % 8 === 0,
  isRepost: i % 9 === 0,
  isQuote: i % 10 === 0,
  verified: i % 3 !== 0,
  likes: Math.floor(Math.random() * 900),
  reposts: Math.floor(Math.random() * 200),
  comments: Math.floor(Math.random() * 60),
}));

function extractEntities(text: string): Entities {
  const cashtags = (text.match(/\$[A-Za-z]{1,6}\b/g) || []).map(c => c.toUpperCase());
  const hashtags = (text.match(/#[\w]+/g) || []);
  const mentions = (text.match(/@[A-Za-z0-9_]{2,15}/g) || []);
  const urlMatches = text.match(/https?:\/\/[^\s]+/g) || [];
  const domains = urlMatches.map(url => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  }).filter(Boolean);
  
  return { cashtags, hashtags, mentions, domains };
}

function classifyPost(p: Post): { type: string; content: string } {
  const type = p.isRepost ? 'Repost' : p.isQuote ? 'Quote' : p.isReply ? 'Reply' : 'Post';
  const content = p.hasMedia ? 'Media' : p.hasLink ? 'Link' : 'Text';
  return { type, content };
}

function withinRange(ts: number, range: string): boolean {
  const now = Date.now();
  const diff = now - ts;
  switch (range) {
    case '1h': return diff <= 60 * 60 * 1000;
    case '4h': return diff <= 4 * 60 * 60 * 1000;
    case '1d': return diff <= 24 * 60 * 60 * 1000;
    case '7d': return diff <= 7 * 24 * 60 * 60 * 1000;
    default: return true;
  }
}

export default function TwitterTrackerPage() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  return (
    <View style={[styles.page, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Twitter Tracker</Text>
          <View style={styles.pill}>
            <Text style={styles.pillText}>BETA</Text>
          </View>
          <View style={styles.flex1} />
          <TouchableOpacity style={styles.pill} activeOpacity={0.7}>
            <Text style={styles.pillText}>⌘K</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.subnav}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subnavContent}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.pill,
                styles.tabPill,
                activeTab === tab.key && styles.pillActive,
              ]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  activeTab === tab.key && styles.pillTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'ruleBuilder' && <RuleBuilderTab />}
        {activeTab === 'targets' && <TargetsTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </View>
    </View>
  );
}

function DashboardTab() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedHandle, setSelectedHandle] = useState('all');
  const [timeRange, setTimeRange] = useState('1d');
  const [contentType, setContentType] = useState('any');
  const [mutedWords, setMutedWords] = useState('');
  const [includeRegex, setIncludeRegex] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const filteredFeed = useMemo(() => {
    let filtered = MOCK_FEED;

    if (searchKeyword) {
      filtered = filtered.filter(p => p.text.toLowerCase().includes(searchKeyword.toLowerCase()));
    }

    if (selectedHandle !== 'all') {
      filtered = filtered.filter(p => p.handle === selectedHandle);
    }

    filtered = filtered.filter(p => withinRange(p.ts, timeRange));

    if (contentType !== 'any') {
      if (contentType === 'text') filtered = filtered.filter(p => !p.hasMedia && !p.hasLink);
      if (contentType === 'links') filtered = filtered.filter(p => p.hasLink);
      if (contentType === 'media') filtered = filtered.filter(p => p.hasMedia);
      if (contentType === 'replies') filtered = filtered.filter(p => p.isReply);
      if (contentType === 'original') filtered = filtered.filter(p => !p.isReply && !p.isRepost);
    }

    if (mutedWords) {
      const muted = mutedWords.split(',').map(w => w.trim().toLowerCase()).filter(Boolean);
      filtered = filtered.filter(p => !muted.some(w => p.text.toLowerCase().includes(w)));
    }

    if (includeRegex) {
      try {
        const regex = new RegExp(includeRegex, 'i');
        filtered = filtered.filter(p => regex.test(p.text));
      } catch {
        // Invalid regex, ignore
      }
    }

    return filtered.sort((a, b) => b.ts - a.ts);
  }, [searchKeyword, selectedHandle, timeRange, contentType, mutedWords, includeRegex]);

  return (
    <View style={styles.dashboardGrid}>
      <ScrollView style={styles.leftColumn} showsVerticalScrollIndicator={false}>
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Filters</Text>
          </View>
          <View style={styles.panelBody}>
            <View style={styles.filterGrid}>
              <LabeledInput label="Search keyword" value={searchKeyword} onChangeText={setSearchKeyword} />
              <LabeledSelect
                label="Handle"
                value={selectedHandle}
                options={['all', ...MOCK_HANDLES.map(h => h.handle)]}
                onChange={setSelectedHandle}
              />
              <LabeledSelect
                label="Time range"
                value={timeRange}
                options={['1h', '4h', '1d', '7d']}
                onChange={setTimeRange}
              />
              <LabeledSelect
                label="Content"
                value={contentType}
                options={['any', 'text', 'links', 'media', 'replies', 'original']}
                onChange={setContentType}
              />
              <LabeledSelect
                label="Language"
                value="any"
                options={['any', 'en', 'es', 'fr', 'de']}
                onChange={() => {}}
              />
              <LabeledInput label="Muted words" value={mutedWords} onChangeText={setMutedWords} placeholder="comma,separated" />
              <LabeledInput label="Include regex" value={includeRegex} onChangeText={setIncludeRegex} />
            </View>
          </View>
        </View>
      </ScrollView>

      <ScrollView style={styles.rightColumn} showsVerticalScrollIndicator={false}>
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Detections</Text>
          </View>
          <View style={styles.panelToolbar}>
            <Text style={styles.toolbarText}>{filteredFeed.length} results</Text>
          </View>
          <View style={styles.panelBody}>
            <View style={styles.feedList}>
              {filteredFeed.map((post) => {
                const { type, content } = classifyPost(post);
                const entities = extractEntities(post.text);
                return (
                  <View key={post.id} style={styles.feedItem}>
                    <View style={styles.feedItemHeader}>
                      <Text style={styles.feedTime}>{new Date(post.ts).toLocaleTimeString()}</Text>
                      <View style={styles.feedPills}>
                        <View style={styles.pillSmall}>
                          <Text style={styles.pillSmallText}>{type}</Text>
                        </View>
                        <View style={styles.pillSmall}>
                          <Text style={styles.pillSmallText}>{content}</Text>
                        </View>
                        {post.verified && (
                          <View style={[styles.pillSmall, styles.pillVerified]}>
                            <Text style={styles.pillSmallText}>VERIFIED</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Text style={styles.feedText}>{post.text}</Text>
                    <View style={styles.feedMeta}>
                      <View style={styles.feedPills}>
                        <View style={styles.pillSmall}>
                          <Text style={styles.pillSmallText}>❤ {post.likes}</Text>
                        </View>
                        <View style={styles.pillSmall}>
                          <Text style={styles.pillSmallText}>↻ {post.reposts}</Text>
                        </View>
                        <View style={styles.pillSmall}>
                          <Text style={styles.pillSmallText}>💬 {post.comments}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.feedEntities}>
                      {entities.cashtags.map((c, i) => (
                        <View key={`c-${i}`} style={[styles.pillSmall, styles.pillEntity]}>
                          <Text style={styles.pillSmallText}>{c}</Text>
                        </View>
                      ))}
                      {entities.hashtags.map((h, i) => (
                        <View key={`h-${i}`} style={[styles.pillSmall, styles.pillEntity]}>
                          <Text style={styles.pillSmallText}>{h}</Text>
                        </View>
                      ))}
                      {entities.domains.map((d, i) => (
                        <View key={`d-${i}`} style={[styles.pillSmall, styles.pillEntity]}>
                          <Text style={styles.pillSmallText}>{d}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.feedActions}>
                      <TouchableOpacity style={styles.pillSmall} onPress={() => setSelectedPost(post)}>
                        <Text style={styles.pillSmallText}>Open</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.pillSmall}>
                        <Text style={styles.pillSmallText}>Copy link</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.pillSmall}>
                        <Text style={styles.pillSmallText}>Mute like this</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {selectedPost && (
        <View style={styles.drawer}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>{selectedPost.handle} · {new Date(selectedPost.ts).toLocaleString()}</Text>
            <TouchableOpacity style={styles.pill} onPress={() => setSelectedPost(null)}>
              <Text style={styles.pillText}>Close</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.drawerBody}>
            <View style={styles.drawerSection}>
              <Text style={styles.drawerSectionTitle}>AI Overview (placeholder)</Text>
              <Text style={styles.drawerText}>• Summary: Post discusses supply chain updates</Text>
              <Text style={styles.drawerText}>• Risk tone: Neutral</Text>
              <Text style={styles.drawerText}>• Detected entities: {extractEntities(selectedPost.text).cashtags.join(', ')}</Text>
              <Text style={styles.drawerText}>• Matched rules: None</Text>
            </View>
            <View style={styles.drawerSection}>
              <Text style={styles.drawerSectionTitle}>Comments (mock)</Text>
              <Text style={styles.drawerText}>@user1: Great insight!</Text>
              <Text style={styles.drawerText}>@user2: Thanks for sharing</Text>
            </View>
            <View style={styles.drawerSection}>
              <Text style={styles.drawerSectionTitle}>Link/Media preview</Text>
              <Text style={styles.drawerText}>Placeholder for media/link preview</Text>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function RuleBuilderTab() {
  const [subject, setSubject] = useState<RuleSubject>('account');
  const [targetValue, setTargetValue] = useState('');
  const [channels, setChannels] = useState<RuleChannel[]>([]);
  const [rateCap, setRateCap] = useState('10');
  const [digest, setDigest] = useState('0');
  const [quietHours, setQuietHours] = useState('');
  const [marketHoursOnly, setMarketHoursOnly] = useState(false);

  const handleSave = () => {
    console.log('Rule saved:', { subject, targetValue, channels, rateCap, digest, quietHours, marketHoursOnly });
  };

  const handleClear = () => {
    setTargetValue('');
    setChannels([]);
    setRateCap('10');
    setDigest('0');
    setQuietHours('');
    setMarketHoursOnly(false);
  };

  return (
    <View style={styles.ruleBuilderGrid}>
      <ScrollView style={styles.leftColumn} showsVerticalScrollIndicator={false}>
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Rule Builder</Text>
          </View>
          <View style={styles.panelBody}>
            <View style={styles.filterGrid}>
              <LabeledSelect
                label="IF (subject)"
                value={subject}
                options={['account', 'group', 'keyword', 'cashtag', 'domain', 'language', 'time window']}
                onChange={(v) => setSubject(v as RuleSubject)}
              />
              <LabeledInput label="Target / value" value={targetValue} onChangeText={setTargetValue} placeholder="supports regex" />
              <View style={styles.formGroup}>
                <Text style={styles.label}>THEN (channels)</Text>
                <View style={styles.checkboxGroup}>
                  {(['toast', 'inbox', 'email', 'webhook'] as RuleChannel[]).map((ch) => (
                    <TouchableOpacity
                      key={ch}
                      style={[styles.checkbox, channels.includes(ch) && styles.checkboxActive]}
                      onPress={() => {
                        if (channels.includes(ch)) {
                          setChannels(channels.filter(c => c !== ch));
                        } else {
                          setChannels([...channels, ch]);
                        }
                      }}
                    >
                      <Text style={[styles.checkboxText, channels.includes(ch) && styles.checkboxTextActive]}>{ch}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <LabeledInput label="Rate cap (alerts/min)" value={rateCap} onChangeText={setRateCap} keyboardType="numeric" />
              <LabeledInput label="Digest (minutes, 0=off)" value={digest} onChangeText={setDigest} keyboardType="numeric" />
              <LabeledInput label="Quiet hours (HH:MM-HH:MM)" value={quietHours} onChangeText={setQuietHours} placeholder="22:00-08:00" />
              <TouchableOpacity
                style={[styles.checkbox, marketHoursOnly && styles.checkboxActive]}
                onPress={() => setMarketHoursOnly(!marketHoursOnly)}
              >
                <Text style={[styles.checkboxText, marketHoursOnly && styles.checkboxTextActive]}>Only during market hours</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.panelFooter}>
            <View style={styles.footerContent}>
              <TouchableOpacity style={styles.pill} onPress={handleClear}>
                <Text style={styles.pillText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pill, styles.pillPrimary]} onPress={handleSave}>
                <Text style={[styles.pillText, styles.pillTextPrimary]}>Save Rule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <ScrollView style={styles.rightColumn} showsVerticalScrollIndicator={false}>
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Preview & Examples</Text>
          </View>
          <View style={styles.panelBody}>
            <View style={styles.previewCard}>
              <Text style={styles.previewLabel}>IF</Text>
              <Text style={styles.previewValue}>{subject}: {targetValue || '(empty)'}</Text>
              <Text style={styles.previewLabel}>THEN</Text>
              <Text style={styles.previewValue}>{channels.length > 0 ? channels.join(', ') : '(no channels)'}</Text>
              <Text style={styles.previewLabel}>WITH</Text>
              <Text style={styles.previewValue}>Rate: {rateCap}/min · Digest: {digest}m · Quiet: {quietHours || 'none'}</Text>
              {marketHoursOnly && <Text style={styles.previewValue}>Market hours only</Text>}
            </View>
            <View style={styles.examplesSection}>
              <Text style={styles.examplesSectionTitle}>Examples</Text>
              <Text style={styles.exampleText}>• IF account: @flofeed THEN toast, inbox WITH rate 5/min</Text>
              <Text style={styles.exampleText}>• IF cashtag: $NVDA THEN email WITH digest 30m</Text>
              <Text style={styles.exampleText}>• IF keyword: &quot;supply chain&quot; THEN webhook WITH quiet 22:00-08:00</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function TargetsTab() {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Targets Directory</Text>
      </View>
      <View style={styles.panelToolbar}>
        <Text style={styles.toolbarText}>{MOCK_HANDLES.length} tracked</Text>
      </View>
      <ScrollView style={styles.panelBody} showsVerticalScrollIndicator={false}>
        <View style={styles.targetsGrid}>
          {MOCK_HANDLES.map((handle) => (
            <View key={handle.id} style={styles.targetCard}>
              <View style={styles.targetCardHeader}>
                <Text style={styles.targetHandle}>{handle.handle}</Text>
                {handle.verified && (
                  <View style={[styles.pillSmall, styles.pillVerified]}>
                    <Text style={styles.pillSmallText}>VERIFIED</Text>
                  </View>
                )}
                <View style={styles.flex1} />
                <View style={styles.pillSmall}>
                  <Text style={styles.pillSmallText}>{handle.postsPerDay}/day</Text>
                </View>
              </View>
              <Text style={styles.targetMeta}>
                Followers ≈ {Math.floor(handle.followers / 1000)}k · Last seen {handle.lastSeenMins}m
              </Text>
              <View style={styles.targetTags}>
                {handle.tags.map((tag, i) => (
                  <View key={i} style={styles.pillSmall}>
                    <Text style={styles.pillSmallText}>{tag}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.targetActions}>
                <TouchableOpacity style={styles.pillSmall}>
                  <Text style={styles.pillSmallText}>Open</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pillSmall}>
                  <Text style={styles.pillSmallText}>Mute</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function AnalyticsTab() {
  return (
    <ScrollView style={styles.analyticsContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.analyticsGrid}>
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Activity Heatmap</Text>
          </View>
          <View style={styles.panelBody}>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.placeholderText}>Heatmap placeholder</Text>
            </View>
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Leaderboards</Text>
          </View>
          <View style={styles.panelBody}>
            <View style={styles.leaderboardSection}>
              <Text style={styles.leaderboardTitle}>Most active</Text>
              <View style={styles.leaderboardList}>
                {MOCK_HANDLES.sort((a, b) => b.postsPerDay - a.postsPerDay).map((handle, idx) => (
                  <View key={handle.id} style={styles.leaderboardItem}>
                    <Text style={styles.leaderboardRank}>{idx + 1}.</Text>
                    <Text style={styles.leaderboardHandle}>{handle.handle}</Text>
                    <View style={styles.flex1} />
                    <Text style={styles.leaderboardValue}>{handle.postsPerDay}/day</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.leaderboardSection}>
              <Text style={styles.leaderboardTitle}>Highest avg engagement</Text>
              <View style={styles.leaderboardList}>
                {MOCK_HANDLES.sort((a, b) => b.followers - a.followers).map((handle, idx) => (
                  <View key={handle.id} style={styles.leaderboardItem}>
                    <Text style={styles.leaderboardRank}>{idx + 1}.</Text>
                    <Text style={styles.leaderboardHandle}>{handle.handle}</Text>
                    <View style={styles.flex1} />
                    <Text style={styles.leaderboardValue}>{Math.floor(handle.followers / 1000)}k</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Top Links & Topics</Text>
          </View>
          <View style={styles.panelBody}>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.placeholderText}>Bar/word cloud placeholder</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function SettingsTab() {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Settings</Text>
      </View>
      <View style={styles.panelBody}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Coming next…</Text>
        </View>
      </View>
    </View>
  );
}

function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
}) {
  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textDim}
        keyboardType={keyboardType}
      />
    </View>
  );
}

function LabeledSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.input} onPress={() => setExpanded(!expanded)}>
        <Text style={styles.inputText}>{value}</Text>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.selectDropdown}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.selectOption}
              onPress={() => {
                onChange(opt);
                setExpanded(false);
              }}
            >
              <Text style={styles.selectOptionText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 0 0 1px var(--border), 0 6px 14px rgba(0,0,0,.35)',
      } as any,
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 13,
    color: theme.colors.text,
    letterSpacing: 0.5,
    fontWeight: '500' as const,
  },
  flex1: {
    flex: 1,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  pillText: {
    fontSize: 12,
    color: theme.colors.textDim,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  pillActive: {
    backgroundColor: theme.colors.border,
  },
  pillTextActive: {
    color: theme.colors.text,
  },
  pillPrimary: {
    backgroundColor: theme.colors.activeCyan,
    borderColor: theme.colors.activeCyan,
  },
  pillTextPrimary: {
    color: theme.colors.bg,
  },
  subnav: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  subnavContent: {
    flexDirection: 'row',
    gap: 8,
  },
  tabPill: {
    minHeight: 36,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    overflow: 'hidden' as any,
  },
  panel: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6,
    margin: 12,
  },
  panelHeader: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  panelTitle: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '500' as const,
  },
  panelToolbar: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
  },
  toolbarText: {
    fontSize: 12,
    color: theme.colors.textDim,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  panelBody: {
    flex: 1,
    padding: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  panelFooter: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
  },
  footerContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
  dashboardGrid: {
    flex: 1,
    flexDirection: 'row',
  },
  leftColumn: {
    width: 300,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  rightColumn: {
    flex: 1,
  },
  filterGrid: {
    gap: 12,
  },
  formGroup: {
    gap: 4,
  },
  label: {
    fontSize: 11,
    color: theme.colors.textDim,
    letterSpacing: 0.2,
    textTransform: 'uppercase' as const,
  },
  input: {
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 13,
    color: theme.colors.text,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  inputText: {
    fontSize: 13,
    color: theme.colors.text,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  selectDropdown: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 4,
    marginTop: 4,
    maxHeight: 200,
  },
  selectOption: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectOptionText: {
    fontSize: 13,
    color: theme.colors.text,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  feedList: {
    gap: 12,
  },
  feedItem: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 12,
    gap: 8,
  },
  feedItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feedTime: {
    fontSize: 13,
    color: theme.colors.text,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  feedPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  pillSmall: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  pillSmallText: {
    fontSize: 10,
    color: theme.colors.textDim,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  pillVerified: {
    backgroundColor: theme.colors.activeCyan,
    borderColor: theme.colors.activeCyan,
  },
  pillEntity: {
    backgroundColor: theme.colors.border,
  },
  feedText: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
  },
  feedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedEntities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  feedActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxHeight: '50%',
    ...Platform.select({
      web: {
        boxShadow: '0 -4px 20px rgba(0,0,0,.5)',
      } as any,
    }),
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  drawerTitle: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '500' as const,
  },
  drawerBody: {
    flex: 1,
    padding: 12,
  },
  drawerSection: {
    marginBottom: 16,
    gap: 4,
  },
  drawerSectionTitle: {
    fontSize: 12,
    color: theme.colors.textDim,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  drawerText: {
    fontSize: 12,
    color: theme.colors.text,
    lineHeight: 16,
  },
  ruleBuilderGrid: {
    flex: 1,
    flexDirection: 'row',
  },
  checkboxGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  checkbox: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  checkboxActive: {
    backgroundColor: theme.colors.activeCyan,
    borderColor: theme.colors.activeCyan,
  },
  checkboxText: {
    fontSize: 12,
    color: theme.colors.textDim,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  checkboxTextActive: {
    color: theme.colors.bg,
  },
  previewCard: {
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 11,
    color: theme.colors.textDim,
    letterSpacing: 0.2,
    textTransform: 'uppercase' as const,
  },
  previewValue: {
    fontSize: 13,
    color: theme.colors.text,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  examplesSection: {
    gap: 8,
  },
  examplesSectionTitle: {
    fontSize: 12,
    color: theme.colors.textDim,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 12,
    color: theme.colors.text,
    lineHeight: 16,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  targetsGrid: {
    gap: 12,
  },
  targetCard: {
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6,
    padding: 12,
    gap: 8,
  },
  targetCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  targetHandle: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '600' as const,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  targetMeta: {
    fontSize: 11,
    color: theme.colors.textDim,
  },
  targetTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  targetActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  analyticsContainer: {
    flex: 1,
  },
  analyticsGrid: {
    gap: 12,
    padding: 12,
  },
  chartPlaceholder: {
    height: 240,
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 13,
    color: theme.colors.textDim,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  leaderboardSection: {
    marginBottom: 16,
    gap: 8,
  },
  leaderboardTitle: {
    fontSize: 12,
    color: theme.colors.textDim,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.2,
  },
  leaderboardList: {
    gap: 6,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  leaderboardRank: {
    fontSize: 12,
    color: theme.colors.textDim,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    width: 24,
  },
  leaderboardHandle: {
    fontSize: 13,
    color: theme.colors.text,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  leaderboardValue: {
    fontSize: 12,
    color: theme.colors.textDim,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
});
