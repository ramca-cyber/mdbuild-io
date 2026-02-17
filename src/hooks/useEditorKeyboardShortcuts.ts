import { useEffect } from 'react';
import { useEditorViewStore } from '@/store/editorViewStore';
import { useSearchStore } from '@/store/searchStore';

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
