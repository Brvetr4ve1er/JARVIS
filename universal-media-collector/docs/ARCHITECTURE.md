# Architecture

Boundaries, as the brief names them, and where each lives.

| Boundary | Module | Notes |
|---|---|---|
| SourceDetector | `main/source-detector.js` | host + path shape → `{ source, looksDirect }`; pure |
| SourceAdapter | `main/adapters/*.js` | `direct`, `webpage`, `platform` (honest stubs) |
| WebPageResolver | `main/adapters/webpage.js` + `main/html-parse.js` | bounded fetch, script-free parse, bounded probe |
| DownloadManager | `main/download-manager.js` | queue, concurrency, progress, retry, cancel, resume |
| FileService | `main/file-service.js` + `main/filenames.js` | names, containment, partials, atomic commit, SHA-256 |
| LibraryRepository | `main/library.js` (+ `json-store.js`) | records, soft delete/undo, search/sort |
| CredentialStore | — (not yet) | OS vault via `safeStorage`/keytar when an OAuth adapter lands |
| PolicyGate | `main/url-safety.js`, `main/net.js`, `main/settings.js`, `main/ipc.js` | address guard, caps, validated settings and IPC |

## Normalized models

**MediaCandidate** — `id` (sha1 of source+page URL), `sourceUrl`, `pageUrl`, `host`, `kind` (image|video|audio|unknown), `mime` + `mimeTrusted` (bytes|header|extension|none), `filenameHint`, `extHint`, `width`, `height` (+ `dimsFrom`), `duration`, `bytes`, `quality` (direct | page-largest-variant | page-variant | metadata | thumbnail | unknown), `accessLevel`, `attribution { title, pageTitle, pageHost }`, `via[]`, `probed`, `probeError`, `acceptRanges`, `validators { etag, lastModified }`.

**ResolverResult** — `pageUrl`, `source`, `capability { id, label, state, stateLabel, nextAction }`, `title`, `candidates[]`, `warnings[]`, `nextAction`, `scannedAt`, `error` (public error shape or null).

**Job** (public shape) — `id`, `status` (queued | running | paused | conflict | done | failed | cancelled | skipped), `name`, `finalPath`, `destination`, `bytesDone`, `bytesTotal`, `speedBps`, `attempts`, `error`, `conflict { existingPath, proposedName }`, `result { libraryId, sha256, bytes, path, duplicateOf }`.

## Renderer

The NEXUS v3 pattern: `registry.js` holds realms (`manifest { id, sigil, lexKey, order, badge(state), enabled(state) }`, `view { mount(el, ctx), unmount() }`); `shell.js` renders the rail and switches realms inside an error boundary; `chrome.js` owns the topstrip/statusbar/keys; `ambient.js` the right rail; `palette.js` the `Ctrl/Cmd+K` overlay; `store.js` holds state and the bridge (or the mock bridge in a plain browser). `ui/util.js` provides the auto-escaping `html` template tag and a text-only `el()`; markup is opt-in via `raw()` / `el.html()`.

Keys: `1–5` realms · `/` focus the paste field · `Ctrl/Cmd+K` palette · `Esc` close drawer/dialog.

## Tests

`npm test` runs every `test/**/*.test.js`: pure modules (url-safety, filenames, sniff, html-parse, robots, source-detector, errors) and integration suites (resolver, download) against `test/helpers/fixture-server.js` on 127.0.0.1 — the only place the address guard is relaxed, through a code-level allowlist (`allowPrivate: ['127.0.0.1']`) that no setting or IPC call can reach.
