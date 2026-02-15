

# Additional Issues Found

## 1. ReactMarkdown Memoization Bug -- Stale Renders

**File:** `src/components/Preview.tsx` (line 579)

The `markdownContent` memo depends only on `[content]`, but it uses `remarkPlugins` and `rehypePlugins` which are separate memos. If `documentSettings.syntaxHighlighting` changes, `rehypePlugins` updates but `markdownContent` does NOT re-render because `content` hasn't changed. The user toggles syntax highlighting and nothing happens until they type.

**Fix:** Add `remarkPlugins` and `rehypePlugins` to the dependency array:
```
[content, remarkPlugins, rehypePlugins]
```

---

## 2. Footnote Plugin Mutates AST During Traversal

**File:** `src/lib/remarkFootnotes.ts` (lines 23-25, 71-73)

The plugin uses `parent.children.splice(index, 1)` inside a `visit()` callback. Mutating the tree while `visit()` is iterating can skip nodes or cause index misalignment. For example, if two consecutive paragraphs are footnote definitions, the second one may be skipped.

**Fix:** Collect nodes to remove in a Set during traversal, then remove them in a separate pass after `visit()` completes. Same for the text node replacements in the second pass.

---

## 3. Outline Panel Uses Text Matching Instead of Heading IDs

**File:** `src/components/OutlinePanel.tsx` (lines 69-88)

`scrollToHeading()` finds headings by matching `el.textContent === text`. If two headings have the same text (e.g., two "## Examples" sections), it always scrolls to the first one. Now that headings have auto-generated `id` attributes (from the `rehypeHeadingIds` plugin), the outline should use those IDs with `getElementById()` or `querySelector('#slug')` for reliable navigation.

**Fix:** Generate the same slug in the outline panel that `rehypeHeadingIds` generates, and use `document.getElementById(slug)` to scroll to the correct heading.

---

## 4. Keyboard Shortcut Conflict -- Ctrl+S Registered Twice

**Files:** `src/components/Editor.tsx` (line 518) and `src/components/DocumentHeader.tsx` (line 93)

Both components register `Ctrl+S` handlers on the `window` keydown event. The Editor's handler calls `saveVersion()` (snapshot to version history), while DocumentHeader's calls `handleQuickSave()` (persist to localStorage). Both fire on every Ctrl+S press. The user expects "Save" but gets two different operations running simultaneously, with no guarantee of execution order.

**Fix:** Remove the duplicate. Keep only the DocumentHeader handler (which does the actual user-facing save). If version snapshots are desired on save, call `saveVersion()` inside `handleQuickSave()`.

---

## 5. Ctrl+A Hijacked Globally

**File:** `src/components/Editor.tsx` (lines 542-545)

The editor registers `Ctrl+A` on the `window`, which dispatches `editor-select-all`. This prevents `Ctrl+A` from working in any other input field on the page -- e.g., the search/replace input, the rename document input, the "Go to Line" dialog input. Users cannot select text in any non-editor input.

**Fix:** Only handle `Ctrl+A` when the editor itself has focus. Check `document.activeElement` is inside `.cm-editor` before preventing default.

---

## 6. Preview Duplicate Word Count Footer

**Files:** `src/components/Preview.tsx` (lines 724-733) and `src/components/StatisticsPanel.tsx`

The Preview component has its own "Words / Characters" footer bar at the bottom. The main StatisticsPanel (in the page footer) also shows word count, character count, and more. On desktop split view, users see two word counts -- one at the bottom of the preview pane and one at the bottom of the whole page. These show different numbers (preview shows "visible" words; footer shows total), which is confusing without clear labels.

**Fix:** Either remove the preview footer stats (they're redundant), or clearly label them as "Visible:" vs "Total:" so users understand the difference.

---

## Summary

| Issue | Severity | File(s) |
|-------|----------|---------|
| Stale markdownContent memo | High | Preview.tsx |
| Footnote AST mutation during visit | Medium | remarkFootnotes.ts |
| Outline uses text matching, not IDs | Medium | OutlinePanel.tsx |
| Ctrl+S registered twice | Medium | Editor.tsx, DocumentHeader.tsx |
| Ctrl+A hijacks all inputs | High | Editor.tsx |
| Duplicate/confusing word counts | Low | Preview.tsx |

