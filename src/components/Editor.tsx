import { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { useDocumentStore } from '@/store/documentStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useSearchStore } from '@/store/searchStore';
import { useSnippetsStore } from '@/store/snippetsStore';
import { useEditorViewStore } from '@/store/editorViewStore';
import { EditorView, ViewUpdate, keymap } from '@codemirror/view';
import { EditorSelection, Prec } from '@codemirror/state';
import { SearchReplace } from '@/components/SearchReplace';
import { debounce } from '@/lib/utils';
import { CompactToolbar } from '@/components/CompactToolbar';
import { SlashCommandMenu } from '@/components/SlashCommandMenu';
import { CommandPalette } from '@/components/CommandPalette';
import { FloatingToolbar } from '@/components/FloatingToolbar';
import { LinkPreview } from '@/components/LinkPreview';
import { 
  isInTable, 
  findTableAtCursor, 
  findCellAtCursor, 
  getNextCell, 
  getPreviousCell,
  addRowBelow,
  addRowAbove,
  addColumnAfter,
  toggleColumnAlignment,
  deleteRow
} from '@/lib/tableUtils';
import { toast } from 'sonner';
import TurndownService from 'turndown';

export const Editor = () => {
  const { content, setContent } = useDocumentStore();
  const { 
    theme, 
    fontSize, 
    lineWrap, 
    lineNumbers, 
    syncScroll,
    zoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    typewriterMode
  } = useSettingsStore();
  const {
    searchResults, 
    currentSearchIndex,
    setCursorPosition,
    setSelectedWords,
  } = useSearchStore();
  const { getSnippetByTrigger } = useSnippetsStore();
  const { setView, setDebouncedSetContent, setShowGoToDialog, insert } = useEditorViewStore();
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [slashMenuPosition, setSlashMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [slashMenuCursorPos, setSlashMenuCursorPos] = useState<number>(0);
  const turndownService = useMemo(() => new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' }), []);

  // Slash command menu handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && viewRef.current) {
        const view = viewRef.current;
        const selection = view.state.selection.main;
        const line = view.state.doc.lineAt(selection.from);
        
        // Only trigger if at start of line or after whitespace
        const textBeforeCursor = line.text.substring(0, selection.from - line.from);
        if (textBeforeCursor.trim() === '') {
          e.preventDefault();
          
          // Get cursor position on screen
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
            
            // Extract the word before cursor
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

  // Wrap selection with markdown syntax
  const wrapSelection = useCallback((before: string, after: string = '') => {
    if (!viewRef.current) return;
    
    const view = viewRef.current;
    const selection = view.state.selection.main;
    const selectedText = view.state.sliceDoc(selection.from, selection.to);
    
    if (selectedText) {
      const wrapped = before + selectedText + (after || before);
      view.dispatch({
        changes: { from: selection.from, to: selection.to, insert: wrapped },
        selection: EditorSelection.range(
          selection.from + before.length,
          selection.to + before.length
        ),
      });
    }
  }, []);

  // Smart syntax helpers keymap
  const syntaxHelpersKeymap = useMemo(() => {
    return keymap.of([
      {
        key: '*',
        run: (view) => {
          const selection = view.state.selection.main;
          const selectedText = view.state.sliceDoc(selection.from, selection.to);
          if (selectedText) {
            wrapSelection('**', '**');
            return true;
          }
          return false;
        },
      },
      {
        key: '_',
        run: (view) => {
          const selection = view.state.selection.main;
          const selectedText = view.state.sliceDoc(selection.from, selection.to);
          if (selectedText) {
            wrapSelection('_', '_');
            return true;
          }
          return false;
        },
      },
      {
        key: '`',
        run: (view) => {
          const selection = view.state.selection.main;
          const selectedText = view.state.sliceDoc(selection.from, selection.to);
          if (selectedText) {
            wrapSelection('`', '`');
            return true;
          }
          return false;
        },
      },
    ]);
  }, [wrapSelection]);

  // Typewriter mode - keep cursor centered via EditorView.updateListener
  const typewriterExtension = useMemo(() => {
    if (!typewriterMode) return [];
    return [
      EditorView.updateListener.of((update) => {
        if (!update.selectionSet) return;
        const view = update.view;
        const selection = view.state.selection.main;
        const coords = view.coordsAtPos(selection.head);
        
        if (coords) {
          const editorRect = view.dom.getBoundingClientRect();
          const targetY = editorRect.height / 2;
          const currentY = coords.top - editorRect.top;
          const scrollOffset = currentY - targetY;
          
          if (Math.abs(scrollOffset) > 10) {
            view.scrollDOM.scrollTop += scrollOffset;
          }
        }
      }),
    ];
  }, [typewriterMode]);

  // Table navigation and editing keymap
  const tableKeymap = useMemo(() => {
    return Prec.high(
      keymap.of([
        {
          key: 'Tab',
          run: (view) => {
            const selection = view.state.selection.main;
            const text = view.state.doc.toString();
            if (!isInTable(text, selection.from)) return false;
            const table = findTableAtCursor(text, selection.from);
            if (!table) return false;
            const cell = findCellAtCursor(table, selection.from);
            if (!cell) return false;
            const nextCell = getNextCell(table, cell.row, cell.col);
            if (nextCell) {
              view.dispatch({
                selection: EditorSelection.cursor(nextCell.pos),
                scrollIntoView: true,
              });
              return true;
            }
            return false;
          },
        },
        {
          key: 'Shift-Tab',
          run: (view) => {
            const selection = view.state.selection.main;
            const text = view.state.doc.toString();
            if (!isInTable(text, selection.from)) return false;
            const table = findTableAtCursor(text, selection.from);
            if (!table) return false;
            const cell = findCellAtCursor(table, selection.from);
            if (!cell) return false;
            const prevCell = getPreviousCell(table, cell.row, cell.col);
            if (prevCell) {
              view.dispatch({
                selection: EditorSelection.cursor(prevCell.pos),
                scrollIntoView: true,
              });
              return true;
            }
            return false;
          },
        },
        {
          key: 'Ctrl-Shift-Enter',
          run: (view) => {
            const selection = view.state.selection.main;
            const text = view.state.doc.toString();
            if (!isInTable(text, selection.from)) return false;
            const table = findTableAtCursor(text, selection.from);
            if (!table) return false;
            const cell = findCellAtCursor(table, selection.from);
            if (!cell) return false;
            const result = addRowBelow(text, table, cell.row);
            view.dispatch({
              changes: { from: 0, to: text.length, insert: result.text },
              selection: EditorSelection.cursor(result.cursorPos),
              scrollIntoView: true,
            });
            toast.success('Row added below');
            return true;
          },
        },
        {
          key: 'Ctrl-Shift-Alt-Enter',
          run: (view) => {
            const selection = view.state.selection.main;
            const text = view.state.doc.toString();
            if (!isInTable(text, selection.from)) return false;
            const table = findTableAtCursor(text, selection.from);
            if (!table) return false;
            const cell = findCellAtCursor(table, selection.from);
            if (!cell) return false;
            const result = addRowAbove(text, table, cell.row);
            view.dispatch({
              changes: { from: 0, to: text.length, insert: result.text },
              selection: EditorSelection.cursor(result.cursorPos),
              scrollIntoView: true,
            });
            toast.success('Row added above');
            return true;
          },
        },
        {
          key: 'Ctrl-Shift-\\',
          run: (view) => {
            const selection = view.state.selection.main;
            const text = view.state.doc.toString();
            if (!isInTable(text, selection.from)) return false;
            const table = findTableAtCursor(text, selection.from);
            if (!table) return false;
            const cell = findCellAtCursor(table, selection.from);
            if (!cell) return false;
            const result = addColumnAfter(text, table, cell.col);
            view.dispatch({
              changes: { from: 0, to: text.length, insert: result.text },
              selection: EditorSelection.cursor(result.cursorPos),
              scrollIntoView: true,
            });
            toast.success('Column added');
            return true;
          },
        },
        {
          key: 'Ctrl-Shift-A',
          run: (view) => {
            const selection = view.state.selection.main;
            const text = view.state.doc.toString();
            if (!isInTable(text, selection.from)) return false;
            const table = findTableAtCursor(text, selection.from);
            if (!table) return false;
            const cell = findCellAtCursor(table, selection.from);
            if (!cell) return false;
            const result = toggleColumnAlignment(text, table, cell.col);
            view.dispatch({
              changes: { from: 0, to: text.length, insert: result.text },
              selection: EditorSelection.cursor(selection.from),
            });
            toast.success('Column alignment toggled');
            return true;
          },
        },
        {
          key: 'Ctrl-Shift-Backspace',
          run: (view) => {
            const selection = view.state.selection.main;
            const text = view.state.doc.toString();
            if (!isInTable(text, selection.from)) return false;
            const table = findTableAtCursor(text, selection.from);
            if (!table) return false;
            const cell = findCellAtCursor(table, selection.from);
            if (!cell) return false;
            if (table.rows.length <= 2) {
              toast.error('Cannot delete row - table must have at least 2 rows');
              return true;
            }
            const result = deleteRow(text, table, cell.row);
            view.dispatch({
              changes: { from: 0, to: text.length, insert: result.text },
              selection: EditorSelection.cursor(result.cursorPos),
              scrollIntoView: true,
            });
            toast.success('Row deleted');
            return true;
          },
        },
      ])
    );
  }, []);

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

  // Smart paste handler - converts rich text to markdown
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
        } catch (error) {
          if (text) {
            const view = viewRef.current;
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
  }, [turndownService]);

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

  // Keyboard shortcuts - now calls store methods directly
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

  // Debounced content update for better performance
  const debouncedSetContent = useMemo(
    () => debounce((value: string) => {
      setContent(value);
    }, 150),
    [setContent]
  );

  // Register debouncedSetContent in store for flush support
  useEffect(() => {
    setDebouncedSetContent(debouncedSetContent);
    return () => setDebouncedSetContent(null);
  }, [debouncedSetContent, setDebouncedSetContent]);

  const onChange = useCallback(
    (value: string) => {
      debouncedSetContent(value);
    },
    [debouncedSetContent]
  );
  
  // Track cursor position and selection
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
        const words = selectedText.trim().split(/\s+/).filter(w => w.length > 0).length;
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
  }, [setCursorPosition, setSelectedWords]);

  // Listen for preview clicks to set cursor position (kept as window event - scroll sync)
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
  }, []);

  // Smooth scroll sync using RAF + interpolation (kept as window events)
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

          window.dispatchEvent(new CustomEvent('editor-scroll', { detail: { ratio: scrollPercentage, line: topLine } }));
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
        <div className="px-4 py-2 bg-muted/50 border-b-2 border-border/80 flex-shrink-0 shadow-sm flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground/70 uppercase tracking-wider" role="heading" aria-level={2}>
            Markdown Editor
          </h2>
          <div className="hidden lg:block">
            <CompactToolbar />
          </div>
        </div>
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
