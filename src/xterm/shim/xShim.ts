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

import trackersData from '../mock/trackers.json';
import postsData from '../mock/posts.json';
import alertsData from '../mock/alerts.json';

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
      return Promise.resolve(trackersData as Tracker[]);
    } catch (e) {
      console.error('[LocalXShim] listTrackers error', e);
      return Promise.resolve([]);
    }
  }

  async listPosts(trackerId: string): Promise<XPost[]> {
    try {
      console.log('[LocalXShim] listPosts()', trackerId);
      const data = postsData as Record<string, XPost[]>;
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
      return Promise.resolve(alertsData as Alert[]);
    } catch (e) {
      console.error('[LocalXShim] listAlerts error', e);
      return Promise.resolve([]);
    }
  }
}

export const xShim: XShim = new LocalXShim();
