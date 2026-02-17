

# Audit Review: Implementation Plan

This plan covers everything from the audit that I agree with and that hasn't already been fixed.

## Already Fixed (skipping these)

These were addressed in previous sessions:
- Heading anchor IDs (rehypeHeadingIds plugin exists)
- Footnote AST mutation during traversal (already refactored to use Set + separate pass)
- Outline panel text matching (already uses slugify + getElementById)
- Ctrl+S duplicate (already removed from Editor.tsx)
- Ctrl+A hijack (already scoped to .cm-editor focus check)
- markdownContent memo deps (already includes remarkPlugins, rehypePlugins)
- "Visible Words" label in preview footer (already labeled)

---

## Fixes to Implement

### 1. Fix `addRowBelow` / `addRowAbove` generating malformed table rows

**Severity: Critical**

Currently generates `|          ||||` instead of `| | | | |` for a 4-column table. Both `addRowBelow` and `addRowAbove` have this bug.

**File:** `src/lib/tableUtils.ts` (lines 275, 292)

**Change:** Replace the malformed row generation:
```
// Before (broken)
const newRow = '|' + ' '.repeat(10) + '|'.repeat(numCells);

// After (correct)
const newRow = '| ' + Array(numCells).fill('     ').join(' | ') + ' |';
```

---

### 2. Fix `addColumnAfter` alignment row calculation

**Severity: Critical**

The alignment row index is computed with a broken averaging heuristic that produces wrong results for documents with uneven line lengths.

**File:** `src/lib/tableUtils.ts` (lines 326-337)

**Change:** Instead of the heuristic, track the alignment row's actual line index during table parsing and use it directly. This requires:
- Storing the alignment row's absolute line index in `TableInfo`
- Using that index directly in `addColumnAfter`

---

### 3. Fix `emitHistoryState` always reporting true

**Severity: Medium**

The function always emits `canUndo: true, canRedo: true` regardless of actual state.

**File:** `src/components/Editor.tsx` (lines 1020-1034)

**Change:** Query CodeMirror's undo/redo state properly:
```typescript
import { undoDepth, redoDepth } from '@codemirror/commands';

const emitHistoryState = () => {
  if (viewRef.current) {
    window.dispatchEvent(
      new CustomEvent('editor-history-change', {
        detail: {
          canUndo: undoDepth(viewRef.current.state) > 0,
          canRedo: redoDepth(viewRef.current.state) > 0,
        },
      })
    );
  }
};
```

---

### 4. Fix `isInTable` false positives

**Severity: Medium**

Any line containing `|` (e.g., prose like "choose A | B") triggers table navigation mode and hijacks Tab.

**File:** `src/lib/tableUtils.ts` (lines 23-52, 135-138)

**Change:** Tighten the detection: require the line to start and end with `|` (trimmed), and check that adjacent lines also look like table rows, to avoid treating random pipe characters as tables.

---

### 5. Replace typewriter mode `setInterval` with CodeMirror listener

**Severity: Medium (performance)**

Currently polls at 100ms via `setInterval`. CodeMirror has `EditorView.updateListener` that fires on selection changes.

**File:** `src/components/Editor.tsx` (lines 200-229)

**Change:** Replace the interval with an `EditorView.updateListener` extension that fires only when the selection actually changes, eliminating the polling.

---

### 6. Table operations: use precise ranges instead of full-document replacement

**Severity: Medium (performance/UX)**

Every table edit dispatches `changes: { from: 0, to: text.length, insert: result.text }`, replacing the entire document. This destroys undo granularity.

**File:** `src/components/Editor.tsx` (lines 308-313, 336-340, 363-367, 390-392)

**Change:** Modify the table utility functions to return a `from`/`to` range targeting only the table region, so the dispatch uses a targeted change instead of a full replacement.

---

### 7. Remove the "Visible Words" preview footer entirely

**Severity: Low**

The audit notes this metric is confusing because it changes on scroll and differs from the total stats. Even with the "Visible" label, it adds little value and the visible-stats computation (tree walker on every scroll) is expensive.

**Files:** `src/components/Preview.tsx` (lines 65-115, 724-733)

**Change:** Remove the `renderedStats` state, the `computeVisibleStats` effect (with its scroll/resize listeners and tree walker), and the footer div entirely.

---

### 8. PWA manifest improvements

**Severity: Low**

- `orientation` should be `'any'` (not `'portrait'`) for a desktop-first editor
- `start_url` should be `/editor` so returning users land in the editor

**File:** `vite.config.ts` (lines 26-27)

**Change:** Update `orientation: 'any'` and `start_url: '/editor'` (or whatever route the editor uses).

---

### 9. Add `rehype-sanitize` for XSS protection

**Severity: Medium (security)**

`rehype-raw` allows arbitrary HTML including script injection. While React mitigates most XSS, a sanitization layer is safer.

**File:** `src/components/Preview.tsx`

**Change:** Add `rehype-sanitize` with a GitHub-compatible schema that allows `<details>`, `<summary>`, `<kbd>`, `<sup>`, `<sub>`, and other safe HTML elements while blocking scripts.

---

### 10. Debounce flush before export

**Severity: Medium**

The editor content is debounced by 150ms. If a user types and immediately exports, the store may hold stale content.

**File:** `src/components/Editor.tsx` (wherever `debouncedSetContent` is defined)

**Change:** Expose a `flush()` method on the debounced function and call it before any export operation, or read directly from the CodeMirror view state during export.

---

## Summary

| # | Fix | Severity | File(s) |
|---|-----|----------|---------|
| 1 | Malformed table rows | Critical | `tableUtils.ts` |
| 2 | Column add alignment calc | Critical | `tableUtils.ts` |
| 3 | emitHistoryState always true | Medium | `Editor.tsx` |
| 4 | isInTable false positives | Medium | `tableUtils.ts` |
| 5 | Typewriter setInterval -> listener | Medium | `Editor.tsx` |
| 6 | Table ops full-doc replacement | Medium | `Editor.tsx`, `tableUtils.ts` |
| 7 | Remove visible words footer | Low | `Preview.tsx` |
| 8 | PWA orientation + start_url | Low | `vite.config.ts` |
| 9 | Add rehype-sanitize | Medium | `Preview.tsx` |
| 10 | Debounce flush before export | Medium | `Editor.tsx` |

## What I'm NOT implementing from the audit

- **Global event bus replacement with Zustand actions**: This is a massive architectural refactor that would touch nearly every component. While it's good advice long-term, it's too risky as a single change and should be done incrementally.
- **Editor.tsx decomposition into hooks**: Same reasoning -- large refactor, better done incrementally.
- **DocumentHeader.tsx decomposition**: Same.
- **Interactive task list checkboxes**: Feature addition, not a bug fix. Worth doing but separate scope.
- **Drag-and-drop image support**: Feature addition, separate scope.
- **@mention / #issue autolinks**: Not needed for a standalone editor.
- **Virtualized rendering**: Optimization for edge cases, separate scope.
- **Flatten toolbar design**: Subjective design change, separate scope.
- **Copy buttons via DOM manipulation**: Works fine currently, lower priority.
- **Smart paste same-origin detection**: Edge case, separate scope.

