import { useCallback, useEffect, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { useEditorStore } from '@/store/editorStore';
import { EditorView } from '@codemirror/view';
import { SearchReplace } from '@/components/SearchReplace';
import { toast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

export const Editor = () => {
  const { content, setContent, theme, fontSize, lineWrap, lineNumbers, syncScroll, searchResults, currentSearchIndex } = useEditorStore();
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  // Drag & Drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    try {
      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter(f => f.type.startsWith('image/'));

      if (imageFiles.length === 0) {
        toast({
          title: 'No images found',
          description: 'Please drop image files only.',
          variant: 'destructive',
        });
        return;
      }

      // Check total size (max 50MB total)
      const totalSize = imageFiles.reduce((sum, f) => sum + f.size, 0);
      if (totalSize > 50 * 1024 * 1024) {
        toast({
          title: 'Files too large',
          description: 'Total file size must be less than 50MB.',
          variant: 'destructive',
        });
        return;
      }

      let insertedCount = 0;
      let errorCount = 0;

      imageFiles.forEach(file => {
        // Check individual file size (max 10MB each)
        if (file.size > 10 * 1024 * 1024) {
          errorCount++;
          if (insertedCount + errorCount === imageFiles.length) {
            toast({
              title: errorCount > 0 ? 'Some images skipped' : 'Images inserted',
              description: errorCount > 0 
                ? `${insertedCount} inserted, ${errorCount} skipped (too large, max 10MB each)`
                : `${imageFiles.length} image(s) added to document.`,
              variant: errorCount > 0 ? 'destructive' : 'default',
            });
          }
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const dataUrl = e.target?.result as string;
            if (!dataUrl) {
              throw new Error('Failed to read image');
            }
            const imageMarkdown = `![${file.name}](${dataUrl})\n`;
            
            // Insert at current cursor position or append
            if (viewRef.current) {
              const view = viewRef.current;
              const pos = view.state.selection.main.head;
              view.dispatch({
                changes: { from: pos, insert: imageMarkdown }
              });
            } else {
              setContent(content + imageMarkdown);
            }
            
            insertedCount++;
            if (insertedCount + errorCount === imageFiles.length) {
              toast({
                title: errorCount > 0 ? 'Some images skipped' : 'Images inserted',
                description: errorCount > 0 
                  ? `${insertedCount} inserted, ${errorCount} skipped (too large, max 10MB each)`
                  : `${imageFiles.length} image(s) added to document.`,
                variant: errorCount > 0 ? 'destructive' : 'default',
              });
            }
          } catch (error) {
            console.error('Error processing image:', error);
            errorCount++;
            if (insertedCount + errorCount === imageFiles.length) {
              toast({
                title: 'Error processing images',
                description: `${insertedCount} inserted, ${errorCount} failed`,
                variant: 'destructive',
              });
            }
          }
        };
        reader.onerror = () => {
          errorCount++;
          console.error('Failed to read file:', file.name);
          if (insertedCount + errorCount === imageFiles.length) {
            toast({
              title: 'Error reading images',
              description: `${insertedCount} inserted, ${errorCount} failed`,
              variant: 'destructive',
            });
          }
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error dropping files:', error);
      toast({
        title: 'Error processing drop',
        description: 'Failed to process dropped files. Please try again.',
        variant: 'destructive',
      });
    }
  }, [content, setContent, toast]);

  return (
    <div 
      ref={editorRef} 
      className="h-full w-full overflow-hidden relative flex flex-col no-print bg-editor-bg"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="px-4 py-3 bg-muted/50 border-b-2 border-border/80 flex-shrink-0 shadow-sm">
        <h2 className="text-sm font-bold text-foreground/70 uppercase tracking-wider" role="heading" aria-level={2}>
          Markdown Editor
        </h2>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <SearchReplace />
      
      {isDragging && (
        <div className="absolute inset-0 z-40 bg-background/80 backdrop-blur-sm flex items-center justify-center border-2 border-dashed border-primary animate-fade-in">
          <div className="text-center">
            <Upload className="h-16 w-16 mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Drop images here</p>
            <p className="text-sm text-muted-foreground">Supports multiple images</p>
          </div>
        </div>
      )}
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
