// Shared renderer helpers. `html` is the safe-by-default template tag: every
// interpolation is escaped unless wrapped in raw(). el() takes TEXT for its
// third argument; use el.html() when you really mean markup.
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

class Raw { constructor(s) { this.s = String(s); } toString() { return this.s; } }
export const raw = (s) => new Raw(s);
export function html(strings, ...values) {
  let out = '';
  strings.forEach((str, i) => {
    out += str;
    if (i < values.length) {
      const v = values[i];
      if (v instanceof Raw) out += v.s;
      else if (Array.isArray(v)) out += v.map((x) => (x instanceof Raw ? x.s : esc(x))).join('');
      else if (v == null || v === false) out += '';
      else out += esc(v);
    }
  });
  return new Raw(out);
}

export const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
el.html = (tag, cls, markup) => { const e = document.createElement(tag); if (cls) e.className = cls; e.innerHTML = String(markup ?? ''); return e; };

// thousands-separated integer
export function fmt(n) { if (typeof n !== 'number' || !Number.isFinite(n)) return String(n); return Math.round(n).toLocaleString('en-US'); }

export function fmtBytes(n) {
  if (n == null || !Number.isFinite(n)) return '';
  if (n < 1024) return `${n} B`;
  const u = ['KB', 'MB', 'GB', 'TB']; let i = -1; let v = n;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v < 10 ? v.toFixed(1) : Math.round(v)} ${u[i]}`;
}

export function fmtSpeed(bps) { return bps ? `${fmtBytes(bps)}/s` : ''; }

// ISO 8601 duration (PT1M30S) or seconds → "1:30"
export function fmtDuration(d) {
  if (d == null) return '';
  let s = 0;
  if (typeof d === 'number') s = d;
  else { const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/i.exec(String(d)); if (!m) return String(d); s = (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0); }
  s = Math.round(s);
  const h = Math.floor(s / 3600), mi = Math.floor((s % 3600) / 60), se = s % 60;
  return h ? `${h}:${String(mi).padStart(2, '0')}:${String(se).padStart(2, '0')}` : `${mi}:${String(se).padStart(2, '0')}`;
}

export function fmtTime(ms) {
  if (!ms) return '';
  const d = new Date(ms);
  return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function shortUrl(u, max = 60) {
  try { const x = new URL(u); const s = x.host + x.pathname; return s.length > max ? s.slice(0, max - 1) + '…' : s; }
  catch { return String(u || '').slice(0, max); }
}

export const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
