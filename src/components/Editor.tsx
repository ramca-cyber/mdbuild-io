import { useCallback, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { useEditorStore } from '@/store/editorStore';
import { EditorView } from '@codemirror/view';

export const Editor = () => {
  const { content, setContent, theme, fontSize, lineWrap, lineNumbers, syncScroll } = useEditorStore();
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

  // Dispatch editor scroll events
  useEffect(() => {
    if (!syncScroll || !editorRef.current) return;

    // Wait for CodeMirror to fully render
    const setupScrollSync = () => {
      const editorScroll = editorRef.current?.querySelector('.cm-scroller');
      if (!editorScroll) {
        // Retry if not ready
        requestAnimationFrame(setupScrollSync);
        return;
      }

      let isScrolling = false;
      let scrollTimeout: NodeJS.Timeout;

      const handleScroll = () => {
        if (isScrolling) return;
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          const maxScroll = editorScroll.scrollHeight - editorScroll.clientHeight;
          if (maxScroll > 0) {
            const scrollPercentage = editorScroll.scrollTop / maxScroll;
            window.dispatchEvent(new CustomEvent('editor-scroll', { detail: scrollPercentage }));
          }
        }, 10);
      };

      const handlePreviewScroll = (e: Event) => {
        if (isScrolling) return;
        
        const customEvent = e as CustomEvent;
        const scrollPercentage = customEvent.detail;
        isScrolling = true;
        const maxScroll = editorScroll.scrollHeight - editorScroll.clientHeight;
        editorScroll.scrollTop = scrollPercentage * maxScroll;
        setTimeout(() => {
          isScrolling = false;
        }, 50);
      };

      editorScroll.addEventListener('scroll', handleScroll);
      window.addEventListener('preview-scroll', handlePreviewScroll);
      
      // Cleanup function
      return () => {
        clearTimeout(scrollTimeout);
        editorScroll.removeEventListener('scroll', handleScroll);
        window.removeEventListener('preview-scroll', handlePreviewScroll);
      };
    };

    const cleanup = setupScrollSync();
    return () => {
      if (cleanup) cleanup();
    };
  }, [syncScroll]);

  return (
    <div ref={editorRef} className="h-full w-full overflow-hidden">
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
      />
    </div>
  );
};
