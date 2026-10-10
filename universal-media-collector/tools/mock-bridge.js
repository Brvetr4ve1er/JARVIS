// mock-bridge.js — installed by store.js when window.umc is absent, i.e. the
// renderer is opened in a plain browser (dev harness, screenshots, UI tests).
// Same surface as preload.js, in-memory, with deterministic sample data. The
// mock never touches the network or the disk.
const SAMPLE_PAGE = 'https://gallery.example/posts/autumn-light';
const PX = (hex) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="${hex}"/><circle cx="110" cy="100" r="46" fill="rgba(255,255,255,.25)"/><path d="M0 240 L120 130 L200 190 L250 150 L320 240 Z" fill="rgba(0,0,0,.25)"/></svg>`)}`;

const cands = (base) => [
  { id: 'c1', sourceUrl: `${base}/img/leaf-2048.jpg`, pageUrl: SAMPLE_PAGE, host: 'cdn.gallery.example', kind: 'image', mime: 'image/jpeg', mimeTrusted: 'bytes', filenameHint: 'leaf-2048.jpg', extHint: 'jpg', width: 2048, height: 1365, duration: null, bytes: 1483201, quality: 'page-largest-variant', accessLevel: 'public', attribution: { title: 'Leaf close-up', pageTitle: 'Autumn light', pageHost: 'gallery.example' }, via: ['img:srcset'], probed: true, acceptRanges: true, _pv: PX('#a8702a') },
  { id: 'c2', sourceUrl: `${base}/img/leaf-640.jpg`, pageUrl: SAMPLE_PAGE, host: 'cdn.gallery.example', kind: 'image', mime: 'image/jpeg', mimeTrusted: 'bytes', filenameHint: 'leaf-640.jpg', extHint: 'jpg', width: 640, height: 427, bytes: 98210, quality: 'page-variant', accessLevel: 'public', attribution: { title: 'Leaf close-up', pageTitle: 'Autumn light', pageHost: 'gallery.example' }, via: ['img'], probed: true, _pv: PX('#6b5a2a') },
  { id: 'c3', sourceUrl: `${base}/og/cover.png`, pageUrl: SAMPLE_PAGE, host: 'cdn.gallery.example', kind: 'image', mime: 'image/png', mimeTrusted: 'bytes', filenameHint: 'cover.png', extHint: 'png', width: 1200, height: 630, bytes: 412009, quality: 'metadata', accessLevel: 'public', attribution: { title: '', pageTitle: 'Autumn light', pageHost: 'gallery.example' }, via: ['og:image', 'twitter:image'], probed: true, _pv: PX('#2f5e8a') },
  { id: 'c4', sourceUrl: `${base}/v/walk.mp4`, pageUrl: SAMPLE_PAGE, host: 'cdn.gallery.example', kind: 'video', mime: 'video/mp4', mimeTrusted: 'bytes', filenameHint: 'walk.mp4', extHint: 'mp4', width: 1280, height: 720, duration: 'PT1M12S', bytes: 48230112, quality: 'metadata', accessLevel: 'public', attribution: { title: 'Forest walk', pageTitle: 'Autumn light', pageHost: 'gallery.example' }, via: ['video:source', 'json-ld:VideoObject'], probed: true, acceptRanges: true },
  { id: 'c5', sourceUrl: `${base}/v/poster.jpg`, pageUrl: SAMPLE_PAGE, host: 'cdn.gallery.example', kind: 'image', mime: 'image/jpeg', mimeTrusted: 'bytes', filenameHint: 'poster.jpg', extHint: 'jpg', width: 1280, height: 720, bytes: 201330, quality: 'thumbnail', accessLevel: 'public', attribution: { title: '', pageTitle: 'Autumn light', pageHost: 'gallery.example' }, via: ['video:poster'], probed: true, _pv: PX('#3b4a2a') },
  { id: 'c6', sourceUrl: `${base}/a/ambience.mp3`, pageUrl: SAMPLE_PAGE, host: 'cdn.gallery.example', kind: 'audio', mime: 'audio/mpeg', mimeTrusted: 'bytes', filenameHint: 'ambience.mp3', extHint: 'mp3', bytes: 5120330, quality: 'unknown', accessLevel: 'public', attribution: { title: 'Ambience', pageTitle: 'Autumn light', pageHost: 'gallery.example' }, via: ['audio'], probed: true },
  { id: 'c7', sourceUrl: `${base}/dl/raw-scan.tif`, pageUrl: SAMPLE_PAGE, host: 'files.gallery.example', kind: 'image', mime: null, mimeTrusted: 'none', filenameHint: 'raw-scan.tif', extHint: 'tif', bytes: null, quality: 'unknown', accessLevel: 'public', attribution: { title: '', pageTitle: 'Autumn light', pageHost: 'gallery.example' }, via: ['a:href'], probed: true, probeError: { code: 'SOURCE_UNAVAILABLE', message: 'The source could not be reached.', detail: 'HTTP 404', next: 'Retry later. The server may be down or the link expired.' } },
  { id: 'c8', sourceUrl: `${base}/img/track.gif`, pageUrl: SAMPLE_PAGE, host: 'cdn.gallery.example', kind: 'image', mime: null, mimeTrusted: 'none', filenameHint: 'track.gif', extHint: 'gif', bytes: null, quality: 'unknown', accessLevel: 'public', attribution: { title: '', pageTitle: 'Autumn light', pageHost: 'gallery.example' }, via: ['img'], probed: false },
];
const CAP = {
  direct: { id: 'direct', label: 'Direct media link', state: 'supported', stateLabel: 'Supported', nextAction: 'Paste the link and save.' },
  webpage: { id: 'webpage', label: 'Public web page', state: 'limited', stateLabel: 'Supported with limits', nextAction: 'Paste a page link, review the candidates, pick what to save.' },
  instagram: { id: 'instagram', label: 'Instagram', state: 'unavailable', stateLabel: 'Unavailable', nextAction: 'Use Instagram’s own "Download your information" export for your account, or paste a direct media link you are entitled to save.' },
  reddit: { id: 'reddit', label: 'Reddit', state: 'authorization-required', stateLabel: 'Authorization required', nextAction: 'A direct media link (i.redd.it/…) works today through the direct resolver.' },
};

