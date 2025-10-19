import { useCallback, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { useEditorStore } from '@/store/editorStore';
import { keymap } from '@codemirror/view';

export const Editor = () => {
  const { content, setContent, theme, fontSize, lineWrap, lineNumbers, syncScroll } = useEditorStore();
  const editorRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!syncScroll || !editorRef.current) return;

    const editorScroll = editorRef.current.querySelector('.cm-scroller');
    if (!editorScroll) return;

    const handleScroll = () => {
      const scrollPercentage = editorScroll.scrollTop / (editorScroll.scrollHeight - editorScroll.clientHeight);
      window.dispatchEvent(new CustomEvent('editor-scroll', { detail: scrollPercentage }));
    };

    editorScroll.addEventListener('scroll', handleScroll);
    return () => editorScroll.removeEventListener('scroll', handleScroll);
  }, [syncScroll]);

  return (
    <div ref={editorRef} className="h-full w-full overflow-hidden">
      <CodeMirror
        value={content}
        height="100%"
        theme={theme === 'dark' ? oneDark : 'light'}
        extensions={[markdown()]}
        onChange={onChange}
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
