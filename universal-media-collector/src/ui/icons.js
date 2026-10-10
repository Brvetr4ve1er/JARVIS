// icons.js — sprite loader + helpers (NEXUS v3 pattern): one fetch, inlined
// into <body>, then <use href="#i-…"> everywhere. Idempotent.
const SPRITE_URL = new URL('../../icons/umc-icons.svg', import.meta.url).href;
const SLOT_ID = 'umc-icon-sprite';
let injectPromise = null;

export function injectIconSprite() {
  if (document.getElementById(SLOT_ID)) return injectPromise || Promise.resolve();
  if (injectPromise) return injectPromise;
  injectPromise = fetch(SPRITE_URL).then((r) => { if (!r.ok) throw new Error(`sprite ${r.status}`); return r.text(); }).then((svg) => {
    if (document.getElementById(SLOT_ID)) return;
    const slot = document.createElement('div');
    slot.id = SLOT_ID; slot.setAttribute('aria-hidden', 'true');
    slot.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';
    slot.innerHTML = svg;   // authored in-repo, never user data
    document.body.appendChild(slot);
  }).catch((err) => { console.warn('[icons] sprite inject failed:', err && err.message); injectPromise = null; throw err; });
  return injectPromise;
}
export function hasIcon(name) { return !!name && !!document.getElementById(`i-${name}`); }
// Returns markup (a trusted static string: name is our own key, size clamped).
export function icon(name, opts) {
  const size = Math.max(8, Math.min(96, Math.round(opts?.size ?? 20)));
  const cls = String(opts?.className ?? '').replace(/[^a-zA-Z0-9 _-]/g, '');
  const id = String(name).replace(/[^a-zA-Z0-9_-]/g, '');
  return `<svg class="i i-${id}${cls ? ' ' + cls : ''}" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${id}"/></svg>`;
}
