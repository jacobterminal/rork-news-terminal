type NotifyItem = { id: string; ts: number; title: string; body?: string; showToast?: boolean };

type Listener = (n: NotifyItem) => void;
type ToastListener = (n: NotifyItem) => void;

const MAX_ITEMS = 100;
const inbox: NotifyItem[] = [];
const listeners: Set<Listener> = new Set();
const toastListeners: Set<ToastListener> = new Set();

export function notify(input: { title: string; body?: string; showToast?: boolean }) {
  const item: NotifyItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ts: Date.now(),
    title: input.title,
    body: input.body,
    showToast: input.showToast,
  };
  inbox.unshift(item);
  if (inbox.length > MAX_ITEMS) inbox.length = MAX_ITEMS;
  for (const l of listeners) {
    try { l(item); } catch (e) { console.error('[notify] listener error', e); }
  }
  if (input.showToast) {
    for (const l of toastListeners) {
      try { l(item); } catch (e) { console.error('[notify] toast listener error', e); }
    }
  }
  return item;
}

export function onNotify(cb: Listener) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function onToast(cb: ToastListener) {
  toastListeners.add(cb);
  return () => toastListeners.delete(cb);
}

export function getNotifications(): NotifyItem[] {
  return [...inbox];
}
