// QUEUE — the local download queue. Badge = jobs needing attention or in flight.
export const manifest = {
  id: 'queue', sigil: '⇣', lexKey: 'tab_queue', order: 2,
  badge: (state) => state.queue.filter((j) => ['running', 'queued', 'paused', 'conflict'].includes(j.status)).length || null,
  enabled: () => true,
};
