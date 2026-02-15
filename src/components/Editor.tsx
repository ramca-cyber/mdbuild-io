import { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { useDocumentStore } from '@/store/documentStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useSearchStore } from '@/store/searchStore';
import { useSnippetsStore } from '@/store/snippetsStore';
import { EditorView, ViewUpdate, keymap } from '@codemirror/view';
import { EditorSelection, Prec } from '@codemirror/state';
import { undo, redo, deleteLine, copyLineDown, moveLineUp, moveLineDown, selectLine } from '@codemirror/commands';
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
                // Replace trigger with snippet content
                let content = snippet.content;
                
                // Handle ${date} variable
                if (content.includes('${date}')) {
                  content = content.replace(/\$\{date\}/g, new Date().toLocaleDateString());
                }
                
                const from = selection.from - trigger.length;
                view.dispatch({
                  changes: { from, to: selection.from, insert: content },
                  selection: EditorSelection.cursor(from + content.length),
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
          
          // If text is selected, wrap with bold
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
          
          // If text is selected, wrap with italic
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
          
          // If text is selected, wrap with inline code
          if (selectedText) {
            wrapSelection('`', '`');
            return true;
          }
          return false;
        },
      },
    ]);
  }, [wrapSelection]);

  // Typewriter mode - keep cursor centered
  useEffect(() => {
    if (!typewriterMode || !viewRef.current) return;

    const view = viewRef.current;
    
    const handleUpdate = () => {
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
    };

    // Add listener for selection changes
    const interval = setInterval(() => {
      if (document.activeElement?.closest('.cm-editor')) {
        handleUpdate();
      }
    }, 100);

    return () => clearInterval(interval);
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
            
            // Check if we're in a table
            if (!isInTable(text, selection.from)) {
              return false;
            }
            
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
            
            if (!isInTable(text, selection.from)) {
              return false;
            }
            
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
            
            if (!isInTable(text, selection.from)) {
              return false;
            }
            
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
            
            if (!isInTable(text, selection.from)) {
              return false;
            }
            
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
            
            if (!isInTable(text, selection.from)) {
              return false;
            }
            
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
            
            if (!isInTable(text, selection.from)) {
              return false;
            }
            
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
            
            if (!isInTable(text, selection.from)) {
              return false;
            }
            
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
      
      // If we have HTML content, convert it to markdown
      if (html && html.trim()) {
        e.preventDefault();
        
        try {
          const markdown = turndownService.turndown(html);
          const view = viewRef.current;
          const selection = view.state.selection.main;
          
          view.dispatch({
            changes: { from: selection.from, to: selection.to, insert: markdown },
            selection: EditorSelection.cursor(selection.from + markdown.length),
          });
        } catch (error) {
          // Fallback to plain text if conversion fails
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Undo
      if (modifier && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('editor-undo'));
      }
      
      // Redo
      if (modifier && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('editor-redo'));
      }
      
      // Alternative Redo (Ctrl+Y)
      if (modifier && e.key === 'y') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('editor-redo'));
      }
      
      // Select All - only when editor is focused
      if (modifier && e.key === 'a') {
        const activeEl = document.activeElement;
        if (activeEl?.closest('.cm-editor')) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('editor-select-all'));
        }
      }
      
      // Find & Replace
      if (modifier && e.key === 'f') {
        e.preventDefault();
        useSearchStore.getState().setShowSearchReplace(true);
      }
      
      // Go To Line
      if (modifier && e.key === 'g') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('show-goto-dialog'));
      }
      
      // Zoom In
      if (modifier && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        zoomIn();
      }
      
      // Zoom Out
      if (modifier && e.key === '-') {
        e.preventDefault();
        zoomOut();
      }
      
      // Reset Zoom
      if (modifier && e.key === '0') {
        e.preventDefault();
        resetZoom();
      }
      
      // Delete Line
      if (modifier && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('editor-delete-line'));
      }
      
      // Duplicate Line
      if (modifier && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('editor-duplicate-line'));
      }
      
      // Select Line
      if (modifier && e.key === 'l') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('editor-select-line'));
      }
      
      // Move Line Up
      if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('editor-move-line-up'));
      }
      
      // Move Line Down
      if (e.altKey && e.key === 'ArrowDown') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('editor-move-line-down'));
      }
      
      // Insert Date/Time (moved to Alt+D)
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
        window.dispatchEvent(
          new CustomEvent('editor-insert', {
            detail: { kind: 'wrap', before: formatted, after: '', placeholder: '' },
          })
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, resetZoom, turndownService]);

  // Debounced content update for better performance
  const debouncedSetContent = useMemo(
    () => debounce((value: string) => {
      setContent(value);
    }, 150),
    [setContent]
  );

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
      
      // Get cursor position
      const line = doc.lineAt(selection.head);
      const lineNum = line.number;
      const col = selection.head - line.from + 1;
      
      setCursorPosition(lineNum, col);
      
      // Get selected text word count
      if (selection.from !== selection.to) {
        const selectedText = doc.sliceString(selection.from, selection.to);
        const words = selectedText.trim().split(/\s+/).filter(w => w.length > 0).length;
        setSelectedWords(words);
      } else {
        setSelectedWords(0);
      }
    };
    
    // Also listen to selection changes via document event
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
      // Listen to multiple events for robust tracking
      view.dom.addEventListener('click', updateCursorInfo);
      view.dom.addEventListener('keyup', updateCursorInfo);
      view.dom.addEventListener('focus', updateCursorInfo);
      view.dom.addEventListener('mouseup', updateCursorInfo);
      document.addEventListener('selectionchange', handleSelectionChange);
      handlersAttached = true;
      
      // Initial update
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

  // Smooth scroll sync using RAF + interpolation
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

      // Smooth scroll animation
      const animateScroll = () => {
        const diff = Math.abs(targetScrollTop - currentScrollTop);
        
        if (diff < 0.5) {
          currentScrollTop = targetScrollTop;
          editorScroll.scrollTop = currentScrollTop;
          smoothRafId = null;
          // Release sync lock
          requestAnimationFrame(() => {
            isSyncing = false;
          });
          return;
        }

        // Smooth interpolation
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

          // Compute top visible line for higher precision
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
              // Set target and start smooth animation
              targetScrollTop = editorScroll.scrollTop + delta;
              currentScrollTop = editorScroll.scrollTop;
              animateScroll();
            } else if (maxScroll > 0 && detail.ratio != null) {
              // Set target and start smooth animation
              targetScrollTop = detail.ratio * maxScroll;
              currentScrollTop = editorScroll.scrollTop;
              animateScroll();
            }
          } else {
            const ratio = typeof detail === 'number' ? detail : detail?.ratio ?? 0;
            // Set target and start smooth animation
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

  // Edit commands handler
  useEffect(() => {
    const handleUndo = () => {
      if (viewRef.current) {
        undo(viewRef.current);
        emitHistoryState();
      }
    };

    const handleRedo = () => {
      if (viewRef.current) {
        redo(viewRef.current);
        emitHistoryState();
      }
    };

    const handleSelectAll = () => {
      if (viewRef.current) {
        const view = viewRef.current;
        const doc = view.state.doc;
        view.dispatch({
          selection: { anchor: 0, head: doc.length },
        });
        view.focus();
      }
    };
    
    const handleDeleteLine = () => {
      if (viewRef.current) {
        deleteLine(viewRef.current);
        emitHistoryState();
      }
    };
    
    const handleDuplicateLine = () => {
      if (viewRef.current) {
        copyLineDown(viewRef.current);
        emitHistoryState();
      }
    };
    
    const handleSelectLine = () => {
      if (viewRef.current) {
        selectLine(viewRef.current);
      }
    };
    
    const handleMoveLineUp = () => {
      if (viewRef.current) {
        moveLineUp(viewRef.current);
        emitHistoryState();
      }
    };
    
    const handleMoveLineDown = () => {
      if (viewRef.current) {
        moveLineDown(viewRef.current);
        emitHistoryState();
      }
    };
    
    const handleGoToLine = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { line } = customEvent.detail;
      
      if (viewRef.current && typeof line === 'number') {
        const view = viewRef.current;
        const doc = view.state.doc;
        const lineCount = doc.lines;
        
        const targetLine = Math.min(Math.max(1, line), lineCount);
        const pos = doc.line(targetLine).from;
        
        view.dispatch({
          selection: { anchor: pos },
          scrollIntoView: true,
        });
        view.focus();
      }
    };
    
    const handleConvertCase = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { caseType } = customEvent.detail;
      
      if (!viewRef.current) return;
      
      const view = viewRef.current;
      const selection = view.state.selection.main;
      
      if (selection.from === selection.to) return; // No selection
      
      const selectedText = view.state.sliceDoc(selection.from, selection.to);
      let convertedText = selectedText;
      
      switch (caseType) {
        case 'upper':
          convertedText = selectedText.toUpperCase();
          break;
        case 'lower':
          convertedText = selectedText.toLowerCase();
          break;
        case 'title':
          convertedText = selectedText.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          );
          break;
      }
      
      view.dispatch({
        changes: { from: selection.from, to: selection.to, insert: convertedText },
        selection: { anchor: selection.from, head: selection.from + convertedText.length },
      });
      
      emitHistoryState();
    };

    window.addEventListener('editor-undo', handleUndo);
    window.addEventListener('editor-redo', handleRedo);
    window.addEventListener('editor-select-all', handleSelectAll);
    window.addEventListener('editor-delete-line', handleDeleteLine);
    window.addEventListener('editor-duplicate-line', handleDuplicateLine);
    window.addEventListener('editor-select-line', handleSelectLine);
    window.addEventListener('editor-move-line-up', handleMoveLineUp);
    window.addEventListener('editor-move-line-down', handleMoveLineDown);
    window.addEventListener('editor-goto-line', handleGoToLine);
    window.addEventListener('editor-convert-case', handleConvertCase);

    return () => {
      window.removeEventListener('editor-undo', handleUndo);
      window.removeEventListener('editor-redo', handleRedo);
      window.removeEventListener('editor-select-all', handleSelectAll);
      window.removeEventListener('editor-delete-line', handleDeleteLine);
      window.removeEventListener('editor-duplicate-line', handleDuplicateLine);
      window.removeEventListener('editor-select-line', handleSelectLine);
      window.removeEventListener('editor-move-line-up', handleMoveLineUp);
      window.removeEventListener('editor-move-line-down', handleMoveLineDown);
      window.removeEventListener('editor-goto-line', handleGoToLine);
      window.removeEventListener('editor-convert-case', handleConvertCase);
    };
  }, []);

  // Emit history state changes for Edit menu
  const emitHistoryState = () => {
    if (viewRef.current) {
      // CodeMirror's history is always available with basicSetup
      // We emit that undo/redo are available since they're always enabled
      window.dispatchEvent(
        new CustomEvent('editor-history-change', {
          detail: {
            canUndo: true,
            canRedo: true,
          },
        })
      );
    }
  };

  // Insertion bus - handles all toolbar insertions at the correct cursor position
  useEffect(() => {
    const handleInsert = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { kind, before, after, placeholder, block } = customEvent.detail;
      
      if (!viewRef.current) return;
      
      const view = viewRef.current;
      const state = view.state;
      const selection = state.selection.main;
      
      if (kind === 'wrap') {
        // Wrap selection or insert with placeholder
        const selectedText = state.sliceDoc(selection.from, selection.to);
        const textToInsert = selectedText || (placeholder || 'text');
        const fullText = before + textToInsert + (after || '');
        
        view.dispatch({
          changes: { from: selection.from, to: selection.to, insert: fullText },
          selection: EditorSelection.cursor(selection.from + before.length + textToInsert.length + (after?.length || 0)),
          scrollIntoView: true,
        });
      } else if (kind === 'block') {
        // Insert block with proper newlines
        const doc = state.doc;
        const line = doc.lineAt(selection.from);
        const isStartOfLine = selection.from === line.from;
        const isEndOfDoc = selection.from === doc.length;
        
        // Add newlines as needed
        const prefix = isStartOfLine || line.text.trim() === '' ? '' : '\n\n';
        const suffix = isEndOfDoc ? '' : '\n\n';
        const fullBlock = prefix + block + suffix;
        
        view.dispatch({
          changes: { from: selection.from, to: selection.from, insert: fullBlock },
          selection: EditorSelection.cursor(selection.from + fullBlock.length),
          scrollIntoView: true,
        });
      }
      
      view.focus();
      emitHistoryState();
    };

    window.addEventListener('editor-insert', handleInsert);
    return () => window.removeEventListener('editor-insert', handleInsert);
  }, []);


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
          extensions={[markdown(), snippetKeymap, syntaxHelpersKeymap, tableKeymap]}
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
