import { useCallback, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { useEditorStore } from '@/store/editorStore';
import { keymap } from '@codemirror/view';

export const Editor = () => {
  const { content, setContent, theme, fontSize, lineWrap, lineNumbers } = useEditorStore();

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

  return (
    <div className="h-full w-full overflow-hidden">
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
