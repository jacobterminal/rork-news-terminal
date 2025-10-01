type NotifyItem = { id: string; ts: number; title: string; body?: string };

type Listener = (n: NotifyItem) => void;

const MAX_ITEMS = 100;
const inbox: NotifyItem[] = [];
const listeners: Set<Listener> = new Set();

export function notify(input: { title: string; body?: string }) {
  const item: NotifyItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ts: Date.now(),
    title: input.title,
    body: input.body,
  };
  inbox.unshift(item);
  if (inbox.length > MAX_ITEMS) inbox.length = MAX_ITEMS;
  for (const l of listeners) {
    try { l(item); } catch (e) { console.error('[notify] listener error', e); }
  }
  return item;
}

export function onNotify(cb: Listener) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getNotifications(): NotifyItem[] {
  return [...inbox];
}
