/*
Swap-to-API plan (ServerXShim):
- Replace LocalXShim with ServerXShim that calls your backend endpoints.
- Endpoints:
  GET /x/trackers -> Tracker[]
  GET /x/stream?trackerId=... -> XPost[] (or upgrade to WS for live stream proxy to X Filtered Stream)
  GET /x/alerts -> Alert[]
- Webhook receiver (X Account Activity API) -> persist to DB -> push to UI (SSE/WS).
- AI upgrade: replace summarizeTweet/opinionTag with GPT-5 Thinking. Instruction:
  "Summarize the tweet to one or two sentences max in neutral, precise language. Output an opinion tag (bullish/bearish/neutral) and a confidence 0–1. Never exceed 2 sentences."
*/

const trackersData = [
  { "id": "t_nvda", "title": "$NVDA chips", "query": "$NVDA OR Nvidia AI chips H200 H100 Blackwell", "type": "cashtag" as const, "pinned": true },
  { "id": "t_fomc", "title": "FOMC rates", "query": "FOMC OR fed funds OR dot plot OR Powell", "type": "keyword" as const, "pinned": true },
  { "id": "t_ceos", "title": "Tech CEOs", "query": "from:sundarpichai OR from:satyanadella OR from:tim_cook OR from:elonmusk", "type": "account" as const, "pinned": true },
  { "id": "t_ai", "title": "AI infra", "query": "AI datacenter OR inference OR fine-tune OR LLM serving", "type": "keyword" as const, "pinned": false }
];

const postsData: Record<string, XPost[]> = {
  "t_nvda": [
    {"id":"x001","ts":1727487205000,"author":"Nvidia Updates","handle":"@nvidia_news","text":"Blackwell yield improvements shared at partner briefing; board vendors prepping next rev.","metrics":{"like":820,"rt":210,"reply":55,"quote":18},"rules":["$NVDA"],"links":["https://example.com/nvda-blackwell"],"media":["https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=1200&q=80"]},
    {"id":"x002","ts":1727488205000,"author":"AI Compute","handle":"@aicompute","text":"H200 lead times compressing 2-3 weeks at select disti per checks.","metrics":{"like":520,"rt":130,"reply":22},"rules":["$NVDA"],"links":[]},
    {"id":"x003","ts":1727486205000,"author":"Semi Digest","handle":"@semidigest","text":"ODM seeing higher-layer power designs for next-gen GPU racks.","metrics":{"like":260,"rt":96,"reply":12},"rules":["$NVDA"],"links":[]},
    {"id":"x004","ts":1727489205000,"author":"Supply Chain","handle":"@supplyeyes","text":"Container routing normalizing at LA/LB; inbound GPU chassis parts up this week.","metrics":{"like":140,"rt":44},"rules":["$NVDA"],"links":[]},
    {"id":"x005","ts":1727489206000,"author":"Cloud Ops","handle":"@cloudops","text":"Seeing mixed utilization across inference clusters; some fleets idling overnight.","metrics":{"like":210,"rt":70},"rules":["$NVDA"],"links":[]},
    {"id":"x006","ts":1727481205000,"author":"DC Builder","handle":"@dcbuilder","text":"New immersion tanks arriving; thermal headroom looks solid for dense trays.","metrics":{"like":95,"rt":30},"rules":["$NVDA"],"links":[]}
  ],
  "t_fomc": [
    {"id":"x101","ts":1727487205000,"author":"Macro Watch","handle":"@macro_watch","text":"Powell remarks hint no preset path; data-dependent into year-end.","metrics":{"like":310,"rt":88,"reply":14},"rules":["FOMC"],"links":[]},
    {"id":"x102","ts":1727488205000,"author":"Rates Today","handle":"@rates_today","text":"Term premium chatter cropping up again after long lull.","metrics":{"like":180,"rt":40},"rules":["FOMC"],"links":[]},
    {"id":"x103","ts":1727489205000,"author":"Desk Notes","handle":"@desknotes","text":"Traders eye path for cuts vs growth mix; labor prints in focus.","metrics":{"like":270,"rt":60},"rules":["FOMC"],"links":[]},
    {"id":"x104","ts":1727484205000,"author":"Economy Live","handle":"@econlive","text":"Utilities CPI noise fading; core services sticky per models.","metrics":{"like":120,"rt":22},"rules":["FOMC"],"links":[]},
    {"id":"x105","ts":1727483205000,"author":"Policy Signals","handle":"@polsignals","text":"Fed speakers stick to script; watch SEP drift.","metrics":{"like":150,"rt":30},"rules":["FOMC"],"links":[]}
  ],
  "t_ceos": [
    {"id":"x201","ts":1727487205000,"author":"Elon Musk","handle":"@elonmusk","text":"Shipping another FSD beta drop tonight.","metrics":{"like":9200,"rt":2100,"reply":950,"quote":300},"rules":["elon"],"links":[]},
    {"id":"x202","ts":1727488205000,"author":"Tim Cook","handle":"@tim_cook","text":"Proud of the teams pushing accessibility forward across our platforms.","metrics":{"like":8200,"rt":1600},"rules":["apple"],"links":["https://apple.com"]},
    {"id":"x203","ts":1727489205000,"author":"Satya Nadella","handle":"@satyanadella","text":"Developers are the heart of our ecosystem. Excited for what's next.","metrics":{"like":5400,"rt":900},"rules":[],"links":[]},
    {"id":"x204","ts":1727484205000,"author":"Sundar Pichai","handle":"@sundarpichai","text":"Helpful AI for everyone.","metrics":{"like":4200,"rt":700},"rules":[],"links":[]},
    {"id":"x205","ts":1727483205000,"author":"Elon Musk","handle":"@elonmusk","text":"Starlink capacity expanding globally.","metrics":{"like":7600,"rt":1400},"rules":[],"links":[]}
  ]
};

