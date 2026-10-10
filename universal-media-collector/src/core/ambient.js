// Right ambient rail — peripheral vision: what is downloading now, the
// queue totals, the destination, the last scanned source and its real
// capability state, and the scan limits in force. Collapsible; persisted.
import { bus } from './bus.js';
import { state, queueSummary } from './store.js';
import { LX } from './lexicon.js';
import { el, esc, fmtBytes, fmtSpeed, html } from '../ui/util.js';

const collapsed = () => { try { return localStorage.getItem('umc-ambient') === 'closed'; } catch { return false; } };

function nowHtml() {
  const live = state.queue.filter((j) => j.status === 'running');
  if (!live.length) return html`<div class="am-empty">${LX('amb_idle')}</div>`;
  return html`${live.slice(0, 3).map((j) => {
    const pct = j.bytesTotal ? Math.round((j.bytesDone / j.bytesTotal) * 100) : null;
    return html`<div class="am-now"><span class="am-domain">${j.name || j.title || j.sourceUrl}</span>
      <div class="am-title">${fmtBytes(j.bytesDone)}${j.bytesTotal ? ' / ' + fmtBytes(j.bytesTotal) : ''}${j.speedBps ? ' · ' + fmtSpeed(j.speedBps) : ''}</div>
      <div class="am-bar"><i style="width:${pct == null ? 30 : pct}%"></i></div></div>`;
  })}`;
}
function queueHtml() {
  const s = queueSummary();
  return html`<div class="am-kv"><span>${LX('amb_active')}</span><b>${s.active}</b></div><div class="am-kv"><span>${LX('amb_queued')}</span><b>${s.queued}</b></div><div class="am-kv"><span>${LX('amb_done')}</span><b>${s.done}</b></div>${s.failed ? html`<div class="am-kv"><span>${LX('amb_failed')}</span><b style="color:var(--red)">${s.failed}</b></div>` : ''}${s.conflicts ? html`<div class="am-kv"><span>${LX('amb_decision')}</span><b style="color:var(--orange)">${s.conflicts}</b></div>` : ''}`;
}
function sourceHtml() {
  const ls = state.lastSource;
  if (!ls) return html`<div class="am-empty">${LX('amb_source_idle')}</div>`;
  const cap = ls.capability;
  return html`<div class="am-now"><span class="am-domain">${ls.host || (cap && cap.label) || '—'}</span>
    <div class="am-title">${cap ? cap.label : ''} · ${ls.count} ${ls.count === 1 ? LX('amb_cand_one') : LX('amb_cand_many')}</div>
    ${cap ? html`<div style="margin-top:6px"><span class="am-state">${LX('st_' + cap.state)}</span></div>` : ''}</div>`;
}
function limitsHtml() {
  const s = state.settings;
  return html`<div class="am-kv"><span>${LX('amb_limit_page')}</span><b>1</b></div>
    <div class="am-kv"><span>${LX('amb_page')}</span><b>≤ ${Math.round((s.maxPageBytes || 0) / 1048576)} MB</b></div>
    <div class="am-kv"><span>${LX('amb_cands')}</span><b>≤ ${s.maxCandidates}</b></div>
    <div class="am-kv"><span>${LX('amb_file')}</span><b>≤ ${((s.maxFileBytes || 0) / 1073741824).toFixed(1)} GB</b></div>
    <div class="am-kv"><span>robots.txt</span><b>${s.respectRobots ? LX('on') : LX('off')}</b></div>`;
}

function render() {
  const rail = document.getElementById('rail-right');
  rail.classList.toggle('closed', collapsed());
  rail.innerHTML = '';
  const tog = el('button', 'am-toggle', collapsed() ? '<' : '>');
  tog.title = collapsed() ? 'Open the ambient rail' : 'Collapse the ambient rail';
  tog.onclick = () => { try { localStorage.setItem('umc-ambient', collapsed() ? 'open' : 'closed'); } catch {} document.getElementById('nexus').classList.toggle('ambient-closed', collapsed()); render(); };
  rail.appendChild(tog);
  if (collapsed()) return;
  const sec = (label, body) => { const s = el('div', 'am-sec'); s.innerHTML = `<div class="am-h">${esc(label)}</div>${body}`; rail.appendChild(s); };
  sec(`◉ ${LX('amb_now')}`, nowHtml());
  sec(LX('amb_queue'), queueHtml());
  sec(LX('amb_dest'), `<div class="am-path">${esc(state.settings.destination || '')}</div>`);
  sec(LX('amb_source'), sourceHtml());
  sec(LX('amb_limits'), limitsHtml());
}

export function initAmbient() {
  document.getElementById('nexus').classList.toggle('ambient-closed', collapsed());
  render();
  let raf = 0;
  const schedule = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; render(); }); };
  for (const ev of ['queue:changed', 'job', 'settings:changed', 'result:changed', 'language:changed']) bus.on(ev, schedule);
}
