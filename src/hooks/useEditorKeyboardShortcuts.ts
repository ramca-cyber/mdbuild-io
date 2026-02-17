import { useEffect } from 'react';
import { useEditorViewStore } from '@/store/editorViewStore';
import { useSearchStore } from '@/store/searchStore';
import { toast } from 'sonner';

/**
 * Registers global keyboard shortcuts for the editor.
 * Handles undo/redo, find/replace, go-to-line, zoom, line operations, and date insertion.
 */
export function useEditorKeyboardShortcuts(
  zoomIn: () => void,
  zoomOut: () => void,
  resetZoom: () => void
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useEditorViewStore.getState().undo();
      }

      if (modifier && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        useEditorViewStore.getState().redo();
      }

      if (modifier && e.key === 'y') {
        e.preventDefault();
        useEditorViewStore.getState().redo();
      }

      if (modifier && e.key === 'a') {
        const activeEl = document.activeElement;
        if (activeEl?.closest('.cm-editor')) {
          e.preventDefault();
          useEditorViewStore.getState().selectAll();
        }
      }

      if (modifier && e.key === 'f') {
        e.preventDefault();
        useSearchStore.getState().setShowSearchReplace(true);
      }

      if (modifier && e.key === 'g') {
        e.preventDefault();
        useEditorViewStore.getState().setShowGoToDialog(true);
      }

      if (modifier && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        zoomIn();
      }

      if (modifier && e.key === '-') {
        e.preventDefault();
        zoomOut();
      }

      if (modifier && e.key === '0') {
        e.preventDefault();
        resetZoom();
      }

      if (modifier && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        useEditorViewStore.getState().deleteLine();
      }

      if (modifier && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        useEditorViewStore.getState().duplicateLine();
      }

      if (modifier && e.key === 'l') {
        e.preventDefault();
        useEditorViewStore.getState().selectLine();
      }

      if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault();
        useEditorViewStore.getState().moveLineUp();
      }

      if (e.altKey && e.key === 'ArrowDown') {
        e.preventDefault();
        useEditorViewStore.getState().moveLineDown();
      }

      // Word count (Ctrl+Shift+W)
      if (modifier && e.shiftKey && e.key === 'W') {
        e.preventDefault();
        const content = useEditorViewStore.getState().view?.state.doc.toString() || '';
        const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
        const chars = content.length;
        const lines = content.split('\n').length;
        toast.success(`Words: ${words} | Characters: ${chars} | Lines: ${lines}`);
      }

      // Comment toggle (Ctrl+/)
      if (modifier && e.key === '/') {
        e.preventDefault();
        useEditorViewStore.getState().insert('wrap', { before: '<!-- ', after: ' -->' });
      }

      // Indent (Ctrl+])
      if (modifier && e.key === ']') {
        e.preventDefault();
        const view = useEditorViewStore.getState().view;
        if (view) {
          const sel = view.state.selection.main;
          const doc = view.state.doc;
          const fromLine = doc.lineAt(sel.from).number;
          const toLine = doc.lineAt(sel.to).number;
          const changes: { from: number; insert: string }[] = [];
          for (let i = fromLine; i <= toLine; i++) {
            changes.push({ from: doc.line(i).from, insert: '  ' });
          }
          view.dispatch({ changes });
        }
      }

      // Outdent (Ctrl+[)
      if (modifier && e.key === '[') {
        e.preventDefault();
        const view = useEditorViewStore.getState().view;
        if (view) {
          const sel = view.state.selection.main;
          const doc = view.state.doc;
          const fromLine = doc.lineAt(sel.from).number;
          const toLine = doc.lineAt(sel.to).number;
          const changes: { from: number; to: number }[] = [];
          for (let i = fromLine; i <= toLine; i++) {
            const line = doc.line(i);
            if (line.text.startsWith('  ')) {
              changes.push({ from: line.from, to: line.from + 2 });
            } else if (line.text.startsWith('\t')) {
              changes.push({ from: line.from, to: line.from + 1 });
            }
          }
          if (changes.length) view.dispatch({ changes });
        }
      }

      if (e.altKey && e.key === 'd') {
        e.preventDefault();
        const now = new Date();
        const formatted = now.toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        useEditorViewStore.getState().insert('wrap', { before: formatted, after: '', placeholder: '' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, resetZoom]);
}