export function createMockBridge() {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let settings = { destination: '/Users/you/Downloads/Universal Media Collector', concurrency: 2, filenameTemplate: '{source}_{date}_{title-or-id}_{index}.{ext}', overwritePolicy: 'ask', respectRobots: true, maxPageBytes: 5242880, maxFileBytes: 2147483648, maxCandidates: 200, probeLimit: 24, maxQueuedBytes: 21474836480, keepPartialOnCancel: false, autoPreviewImages: true, previewMaxBytes: 1572864, theme: 'nexus', language: 'en', appName: 'Universal Media Collector', acknowledgedAt: new Date().toISOString(), telemetry: false };
  const queue = []; const qsubs = new Set(); const jsubs = new Set();
  const library = [
    { id: 'l1', savedAt: new Date(Date.now() - 3600e3).toISOString(), source: 'web', host: 'cdn.gallery.example', pageUrl: SAMPLE_PAGE, sourceUrl: 'https://cdn.gallery.example/img/dawn-2048.jpg', localPath: settings.destination + '/gallery.example_2026-10-10_Dawn_01.jpg', originalName: 'dawn-2048.jpg', finalName: 'gallery.example_2026-10-10_Dawn_01.jpg', kind: 'image', mime: 'image/jpeg', bytes: 1320110, sha256: '9f2c1a…demo', width: 2048, height: 1365, duration: null, title: 'Dawn', pageTitle: 'Autumn light', quality: 'page-largest-variant', via: ['img:srcset'], tags: ['autumn', 'wallpaper'], note: 'Keep for the deck cover.', jobId: null, deleted: false },
    { id: 'l2', savedAt: new Date(Date.now() - 86400e3).toISOString(), source: 'direct', host: 'files.example', pageUrl: null, sourceUrl: 'https://files.example/clips/intro.mp4', localPath: settings.destination + '/files.example_2026-10-09_intro_01.mp4', originalName: 'intro.mp4', finalName: 'files.example_2026-10-09_intro_01.mp4', kind: 'video', mime: 'video/mp4', bytes: 48230112, sha256: '31ab77…demo', width: 1920, height: 1080, duration: 'PT0M42S', title: 'intro', pageTitle: '', quality: 'direct', via: ['direct'], tags: [], note: '', jobId: null, deleted: false },
  ];
  const emitQ = () => { const q = queue.map(pub); qsubs.forEach((cb) => cb(q)); };
  const pub = (j) => ({ id: j.id, status: j.status, sourceUrl: j.c.sourceUrl, pageUrl: j.c.pageUrl, host: j.c.host, kind: j.c.kind, mime: j.c.mime, title: j.c.attribution.title || j.c.filenameHint, name: j.name, finalPath: j.finalPath, destination: settings.destination, bytesDone: j.done, bytesTotal: j.total, speedBps: j.speed, attempts: j.attempts, error: j.error, conflict: j.conflict, result: j.result, createdAt: j.createdAt, startedAt: j.startedAt, finishedAt: j.finishedAt, canResume: j.status === 'paused' });
  let n = 0;
  function tick() {
    const running = queue.filter((j) => j.status === 'running');
    if (running.length < settings.concurrency) { const next = queue.find((j) => j.status === 'queued'); if (next) { next.status = 'running'; next.startedAt = Date.now(); emitQ(); } }
    for (const j of queue.filter((x) => x.status === 'running')) {
      j.done = Math.min(j.total, j.done + Math.max(20000, Math.round(j.total / 40))); j.speed = 1.2e6 + (n % 7) * 1e5;
      if (j.done >= j.total) {
        if (j.c.sourceUrl.includes('track.gif')) { j.status = 'failed'; j.error = { code: 'UNSUPPORTED_MEDIA', message: 'The response is not a media file we can save.', detail: 'text/html', next: 'Check the link in a browser. It may be an HTML page or a stream manifest.' }; j.finishedAt = Date.now(); }
        else if (j.c.sourceUrl.includes('poster') && !j._conflictDone) { j.status = 'conflict'; j.conflict = { existingPath: settings.destination + '/' + j.name, proposedName: j.name }; }
        else { j.status = 'done'; j.finishedAt = Date.now(); j.finalPath = settings.destination + '/' + j.name; j.result = { libraryId: 'l' + (++n), sha256: 'c0ffee…demo', bytes: j.total, path: j.finalPath, duplicateOf: null }; library.unshift({ id: j.result.libraryId, savedAt: new Date().toISOString(), source: j.c.pageUrl ? 'web' : 'direct', host: j.c.host, pageUrl: j.c.pageUrl, sourceUrl: j.c.sourceUrl, localPath: j.finalPath, originalName: j.c.filenameHint, finalName: j.name, kind: j.c.kind, mime: j.c.mime, bytes: j.total, sha256: j.result.sha256, width: j.c.width, height: j.c.height, duration: j.c.duration, title: j.c.attribution.title, pageTitle: j.c.attribution.pageTitle, quality: j.c.quality, via: j.c.via, tags: [], note: '', jobId: j.id, deleted: false }); }
        emitQ();
      } else jsubs.forEach((cb) => cb(pub(j)));
    }
  }
  setInterval(() => { n++; tick(); }, 220);
  const api = {
    app: async () => ({ version: '0.1.0', userData: '/Users/you/Library/Application Support/universal-media-collector', userAgent: 'UniversalMediaCollector/0.1.0 (local desktop app)', platform: 'web' }),
    resolve: async (url) => {
      await sleep(700);
      const scannedAt = new Date().toISOString();
      let u; try { u = new URL(url); } catch { return { pageUrl: null, source: null, capability: null, title: '', candidates: [], warnings: [], nextAction: 'Paste a full http:// or https:// link to a page or a media file.', scannedAt, error: { code: 'INVALID_URL', message: 'That is not a usable web address.', detail: 'unparseable', next: 'Paste a full http:// or https:// link to a page or a media file.' } }; }
      if (/instagram\.com/.test(u.host)) return { pageUrl: url, source: 'instagram', capability: CAP.instagram, title: '', candidates: [], warnings: [], nextAction: CAP.instagram.nextAction, scannedAt, error: { code: 'UNSUPPORTED_SOURCE', message: 'This site is not supported through an approved path.', detail: 'Instagram', next: CAP.instagram.nextAction } };
      if (/reddit\.com/.test(u.host)) return { pageUrl: url, source: 'reddit', capability: CAP.reddit, title: '', candidates: [], warnings: [], nextAction: CAP.reddit.nextAction, scannedAt, error: { code: 'AUTHORIZATION_REQUIRED', message: 'This source needs an authorized account connection.', detail: 'Reddit', next: CAP.reddit.nextAction } };
      if (/\.(jpe?g|png|gif|mp4|webm|mp3)$/i.test(u.pathname)) { const c = { ...cands('https://cdn.gallery.example')[0], id: 'd1', sourceUrl: url, pageUrl: null, host: u.host, filenameHint: u.pathname.split('/').pop(), quality: 'direct', via: ['direct'], attribution: { title: u.pathname.split('/').pop().replace(/\.\w+$/, ''), pageTitle: '' } }; return { pageUrl: url, source: 'direct', capability: CAP.direct, title: c.filenameHint, candidates: [c], warnings: [], nextAction: 'Choose a destination and save.', scannedAt, error: null }; }
      if (/empty/.test(u.pathname)) return { pageUrl: url, source: 'webpage', capability: CAP.webpage, title: 'An empty page', candidates: [], warnings: [], nextAction: 'The media may load with scripts or need a login. Try a direct media link.', scannedAt, error: { code: 'NO_MEDIA_FOUND', message: 'No media was found on this page.', detail: '', next: 'The media may load with scripts or need a login. Try a direct media link.' } };
      return { pageUrl: url, source: 'webpage', capability: CAP.webpage, title: 'Autumn light — a small gallery', candidates: cands('https://cdn.gallery.example'), warnings: [{ code: 'PARTIAL_RESULTS', message: 'Candidate limit reached; 3 more were not listed.' }], nextAction: 'Select the candidates you want and add them to the queue.', scannedAt, error: null };
    },
    cancelResolve: async () => true,
    preview: async (url) => { await sleep(350); const c = cands('https://cdn.gallery.example').find((x) => x.sourceUrl === url); if (c && c._pv) return { dataUrl: c._pv, mime: 'image/svg+xml', bytes: 1200 }; if (/\.(jpe?g|png)$/i.test(url)) return { dataUrl: PX('#4a3a6a'), mime: 'image/png', bytes: 1000 }; return { error: { code: 'UNSUPPORTED_MEDIA', message: 'Not a raster image.' } }; },
    sources: async () => (await import('../main/sources.js')).list ? (await import('../main/sources.js')).list() : [],
    queue: {
      add: async (cs) => { const out = []; for (const c of cs) { const id = 'j' + Math.random().toString(36).slice(2, 8); const name = `${c.attribution.pageHost || c.host}_2026-10-10_${(c.attribution.title || c.filenameHint.replace(/\.\w+$/, '')).replace(/[^\w-]+/g, '_')}_${String(queue.length + 1).padStart(2, '0')}.${c.extHint}`; queue.push({ id, c, status: 'queued', name, done: 0, total: c.bytes || 900000, speed: 0, attempts: 1, error: null, conflict: null, result: null, createdAt: Date.now() }); out.push({ id }); } emitQ(); return out; },
      list: async () => queue.map(pub),
      cancel: async (id) => { const j = queue.find((x) => x.id === id); if (j) { j.status = 'cancelled'; j.error = { code: 'CANCELLED', message: 'Cancelled.', next: '' }; emitQ(); } return !!j; },
      pause: async (id) => { const j = queue.find((x) => x.id === id); if (j) { j.status = 'paused'; emitQ(); } return !!j; },
      resume: async (id) => { const j = queue.find((x) => x.id === id); if (j) { j.status = 'queued'; emitQ(); } return !!j; },
      retry: async (id) => { const j = queue.find((x) => x.id === id); if (j) { j.status = 'queued'; j.done = 0; j.error = null; j.attempts++; emitQ(); } return !!j; },
      remove: async (id) => { const i = queue.findIndex((x) => x.id === id); if (i !== -1) queue.splice(i, 1); emitQ(); return i !== -1; },
      resolveConflict: async (id, choice) => { const j = queue.find((x) => x.id === id); if (!j) return false; j._conflictDone = true; j.conflict = null; if (choice === 'skip') j.status = 'skipped'; else { if (choice === 'rename') j.name = j.name.replace(/(\.\w+)$/, ' (2)$1'); j.status = 'queued'; j.done = 0; } emitQ(); return true; },
      pauseAll: async () => { for (const j of queue) if (j.status === 'running' || j.status === 'queued') j.status = 'paused'; emitQ(); return true; },
      resumeAll: async () => { for (const j of queue) if (j.status === 'paused') j.status = 'queued'; emitQ(); return true; },
      clearFinished: async () => { for (let i = queue.length - 1; i >= 0; i--) if (['done', 'failed', 'cancelled', 'skipped'].includes(queue[i].status)) queue.splice(i, 1); emitQ(); return true; },
    },
    onQueue: (cb) => { qsubs.add(cb); return () => qsubs.delete(cb); },
    onJob: (cb) => { jsubs.add(cb); return () => jsubs.delete(cb); },
    library: {
      list: async ({ q = '', sort = 'savedAt', dir = 'desc', kind = 'all' } = {}) => { let it = library.filter((i) => !i.deleted); if (kind !== 'all') it = it.filter((i) => i.kind === kind); if (q) it = it.filter((i) => JSON.stringify(i).toLowerCase().includes(q.toLowerCase())); it.sort((a, b) => (a[sort] > b[sort] ? 1 : -1) * (dir === 'asc' ? 1 : -1)); return it; },
      get: async (id) => library.find((i) => i.id === id) || null,
      update: async (id, p) => { const it = library.find((i) => i.id === id); if (it) { if (p.tags) it.tags = p.tags; if (typeof p.note === 'string') it.note = p.note; } return it; },
      remove: async (id) => { const it = library.find((i) => i.id === id); if (it) it.deleted = true; return !!it; },
      restore: async (id) => { const it = library.find((i) => i.id === id); if (it) it.deleted = false; return !!it; },
      clear: async () => { library.length = 0; return true; },
      exists: async () => true,
    },
    settings: { get: async () => ({ ...settings }), set: async (patch) => { const errors = {}; if (patch.destination === '/') errors.destination = 'Destination cannot be a system directory.'; else settings = { ...settings, ...patch, acknowledgedAt: patch.acknowledgedAt === false ? null : patch.acknowledgedAt === true ? new Date().toISOString() : settings.acknowledgedAt }; return { value: { ...settings }, errors }; }, chooseDestination: async () => null },
    shell: { openFile: async () => true, showInFolder: async () => true, openDestination: async () => true, openDataDir: async () => true, openExternal: async (u) => { window.open(u, '_blank', 'noopener'); return true; } },
    clipboardText: async () => { try { return await navigator.clipboard.readText(); } catch { return ''; } },
  };
  return api;
}
