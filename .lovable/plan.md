

# MDBuild.io -- End-to-End Website Audit

## 1. SEO and Metadata

### Issues Found
- **Outdated sitemap dates**: All `<lastmod>` entries in `sitemap.xml` are from January 2025 (over a year old). Search engines may deprioritize stale sitemaps.
- **Duplicate structured data**: `index.html` has a hardcoded JSON-LD WebApplication schema, and `Landing.tsx` injects a near-identical one via `<SEO>`. This produces duplicate structured data on the landing page.
- **Stale article dates**: Help and About pages have `dateModified: "2025-01-20"` hardcoded -- over a year old. Google uses these for freshness signals.
- **Missing `landing` route in sitemap**: The `/landing` route exists but is not listed in the sitemap.
- **404 page sets canonical URL to the broken path** (e.g., `https://mdbuild.io/foobar`), which could confuse crawlers. 404 pages should either have no canonical or point to the homepage.
- **Privacy/Terms "Last updated" uses `new Date().toLocaleDateString()`**: This dynamically shows today's date, which is misleading -- it implies the policy was updated today every day the user visits.

### Recommendations
- Update sitemap `<lastmod>` dates to reflect actual content changes.
- Remove the hardcoded JSON-LD from `index.html` since `Landing.tsx` already provides it via `<SEO>`.
- Update `dateModified` in article schemas to current dates or make them dynamic based on actual last-edit.
- Add `/landing` to `sitemap.xml` or redirect `/landing` to `/`.
- Remove `canonicalUrl` from the 404 page or set it to `https://mdbuild.io/`.
- Replace `new Date().toLocaleDateString()` in Privacy/Terms with a static "Last updated" date.

---

## 2. Performance

### Issues Found
- **Render-blocking external CSS**: `index.html` loads KaTeX CSS and two Highlight.js stylesheets synchronously. These block first paint for all pages, including the landing page that never uses them.
- **Cache-busting on editor preview image**: `src={`/editor-preview.png?v=${Date.now()}`}` generates a unique URL on every render, defeating CDN/browser caching and forcing a re-download every time.
- **Large bundle**: 76+ npm dependencies -- many heavy libraries (mermaid, jspdf, docx, mammoth, katex, codemirror, html2canvas, etc.) are likely bundled together. No evidence of code splitting or lazy loading for heavy features.
- **No `React.lazy` usage**: All page components are eagerly imported in `App.tsx`.

### Recommendations
- Defer KaTeX and Highlight.js CSS to only load on the `/editor` route (or load them dynamically).
- Remove `?v=${Date.now()}` from the editor preview image or use a content hash instead.
- Add route-based code splitting with `React.lazy` and `Suspense` for all page routes.
- Consider dynamic imports for heavy libraries (mermaid, jspdf, docx, mammoth) so they only load when the user triggers export or uses diagrams.

---

## 3. Accessibility

### Issues Found
- **Feature table on landing page lacks proper semantics**: The comparison table uses `<table>` correctly but the status column uses emoji checkmarks (`✓`) inside styled spans -- screen readers may not convey "supported" clearly.
- **Sepia theme alert colors**: GitHub alert styles (`.markdown-alert-note`, etc.) reference `dark:` variants but no `.sepia` variants, meaning alerts in sepia mode use light-mode colors which may have contrast issues.
- **Min touch target CSS override**: The global rule `button, a, [role="button"] { min-height: 2.5rem; min-width: 2.5rem; }` applies to ALL links including inline text links, which can cause layout issues.
- **Mobile menu hamburger has no accessible label**: The `<Menu>` icon button only has an icon -- there is no `aria-label`.

### Recommendations
- Add `aria-label="Supported"` to the status checkmark spans in the feature table.
- Add `.sepia` variants for GitHub alert styles.
- Scope the min touch target CSS to interactive buttons only, not inline `<a>` tags.
- Add `aria-label="Open menu"` to the mobile hamburger button.

---

## 4. UX and Functionality

### Issues Found
- **System theme overrides user preference**: The `useEffect` in `Index.tsx` runs `setTheme(mediaQuery.matches ? 'dark' : 'light')` on every mount, overriding any previously saved user theme choice (including sepia). This means if a user selects "sepia", it gets reset on page reload.
- **Landing page redirect logic**: First-time visitors see the landing page, but `showLanding` is based on `localStorage.getItem('mdbuild-firstVisit')`. If a user clears localStorage (which also stores documents), they lose all data AND get redirected back to the landing page.
- **Storage calculation checks wrong key**: `storageUtils.ts` checks `localStorage.getItem('mdbuild-storage')`, but actual document data is stored under `document-storage`. The storage usage calculation will always return ~0 bytes.
- **No confirmation before "New Document"**: `createNewDocument()` replaces content with default content and clears versions without asking for confirmation, potentially losing unsaved work.
- **"Copy Rich Text" footnote inlining may fail**: The `prepareHtmlForRichTextCopy` function looks for `anchor.getAttribute('data-footnote-id')` which may not exist in the rendered HTML (depends on the remark-footnotes plugin output). Falls back to `anchor.textContent` which may not match footnote IDs.