const alertsData = [
  {
    "id": "a1",
    "name": "High-like NVDA mentions",
    "criteria": { "query": "$NVDA", "lang": "en", "has": ["media"], "minLikes": 200 },
    "throttleSec": 600,
    "enabled": true
  },
  {
    "id": "a2",
    "name": "Policy chatter",
    "criteria": { "query": "FOMC OR Powell", "lang": "en", "has": ["links"], "minLikes": 50 },
    "throttleSec": 900,
    "enabled": false
  }
];

export type XMetrics = {
  like?: number;
  rt?: number;
  reply?: number;
  quote?: number;
};

export type XPost = {
  id: string;
  ts: number;
  author: string;
  handle: string;
  text: string;
  lang?: string;
  metrics?: XMetrics;
  rules?: string[];
  links?: string[];
  media?: string[];
};

export type Tracker = {
  id: string;
  title: string;
  query: string;
  type: 'keyword' | 'account' | 'cashtag';
  pinned?: boolean;
};

export type Alert = {
  id: string;
  name: string;
  criteria: {
    query: string;
    lang?: string;
    has?: string[];
    minLikes?: number;
  };
  throttleSec: number;
  enabled: boolean;
};

export interface XShim {
  listTrackers(): Promise<Tracker[]>;
  listPosts(trackerId: string): Promise<XPost[]>;
  listAlerts(): Promise<Alert[]>;
}

export class LocalXShim implements XShim {
  async listTrackers(): Promise<Tracker[]> {
    try {
      console.log('[LocalXShim] listTrackers()');
      return Promise.resolve(trackersData);
    } catch (e) {
      console.error('[LocalXShim] listTrackers error', e);
      return Promise.resolve([]);
    }
  }

  async listPosts(trackerId: string): Promise<XPost[]> {
    try {
      console.log('[LocalXShim] listPosts()', trackerId);
      const data = postsData;
      const items = data[trackerId] ?? [];
      return Promise.resolve(items);
    } catch (e) {
      console.error('[LocalXShim] listPosts error', e);
      return Promise.resolve([]);
    }
  }

  async listAlerts(): Promise<Alert[]> {
    try {
      console.log('[LocalXShim] listAlerts()');
      return Promise.resolve(alertsData);
    } catch (e) {
      console.error('[LocalXShim] listAlerts error', e);
      return Promise.resolve([]);
    }
  }
}

export const xShim: XShim = new LocalXShim();
