import { useCallback, useEffect, useRef, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { useEditorStore } from '@/store/editorStore';
import { EditorView } from '@codemirror/view';
import { EditorSelection } from '@codemirror/state';
import { undo, redo, deleteLine, copyLineDown, moveLineUp, moveLineDown, selectLine } from '@codemirror/commands';
import { SearchReplace } from '@/components/SearchReplace';
import { debounce } from '@/lib/utils';
import { CompactToolbar } from '@/components/CompactToolbar';

export const Editor = () => {
  const { 
    content, 
    setContent, 
    theme, 
    fontSize, 
    lineWrap, 
    lineNumbers, 
    syncScroll, 
    searchResults, 
    currentSearchIndex,
    setCursorPosition,
    setSelectedWords,
    zoomLevel,
    zoomIn,
    zoomOut,
    resetZoom
  } = useEditorStore();
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Save
      if (modifier && e.key === 's') {
        e.preventDefault();
        useEditorStore.getState().saveVersion();
      }
      
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
      
      // Select All
      if (modifier && e.key === 'a') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('editor-select-all'));
      }
      
      // Find & Replace
      if (modifier && e.key === 'f') {
        e.preventDefault();
        useEditorStore.getState().setShowSearchReplace(true);
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
  }, [zoomIn, zoomOut, resetZoom]);

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
    if (!viewRef.current) return;
    
    const view = viewRef.current;
    
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
    
    const handleUpdate = () => {
      updateCursorInfo();
    };
    
    // Use MutationObserver to detect selection changes
    const observer = new MutationObserver(handleUpdate);
    const editorElement = editorRef.current?.querySelector('.cm-content');
    
    if (editorElement) {
      observer.observe(editorElement, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    }
    
    // Also listen to click and keyboard events
    view.dom.addEventListener('click', updateCursorInfo);
    view.dom.addEventListener('keyup', updateCursorInfo);
    
    // Initial update
    updateCursorInfo();
    
    return () => {
      observer.disconnect();
      view.dom.removeEventListener('click', updateCursorInfo);
      view.dom.removeEventListener('keyup', updateCursorInfo);
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
              editorScroll.scrollTop += delta;
            } else if (maxScroll > 0 && detail.ratio != null) {
              editorScroll.scrollTop = detail.ratio * maxScroll;
            }
          } else {
            const ratio = typeof detail === 'number' ? detail : detail?.ratio ?? 0;
            editorScroll.scrollTop = ratio * maxScroll;
          }

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
    <div 
      ref={editorRef} 
      className="h-full w-full overflow-hidden relative flex flex-col no-print bg-editor-bg"
    >
      <div className="px-4 py-2 bg-muted/50 border-b-2 border-border/80 flex-shrink-0 shadow-sm flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground/70 uppercase tracking-wider" role="heading" aria-level={2}>
          Markdown Editor
        </h2>
        {/* Import and add CompactToolbar here */}
        <div className="hidden xl:block">
          <CompactToolbar />
        </div>
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
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top left',
            width: `${10000 / zoomLevel}%`,
          }}
          aria-label="Markdown editor text area"
        />
      </div>
    </div>
  );
};
