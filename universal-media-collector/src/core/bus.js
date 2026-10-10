// Tiny pub/sub — the nervous system between core, realms, and overlays.
// Realms never call each other; they emit and listen here. (NEXUS v3 pattern.)
const handlers = new Map();   // event -> Set<fn>

export const bus = {
  on(event, fn) {
    if (!handlers.has(event)) handlers.set(event, new Set());
    handlers.get(event).add(fn);
    return () => handlers.get(event)?.delete(fn);
  },
  emit(event, payload) {
    handlers.get(event)?.forEach((fn) => {
      try { fn(payload); } catch (err) { console.error(`[bus] handler for "${event}" threw:`, err); }
    });
  },
};
