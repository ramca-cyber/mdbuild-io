

# Refactor: Replace Global Event Bus with Zustand EditorView Store

## Overview

Replace 18 custom `window.dispatchEvent`/`addEventListener` event types with a Zustand store that holds the CodeMirror `EditorView` ref and exposes typed action methods. All toolbar/menu components will call store methods directly instead of dispatching untyped `CustomEvent`s.

## Architecture

The core idea: create an `editorViewStore` that holds a reference to the CodeMirror `EditorView`. Any component that needs to command the editor (insert text, undo, scroll, etc.) imports the store and calls a typed method.

```text
Before:
  Toolbar --dispatchEvent('editor-insert')--> window --> Editor (addEventListener)

After:
  Toolbar --useEditorViewStore().insert()--> directly operates on EditorView
```

## New Store: `src/store/editorViewStore.ts`

A Zustand store (NOT persisted) that holds:

- `view: EditorView | null` -- the CodeMirror view reference
- `setView(view)` -- called once when CodeMirror mounts
- **Command methods** that operate directly on the view:
  - `insert(kind, before, after, placeholder, block)` -- replaces `editor-insert`
  - `undo()` / `redo()` -- replaces `editor-undo` / `editor-redo`
  - `selectAll()` -- replaces `editor-select-all`
  - `deleteLine()` / `duplicateLine()` / `selectLine()` -- replaces corresponding events
  - `moveLineUp()` / `moveLineDown()` -- replaces corresponding events
  - `goToLine(line)` -- replaces `editor-goto-line`
  - `convertCase(type)` -- replaces `editor-convert-case`
  - `textCleanup(type)` -- replaces `editor-text-cleanup` (also fixes missing listener bug)
  - `flushContent()` -- replaces `editor-flush-content`
- **State getters:**
  - `canUndo: boolean` / `canRedo: boolean` -- replaces `editor-history-change` event
  - `updateHistoryState()` -- called after mutations, updates canUndo/canRedo

**Scroll sync** (`editor-scroll`, `preview-scroll`, `preview-click`) will remain as window events for now. These are bidirectional between Editor and Preview (two separate DOM scroll containers), and converting them to store-based would require both components to share scroll position state with RAF timing -- a separate, more complex refactor. The audit's main concern was the command bus (toolbar-to-editor), not scroll sync.

**`show-goto-dialog`** will move to a simple boolean in the search store (it already has `showSearchReplace`).

## Files to Change

| File | Change |
|------|--------|
| `src/store/editorViewStore.ts` | **New file** -- Zustand store with EditorView ref + all command methods |
| `src/components/Editor.tsx` | Remove 10 event listeners + 10 keyboard dispatchers. Call `setView()` on mount. Move command logic into store. Keep scroll sync events. |
| `src/components/EditMenu.tsx` | Replace all `dispatchEvent` calls with `useEditorViewStore()` method calls. Read `canUndo`/`canRedo` from store instead of event listener. |
| `src/components/CompactToolbar.tsx` | Replace `dispatchEvent` calls with store methods |
| `src/components/Toolbar.tsx` | Replace `dispatchEvent` calls with store methods |
| `src/components/FormatMenu.tsx` | Replace `dispatchEvent` calls with store methods |
| `src/components/ErrorConsole.tsx` | Replace `preview-click` dispatch with store `goToLine()` |
| `src/components/StatisticsPanel.tsx` | Replace `show-goto-dialog` listener with store boolean |
| `src/hooks/useExportProgress.ts` | Replace `editor-flush-content` dispatch with store `flushContent()` |
| `src/hooks/useEditorCommands.ts` | Update to use store methods instead of `dispatchEvent` |
| `src/store/searchStore.ts` | Add `showGoToDialog` boolean (replaces `show-goto-dialog` event) |

## What Gets Removed

- 10 `window.addEventListener` registrations in Editor.tsx (the command handler block ~lines 880-1019)
- 10+ `window.dispatchEvent` calls in Editor.tsx keyboard handler (~lines 504-617)
- All `window.dispatchEvent(new CustomEvent('editor-*'))` calls in EditMenu, Toolbar, CompactToolbar, FormatMenu
- The `editor-history-change` event pattern (replaced by reactive store state)
- The `useEditorCommands` hook (replaced by direct store usage)

## What Stays (for now)

- `editor-scroll` / `preview-scroll` / `preview-click` -- scroll sync between Editor and Preview. These are performance-sensitive bidirectional events between two scroll containers. Converting them requires a separate refactor.

## Technical Details

The store will use `getState()` for imperative access (needed because CodeMirror commands are synchronous):

```typescript
// In editorViewStore.ts
export const useEditorViewStore = create<EditorViewState>((set, get) => ({
  view: null,
  canUndo: false,
  canRedo: false,
  debouncedSetContent: null,

  setView: (view) => set({ view }),
  setDebouncedSetContent: (fn) => set({ debouncedSetContent: fn }),

  undo: () => {
    const { view } = get();
    if (!view) return;
    undo(view);
    get().updateHistoryState();
  },

  insert: (kind, opts) => {
    const { view } = get();
    if (!view) return;
    // ... insertion logic moved from Editor.tsx
  },

  updateHistoryState: () => {
    const { view } = get();
    if (!view) return;
    set({
      canUndo: undoDepth(view.state) > 0,
      canRedo: redoDepth(view.state) > 0,
    });
  },

  flushContent: () => {
    get().debouncedSetContent?.flush();
  },
}));
```

Components consume it reactively:

```typescript
// In EditMenu.tsx
const { undo, redo, canUndo, canRedo } = useEditorViewStore();

// No more useEffect for editor-history-change
<MenubarItem onClick={undo} disabled={!canUndo}>Undo</MenubarItem>
```

## Benefits

- Full type safety on all editor commands (no more string event names)
- Compile-time errors if a command signature changes
- `canUndo`/`canRedo` are reactive store state -- no event listener needed
- Text cleanup bug is fixed (the `editor-text-cleanup` event was dispatched but never listened to)
- Easier debugging (store state is inspectable)
- ~150 lines of event wiring removed from Editor.tsx

## Risk Mitigation

- Scroll sync events are left unchanged to avoid breaking the sensitive RAF-based scroll interpolation
- All command logic is moved verbatim from Editor.tsx into the store -- no behavioral changes
- The store is non-persisted (vanilla Zustand, no middleware) since it holds a runtime ref

