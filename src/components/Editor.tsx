import { useCallback, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { useEditorStore } from '@/store/editorStore';
import { EditorView } from '@codemirror/view';
import { SearchReplace } from '@/components/SearchReplace';

export const Editor = () => {
  const { content, setContent, theme, fontSize, lineWrap, lineNumbers, syncScroll, searchResults, currentSearchIndex } = useEditorStore();
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === 's') {
        e.preventDefault();
        // Trigger save
        useEditorStore.getState().saveVersion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const onChange = useCallback(
    (value: string) => {
      setContent(value);
    },
    [setContent]
  );

  // Listen for preview clicks to set cursor position
  useEffect(() => {
    const handlePreviewClick = (e: Event) => {
      const customEvent = e as CustomEvent;
      const line = customEvent.detail;
      
      if (viewRef.current && typeof line === 'number') {
        const view = viewRef.current;
        const doc = view.state.doc;
        const lineCount = doc.lines;
        
        // Ensure line is within bounds
        const targetLine = Math.min(Math.max(1, line), lineCount);
        const pos = doc.line(targetLine).from;
        
        view.dispatch({
          selection: { anchor: pos },
          scrollIntoView: true,
        });
        view.focus();
      }
    };

    window.addEventListener('preview-click', handlePreviewClick);
    return () => window.removeEventListener('preview-click', handlePreviewClick);
  }, []);

  // Robust scroll sync using RAF + lock to prevent feedback loops
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

      const handleScroll = () => {
        if (!syncScroll || isSyncing) return;

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const maxScroll = editorScroll.scrollHeight - editorScroll.clientHeight;
          if (maxScroll > 0) {
            const scrollPercentage = editorScroll.scrollTop / maxScroll;
            window.dispatchEvent(new CustomEvent('editor-scroll', { detail: scrollPercentage }));
          }
          rafId = null;
        });
      };

      const handlePreviewScroll = (e: Event) => {
        const customEvent = e as CustomEvent;
        const scrollPercentage = customEvent.detail;

        isSyncing = true;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const maxScroll = editorScroll.scrollHeight - editorScroll.clientHeight;
          editorScroll.scrollTop = scrollPercentage * maxScroll;

          // Release the lock on the next frame (after the scroll event fires)
          requestAnimationFrame(() => {
            isSyncing = false;
          });
          rafId = null;
        });
      };

      editorScroll.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('preview-scroll', handlePreviewScroll);

      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        editorScroll.removeEventListener('scroll', handleScroll);
        window.removeEventListener('preview-scroll', handlePreviewScroll);
      };
    };

    const cleanup = setupScrollSync();
    return () => {
      if (cleanup) cleanup();
    };
  }, [syncScroll]);

  // Scroll to current search result
  useEffect(() => {
    if (searchResults.length > 0 && viewRef.current) {
      const result = searchResults[currentSearchIndex];
      const view = viewRef.current;
      const doc = view.state.doc;
      const line = doc.line(result.line);
      const pos = line.from + result.column;
      
      view.dispatch({
        selection: { anchor: pos, head: pos + result.length },
        scrollIntoView: true,
      });
      view.focus();
    }
  }, [currentSearchIndex, searchResults]);


  return (
    <div 
      ref={editorRef} 
      className="h-full w-full overflow-hidden relative flex flex-col no-print bg-editor-bg"
    >
      <div className="px-4 py-3 bg-muted/50 border-b-2 border-border/80 flex-shrink-0 shadow-sm">
        <h2 className="text-sm font-bold text-foreground/70 uppercase tracking-wider" role="heading" aria-level={2}>
          Markdown Editor
        </h2>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <SearchReplace />
        <CodeMirror
          value={content}
          height="100%"
          theme={theme === 'dark' ? oneDark : 'light'}
          extensions={[markdown()]}
          onChange={onChange}
          onCreateEditor={(view) => {
            viewRef.current = view;
          }}
          className="h-full text-base"
          basicSetup={{
            lineNumbers: lineNumbers,
            highlightActiveLineGutter: true,
            highlightActiveLine: true,
            foldGutter: true,
            dropCursor: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightSelectionMatches: true,
          }}
          style={{
            fontSize: `${fontSize}px`,
            height: '100%',
          }}
          aria-label="Markdown editor text area"
        />
      </div>
    </div>
  );
};
