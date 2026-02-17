import { useEffect, RefObject } from 'react';
import { EditorView } from '@codemirror/view';
import { useEditorViewStore } from '@/store/editorViewStore';

/**
 * Manages bidirectional scroll synchronization between the editor and preview pane.
 * Uses RAF + interpolation for smooth scrolling. Also handles preview-click for cursor positioning.
 */
export function useScrollSync(
  syncScroll: boolean,
  editorRef: RefObject<HTMLDivElement>,
  viewRef: RefObject<EditorView | null>
) {
  // Listen for preview clicks to set cursor position
  useEffect(() => {
    const handlePreviewClick = (e: Event) => {
      const customEvent = e as CustomEvent;
      const line = customEvent.detail;

      if (viewRef.current && typeof line === 'number') {
        useEditorViewStore.getState().goToLine(line);
      }
    };

    window.addEventListener('preview-click', handlePreviewClick);
    return () => window.removeEventListener('preview-click', handlePreviewClick);
  }, [viewRef]);

  // Smooth scroll sync using RAF + interpolation
  useEffect(() => {
    if (!syncScroll || !editorRef.current) return;

    const setupScrollSync = () => {
      const editorScroll = editorRef.current?.querySelector('.cm-scroller') as HTMLElement | null;
      if (!editorScroll) {
        requestAnimationFrame(setupScrollSync);
        return;
      }

      let isSyncing = false;
      let rafId: number | null = null;
      let smoothRafId: number | null = null;
      let currentScrollTop = editorScroll.scrollTop;
      let targetScrollTop = editorScroll.scrollTop;

      const animateScroll = () => {
        const diff = Math.abs(targetScrollTop - currentScrollTop);

        if (diff < 0.5) {
          currentScrollTop = targetScrollTop;
          editorScroll.scrollTop = currentScrollTop;
          smoothRafId = null;
          requestAnimationFrame(() => {
            isSyncing = false;
          });
          return;
        }

        currentScrollTop += (targetScrollTop - currentScrollTop) * 0.15;
        editorScroll.scrollTop = currentScrollTop;

        smoothRafId = requestAnimationFrame(animateScroll);
      };

      const handleScroll = () => {
        if (!syncScroll || isSyncing) return;

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          currentScrollTop = editorScroll.scrollTop;
          targetScrollTop = editorScroll.scrollTop;

          const maxScroll = editorScroll.scrollHeight - editorScroll.clientHeight;
          const scrollPercentage = maxScroll > 0 ? editorScroll.scrollTop / maxScroll : 0;

          let topLine = 1;
          if (viewRef.current) {
            const view = viewRef.current;
            const rect = editorScroll.getBoundingClientRect();
            const pos = view.posAtCoords({ x: rect.left + 20, y: rect.top + 20 });
            if (pos != null) {
              try {
                topLine = view.state.doc.lineAt(pos).number;
              } catch {}
            }
          }

          window.dispatchEvent(
            new CustomEvent('editor-scroll', { detail: { ratio: scrollPercentage, line: topLine } })
          );
          rafId = null;
        });
      };

      const handlePreviewScroll = (e: Event) => {
        const customEvent = e as CustomEvent;
        const detail = customEvent.detail;

        isSyncing = true;
        if (rafId) cancelAnimationFrame(rafId);
        if (smoothRafId) cancelAnimationFrame(smoothRafId);

        rafId = requestAnimationFrame(() => {
          const maxScroll = editorScroll.scrollHeight - editorScroll.clientHeight;

          if (detail && typeof detail === 'object' && 'line' in detail && viewRef.current) {
            const view = viewRef.current;
            const doc = view.state.doc;
            const lineNum = Math.min(Math.max(1, detail.line as number), doc.lines);
            const pos = doc.line(lineNum).from;
            const coords = view.coordsAtPos(pos);
            const rect = editorScroll.getBoundingClientRect();
            if (coords) {
              const delta = coords.top - rect.top;
              targetScrollTop = editorScroll.scrollTop + delta;
              currentScrollTop = editorScroll.scrollTop;
              animateScroll();
            } else if (maxScroll > 0 && detail.ratio != null) {
              targetScrollTop = detail.ratio * maxScroll;
              currentScrollTop = editorScroll.scrollTop;
              animateScroll();
            }
          } else {
            const ratio = typeof detail === 'number' ? detail : detail?.ratio ?? 0;
            targetScrollTop = ratio * maxScroll;
            currentScrollTop = editorScroll.scrollTop;
            animateScroll();
          }

          rafId = null;
        });
      };

      editorScroll.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('preview-scroll', handlePreviewScroll);

      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        if (smoothRafId) cancelAnimationFrame(smoothRafId);
        editorScroll.removeEventListener('scroll', handleScroll);
        window.removeEventListener('preview-scroll', handlePreviewScroll);
      };
    };

    const cleanup = setupScrollSync();
    return () => {
      if (cleanup) cleanup();
    };
  }, [syncScroll, editorRef, viewRef]);
}
