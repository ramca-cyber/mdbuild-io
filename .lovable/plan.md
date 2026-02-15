

# UI/UX Issues and Confusions Found

## 1. Mobile Editor: Too Much Vertical Space Consumed by Chrome

On mobile (390px), the editor screen shows:
- Header bar (MDBuild.io + hamburger)
- Menu bar (File, Edit, Format, View, Snippets)
- "MARKDOWN EDITOR" label bar
- The actual editor (only ~5 lines visible)
- Resize handle
- "PREVIEW" label
- Preview content (cut off)
- Word/character count overlay
- Statistics bar (Ln, Col, Lines)
- Issues panel (expanded by default)

**Problem**: The user gets only ~120px of actual editor space. The issues panel is expanded by default and pushes content off-screen. Between the header, menu bar, toolbar label, stats bar, and issues panel, there's more UI chrome than content.

**Fix**:
- Collapse the issues/linter panel by default on mobile (in `StatisticsPanel.tsx` or wherever `statisticsExpanded` defaults)
- Consider hiding the "MARKDOWN EDITOR" / "PREVIEW" labels on mobile to save vertical space
- On mobile in split mode, give more default space to the editor panel (e.g., 65/35 instead of 50/50)

---

## 2. Landing Page Demo Section Overflows on Mobile

The "See It In Action" demo section (lines 137-156 in `Landing.tsx`) has a horizontal row of 4 steps: "Type Markdown -> Add Diagrams -> Math Equations -> Export PDF". These are laid out with `flex` and `gap-4` but have no wrapping -- they overflow horizontally on mobile screens, causing a broken layout.

**Fix**: Add `flex-wrap` to the container or reflow to a 2x2 grid on mobile. Use responsive classes like `flex-wrap` or `grid grid-cols-2 md:flex`.

---

## 3. `prompt()` / `window.prompt()` for Link and Image Insertion

Multiple places use `window.prompt()` to ask for URLs (link insertion in Toolbar, CompactToolbar, FloatingToolbar, and image insertion). This is:
- Jarring and ugly -- browser native prompts don't match the app's polished UI
- Blocks the main thread
- Doesn't work well on some mobile browsers
- Two sequential prompts for link insertion (URL then text) is especially confusing

**Fix**: Replace `prompt()` calls with inline dialog components (using the existing `Dialog` from radix) for link/image insertion. This is a larger change but significantly improves UX.

---

## 4. No Confirmation Before "New Document"

`handleNewDocument()` in `DocumentHeader.tsx` (line 150-153) immediately calls `createNewDocument()` without checking if there are unsaved changes. Users can accidentally lose their work with one click.

**Fix**: Add an `AlertDialog` confirmation when `hasUnsavedChanges` is true before creating a new document.

---

## 5. Landing Page: "Help" Link Hidden on Mobile

The landing page header (line 101) has `className="hidden sm:flex"` on the Help button, making it invisible on mobile. Users on phones have no way to access Help from the landing page.

**Fix**: Either show the Help link on mobile or add it to a mobile menu/dropdown.

---

## 6. Mobile Landing: No Navigation Menu

The mobile landing page header only shows the logo and "Start Writing" button. There's no hamburger menu or way to access About, Contact, Help, Privacy, or Terms pages from mobile. Users must scroll to the very bottom footer to find these links.

**Fix**: Add a simple hamburger menu to the landing page header on mobile with links to Help, About, Contact.

---

## 7. Editor View Mode Switcher Placement

On desktop, the view mode switcher (Edit/Split/Preview/Outline/Sync) is in the `DocumentHeader` bar alongside File/Edit/Format menus. This creates a very crowded toolbar. On mobile, these controls overflow.

**Fix**: This is minor but consider grouping the view controls more clearly or moving them to a dedicated row on mobile.

---

## Summary of Fixes

| Issue | Severity | Files to Change |
|-------|----------|-----------------|
| Mobile editor: too little content space, issues panel expanded | High | `src/store/settingsStore.ts`, `src/pages/Index.tsx` |
| Landing demo section overflow on mobile | High | `src/pages/Landing.tsx` |
| `prompt()` for link/image URLs | Medium | `src/components/Toolbar.tsx`, `CompactToolbar.tsx`, `FloatingToolbar.tsx` |
| No confirmation on New Document | Medium | `src/components/DocumentHeader.tsx` |
| Help link hidden on mobile landing | Low | `src/pages/Landing.tsx` |
| No mobile nav menu on landing page | Low | `src/pages/Landing.tsx` |
| View mode switcher crowding on mobile | Low | `src/components/ViewModeSwitcher.tsx` |

