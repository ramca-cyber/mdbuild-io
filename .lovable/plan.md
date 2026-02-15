

# Fix: Heading Anchor Links and Link Preview

## Problem

1. **Same-page heading links don't work**: Writing `[Jump to section](#my-section)` does nothing because headings like `## My Section` render without an `id` attribute. There's no `id="my-section"` on the `<h2>`, so the browser has nowhere to scroll.

2. **Link hover preview only shows the first link per line**: The `LinkPreview` component uses `match()` (finds first only) instead of scanning for all links, so hovering over a second link on the same line shows the wrong URL.

## Solution

### 1. Auto-generate heading IDs (custom rehype plugin)

Create a small rehype plugin (`src/lib/rehypeHeadingIds.ts`) that:
- Visits all heading elements (h1-h6)
- Extracts the text content
- Converts it to a URL-friendly slug (lowercase, spaces to hyphens, strip special chars)
- Sets it as the `id` attribute on the heading

This means `## My Section` renders as `<h2 id="my-section">My Section</h2>`, and `[link](#my-section)` scrolls to it.

### 2. Add the plugin to Preview.tsx

Add `rehypeHeadingIds` to the `rehypePlugins` array alongside the existing plugins.

### 3. Fix LinkPreview to handle multiple links per line

Update `LinkPreview.tsx` to find the closest link match to the cursor position rather than always returning the first link on the line.

## Files to Change

| File | Change |
|------|--------|
| `src/lib/rehypeHeadingIds.ts` | **New file** -- ~25 lines, custom rehype plugin to slugify heading text into `id` attributes |
| `src/components/Preview.tsx` | Import and add `rehypeHeadingIds` to the `rehypePlugins` array (2 lines changed) |
| `src/components/LinkPreview.tsx` | Use `matchAll()` instead of `match()` and pick the link closest to cursor position |

## Technical Details

The heading slug algorithm will:
- Extract all text content from heading children (handles nested bold/italic/code)
- Convert to lowercase
- Replace spaces with hyphens
- Remove non-alphanumeric characters (except hyphens)
- Collapse consecutive hyphens
- Handle duplicates by appending `-1`, `-2`, etc.

This matches the behavior of GitHub's heading anchors, so users familiar with GitHub markdown will get expected results.

