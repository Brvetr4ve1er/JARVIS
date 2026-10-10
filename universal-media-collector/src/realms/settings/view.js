// SETTINGS realm — every value goes through the main-side validator; the
// form re-reads the validated result (so a clamped value shows clamped).
import { el, html, raw, esc } from '../../ui/util.js';
import { icon } from '../../ui/icons.js';
import { toast } from '../../ui/toast.js';
import { confirm } from '../../ui/modal.js';
import { saveSettings, refreshLibrary, state } from '../../core/store.js';
import { applyTheme } from '../../core/themes.js';
import { changeLanguage } from '../../core/chrome.js';
import { showAck } from '../../core/onboarding.js';
import { LANGUAGES } from '../../core/lexicon.js';

let CTX = null, root = null, _offs = [];
const MB = 1048576;

function render() {
  const { LX, api } = CTX;
  const s = state.settings;
  root.innerHTML = '';
  root.appendChild(el.html('h2', 'sec', LX('set_h')));
  const form = el.html('form', 'form', html`
    <div class="field"><label>${LX('set_dest')}</label>
      <div class="field-row"><input class="input mono" id="s-dest" value="${s.destination}" /><button class="btn" type="button" id="s-choose">${raw(icon('verb-folder', { size: 14 }))}${LX('set_choose')}</button></div>
      <div class="hint">${LX('set_dest_hint')}</div></div>

    <h2 class="sec">${LX('set_downloads')}</h2>
    <div class="two">
      <div class="field"><label>${LX('set_concurrency')}</label><input class="input" id="s-conc" type="number" min="1" max="4" value="${s.concurrency}" /></div>
      <div class="field"><label>${LX('set_max_file')}</label><input class="input" id="s-maxfile" type="number" min="1" value="${Math.round(s.maxFileBytes / MB)}" /></div>
    </div>
    <div class="field"><label>${LX('set_template')}</label><input class="input mono" id="s-tpl" value="${s.filenameTemplate}" /><div class="hint">${LX('set_template_hint')}</div></div>
    <div class="two">
      <div class="field"><label>${LX('set_overwrite')}</label><select class="input" id="s-ow">${['ask', 'skip', 'rename'].map((v) => html`<option value="${v}" ${s.overwritePolicy === v ? 'selected' : ''}>${LX('ow_' + v)}</option>`)}</select></div>
      <div class="field"><label>&nbsp;</label><label class="check"><input type="checkbox" id="s-keep" ${s.keepPartialOnCancel ? 'checked' : ''} /> ${LX('set_keep_partial')}</label></div>
    </div>

    <h2 class="sec">${LX('set_scanning')}</h2>
    <label class="check"><input type="checkbox" id="s-robots" ${s.respectRobots ? 'checked' : ''} /> ${LX('set_robots')}</label>
    <div class="two">
      <div class="field"><label>${LX('set_max_page')}</label><input class="input" id="s-maxpage" type="number" min="1" value="${Math.round(s.maxPageBytes / MB)}" /></div>
      <div class="field"><label>${LX('set_max_candidates')}</label><input class="input" id="s-maxc" type="number" min="1" value="${s.maxCandidates}" /></div>
      <div class="field"><label>${LX('set_probe_limit')}</label><input class="input" id="s-probe" type="number" min="0" value="${s.probeLimit}" /></div>
      <div class="field"><label>&nbsp;</label><label class="check"><input type="checkbox" id="s-autopv" ${s.autoPreviewImages ? 'checked' : ''} /> ${LX('set_auto_preview', { mb: (s.previewMaxBytes / MB).toFixed(1) })}</label></div>
    </div>

    <h2 class="sec">${LX('set_appearance')}</h2>
    <div class="two">
      <div class="field"><label>${LX('set_theme')}</label><select class="input" id="s-theme"><option value="nexus" ${s.theme === 'nexus' ? 'selected' : ''}>NEXUS (dark)</option><option value="daylight" ${s.theme === 'daylight' ? 'selected' : ''}>DAYLIGHT (light)</option></select></div>
      <div class="field"><label>${LX('set_language')}</label><select class="input" id="s-lang">${LANGUAGES.map((l) => html`<option value="${l.id}" ${s.language === l.id ? 'selected' : ''}>${l.label}</option>`)}</select></div>
    </div>
    <div class="field"><label>${LX('set_app_name')}</label><input class="input" id="s-name" value="${s.appName}" maxlength="60" /></div>

    <div class="btn-row"><button class="btn primary" type="submit">${raw(icon('verb-check', { size: 14 }))}${LX('set_save')}</button></div>

    <h2 class="sec">${LX('set_privacy')}</h2>
    <p class="lead">${LX('set_privacy_body')}</p>
    <div class="kv"><span class="k">${LX('set_data_dir')}</span><span class="v mono">${state.app.userData || '—'} <button class="btn sm quiet" type="button" id="s-opendata">${LX('set_open_data')}</button></span>
      <span class="k">${LX('set_ua')}</span><span class="v mono">${state.app.userAgent || '—'}</span></div>
    <div class="btn-row"><button class="btn danger" type="button" id="s-dellib">${raw(icon('verb-trash', { size: 14 }))}${LX('set_delete_library')}</button><span class="faint">${LX('set_delete_library_hint')}</span></div>
    <div class="btn-row"><button class="btn" type="button" id="s-ack">${LX('set_reset_ack')}</button></div>

    <h2 class="sec">${LX('set_about')}</h2>
    <div class="kv"><span class="k">${LX('set_version')}</span><span class="v mono">${state.app.version}${state.app.mock ? ' · browser harness (mock bridge)' : ''}</span></div>
  `.toString());
  root.appendChild(form);
  form.onsubmit = async (e) => {
    e.preventDefault();
    const g = (id) => form.querySelector('#' + id);
    const patch = {
      destination: g('s-dest').value, concurrency: Number(g('s-conc').value), maxFileBytes: Number(g('s-maxfile').value) * MB,
      filenameTemplate: g('s-tpl').value, overwritePolicy: g('s-ow').value, keepPartialOnCancel: g('s-keep').checked,
      respectRobots: g('s-robots').checked, maxPageBytes: Number(g('s-maxpage').value) * MB, maxCandidates: Number(g('s-maxc').value), probeLimit: Number(g('s-probe').value),
      autoPreviewImages: g('s-autopv').checked, theme: g('s-theme').value, language: g('s-lang').value, appName: g('s-name').value,
    };
    const r = await saveSettings(patch);
    if (r.value.theme !== document.documentElement.getAttribute('data-theme')) applyTheme(r.value.theme);
    if (patch.language !== s.language) changeLanguage(r.value.language);
    for (const [k, msg] of Object.entries(r.errors || {})) toast(`${k}: ${msg}`, { kind: 'err', ms: 6000 });
    if (!Object.keys(r.errors || {}).length) toast(LX('toast_settings'), { kind: 'ok' });
    render();
  };
  form.querySelector('#s-choose').onclick = async () => { const p = await api.settings.chooseDestination(); if (p && !p.error) { state.settings = await api.settings.get(); render(); } else if (p && p.error) toast(p.error.message, { kind: 'err' }); };
  form.querySelector('#s-opendata').onclick = () => api.shell.openDataDir();
  form.querySelector('#s-dellib').onclick = async () => {
    const ok = await confirm({ title: LX('set_delete_library'), body: LX('set_delete_library_hint'), actions: [{ label: LX('no'), value: false }, { label: LX('yes'), value: true, cls: 'danger' }] });
    if (ok) { await api.library.clear(); await refreshLibrary(); toast(LX('set_saved'), { kind: 'ok' }); }
  };
  form.querySelector('#s-ack').onclick = async () => { await saveSettings({ acknowledgedAt: false }); showAck(); };
}

export const view = {
  mount(stage, ctx) { CTX = ctx; root = el('div', 'settings measure'); stage.appendChild(root); render(); _offs.push(ctx.bus.on('language:changed', render)); _offs.push(ctx.bus.on('settings:changed', () => { if (!root.contains(document.activeElement)) render(); })); },
  unmount() { for (const off of _offs) off(); _offs = []; root = null; },
};
