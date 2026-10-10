// One-time acknowledgement: the user owns or has permission to save what
// they collect. Stored in settings (main side), re-showable from Settings.
import { state, saveSettings } from './store.js';
import { LX } from './lexicon.js';
import { el } from '../ui/util.js';
export function maybeShowAck() {
  if (state.settings.acknowledgedAt) return Promise.resolve(true);
  return showAck();
}
export function showAck() {
  const m = document.getElementById('ack'); m.innerHTML = '';
  const card = el('div', 'md-card');
  card.appendChild(el('div', 'md-h', LX('ob_h')));
  card.appendChild(el('div', 'md-body', LX('ob_body')));
  const lab = el('label', 'md-check'); const cb = el('input'); cb.type = 'checkbox'; lab.appendChild(cb); lab.appendChild(el('span', null, LX('ob_check'))); card.appendChild(lab);
  const acts = el('div', 'md-actions'); const go = el('button', 'btn primary', LX('ob_go')); go.disabled = true; acts.appendChild(go); card.appendChild(acts);
  cb.onchange = () => { go.disabled = !cb.checked; };
  m.appendChild(card); m.classList.add('open'); cb.focus();
  return new Promise((res) => { go.onclick = async () => { await saveSettings({ acknowledgedAt: true }); m.classList.remove('open'); m.innerHTML = ''; res(true); }; });
}
