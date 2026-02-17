import { useEffect, RefObject, useMemo } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorSelection } from '@codemirror/state';
import TurndownService from 'turndown';

/**
 * Handles pasting HTML content by converting it to Markdown using Turndown.
 * Falls back to plain text if conversion fails.
 */
export function useSmartPaste(
  editorRef: RefObject<HTMLDivElement>,
  viewRef: RefObject<EditorView | null>
) {
  const turndownService = useMemo(
    () => new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' }),
    []
  );

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!viewRef.current) return;

      const html = e.clipboardData?.getData('text/html');
      const text = e.clipboardData?.getData('text/plain');

      if (html && html.trim()) {
        e.preventDefault();

        try {
          const md = turndownService.turndown(html);
          const view = viewRef.current;
          const selection = view.state.selection.main;

          view.dispatch({
            changes: { from: selection.from, to: selection.to, insert: md },
            selection: EditorSelection.cursor(selection.from + md.length),
          });
        } catch {
          if (text) {
            const view = viewRef.current!;
            const selection = view.state.selection.main;

            view.dispatch({
              changes: { from: selection.from, to: selection.to, insert: text },
              selection: EditorSelection.cursor(selection.from + text.length),
            });
          }
        }
      }
    };

    const editorDom = editorRef.current?.querySelector('.cm-content');
    if (editorDom) {
      editorDom.addEventListener('paste', handlePaste as EventListener);
      return () => editorDom.removeEventListener('paste', handlePaste as EventListener);
    }
  }, [turndownService, editorRef, viewRef]);
}
