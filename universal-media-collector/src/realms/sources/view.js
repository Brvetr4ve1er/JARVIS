// SOURCES realm — one card per source from the registry: state, access mode,
// media types, pagination, rate limits, limitations, what works today, and
// links to the official documentation. Plus the explicit out-of-scope list.
import { el, html } from '../../ui/util.js';

let CTX = null, root = null, _offs = [];
const STATE_CLS = { supported: 'green', limited: 'blue', 'authorization-required': 'orange', unavailable: 'red', unsupported: 'red' };
const ORDER = { supported: 0, limited: 1, 'authorization-required': 2, unavailable: 3, unsupported: 4 };

function render() {
  const { LX, state, api } = CTX;
  root.innerHTML = '';
  root.appendChild(el.html('h2', 'sec', LX('src_h')));
  root.appendChild(el('p', 'lead', LX('src_intro')));
  const grid = el('div', 'grid src-grid');
  for (const s of [...state.sources].sort((a, b) => ORDER[a.state] - ORDER[b.state])) {
    const card = el('div', 'card src-card');
    card.innerHTML = html`
      <div class="src-top"><h3>${s.label}</h3><span class="tag ${STATE_CLS[s.state] || ''}">${LX('st_' + s.state)}</span></div>
      <div class="kv">
        <span class="k">${LX('src_urls')}</span><span class="v">${s.urlTypes.join(' · ')}</span>
        <span class="k">${LX('src_auth')}</span><span class="v">${s.auth}</span>
        <span class="k">${LX('src_types')}</span><span class="v">${s.mediaTypes.length ? s.mediaTypes.join(', ') : '—'}</span>
        <span class="k">${LX('src_pagination')}</span><span class="v">${s.pagination}</span>
        <span class="k">${LX('src_limits')}</span><span class="v">${s.rateLimits}</span>
      </div>
      <div class="src-lim"><span class="k">${LX('src_limitations')}</span><ul>${s.limitations.map((l) => html`<li>${l}</li>`)}</ul></div>
      <div class="note"><b>${LX('src_next')}:</b> ${s.nextAction}</div>
      ${s.docs.length ? html`<div class="src-docs"><span class="k">${LX('src_docs')}</span>${s.docs.map((d) => html`<a href="#" data-url="${d.url}">${d.label}</a>`)}</div>` : ''}
    `.toString();
    card.querySelectorAll('a[data-url]').forEach((a) => { a.onclick = (e) => { e.preventDefault(); api.shell.openExternal(a.dataset.url); }; });
    grid.appendChild(card);
  }
  root.appendChild(grid);
  root.appendChild(el.html('h2', 'sec', LX('src_out_of_scope_h')));
  root.appendChild(el('div', 'empty-note', LX('src_out_of_scope')));
}

export const view = {
  mount(stage, ctx) { CTX = ctx; root = el('div', 'sources'); stage.appendChild(root); render(); _offs.push(ctx.bus.on('language:changed', render)); },
  unmount() { for (const off of _offs) off(); _offs = []; root = null; },
};
