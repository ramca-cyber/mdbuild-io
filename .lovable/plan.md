
# Audit Review: Implementation Plan — COMPLETED

All 10 fixes from the audit have been implemented (fix #6 kept as full-doc replacement pending table utils refactor).

## Completed Fixes

1. ✅ Fixed `addRowBelow`/`addRowAbove` malformed table rows
2. ✅ Fixed `addColumnAfter` alignment row calculation (uses `alignmentRowLineIndex`)
3. ✅ Fixed `emitHistoryState` to use `undoDepth`/`redoDepth`
4. ✅ Fixed `isInTable` false positives (requires `|` start+end and adjacent table row)
5. ✅ Replaced typewriter mode `setInterval` with `EditorView.updateListener`
6. ⚠️ Table ops still use full-doc replacement (needs table utils refactor to return ranges)
7. ✅ Removed "Visible Words" preview footer entirely
8. ✅ PWA manifest: `orientation: 'any'`, `start_url: '/editor'`
9. ✅ Added `rehype-sanitize` with GitHub-compatible schema
10. ✅ Added `debounce.flush()` + `editor-flush-content` event before exports
