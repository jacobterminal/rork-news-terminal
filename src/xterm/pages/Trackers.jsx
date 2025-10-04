import React, { useMemo, useState, useCallback } from "react";
import Panel from "../components/Panel";
import "../theme/tokens.css";
import "../theme/util.css";

const MOCK_HANDLES = [
  { id: "h1", handle: "@semi_analyst", verified: true, followers: 45200, tags: ["semiconductors", "supply-chain"], postsPerDay: 12, lastSeenMins: 5 },
  { id: "h2", handle: "@chipedge", verified: false, followers: 8900, tags: ["chips", "rumors"], postsPerDay: 8, lastSeenMins: 15 },
  { id: "h3", handle: "@supplywatch", verified: true, followers: 102000, tags: ["logistics", "datacenter"], postsPerDay: 6, lastSeenMins: 45 },
  { id: "h4", handle: "@flofeed", verified: false, followers: 3400, tags: ["AI", "infra"], postsPerDay: 20, lastSeenMins: 2 },
];

const MOCK_FEED = Array.from({ length: 30 }).map((_, i) => {
  const handles = ["@semi_analyst", "@chipedge", "@supplywatch", "@flofeed"];
  const handle = handles[i % handles.length];
  const verified = handle === "@semi_analyst" || handle === "@supplywatch";
  const texts = [
    "$NVDA H200 production checks positive; lead times steady. #AI #datacenter https://example.com/report",
    "Channel partners see stable orders into Q4. Watching $AAPL supply closely.",
    "Rumor: additional CoWoS capacity coming online in TW. $TSM beneficiary. @industry_insider thoughts?",
    "$MSFT Azure expansion continues. New regions announced. #cloud",
    "Breaking: $GOOGL announces new TPU generation. Competitive with H100?",
    "$AMD MI300 ramp looking solid per checks. #AI #compute",
    "Supply chain chatter: HBM3E allocations tightening. $NVDA $AMD exposure.",
    "$INTC foundry wins rumored. Waiting for confirmation. @chipnews",
    "Datacenter capex trends remain strong. $NVDA $AMD $AVGO all benefit.",
    "$TSLA Dojo progress update expected soon. Custom silicon play.",
  ];
  const text = texts[i % texts.length];
  const hasMedia = i % 5 === 0;
  const hasLink = text.includes("http");
  const isReply = i % 7 === 0;
  const isRepost = i % 11 === 0;
  const isQuote = i % 13 === 0;
  const likes = Math.floor(Math.random() * 500) + 10;
  const reposts = Math.floor(Math.random() * 100);
  const comments = Math.floor(Math.random() * 50);
  const ts = Date.now() - i * 15 * 60 * 1000;

  return {
    id: `p${i + 1}`,
    handle,
    ts,
    text,
    hasMedia,
    hasLink,
    isReply,
    isRepost,
    isQuote,
    verified,
    likes,
    reposts,
    comments,
  };
});

