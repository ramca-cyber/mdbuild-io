import { useEffect, RefObject } from 'react';
import { EditorView } from '@codemirror/view';

/**
 * Tracks cursor position (line, column) and selected word count,
 * updating the search store for the statistics panel.
 */
export function useCursorTracking(
  viewRef: RefObject<EditorView | null>,
  setCursorPosition: (line: number, column: number) => void,
  setSelectedWords: (count: number) => void
) {
  useEffect(() => {
    let view: EditorView | null = null;
    let handlersAttached = false;

    const updateCursorInfo = () => {
      if (!view) return;

      const selection = view.state.selection.main;
      const doc = view.state.doc;

      const line = doc.lineAt(selection.head);
      const lineNum = line.number;
      const col = selection.head - line.from + 1;

      setCursorPosition(lineNum, col);

      if (selection.from !== selection.to) {
        const selectedText = doc.sliceString(selection.from, selection.to);
        const words = selectedText.trim().split(/\s+/).filter((w) => w.length > 0).length;
        setSelectedWords(words);
      } else {
        setSelectedWords(0);
      }
    };

    const handleSelectionChange = () => {
      requestAnimationFrame(updateCursorInfo);
    };

    const tryAttach = () => {
      if (handlersAttached) return;
      view = viewRef.current;
      if (!view) {
        requestAnimationFrame(tryAttach);
        return;
      }
      view.dom.addEventListener('click', updateCursorInfo);
      view.dom.addEventListener('keyup', updateCursorInfo);
      view.dom.addEventListener('focus', updateCursorInfo);
      view.dom.addEventListener('mouseup', updateCursorInfo);
      document.addEventListener('selectionchange', handleSelectionChange);
      handlersAttached = true;
      updateCursorInfo();
    };

    tryAttach();

    return () => {
      if (view) {
        view.dom.removeEventListener('click', updateCursorInfo);
        view.dom.removeEventListener('keyup', updateCursorInfo);
        view.dom.removeEventListener('focus', updateCursorInfo);
        view.dom.removeEventListener('mouseup', updateCursorInfo);
      }
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [viewRef, setCursorPosition, setSelectedWords]);
}
