// Boot — bridge init, realm registration, shell start, chrome/ambient/
// palette, the one-time acknowledgement, and the --selftest sweep.
import { bus } from './bus.js';
import { init as initStore, state } from './store.js';
import { register, ordered } from './registry.js';
import { startShell, switchRealm } from './shell.js';
import { THEMES, applyTheme, currentTheme } from './themes.js';
import { setLanguage } from './lexicon.js';
import { injectIconSprite } from '../ui/icons.js';
import { initChrome } from './chrome.js';
import { initAmbient } from './ambient.js';
import { initPalette } from './palette.js';
import { maybeShowAck } from './onboarding.js';

import { manifest as inboxM } from '../realms/inbox/manifest.js';
import { view as inboxV } from '../realms/inbox/view.js';
import { manifest as queueM } from '../realms/queue/manifest.js';
import { view as queueV } from '../realms/queue/view.js';
import { manifest as libraryM } from '../realms/library/manifest.js';
import { view as libraryV } from '../realms/library/view.js';
import { manifest as sourcesM } from '../realms/sources/manifest.js';
import { view as sourcesV } from '../realms/sources/view.js';
import { manifest as settingsM } from '../realms/settings/manifest.js';
import { view as settingsV } from '../realms/settings/view.js';

await injectIconSprite().catch(() => {});
await initStore();

// theme + language: settings win (they are the persisted truth); the
// localStorage theme key only bridges the first paint before settings load.
applyTheme(state.settings.theme || currentTheme());
setLanguage(state.settings.language || 'en');

register(inboxM, inboxV);
register(queueM, queueV);
register(libraryM, libraryV);
register(sourcesM, sourcesV);
register(settingsM, settingsV);

startShell(sessionStorage.getItem('umc-active-realm') || 'inbox');
initChrome();
initAmbient();
initPalette();

window.UMC = { switchRealm, applyTheme, THEMES, ordered, state, bus };
console.log(`UMC boot realms=${ordered().length} theme=${currentTheme()} lang=${state.settings.language} bridge=${state.app.mock ? 'mock' : 'electron'} queue=${state.queue.length} library=${state.library.length}`);

const params = new URLSearchParams(location.search);
if (params.get('selftest')) {
  let errors = 0; const seen = [];
  bus.on('realm:error', () => { errors++; });
  for (const themeId of Object.keys(THEMES)) {
    try { applyTheme(themeId, { persist: false }); } catch (err) { errors++; console.error('[selftest] theme', themeId, err); }
    for (const { manifest } of ordered()) {
      try { switchRealm(manifest.id, true); seen.push(`${themeId}/${manifest.id}`); const stage = document.getElementById('stage'); if (!stage.childElementCount) { errors++; console.error('[selftest] empty stage', themeId, manifest.id); } console.log(`SELFTEST-REALM ${themeId}/${manifest.id} nodes=${stage.childElementCount} chars=${stage.innerHTML.length}`); }
      catch (err) { errors++; console.error('[selftest] realm', themeId, manifest.id, err); }
    }
  }
  applyTheme(state.settings.theme || 'nexus', { persist: false }); switchRealm('inbox', true);
  console.log(`SELFTEST combos=${seen.length} errors=${errors} ${errors === 0 ? 'PASS' : 'FAIL'}`);
} else {
  maybeShowAck();
}
