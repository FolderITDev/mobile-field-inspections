# Architecture and decisions

Field Inspections is a local-first Expo app: every inspection lives on the device and SQLite is the source of truth.

## Layers

```text
src/app/        routes (Expo Router)       → render a screen, nothing else
src/features/   screens and components     → read state, call store actions
src/data/store  serialized write queue     → apply a domain transition, write, then publish
src/domain/     pure rules and validation  → no React, Expo or storage imports
src/data/       repositories               → SQLite on device, IndexedDB on web
```

A screen asks the store for a change. The store applies a pure domain transition to the latest committed inspection, writes it through the repository and only then publishes the new state to React. If the write fails, the committed state is untouched and the error appears next to the action that triggered it.

## Storage

- **One aggregate per row.** Each inspection is stored as validated JSON in a single SQLite row with an explicit `revision`. Saving one answer rewrites the whole inspection atomically, so a draft is never half updated. A workload with much larger collections would justify normalized tables and filtering in SQL.
- **Optimistic revisions.** Every write states the revision it started from; a stale revision is rejected instead of overwritten. The in-process queue serializes writes from the app itself.
- **Versioned schema.** `PRAGMA user_version` tracks the schema. Databases written by a newer version are rejected without a destructive reset.
- **Validation on read and write.** Every stored inspection passes through `parseRecord`; corrupt data is reported, never repaired by guessing.
- **Platforms.** Native builds use SQLite in WAL mode. The browser build uses IndexedDB transactions with the same validation and domain rules; it exists for quick UI review and does not stand in for native testing.

## Checklist and autosave

The eight checkpoints are defined in code with a `templateVersion`; stored inspections are validated against it, and records with missing or duplicate checkpoints are rejected. `use-checkpoint-autosave.ts` batches changes per checkpoint: answers save immediately and notes after a 600 ms pause. The screen shows **Saving…** until the write resolves and **Not saved** if it fails. Leaving a checkpoint flushes pending changes first and asks before discarding only when the write failed.

## Media

Camera and library images are resized to at most 1600 px on the longest side, re-encoded as JPEG (which drops most embedded metadata) and copied into the app documents directory under a generated name before an answer references them. Each checkpoint holds up to two photos. In the browser build images are stored with their record in IndexedDB. On startup, unreferenced files older than 24 hours are removed, so a save still in flight never loses its photo; deleting an inspection removes its files. A missing file never hides the rest of the record.

## Interface

Navigation uses native Expo Router stacks with large titles, modals for creation and review, and platform back gestures. Interactive elements are built from React Native primitives with explicit accessibility roles, names and states. Colors, fonts, spacing and motion come from `src/theme/tokens.ts` and follow the system appearance. Long lists are virtualized. See [DESIGN.md](../DESIGN.md).

## Verification

Automated tests run on Node's test runner against a real SQLite database (`node:sqlite`): domain invariants, migrations, durable restart, stale updates, corrupted payloads and formatting. Camera capture, permission denial, airplane mode, autosave across restarts and keyboard behavior are verified manually on physical iOS and Android devices.
