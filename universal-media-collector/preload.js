// preload.js — the ONLY bridge between the renderer and the main process.
// A narrow, promise-based surface; the renderer never sees Node, fs, or
// network primitives. Every channel is validated main-side (main/ipc.js).
const { contextBridge, ipcRenderer } = require('electron');

const invoke = (ch, ...args) => ipcRenderer.invoke(ch, ...args);
const on = (ch, cb) => { const h = (_e, payload) => cb(payload); ipcRenderer.on(ch, h); return () => ipcRenderer.removeListener(ch, h); };

contextBridge.exposeInMainWorld('umc', {
  app: () => invoke('umc:app'),
  resolve: (url) => invoke('umc:resolve', String(url)),
  cancelResolve: () => invoke('umc:resolve:cancel'),
  preview: (url) => invoke('umc:preview', String(url)),
  sources: () => invoke('umc:sources'),
  queue: {
    add: (candidates) => invoke('umc:queue:add', candidates),
    list: () => invoke('umc:queue:list'),
    cancel: (id) => invoke('umc:queue:cancel', String(id)),
    pause: (id) => invoke('umc:queue:pause', String(id)),
    resume: (id) => invoke('umc:queue:resume', String(id)),
    retry: (id) => invoke('umc:queue:retry', String(id)),
    remove: (id) => invoke('umc:queue:remove', String(id)),
    resolveConflict: (id, choice) => invoke('umc:queue:conflict', String(id), String(choice)),
    pauseAll: () => invoke('umc:queue:pauseAll'),
    resumeAll: () => invoke('umc:queue:resumeAll'),
    clearFinished: () => invoke('umc:queue:clearFinished'),
  },
  onQueue: (cb) => on('umc:queue', cb),
  onJob: (cb) => on('umc:job', cb),
  library: {
    list: (opts) => invoke('umc:library:list', opts || {}),
    get: (id) => invoke('umc:library:get', String(id)),
    update: (id, patch) => invoke('umc:library:update', String(id), patch || {}),
    remove: (id) => invoke('umc:library:remove', String(id)),
    restore: (id) => invoke('umc:library:restore', String(id)),
    clear: () => invoke('umc:library:clear'),
    exists: (id) => invoke('umc:library:exists', String(id)),
  },
  settings: {
    get: () => invoke('umc:settings:get'),
    set: (patch) => invoke('umc:settings:set', patch || {}),
    chooseDestination: () => invoke('umc:settings:chooseDestination'),
  },
  shell: {
    openFile: (libraryIdOrJobId) => invoke('umc:shell:openFile', String(libraryIdOrJobId)),
    showInFolder: (libraryIdOrJobId) => invoke('umc:shell:showInFolder', String(libraryIdOrJobId)),
    openDestination: () => invoke('umc:shell:openDestination'),
    openDataDir: () => invoke('umc:shell:openDataDir'),
    openExternal: (url) => invoke('umc:shell:openExternal', String(url)),
  },
  clipboardText: () => invoke('umc:clipboard:text'),
});
