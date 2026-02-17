
# Controls Audit Implementation Plan

## Current Status

The audit identifies 20 prioritized fixes. Several items from Parts 1-2 were already addressed in the previous UI/UX review work (table commands in CommandPalette now work, panel labels removed, Toolbar/CompactToolbar removed, FloatingToolbar enhanced). Here's what remains.

## Remaining Issues (Grouped by Priority)

### Group A: Dead Controls (Broken -- Fix Now)

**A1. CommandPalette "export-document" events are dead (4 items)**
The export commands (PDF, DOCX, HTML, MD) dispatch `export-document` custom events that nothing listens for. The actual export functions live in `useDocumentActions`.
- **Fix**: Import and call the export functions directly from `useDocumentActions` instead of dispatching events.

**A2. CommandPalette "Open Settings" is dead**
Dispatches `show-settings` with no listener.
- **Fix**: Add a `showEditorSettings` state to a shared store or toggle it via a new Zustand flag in `settingsStore`, so the command palette can open it directly.

**A3. FormatMenu "Text Cleanup" -- Already Fixed**
The audit says these are dead, but they now call `textCleanup()` directly from `editorViewStore` (verified in current FormatMenu.tsx). No action needed.

### Group B: Shortcut Conflicts and Mismatches (Fix Now)

**B1. Ctrl+D conflict (Select Next Occurrence vs Split View)**
KeyboardShortcutsDialog lists Ctrl+D for both "Select next occurrence" and "Split View."
- **Fix**: Change Split View shortcut display to Ctrl+Shift+D in KeyboardShortcutsDialog and ViewMenu. Update the actual binding in `useEditorKeyboardShortcuts`.

**B2. Ctrl+P conflict (Print vs Preview Only)**
- **Fix**: Remove Ctrl+P as Preview shortcut. Keep it for Print only. Update KeyboardShortcutsDialog and ViewMenu.

**B3. EditMenu Delete Line shortcut label wrong**
Shows Ctrl+D but actual binding is Ctrl+Shift+K.
- **Fix**: Change the MenubarShortcut in EditMenu from `{modKey}+D` to `{modKey}+Shift+K`.

**B4. Outline toggle tooltip said "Ctrl+B"**
- **Fix**: Already resolved in previous work (tooltip now just says "Toggle Outline"). Verify -- no action needed.

### Group C: Toast Spam (User Experience)

**C1. Remove unnecessary toasts**
Remove toasts from: Undo, Redo, Cut, Copy, Paste, Select All, Insert Link/Image/Emoji, Insert Date/Time. Keep toasts for: Save, Export, Import, Delete, Template, Clear, and errors.
- **Files**: `EditMenu.tsx` (remove from handleUndo, handleRedo, handleCut, handleCopy, handlePaste, handleSelectAll, handleInsertDateTime)

### Group D: Missing PNG Export (Fix Now)

**D1. Add PNG export to File menu and Command Palette**
The `exportUtils.tsx` already has `toPng` from `html-to-image`. An export function exists but is not exposed in the File menu.
- **Fix**: Add `handleExportPNG` to `useDocumentActions`, wire it into `FileMenu` and `CommandPalette`.

### Group E: Settings UX (Fix Soon)

**E1. Reset All Settings uses `confirm()` instead of AlertDialog**
- **Fix**: Replace `confirm()` in `SettingsMenu.tsx` with an AlertDialog for consistency.

**E2. Snippets menu is a 1-item menu**
- **Fix**: Merge "Manage Snippets..." into Settings menu. Remove SnippetsMenu from DocumentHeader.

### Group F: Keyboard Shortcuts Dialog Improvements

**F1. Mac key labels**
Always shows "Ctrl" even on Mac. Should show the Command symbol.
- **Fix**: Detect Mac and replace "Ctrl" with the Command symbol in KeyboardShortcutsDialog.

**F2. Fix documented conflicts**
Remove duplicate Ctrl+D and Ctrl+P entries that list different actions.

## Files to Change

| File | Changes |
|------|---------|
| `src/components/CommandPalette.tsx` | Replace `handleExport` event dispatch with direct calls; replace `show-settings` with store toggle; add PNG export |
| `src/components/EditMenu.tsx` | Remove toasts from undo/redo/cut/copy/paste/selectAll/insertDateTime; fix Delete Line shortcut label |
| `src/components/ViewMenu.tsx` | Fix Ctrl+D to Ctrl+Shift+D for Split View; remove Ctrl+P from Preview |
| `src/components/KeyboardShortcutsDialog.tsx` | Fix shortcut conflicts; add Mac key detection |
| `src/components/SettingsMenu.tsx` | Replace `confirm()` with AlertDialog; absorb "Manage Snippets" item |
| `src/components/DocumentHeader.tsx` | Remove SnippetsMenu from menu bar |
| `src/hooks/useDocumentActions.ts` | Add handleExportPNG function |
| `src/components/FileMenu.tsx` | Add PNG export option |
| `src/store/settingsStore.ts` | Add `showEditorSettings` flag for command palette access |
| `src/hooks/useEditorKeyboardShortcuts.ts` | Fix Ctrl+D to Ctrl+Shift+D for split view; remove Ctrl+P for preview |

## Implementation Order

1. **Group A + D** -- Fix dead controls and add PNG export (highest impact, breaks trust)
2. **Group B** -- Fix shortcut conflicts and mislabels
3. **Group C** -- Remove toast spam
4. **Group E** -- Settings UX improvements (AlertDialog, merge Snippets)
5. **Group F** -- Keyboard shortcuts dialog Mac awareness and conflict cleanup

## Out of Scope (Future Iterations)

The audit also recommends: right-click context menu, drag-and-drop file support, top-level Insert menu, cursor breadcrumb, share actions, presentation mode, and searchable shortcuts dialog. These are enhancements for a follow-up iteration, not broken controls.