### Recommendations
- Remove or guard the system theme sync in `Index.tsx` -- only apply on first visit, respect persisted preference thereafter.
- Decouple the "first visit" flag from document storage, or warn users before clearing.
- Fix `storageUtils.ts` to check the correct localStorage key(s): `document-storage`, `settings-storage`, etc.
- Add an unsaved changes confirmation before creating a new document.
- Test and fix the footnote ID matching in `prepareHtmlForRichTextCopy`.

---

## 5. Code Quality and Architecture

### Issues Found
- **Legacy compatibility layer**: `editorStore.ts` re-exports from 4 separate stores and creates a combined hook, but many components still import from individual stores directly. The combined hook merges unrelated state, causing unnecessary re-renders.
- **Direct DOM manipulation in Preview.tsx**: Copy buttons, language badges, and scroll sync use extensive `querySelector`/`appendChild` DOM manipulation rather than React patterns.
- **No `StrictMode`**: `main.tsx` renders `<App />` without `React.StrictMode`, missing potential development-time warnings.
- **Unused imports**: Several pages import icons that aren't used (e.g., `Zap as ZapIcon` in Help.tsx).

### Recommendations
- Remove the legacy `editorStore.ts` combined hook or mark it deprecated.
- Consider migrating Preview.tsx DOM manipulation to React refs and state.
- Add `React.StrictMode` wrapper in `main.tsx`.
- Clean up unused imports across pages.

---

## 6. Security

### Issues Found
- **`rehype-raw` enabled**: The Preview component uses `rehype-raw` which allows arbitrary HTML in markdown. Combined with user-generated content, this could enable XSS if content is ever shared between users.
- **No CSP meta tag**: No Content Security Policy is defined in `index.html`, relying on server-side headers (which may not be configured on the Lovable hosting).
- **security.txt expires Dec 2026**: Still valid, but should be monitored.

### Recommendations
- Since this is a single-user local app, `rehype-raw` risk is low, but document the intentional choice.
- Add a CSP `<meta>` tag in `index.html` restricting script/style sources.
- Set a calendar reminder to update `security.txt` before expiration.

---

## 7. PWA and Offline

### Issues Found
- **Service worker registration path**: `main.tsx` registers `/sw.js` manually, but `vite-plugin-pwa` generates its own service worker. These may conflict.
- **Only one icon size**: The PWA manifest only has a single 512x512 icon with `purpose: 'any maskable'`. Google recommends separate icons for `any` and `maskable`, plus smaller sizes (192x192, 384x384).
- **No offline fallback page**: If a user navigates to a non-cached route while offline, they get a browser error instead of a friendly offline page.

### Recommendations
- Remove the manual SW registration in `main.tsx` and let `vite-plugin-pwa` handle it.
- Add multiple icon sizes and separate `any` and `maskable` icons.
- Configure an offline fallback page in the PWA workbox config.

---

## 8. Content and Copy

### Issues Found
- **Footer says "2025"**: `Footer.tsx` has `(c) 2025 MDBuild.io` -- should be updated to 2026 or made dynamic.
- **About page says "Open source & auditable"** but no GitHub repo link is provided anywhere.
- **"4MB Storage" on landing page** but `storageUtils.ts` defines `STORAGE_LIMIT = 5MB`.
- **Terms of Service mentions "Export to PDF, HTML, DOCX, Markdown"** but omits PNG export.

### Recommendations
- Update copyright year to dynamic: `(c) ${new Date().getFullYear()}`.
- Either provide the GitHub repo link or remove "open source" claims.
- Align the "4MB" on the landing page with the actual 5MB limit.
- Update Terms of Service export list to include PNG.

---

## Summary of Priority Fixes

| Priority | Issue | Impact |
|----------|-------|--------|
| High | System theme overrides user preference on every reload | Users lose theme selection |
| High | Storage utility checks wrong localStorage key | Storage warnings never trigger |
| High | Cache-busting `Date.now()` on editor preview image | Poor performance, no caching |
| High | No code splitting -- everything loads upfront | Slow initial page load |
| Medium | Outdated sitemap and article dates | SEO freshness signals |
| Medium | Duplicate JSON-LD structured data | SEO confusion |
| Medium | Privacy/Terms "Last updated" shows today's date | Misleading legal documents |
| Medium | Footer copyright year is 2025 | Outdated appearance |
| Medium | PWA icon configuration issues | Install experience |
| Low | Unused imports and legacy store | Code cleanliness |
| Low | Missing CSP meta tag | Security hardening |
| Low | "4MB" vs "5MB" inconsistency | Minor copy error |

---

## Technical Implementation Notes

The fixes above span across these files:
- `index.html` -- Remove duplicate JSON-LD, add CSP meta tag, defer external CSS
- `src/main.tsx` -- Remove manual SW registration, add StrictMode
- `src/App.tsx` -- Add React.lazy code splitting for all routes
- `src/pages/Index.tsx` -- Fix theme sync to respect saved preference
- `src/pages/Landing.tsx` -- Fix cache-busting image URL
- `src/pages/PrivacyPolicy.tsx` and `TermsOfService.tsx` -- Static "last updated" date
- `src/pages/NotFound.tsx` -- Remove or fix canonical URL
- `src/components/Footer.tsx` -- Dynamic copyright year
- `src/lib/storageUtils.ts` -- Fix localStorage key
- `public/sitemap.xml` -- Update dates, add missing routes
- `vite.config.ts` -- PWA icon configuration
- Various pages -- Clean up unused imports

