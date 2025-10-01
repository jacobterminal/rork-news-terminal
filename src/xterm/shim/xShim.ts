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

// eslint-disable-next-line @typescript-eslint/no-var-requires
const trackersData = require('../mock/trackers.json') as Tracker[];
// eslint-disable-next-line @typescript-eslint/no-var-requires
const postsData = require('../mock/posts.json') as Record<string, XPost[]>;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const alertsData = require('../mock/alerts.json') as Alert[];

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
      const items = (postsData?.[trackerId] ?? []) as XPost[];
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
