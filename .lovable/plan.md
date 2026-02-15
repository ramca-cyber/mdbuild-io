

# Follow-Up Audit: Remaining Issues

The previous audit fixes are all correctly applied and working. Here are the remaining items that still need attention:

## 1. Contact Page FAQ -- Missing PNG Export

**File:** `src/pages/Contact.tsx` (line 118)

The backup FAQ answer says: *"You can export any document to Markdown, PDF, HTML, or DOCX format."* -- this omits PNG, which is a supported export format.

**Fix:** Change to *"You can export any document to Markdown, PDF, HTML, DOCX, or PNG format."*

---

## 2. Accessibility -- Feature Table Checkmarks

**File:** `src/pages/Landing.tsx` (multiple lines: 264, 281, 297, 313, 330, 346, 362, 378)

Each checkmark span (`<span>...</span>` with the checkmark character) lacks an `aria-label`. Screen readers won't clearly convey "Supported."

**Fix:** Add `aria-label="Supported"` to each checkmark `<span>` element.

---

## 3. Accessibility -- Global Min Touch Target on All Links

**File:** `src/index.css` (lines 176-182)

The rule applies `min-height: 2.5rem; min-width: 2.5rem;` to ALL `<a>` tags, including inline text links inside paragraphs. This can cause layout distortion in prose content.

**Fix:** Scope the `a` selector to only block-level/button links, not inline text links. For example, exclude links inside `.prose` containers or only target `a` elements that don't have inline ancestors. A practical approach: change `a` to `a:not(.prose a):not(p a)` or use a more specific selector.

Also remove the tablet override (lines 185-192) that adds extra padding to all links.

---

## 4. PWA Icon Configuration

**File:** `vite.config.ts` (lines 29-35)

Currently only one icon entry with `purpose: 'any maskable'` combined. Google recommends separate entries.

**Fix:** Split into two entries:
- `{ src: '/favicon.png', sizes: '512x512', type: 'image/png', purpose: 'any' }`
- `{ src: '/favicon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }`

Note: Ideally you'd also generate 192x192 and 384x384 icon sizes, but that requires creating new image assets which is out of scope here.

---

## 5. Landing Page -- "Fully Auditable Codebase" Claim

**File:** `src/pages/Landing.tsx` (line 579)

The IT administrator section claims "Fully auditable codebase" but there is no public GitHub repo link anywhere on the site.

**Fix:** Change to "Transparent codebase" or "Client-side only codebase" to avoid implying the source code is publicly available.

---

## Summary

| Item | File | Effort |
|------|------|--------|
| Contact FAQ missing PNG | Contact.tsx | Trivial |
| Checkmark aria-labels | Landing.tsx | Small |
| Global min-touch on links | index.css | Small |
| PWA icon split | vite.config.ts | Trivial |
| "Auditable codebase" wording | Landing.tsx | Trivial |

All fixes are minor and low-risk.

