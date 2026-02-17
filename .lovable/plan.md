

# UI/UX Review Implementation Plan

## Summary

This plan addresses the most impactful findings from the UI/UX review, organized into phases. The review identifies ~40% of screen space consumed by chrome, 4 overlapping toolbar surfaces, and several interaction bugs.

## Phase 1: Quick Wins (High Impact, Low Effort)

### 1A. Remove "Markdown Editor" and "Preview" panel header labels
- **Editor.tsx**: Remove the `<h2>Markdown Editor</h2>` text from the editor panel header (line 257-263). Keep the CompactToolbar row but make it slimmer.
- **Preview.tsx**: Remove the `<h2>Preview</h2>` text from the preview panel header (line 552-555). Keep the tool buttons.
- **Savings**: ~16px per panel, reduced visual noise.

### 1B. Fix FloatingToolbar viewport clamping
- **FloatingToolbar.tsx**: Add bounds checking to the position calculation (lines 39-42):
  - Clamp X to `Math.max(8, Math.min(window.innerWidth - toolbarWidth - 8, calculated_x))`
  - Flip Y below selection if it would go above viewport: `calculated_y < 8 ? rect.bottom + 8 : calculated_y`

### 1C. Stop AnimatedPreview infinite loop
- **AnimatedPreview.tsx**: Add a cycle counter. After 2 full cycles, clear the interval and leave the final text displayed. This stops unnecessary CPU usage on the landing page.

### 1D. Fix command palette hardcoded array slicing
- **CommandPalette.tsx**: Add a `group` property to each command object (`'formatting' | 'headings' | 'lists' | 'insert' | 'alerts' | 'table' | 'edit' | 'view' | 'document' | 'settings'`). Replace all `commands.slice(N, M)` calls with `commands.filter(c => c.group === 'formatting')` etc. Also fix the `icon: any` type to `icon: LucideIcon`.

### 1E. Fix non-functional table commands in CommandPalette
- **CommandPalette.tsx**: The table commands (Add Row Below, Add Row Above, etc.) dispatch custom events that nothing listens for. Replace with direct calls to the table utility functions from `editorViewStore` or remove them if they can only work contextually (when cursor is inside a table).

### 1F. Scope the global `min-height`/`min-width` CSS rule
- **index.css** (line 176-181): The rule `button, [role="button"], [tabindex] { min-height: 2.5rem; min-width: 2.5rem; }` affects every clickable element globally, causing oversized accordion triggers, dropdown items, and inline toolbar buttons. Scope it to only primary action buttons (e.g., `.primary-touch-target`) or remove it entirely since individual components already define their own sizing.

### 1G. Fix StatisticsPanel stale time display
- **StatisticsPanel.tsx**: The `formatTime` function shows "Saved 2m ago" but never re-renders to update. Add a `setInterval` (every 30s) that forces a re-render so the "Saved X ago" text stays current.

## Phase 2: Layout & Vertical Space Optimization

### 2A. Merge Header and DocumentHeader into one bar
- **Index.tsx**: Remove the separate `<header>` element (lines 129-282) that contains the logo, Home/Help links, theme toggle, and keyboard shortcuts button.
- **DocumentHeader.tsx**: Absorb these elements into the existing DocumentHeader bar:
  - Add the "M" logo icon on the far left (before the File menu)
  - Move theme toggle, Home/Help links, PWA install, and keyboard shortcuts button into the right side of DocumentHeader
  - This saves ~56px of vertical space

### 2B. Auto-collapse StatisticsPanel
- **StatisticsPanel.tsx**: Make the default state collapsed (single line showing `Ln X, Col Y | N words | Saved just now`). The expanded grid with paragraphs/sentences/headings only appears on click of the expand button. Ensure `statisticsExpanded` defaults to `false` in the settings store.

### 2C. Remove Preview footer visible word count
- If there's a visible-words footer in the Preview component, remove it. (The review mentions "Visible Words/Characters" but checking Preview.tsx, this may have already been removed or may be rendered elsewhere.)

## Phase 3: Interaction Pattern Fixes

### 3A. Fix OutlinePanel editor-only mode
- **OutlinePanel.tsx**: The `scrollToHeading` function only queries `.preview-content`. In editor-only mode (`viewMode === 'editor'`), it should instead use `editorViewStore.goToLine()` to scroll the editor to the heading's source line. Detect the current view mode and branch accordingly.

### 3B. Add `aria-current="page"` to active view mode button
- **ViewModeSwitcher.tsx**: Add `aria-current="page"` attribute to the currently active view mode button for accessibility.

### 3C. Show ViewModeSwitcher on mobile
- **Index.tsx / DocumentHeader.tsx**: Move the ViewModeSwitcher out of the desktop-only area so it's visible on mobile. Switching between editor and preview is the most common mobile action and shouldn't require opening the hamburger menu.

## Phase 4: Toolbar Consolidation (Larger Effort)

This is the review's most significant structural recommendation. It can be done in a follow-up iteration.

### 4A. Remove the main Toolbar component
- The Toolbar (Format/Structure/Lists/Insert groups) duplicates functionality available in:
  - DocumentHeader menus (File/Edit/Format/View)
  - CompactToolbar (inline formatting)
  - FloatingToolbar (selection formatting)
  - SlashCommandMenu (block insertion)
- Remove `<Toolbar />` from `Index.tsx` and delete the component. Move the error badge to the DocumentHeader or StatisticsPanel.

### 4B. Enhance FloatingToolbar
- Add a heading dropdown and list toggle to the FloatingToolbar so it fully replaces the CompactToolbar for selection-based formatting.

### 4C. Remove CompactToolbar
- After enhancing FloatingToolbar, remove CompactToolbar from Editor.tsx.

## Files Changed

| Phase | File | Change |
|-------|------|--------|
| 1A | `src/components/Editor.tsx` | Remove "Markdown Editor" h2 label |
| 1A | `src/components/Preview.tsx` | Remove "Preview" h2 label |
| 1B | `src/components/FloatingToolbar.tsx` | Add viewport bounds clamping |
| 1C | `src/components/AnimatedPreview.tsx` | Stop loop after 2 cycles |
| 1D, 1E | `src/components/CommandPalette.tsx` | Add group property, fix types, fix table commands |
| 1F | `src/index.css` | Scope or remove global min-height/min-width rule |
| 1G | `src/components/StatisticsPanel.tsx` | Add interval for stale time refresh |
| 2A | `src/pages/Index.tsx` | Remove separate header, merge into DocumentHeader |
| 2A | `src/components/DocumentHeader.tsx` | Absorb logo, theme toggle, nav links |
| 2B | `src/components/StatisticsPanel.tsx` | Default collapsed, compact single-line |
| 3A | `src/components/OutlinePanel.tsx` | Support editor-only scroll-to-heading |
| 3B | `src/components/ViewModeSwitcher.tsx` | Add aria-current |
| 3C | `src/pages/Index.tsx` or `DocumentHeader.tsx` | Show ViewModeSwitcher on mobile |
| 4A | `src/pages/Index.tsx` | Remove Toolbar |
| 4B | `src/components/FloatingToolbar.tsx` | Add heading/list options |
| 4C | `src/components/Editor.tsx` | Remove CompactToolbar |

## Recommended Implementation Order

Phases 1 and 2 can be done first as they are independent quick wins. Phase 3 is small fixes. Phase 4 (toolbar consolidation) is a larger structural change that should be a separate iteration.

