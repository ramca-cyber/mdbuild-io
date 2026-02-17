import { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { useDocumentStore } from '@/store/documentStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useSearchStore } from '@/store/searchStore';
import { useSnippetsStore } from '@/store/snippetsStore';
import { useEditorViewStore } from '@/store/editorViewStore';
import { EditorView, keymap } from '@codemirror/view';
import { EditorSelection, Prec } from '@codemirror/state';
import { SearchReplace } from '@/components/SearchReplace';
import { debounce } from '@/lib/utils';

import { SlashCommandMenu } from '@/components/SlashCommandMenu';
import { CommandPalette } from '@/components/CommandPalette';
import { FloatingToolbar } from '@/components/FloatingToolbar';
import { LinkPreview } from '@/components/LinkPreview';
import { useTableKeymap } from '@/hooks/useTableKeymap';
import { useEditorKeyboardShortcuts } from '@/hooks/useEditorKeyboardShortcuts';
import { useScrollSync } from '@/hooks/useScrollSync';
import { useSmartPaste } from '@/hooks/useSmartPaste';
import { useCursorTracking } from '@/hooks/useCursorTracking';

export const Editor = () => {
  const { content, setContent } = useDocumentStore();
  const {
    theme,
    fontSize,
    lineNumbers,
    syncScroll,
    zoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    typewriterMode,
  } = useSettingsStore();
  const { searchResults, currentSearchIndex, setCursorPosition, setSelectedWords } = useSearchStore();
  const { getSnippetByTrigger } = useSnippetsStore();
  const { setView, setDebouncedSetContent } = useEditorViewStore();
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [slashMenuPosition, setSlashMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [slashMenuCursorPos, setSlashMenuCursorPos] = useState<number>(0);

  // --- Extracted hooks ---
  const tableKeymap = useTableKeymap();
  useEditorKeyboardShortcuts(zoomIn, zoomOut, resetZoom);
  useScrollSync(syncScroll, editorRef, viewRef);
  useSmartPaste(editorRef, viewRef);
  useCursorTracking(viewRef, setCursorPosition, setSelectedWords);

  // Slash command menu handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && viewRef.current) {
        const view = viewRef.current;
        const selection = view.state.selection.main;
        const line = view.state.doc.lineAt(selection.from);
        const textBeforeCursor = line.text.substring(0, selection.from - line.from);
        if (textBeforeCursor.trim() === '') {
          e.preventDefault();
          const coords = view.coordsAtPos(selection.from);
          if (coords) {
            setSlashMenuPosition({ x: coords.left, y: coords.bottom + 4 });
            setSlashMenuCursorPos(selection.from);
          }
        }
      }
    };
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, []);

  // Snippets system with Tab trigger
  const snippetKeymap = useMemo(() => {
    return Prec.highest(
      keymap.of([
        {
          key: 'Tab',
          run: (view) => {
            const selection = view.state.selection.main;
            const line = view.state.doc.lineAt(selection.from);
            const textBeforeCursor = line.text.substring(0, selection.from - line.from);
            const wordMatch = textBeforeCursor.match(/(\S+)$/);
            if (wordMatch) {
              const trigger = wordMatch[1];
              const snippet = getSnippetByTrigger(trigger);
              if (snippet) {
                let snippetContent = snippet.content;
                if (snippetContent.includes('${date}')) {
                  snippetContent = snippetContent.replace(/\$\{date\}/g, new Date().toLocaleDateString());
                }
                const from = selection.from - trigger.length;
                view.dispatch({
                  changes: { from, to: selection.from, insert: snippetContent },
                  selection: EditorSelection.cursor(from + snippetContent.length),
                });
                return true;
              }
            }
            return false;
          },
        },
      ])
    );
  }, [getSnippetByTrigger]);

  // Wrap selection with markdown syntax (used by syntax helpers)
  const wrapSelection = useCallback((before: string, after: string = '') => {
    if (!viewRef.current) return;
    const view = viewRef.current;
    const selection = view.state.selection.main;
    const selectedText = view.state.sliceDoc(selection.from, selection.to);
    if (selectedText) {
      const wrapped = before + selectedText + (after || before);
      view.dispatch({
        changes: { from: selection.from, to: selection.to, insert: wrapped },
        selection: EditorSelection.range(selection.from + before.length, selection.to + before.length),
      });
    }
  }, []);

  // Smart syntax helpers keymap (*, _, `)
  const syntaxHelpersKeymap = useMemo(() => {
    return keymap.of([
      {
        key: '*',
        run: (view) => {
          if (view.state.sliceDoc(view.state.selection.main.from, view.state.selection.main.to)) {
            wrapSelection('**', '**');
            return true;
          }
          return false;
        },
      },
      {
        key: '_',
        run: (view) => {
          if (view.state.sliceDoc(view.state.selection.main.from, view.state.selection.main.to)) {
            wrapSelection('_', '_');
            return true;
          }
          return false;
        },
      },
      {
        key: '`',
        run: (view) => {
          if (view.state.sliceDoc(view.state.selection.main.from, view.state.selection.main.to)) {
            wrapSelection('`', '`');
            return true;
          }
          return false;
        },
      },
    ]);
  }, [wrapSelection]);

  // Typewriter mode extension
  const typewriterExtension = useMemo(() => {
    if (!typewriterMode) return [];
    return [
      EditorView.updateListener.of((update) => {
        if (!update.selectionSet) return;
        const view = update.view;
        const coords = view.coordsAtPos(view.state.selection.main.head);
        if (coords) {
          const editorRect = view.dom.getBoundingClientRect();
          const scrollOffset = coords.top - editorRect.top - editorRect.height / 2;
          if (Math.abs(scrollOffset) > 10) {
            view.scrollDOM.scrollTop += scrollOffset;
          }
        }
      }),
    ];
  }, [typewriterMode]);

  const handleSlashCommand = (template: string) => {
    if (viewRef.current) {
      const view = viewRef.current;
      view.dispatch({
        changes: { from: slashMenuCursorPos, to: slashMenuCursorPos, insert: template },
        selection: EditorSelection.cursor(slashMenuCursorPos + template.length),
      });
      view.focus();
    }
    setSlashMenuPosition(null);
  };

  // Floating toolbar format handler
  const handleFloatingFormat = (before: string, after: string, placeholder: string) => {
    if (!viewRef.current) return;
    const view = viewRef.current;
    const selection = view.state.selection.main;
    const selectedText = view.state.sliceDoc(selection.from, selection.to);
    const textToInsert = selectedText || placeholder;
    const fullText = before + textToInsert + after;
    view.dispatch({
      changes: { from: selection.from, to: selection.to, insert: fullText },
      selection: EditorSelection.range(
        selection.from + before.length,
        selection.from + before.length + textToInsert.length
      ),
    });
    view.focus();
  };

  // Debounced content update
  const debouncedSetContent = useMemo(
    () => debounce((value: string) => setContent(value), 150),
    [setContent]
  );

  useEffect(() => {
    setDebouncedSetContent(debouncedSetContent);
    return () => setDebouncedSetContent(null);
  }, [debouncedSetContent, setDebouncedSetContent]);

  const onChange = useCallback(
    (value: string) => debouncedSetContent(value),
    [debouncedSetContent]
  );

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
    <>
      <CommandPalette />
      <SlashCommandMenu
        position={slashMenuPosition}
        onSelect={handleSlashCommand}
        onClose={() => setSlashMenuPosition(null)}
      />
      <FloatingToolbar onFormat={handleFloatingFormat} />
      <LinkPreview />

      <div
        ref={editorRef}
        className="h-full w-full overflow-hidden relative flex flex-col no-print bg-editor-bg"
      >
        <div className="flex-1 overflow-hidden relative">
          <SearchReplace />
          <CodeMirror
            value={content}
            height="100%"
            theme={theme === 'dark' ? oneDark : 'light'}
            extensions={[markdown(), snippetKeymap, syntaxHelpersKeymap, tableKeymap, ...typewriterExtension]}
            onChange={onChange}
            onCreateEditor={(view) => {
              viewRef.current = view;
              setView(view);
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
              rectangularSelection: true,
              crosshairCursor: true,
            }}
            style={{
              fontSize: `${fontSize}px`,
              height: '100%',
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top left',
              width: `${10000 / zoomLevel}%`,
            }}
            aria-label="Markdown editor text area"
          />
        </div>
      </div>
    </>
  );
};
