

# Post-Refactor Controls Audit v2 -- Implementation Plan

## Summary

The v2 audit found 5 broken items, 5 polish items, and 4 enhancement items. This plan addresses all of them in priority order.

## Fix Now (Broken)

### 1. ViewModeSwitcher Ctrl+D / Ctrl+P conflicts
The handler at lines 13-24 binds `Ctrl+D` (split) and `Ctrl+P` (preview) without checking `shiftKey`. This breaks CodeMirror's "Select next occurrence" and browser Print.

**Fix in `ViewModeSwitcher.tsx`:**
- Change `Ctrl+D` to require `e.shiftKey` (so `Ctrl+Shift+D` triggers split view)
- Remove `Ctrl+P` binding entirely (preview has no shortcut; print works natively)
- Update tooltip strings to match: Split View shows `Ctrl+Shift+D`, Preview shows no shortcut

### 2. EditMenu Cut/Copy uses wrong selection API
`window.getSelection()` returns DOM selection, which shifts to the menu item once clicked. Should use CodeMirror's selection via `editorViewStore`.

**Fix in `EditMenu.tsx`:**
- Import `useEditorViewStore` (already imported)
- For Cut: get selected text from `view.state.sliceDoc(sel.from, sel.to)`, write to clipboard, then dispatch a replacement
- For Copy: same read, just clipboard write
- Matches how `EditorContextMenu` already does it

### 3. Insert Date/Time format mismatch
EditMenu uses bare `toLocaleString()`, keyboard shortcut uses explicit `en-US` format with options.

**Fix in `EditMenu.tsx`:**
- Standardize `handleInsertDateTime` to use the same format: `toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })`

### 4. Mobile menu access gap
The hamburger only opens Saved Documents. All 6 menus are hidden behind `hidden sm:flex`. Mobile users cannot save, format, export, or access settings.

**Fix: Create a mobile action sheet**
- Create `MobileMenuSheet.tsx` -- a bottom sheet (using the existing Drawer/Sheet component) containing grouped action buttons for the most critical operations:
  - **File**: Save, Export (MD), Import, New
  - **Edit**: Undo, Redo, Find
  - **Format**: Bold, Italic, Heading, List, Code
  - **Insert**: Link, Image, Table
  - **View**: Toggle outline, Theme
  - **Settings**: Open unified settings
- Update `DocumentHeader.tsx` hamburger to open this sheet instead of (or in addition to) the documents panel
- Add a "Saved Documents" button inside the sheet to access the existing documents panel

### 5. Ctrl+Shift+W (Word Count) not bound
EditMenu shows `Ctrl+Shift+W` for Word Count, but no keyboard handler exists.

**Fix in `useEditorKeyboardShortcuts.ts`:**
- Add a handler for `Ctrl+Shift+W` that shows the word count toast (same logic as EditMenu's `handleWordCount`)

## Fix Soon (Polish)

### 6. FormatMenu missing keyboard shortcuts
Bold, Italic show no shortcut hints.

**Fix in `FormatMenu.tsx`:**
- Add `MenubarShortcut` for Bold (`Ctrl+B`), Italic (`Ctrl+I`)

### 7. FloatingToolbar Link tooltip says "Ctrl+K"
`Ctrl+K` opens Command Palette, not link dialog.

**Fix in `FloatingToolbar.tsx`:**
- Remove the `Ctrl+K` kbd from the Link tooltip (line 213). Just show "Link".

### 8. ViewModeSwitcher aria-current redundancy
Uses both `aria-pressed` and `aria-current="page"`.

**Fix in `ViewModeSwitcher.tsx`:**
- Remove `aria-current={isActive ? 'page' : undefined}` (line 76). Keep `aria-pressed` only.

### 9. UnifiedSettingsDialog missing Reset buttons
No per-tab reset to defaults.

**Fix in `UnifiedSettingsDialog.tsx`:**
- Add a "Reset to Defaults" button in the dialog footer
- When on Editor tab, reset editor-related settings; when on Preview tab, reset preview settings

### 10. Storage polling every 5 seconds
`DocumentHeader.tsx` line 61 polls storage continuously.

**Fix in `DocumentHeader.tsx`:**
- Remove the `setInterval` polling
- Instead, recalculate storage when the dialog opens (`storageDialogOpen` changes to true) and after save/delete actions
- Listen for a lightweight event or recalculate in the `useDocumentActions` callbacks

## Enhance Next

### 11. Ctrl+/ for comment toggle
Wrap/unwrap selection in `<!-- -->`.

**Fix in `useEditorKeyboardShortcuts.ts`:**
- Add handler for `Ctrl+/` that calls `insert('wrap', { before: '<!-- ', after: ' -->' })`

### 12. Ctrl+] / Ctrl+[ for indent/outdent
Standard editor shortcuts.

**Fix in `useEditorKeyboardShortcuts.ts`:**
- `Ctrl+]`: prepend selected lines with two spaces (or tab)
- `Ctrl+[`: remove leading two spaces from selected lines

### 13. System theme option
Users can't explicitly select "follow system" after changing theme.

**Fix:**
- Add `'system'` to the Theme type in `settingsStore.ts`
- Add "System" option in `UnifiedSettingsDialog` theme selector
- In `Index.tsx`, when theme is `'system'`, use `window.matchMedia('(prefers-color-scheme: dark)')` to determine actual theme and listen for changes

### 14. Searchable shortcuts -- already done
Confirmed working. No action needed.

## Files to Change

| File | Changes |
|------|---------|
| `src/components/ViewModeSwitcher.tsx` | Fix Ctrl+D to require Shift; remove Ctrl+P; remove aria-current; update tooltips |
| `src/components/EditMenu.tsx` | Fix Cut/Copy to use CM selection; fix date format |
| `src/components/FormatMenu.tsx` | Add MenubarShortcut to Bold, Italic |
| `src/components/FloatingToolbar.tsx` | Remove Ctrl+K from Link tooltip |
| `src/components/DocumentHeader.tsx` | Replace storage polling with event-driven; update hamburger for mobile sheet |
| `src/components/MobileMenuSheet.tsx` | **New** -- mobile action sheet with grouped controls |
| `src/components/UnifiedSettingsDialog.tsx` | Add per-tab Reset buttons; add System theme option |
| `src/hooks/useEditorKeyboardShortcuts.ts` | Add Ctrl+Shift+W, Ctrl+/, Ctrl+]/Ctrl+[ bindings |
| `src/store/settingsStore.ts` | Add 'system' to Theme type |

## Implementation Order

1. Items 1-3 (ViewModeSwitcher shortcuts, EditMenu selection, date format) -- quick targeted fixes
2. Item 5 (Ctrl+Shift+W binding)
3. Items 6-8 (FormatMenu shortcuts, FloatingToolbar tooltip, aria fix)
4. Item 4 (Mobile menu sheet -- largest new component)
5. Items 9-10 (Reset buttons, storage polling)
6. Items 11-13 (Comment toggle, indent/outdent, system theme)

