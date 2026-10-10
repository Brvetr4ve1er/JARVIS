'use strict';
// IPC — the validated main-side surface behind preload.js. Every handler
// checks its arguments; file-system verbs (open, reveal) accept only paths
// the app itself produced (library records or finished jobs).
const path = require('node:path');
const fs = require('node:fs');
const { ipcMain, dialog, clipboard } = require('electron');
const { resolve } = require('./resolver');
const { previewImage } = require('./preview');
const { list: listSources } = require('./sources');
const { toPublic, UmcError } = require('./errors');
const { USER_AGENT } = require('./net');

const str = (v, max = 4096) => String(v == null ? '' : v).slice(0, max);
const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

function registerIpc({ win, settings, library, dm, log, shell, app, version }) {
  let resolveAc = null;
  const h = (ch, fn) => ipcMain.handle(ch, async (_e, ...args) => {
    try { return await fn(...args); }
    catch (err) { log.warn(ch, err && err.code ? `${err.code} ${err.detail || ''}` : (err && err.message)); return { error: toPublic(err) }; }
  });
  const scanCtx = () => { const s = settings.get(); return { respectRobots: s.respectRobots, maxPageBytes: s.maxPageBytes, maxCandidates: s.maxCandidates, probeLimit: s.probeLimit, timeoutMs: 15000, probeBudgetMs: 12000 }; };

  h('umc:app', () => ({ version, userData: app.getPath('userData'), userAgent: USER_AGENT, platform: process.platform }));

  h('umc:resolve', async (url) => {
    if (resolveAc) resolveAc.abort();
    resolveAc = new AbortController();
    const r = await resolve(str(url), { ...scanCtx(), signal: resolveAc.signal });
    resolveAc = null;
    return r;
  });
  h('umc:resolve:cancel', () => { if (resolveAc) { resolveAc.abort(); resolveAc = null; } return true; });

  h('umc:preview', async (url) => previewImage(str(url), { timeoutMs: 12000 }));
  h('umc:sources', () => listSources());

  // queue — candidates are re-validated here, never trusted from the page
  h('umc:queue:add', (cands) => {
    if (!Array.isArray(cands)) throw new UmcError('INVALID_URL', 'bad payload');
    const clean = cands.slice(0, 500).map((c) => sanitizeCandidate(c)).filter(Boolean);
    return dm.add(clean);
  });
  h('umc:queue:list', () => dm.list());
  h('umc:queue:cancel', (id) => dm.cancel(str(id, 64)));
  h('umc:queue:pause', (id) => dm.pause(str(id, 64)));
  h('umc:queue:resume', (id) => dm.resume(str(id, 64)));
  h('umc:queue:retry', (id) => dm.retry(str(id, 64)));
  h('umc:queue:remove', (id) => dm.remove(str(id, 64)));
  h('umc:queue:conflict', (id, choice) => dm.resolveConflict(str(id, 64), ['skip', 'rename', 'replace'].includes(choice) ? choice : 'skip'));
  h('umc:queue:pauseAll', () => { dm.pauseAll(); return true; });
  h('umc:queue:resumeAll', () => { dm.resumeAll(); return true; });
  h('umc:queue:clearFinished', () => { dm.clearFinished(); return true; });

  // library
  h('umc:library:list', (o) => { const q = obj(o); return library.list({ q: str(q.q, 200), sort: str(q.sort, 20), dir: q.dir === 'asc' ? 'asc' : 'desc', kind: str(q.kind, 10) || 'all' }); });
  h('umc:library:get', (id) => library.get(str(id, 64)));
  h('umc:library:update', (id, patch) => { const p = obj(patch); return library.update(str(id, 64), { note: typeof p.note === 'string' ? p.note : undefined, tags: Array.isArray(p.tags) ? p.tags : undefined }); });
  h('umc:library:remove', (id) => library.remove(str(id, 64)));
  h('umc:library:restore', (id) => library.restore(str(id, 64)));
  h('umc:library:clear', () => { library.clear(); return true; });
  h('umc:library:exists', (id) => { const it = library.get(str(id, 64)); return !!(it && fs.existsSync(it.localPath)); });

  // settings
  h('umc:settings:get', () => settings.get());
  h('umc:settings:set', (patch) => settings.set(obj(patch)));
  h('umc:settings:chooseDestination', async () => {
    const r = await dialog.showOpenDialog(win, { properties: ['openDirectory', 'createDirectory'], defaultPath: settings.get().destination });
    if (r.canceled || !r.filePaths[0]) return null;
    const { errors, value } = settings.set({ destination: r.filePaths[0] });
    if (errors.destination) throw new UmcError('ACCESS_DENIED', errors.destination);
    return value.destination;
  });

  // shell verbs — only app-produced paths
  const knownPath = (id) => {
    const it = library.get(id); if (it) return it.localPath;
    const j = dm.get(id); if (j && j.status === 'done' && j.finalPath) return j.finalPath;
    return null;
  };
  h('umc:shell:openFile', async (id) => { const p = knownPath(str(id, 64)); if (!p || !fs.existsSync(p)) return false; const err = await shell.openPath(p); return !err; });
  h('umc:shell:showInFolder', (id) => { const p = knownPath(str(id, 64)); if (!p || !fs.existsSync(p)) return false; shell.showItemInFolder(p); return true; });
  h('umc:shell:openDestination', async () => { const d = settings.ensureDestination(); const err = await shell.openPath(d); return !err; });
  h('umc:shell:openDataDir', async () => { const err = await shell.openPath(app.getPath('userData')); return !err; });
  h('umc:shell:openExternal', async (url) => {
    let u; try { u = new URL(str(url)); } catch { return false; }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    await shell.openExternal(u.href); return true;
  });
  h('umc:clipboard:text', () => str(clipboard.readText(), 8192));
}

// A candidate from the renderer keeps only the fields the queue needs; the
// URL is re-parsed by the network layer anyway, so a hostile renderer gains
// nothing beyond what it could already request.
function sanitizeCandidate(c) {
  if (!c || typeof c !== 'object' || typeof c.sourceUrl !== 'string') return null;
  const s = (v, m = 300) => (typeof v === 'string' ? v.slice(0, m) : '');
  const n = (v) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null);
  return {
    id: s(c.id, 64), sourceUrl: s(c.sourceUrl, 4096), pageUrl: c.pageUrl ? s(c.pageUrl, 4096) : null, host: s(c.host, 253),
    kind: ['image', 'video', 'audio'].includes(c.kind) ? c.kind : 'unknown', mime: s(c.mime, 100) || null, mimeTrusted: c.mimeTrusted === 'bytes' ? 'bytes' : 'none',
    filenameHint: s(c.filenameHint, 200), extHint: s(c.extHint, 8), width: n(c.width), height: n(c.height), duration: c.duration == null ? null : s(String(c.duration), 32),
    bytes: n(c.bytes), quality: s(c.quality, 40) || 'unknown', via: Array.isArray(c.via) ? c.via.slice(0, 10).map((v) => s(v, 40)) : [],
    attribution: { title: s(c.attribution && c.attribution.title, 200), pageTitle: s(c.attribution && c.attribution.pageTitle, 200), pageHost: s(c.attribution && c.attribution.pageHost, 253) },
    acceptRanges: !!c.acceptRanges, validators: c.validators && typeof c.validators === 'object' ? { etag: s(c.validators.etag, 200) || null, lastModified: s(c.validators.lastModified, 100) || null } : null,
  };
}

module.exports = { registerIpc, sanitizeCandidate };
