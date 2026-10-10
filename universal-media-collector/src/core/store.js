// store.js — renderer state + the bridge. Realms read `state` and call
// `api`; the bridge pushes queue updates which land here and fan out over the
// bus ('queue:changed', 'job', 'settings:changed', 'library:changed').
// Without window.umc (plain browser / screenshot harness) a mock bridge is
// installed so the whole UI runs with sample data.
import { bus } from './bus.js';

export const state = {
  app: { version: '0.0.0', userData: '', userAgent: '', platform: 'web', mock: false },
  settings: {},
  queue: [],
  library: [],
  sources: [],
  lastResult: null,
  savedThisSession: 0,
  lastSource: null,
};

export let api = null;

export async function init() {
  api = window.umc || (await import('../../tools/mock-bridge.js')).createMockBridge();
  state.app = { ...(await api.app()), mock: !window.umc };
  state.settings = await api.settings.get();
  state.sources = await api.sources();
  state.queue = await api.queue.list();
  await refreshLibrary();
  api.onQueue((q) => {
    const doneBefore = new Set(state.queue.filter((j) => j.status === 'done').map((j) => j.id));
    state.queue = q;
    for (const j of q) if (j.status === 'done' && !doneBefore.has(j.id)) { state.savedThisSession++; bus.emit('job:done', j); refreshLibrary(); }
    for (const j of q) if (j.status === 'failed' && !j._seen) { j._seen = true; }
    bus.emit('queue:changed', q);
  });
  api.onJob((j) => {
    const i = state.queue.findIndex((x) => x.id === j.id);
    if (i !== -1) state.queue[i] = { ...state.queue[i], ...j };
    bus.emit('job', j);
  });
}

export async function refreshLibrary() {
  state.library = await api.library.list({});
  bus.emit('library:changed', state.library);
  return state.library;
}

export async function saveSettings(patch) {
  const r = await api.settings.set(patch);
  state.settings = r.value;
  bus.emit('settings:changed', state.settings);
  return r;
}

export function setLastResult(r) {
  state.lastResult = r;
  if (r) state.lastSource = { source: r.source, capability: r.capability, host: r.pageUrl ? safeHost(r.pageUrl) : '', title: r.title, count: r.candidates.length, error: r.error };
  bus.emit('result:changed', r);
}
const safeHost = (u) => { try { return new URL(u).hostname; } catch { return ''; } };

// recent links (renderer-only convenience; never the source of truth)
const RECENT_KEY = 'umc-recent';
export function recentLinks() { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; } }
export function rememberLink(url) {
  try {
    const list = recentLinks().filter((u) => u !== url);
    list.unshift(url);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 8)));
  } catch {}
}

export const queueSummary = () => {
  const q = state.queue;
  const n = (s) => q.filter((j) => j.status === s).length;
  const live = q.filter((j) => j.status === 'running');
  const done = live.reduce((a, j) => a + (j.bytesDone || 0), 0), total = live.reduce((a, j) => a + (j.bytesTotal || 0), 0);
  return { active: n('running'), queued: n('queued') + n('paused') + n('conflict'), done: n('done'), failed: n('failed'), conflicts: n('conflict'), total: q.length, pct: total ? Math.round((done / total) * 100) : null, live };
};