function extractEntities(text) {
  const cashtags = [...new Set((text.match(/\$[A-Za-z]{1,6}\b/g) || []))];
  const hashtags = [...new Set((text.match(/#[\w\u00C0-\u017F]+/g) || []))];
  const mentions = [...new Set((text.match(/@[A-Za-z0-9_]{2,15}/g) || []))];
  const urlMatches = text.match(/https?:\/\/[^\s]+/g) || [];
  const domains = [...new Set(urlMatches.map(url => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  }).filter(Boolean))];

  return { cashtags, hashtags, mentions, domains };
}

function classifyPost(p) {
  let type = "Post";
  if (p.isReply) type = "Reply";
  else if (p.isRepost) type = "Repost";
  else if (p.isQuote) type = "Quote";

  let content = "Text";
  if (p.hasMedia) content = "Media";
  else if (p.hasLink) content = "Link";

  return { type, content };
}

function withinRange(ts, range) {
  const now = Date.now();
  const diff = now - ts;
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;

  switch (range) {
    case "1h": return diff <= hour;
    case "4h": return diff <= 4 * hour;
    case "1d": return diff <= day;
    case "7d": return diff <= 7 * day;
    default: return true;
  }
}

function FiltersPanel({ filters, onChange }) {
  return (
    <Panel title="Filters">
      <div className="grid gap-3">
        <label className="grid gap-1">
          <span className="label text-[11px] opacity-70">Search keyword</span>
          <input
            type="text"
            value={filters.keyword}
            onChange={(e) => onChange({ ...filters, keyword: e.target.value })}
            className="focusable bg-[var(--panel-elev)] border border-[var(--border)] rounded-[var(--r-sm)] px-2 py-2 outline-none w-full font-mono text-[13px]"
            placeholder="NVDA, AI, etc."
          />
        </label>

        <label className="grid gap-1">
          <span className="label text-[11px] opacity-70">Handle</span>
          <select
            value={filters.handle}
            onChange={(e) => onChange({ ...filters, handle: e.target.value })}
            className="focusable bg-[var(--panel-elev)] border border-[var(--border)] rounded-[var(--r-sm)] px-2 py-2 outline-none w-full font-mono text-[13px]"
          >
            <option value="">All handles</option>
            {MOCK_HANDLES.map(h => (
              <option key={h.id} value={h.handle}>{h.handle}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="label text-[11px] opacity-70">Time range</span>
          <select
            value={filters.timeRange}
            onChange={(e) => onChange({ ...filters, timeRange: e.target.value })}
            className="focusable bg-[var(--panel-elev)] border border-[var(--border)] rounded-[var(--r-sm)] px-2 py-2 outline-none w-full font-mono text-[13px]"
          >
            <option value="1h">1h</option>
            <option value="4h">4h</option>
            <option value="1d">1d</option>
            <option value="7d">7d</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="label text-[11px] opacity-70">Content</span>
          <select
            value={filters.content}
            onChange={(e) => onChange({ ...filters, content: e.target.value })}
            className="focusable bg-[var(--panel-elev)] border border-[var(--border)] rounded-[var(--r-sm)] px-2 py-2 outline-none w-full font-mono text-[13px]"
          >
            <option value="any">Any</option>
            <option value="text">Text only</option>
            <option value="links">Links</option>
            <option value="media">Media</option>
            <option value="replies">Replies</option>
            <option value="original">Original posts</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="label text-[11px] opacity-70">Language</span>
          <select
            value={filters.language}
            onChange={(e) => onChange({ ...filters, language: e.target.value })}
            className="focusable bg-[var(--panel-elev)] border border-[var(--border)] rounded-[var(--r-sm)] px-2 py-2 outline-none w-full font-mono text-[13px]"
          >
            <option value="any">Any</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="label text-[11px] opacity-70">Muted words (comma-separated)</span>
          <input
            type="text"
            value={filters.mutedWords}
            onChange={(e) => onChange({ ...filters, mutedWords: e.target.value })}
            className="focusable bg-[var(--panel-elev)] border border-[var(--border)] rounded-[var(--r-sm)] px-2 py-2 outline-none w-full font-mono text-[13px]"
            placeholder="spam, promo"
          />
        </label>

        <label className="grid gap-1">
          <span className="label text-[11px] opacity-70">Include regex</span>
          <input
            type="text"
            value={filters.includeRegex}
            onChange={(e) => onChange({ ...filters, includeRegex: e.target.value })}
            className="focusable bg-[var(--panel-elev)] border border-[var(--border)] rounded-[var(--r-sm)] px-2 py-2 outline-none w-full font-mono text-[13px]"
            placeholder="(?i)breaking|alert"
          />
        </label>
      </div>
    </Panel>
  );
}

function FeedItem({ post, onOpen }) {
  const { type, content } = classifyPost(post);
  const entities = extractEntities(post.text);
  const timeStr = new Date(post.ts).toLocaleTimeString();

  return (
    <div className="border-b border-[var(--border)] py-3" data-testid="feed-item">
      <div className="flex items-start gap-2 mb-2">
        <span className="label tabular-nums text-[11px] opacity-70">{timeStr}</span>
        <span className="pill text-[10px]">{type}</span>
        <span className="pill text-[10px]">{content}</span>
        {post.verified && <span className="pill pill-up text-[10px]">VERIFIED</span>}
        <div className="flex-1" />
        <span className="pill text-[10px]">❤ {post.likes}</span>
        <span className="pill text-[10px]">↻ {post.reposts}</span>
        <span className="pill text-[10px]">💬 {post.comments}</span>
      </div>

      <div className="text-[13px] leading-snug mb-2 whitespace-pre-wrap break-words">
        {post.text}
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {entities.cashtags.map(tag => (
          <span key={tag} className="pill text-[10px] bg-blue-500/10">{tag}</span>
        ))}
        {entities.hashtags.map(tag => (
          <span key={tag} className="pill text-[10px] bg-purple-500/10">{tag}</span>
        ))}
        {entities.domains.map(domain => (
          <span key={domain} className="pill text-[10px] bg-green-500/10">{domain}</span>
        ))}
        {entities.mentions.map(mention => (
          <span key={mention} className="pill text-[10px] bg-orange-500/10">{mention}</span>
        ))}
      </div>

      <div className="flex gap-2">
        <button className="pill focusable text-[11px]" onClick={() => onOpen(post)}>Open</button>
        <button className="pill focusable text-[11px]">Copy link</button>
        <button className="pill focusable text-[11px]">Mute like this</button>
      </div>
    </div>
  );
}

function DetectionsPanel({ posts, onOpen }) {
  return (
    <Panel
      title="Detections"
      toolbar={
        <div className="flex items-center gap-2">
          <span className="label text-[11px]">{posts.length} results</span>
        </div>
      }
    >
      <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
        {posts.map(p => (
          <FeedItem key={p.id} post={p} onOpen={onOpen} />
        ))}
      </div>
    </Panel>
  );
}

function Drawer({ post, onClose }) {
  if (!post) return null;

  const entities = extractEntities(post.text);
  const timeStr = new Date(post.ts).toLocaleTimeString();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-[var(--panel)] border-t border-[var(--border)] rounded-t-[12px] shadow-2xl z-50"
      style={{ maxHeight: "70vh", overflow: "hidden" }}
      data-testid="drawer"
    >
      <div className="px-3 py-2 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="value text-[13px]">{post.handle}</span>
          <span className="label text-[11px]">{timeStr}</span>
        </div>
        <button className="pill focusable" onClick={onClose}>Close</button>
      </div>

      <div className="grid md:grid-cols-2 gap-3 p-3 overflow-auto" style={{ maxHeight: "calc(70vh - 60px)" }}>
        <div className="grid gap-3">
          <Panel title="AI Overview">
            <div className="grid gap-2 text-[12px]">
              <div>
                <div className="label text-[10px] mb-1">Summary</div>
                <div className="opacity-80">Post discusses {entities.cashtags.join(", ") || "market activity"} with positive sentiment.</div>
              </div>
              <div>
                <div className="label text-[10px] mb-1">Risk Tone</div>
                <div className="opacity-80">Neutral to bullish</div>
              </div>
              <div>
                <div className="label text-[10px] mb-1">Detected Entities</div>
                <div className="flex flex-wrap gap-1">
                  {[...entities.cashtags, ...entities.hashtags].map(e => (
                    <span key={e} className="pill text-[10px]">{e}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="label text-[10px] mb-1">Matched Rules</div>
                <div className="opacity-80">Rule #1: High-engagement semiconductor posts</div>
              </div>
            </div>
          </Panel>

          <Panel title="Comments">
            <div className="grid gap-2 text-[12px]">
              <div className="border-b border-[var(--border)] pb-2">
                <div className="label text-[10px] mb-1">@user1 · 5m ago</div>
                <div className="opacity-80">Great insight, thanks for sharing!</div>
              </div>
              <div className="border-b border-[var(--border)] pb-2">
                <div className="label text-[10px] mb-1">@user2 · 12m ago</div>
                <div className="opacity-80">Do you have a source for this?</div>
              </div>
              <div className="opacity-50 text-[11px]">End of comments</div>
            </div>
          </Panel>
        </div>

        <div className="grid gap-3">
          <Panel title="Link/Media Preview">
            <div className="grid gap-2 text-[12px]">
              {post.hasMedia && (
                <div className="bg-[var(--panel-elev)] border border-[var(--border)] rounded-[var(--r-sm)] p-4 text-center opacity-50">
                  [Media preview placeholder]
                </div>
              )}
              {post.hasLink && entities.domains.length > 0 && (
                <div>
                  <div className="label text-[10px] mb-1">Linked domains</div>
                  <div className="flex flex-wrap gap-1">
                    {entities.domains.map(d => (
                      <span key={d} className="pill text-[10px]">{d}</span>
                    ))}
                  </div>
                </div>
              )}
              {!post.hasMedia && !post.hasLink && (
                <div className="opacity-50 text-[11px]">No media or links</div>
              )}
            </div>
          </Panel>

          <Panel title="Entities">
            <div className="grid gap-2 text-[12px]">
              {entities.cashtags.length > 0 && (
                <div>
                  <div className="label text-[10px] mb-1">Cashtags</div>
                  <div className="flex flex-wrap gap-1">
                    {entities.cashtags.map(c => (
                      <span key={c} className="pill text-[10px]">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {entities.hashtags.length > 0 && (
                <div>
                  <div className="label text-[10px] mb-1">Hashtags</div>
                  <div className="flex flex-wrap gap-1">
                    {entities.hashtags.map(h => (
                      <span key={h} className="pill text-[10px]">{h}</span>
                    ))}
                  </div>
                </div>
              )}
              {entities.mentions.length > 0 && (
                <div>
                  <div className="label text-[10px] mb-1">Mentions</div>
                  <div className="flex flex-wrap gap-1">
                    {entities.mentions.map(m => (
                      <span key={m} className="pill text-[10px]">{m}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function DashboardTab() {
  const [filters, setFilters] = useState({
    keyword: "",
    handle: "",
    timeRange: "1d",
    content: "any",
    language: "any",
    mutedWords: "",
    includeRegex: "",
  });

  const [selectedPost, setSelectedPost] = useState(null);

  const filteredPosts = useMemo(() => {
    let result = [...MOCK_FEED];

    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      result = result.filter(p => p.text.toLowerCase().includes(kw));
    }

    if (filters.handle) {
      result = result.filter(p => p.handle === filters.handle);
    }

    if (filters.timeRange) {
      result = result.filter(p => withinRange(p.ts, filters.timeRange));
    }

    if (filters.content !== "any") {
      switch (filters.content) {
        case "text":
          result = result.filter(p => !p.hasMedia && !p.hasLink);
          break;
        case "links":
          result = result.filter(p => p.hasLink);
          break;
        case "media":
          result = result.filter(p => p.hasMedia);
          break;
        case "replies":
          result = result.filter(p => p.isReply);
          break;
        case "original":
          result = result.filter(p => !p.isReply && !p.isRepost);
          break;
      }
    }

    if (filters.mutedWords) {
      const muted = filters.mutedWords.split(",").map(w => w.trim().toLowerCase()).filter(Boolean);
      result = result.filter(p => {
        const text = p.text.toLowerCase();
        return !muted.some(m => text.includes(m));
      });
    }

    if (filters.includeRegex) {
      try {
        const regex = new RegExp(filters.includeRegex);
        result = result.filter(p => regex.test(p.text));
      } catch (e) {
        console.warn("Invalid regex:", e);
      }
    }

    return result;
  }, [filters]);

  return (
    <>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[380px_1fr]">
        <FiltersPanel filters={filters} onChange={setFilters} />
        <DetectionsPanel posts={filteredPosts} onOpen={setSelectedPost} />
      </div>
      {selectedPost && <Drawer post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </>
  );
}

function RuleBuilderTab() {
  return (
    <Panel title="Rule Builder">
      <div className="text-center opacity-50 py-8">Coming next…</div>
    </Panel>
  );
}

function TargetsTab() {
  return (
    <Panel title="Targets">
      <div className="text-center opacity-50 py-8">Coming next…</div>
    </Panel>
  );
}

function AnalyticsTab() {
  return (
    <Panel title="Analytics">
      <div className="text-center opacity-50 py-8">Coming next…</div>
    </Panel>
  );
}

function SettingsTab() {
  return (
    <Panel title="Settings">
      <div className="text-center opacity-50 py-8">Coming next…</div>
    </Panel>
  );
}

function BottomNav() {
  return (
    <nav className="border-t border-[var(--border)] bg-[var(--panel)] px-3 py-2 sticky bottom-0" data-testid="bottom-nav">
      <div className="grid grid-cols-4 gap-2 text-center">
        <a href="/news" className="pill focusable block">News</a>
        <a href="/moves" className="pill focusable block">Moves</a>
        <a href="/trackers" className="pill focusable block">Trackers</a>
        <a href="/watchlist" className="pill focusable block">Watchlist</a>
      </div>
    </nav>
  );
}

export default function TrackersPage() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const tabs = ["Dashboard", "Rule Builder", "Targets", "Analytics", "Settings"];

  return (
    <div className="h-full w-full grid" style={{ gridTemplateRows: "auto auto 1fr auto", overflow: "hidden" }} data-testid="trackers-page">
      <div className="px-3 py-2 border-b border-[var(--border)] bg-[var(--panel-elev)]">
        <div className="flex items-center gap-2">
          <h1 className="text-sm tracking-wide">Twitter Tracker</h1>
          <span className="pill">BETA</span>
          <div className="flex-1" />
          <button className="pill focusable">⌘K</button>
        </div>
      </div>

      <div className="px-3 py-2 border-b border-[var(--border)] bg-[var(--panel)]">
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`pill focusable ${activeTab === tab ? "pill-up" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="px-3 pb-3 overflow-hidden">
        <div className="h-full overflow-auto">
          {activeTab === "Dashboard" && <DashboardTab />}
          {activeTab === "Rule Builder" && <RuleBuilderTab />}
          {activeTab === "Targets" && <TargetsTab />}
          {activeTab === "Analytics" && <AnalyticsTab />}
          {activeTab === "Settings" && <SettingsTab />}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
