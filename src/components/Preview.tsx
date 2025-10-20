import { useEffect, useRef, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkEmoji from 'remark-emoji';
import remarkFrontmatter from 'remark-frontmatter';
import remarkDirective from 'remark-directive';
import remarkGithubBlockquoteAlert from 'remark-github-blockquote-alert';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { useEditorStore } from '@/store/editorStore';
import { useToast } from '@/hooks/use-toast';
import { MermaidDiagram } from '@/components/MermaidDiagram';
import { visit } from 'unist-util-visit';

// TypeScript interfaces
interface CodeProps {
  className?: string;
  children?: React.ReactNode;
  inline?: boolean;
}

// Custom rehype plugin to add line number data attributes
const rehypeAddLineNumbers = () => {
  return (tree: any) => {
    visit(tree, 'element', (node: any) => {
      if (node.position?.start?.line) {
        node.properties = node.properties || {};
        node.properties.dataLine = node.position.start.line;
      }
    });
  };
};

export const Preview = () => {
  const { content, syncScroll, setContent } = useEditorStore();
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const syncScrollRef = useRef(syncScroll);

  // Optimized copy buttons with proper cleanup and memoization
  const addCopyButtons = useCallback(() => {
    if (!previewRef.current) return;
    
    const codeBlocks = previewRef.current.querySelectorAll('pre');
    codeBlocks.forEach((pre) => {
      // Skip if button already added
      if (pre.hasAttribute('data-copy-button-added')) return;
      
      const code = pre.querySelector('code');
      if (code && !code.classList.contains('mermaid-diagram-container')) {
        // Extract language from class name
        const className = code.className || '';
        const langMatch = /language-(\w+)/.exec(className);
        const language = langMatch ? langMatch[1] : '';
        
        // Add language badge if detected
        if (language) {
          const langBadge = document.createElement('span');
          langBadge.className = 'code-language-badge';
          langBadge.textContent = language;
          langBadge.setAttribute('aria-label', `Code language: ${language}`);
          pre.appendChild(langBadge);
        }
        
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.setAttribute('aria-label', 'Copy code to clipboard');
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
        
        button.addEventListener('click', (ev) => {
          ev.stopPropagation();
          const text = code.textContent || '';
          navigator.clipboard.writeText(text);
          toast({
            title: 'Copied!',
            description: 'Code copied to clipboard',
          });
          button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
          button.setAttribute('aria-label', 'Code copied');
          setTimeout(() => {
            button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
            button.setAttribute('aria-label', 'Copy code to clipboard');
          }, 2000);
        });
        
        pre.style.position = 'relative';
        pre.appendChild(button);
        pre.setAttribute('data-copy-button-added', 'true');
      }
    });
  }, [toast]);

  // Make task list checkboxes interactive
  const makeTaskListsInteractive = useCallback(() => {
    if (!previewRef.current) return;
    
    // Find all checkboxes in task lists
    const checkboxes = previewRef.current.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach((checkbox, checkboxIndex) => {
      const input = checkbox as HTMLInputElement;
      
      // Skip if already interactive
      if (input.hasAttribute('data-interactive')) return;
      
      // Remove disabled attribute to make it clickable
      input.removeAttribute('disabled');
      input.setAttribute('data-interactive', 'true');
      input.setAttribute('data-task-index', checkboxIndex.toString());
      input.style.cursor = 'pointer';
      
      input.addEventListener('change', (e) => {
        const clickedInput = e.target as HTMLInputElement;
        const newCheckedState = clickedInput.checked;
        const taskIndex = parseInt(clickedInput.getAttribute('data-task-index') || '0');
        
        // Parse content to find and toggle the specific checkbox
        const lines = content.split('\n');
        let currentTaskCount = -1;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          // Match task list items: - [ ] or - [x] or - [X] with optional indentation
          const taskMatch = line.match(/^(\s*[-*+])\s+\[([ xX])\]\s+(.*)$/);
          
          if (taskMatch) {
            currentTaskCount++;
            
            if (currentTaskCount === taskIndex) {
              // Update to the new checkbox state
              const indent = taskMatch[1];
              const newState = newCheckedState ? 'x' : ' ';
              const text = taskMatch[3];
              lines[i] = `${indent} [${newState}] ${text}`;
              
              // Update content
              const newContent = lines.join('\n');
              setContent(newContent);
              
              toast({
                title: newCheckedState ? 'Task completed! ✓' : 'Task unchecked',
                description: text.length > 50 ? text.substring(0, 50) + '...' : text,
              });
              
              break;
            }
          }
        }
      });
    });
  }, [content, setContent, toast]);

  // Handle content changes - add copy buttons and make checkboxes interactive after render
  useEffect(() => {
    requestAnimationFrame(() => {
      addCopyButtons();
      makeTaskListsInteractive();
    });
  }, [content, addCopyButtons, makeTaskListsInteractive]);

  // Track syncScroll changes without re-rendering diagrams
  useEffect(() => {
    syncScrollRef.current = syncScroll;
  }, [syncScroll]);

  // Robust synchronized scrolling using RAF + lock to prevent feedback loops
  useEffect(() => {
    if (!previewRef.current) return;

    const preview = previewRef.current;
    let isSyncing = false;
    let rafId: number | null = null;

    const handleEditorScroll = (e: Event) => {
      if (!syncScrollRef.current) return;

      const customEvent = e as CustomEvent;
      const scrollPercentage = customEvent.detail;

      isSyncing = true;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const maxScroll = preview.scrollHeight - preview.clientHeight;
        preview.scrollTop = maxScroll * scrollPercentage;

        // Release the lock on the next frame after the scroll event fires
        requestAnimationFrame(() => {
          isSyncing = false;
        });
        rafId = null;
      });
    };

    const handlePreviewScroll = () => {
      if (!syncScrollRef.current || isSyncing) return;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const maxScroll = preview.scrollHeight - preview.clientHeight;
        if (maxScroll > 0) {
          const scrollPercentage = preview.scrollTop / maxScroll;
          window.dispatchEvent(new CustomEvent('preview-scroll', { detail: scrollPercentage }));
        }
        rafId = null;
      });
    };

    window.addEventListener('editor-scroll', handleEditorScroll);
    preview.addEventListener('scroll', handlePreviewScroll, { passive: true });
    
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('editor-scroll', handleEditorScroll);
      preview.removeEventListener('scroll', handlePreviewScroll);
    };
  }, []); // Only setup once

  // Handle clicks to sync cursor position based on scroll ratio
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!previewRef.current) return;

    const root = previewRef.current;
    let el = e.target as HTMLElement | null;

    // Walk up to find element with data-line attribute
    while (el && el !== root) {
      const lineAttr = (el as HTMLElement).dataset?.line;
      if (lineAttr) {
        const line = parseInt(lineAttr, 10);
        if (!isNaN(line)) {
          window.dispatchEvent(new CustomEvent('preview-click', { detail: line }));
          return;
        }
      }
      el = el.parentElement;
    }

    // Fallback: estimate using scroll ratio
    const preview = root;
    const clickY = e.clientY;
    const previewRect = preview.getBoundingClientRect();
    const clickOffset = clickY - previewRect.top + preview.scrollTop;
    const totalHeight = Math.max(1, preview.scrollHeight);
    const clickRatio = Math.max(0, Math.min(1, clickOffset / totalHeight));
    const lines = content.split('\n');
    const targetLine = Math.max(1, Math.round(clickRatio * lines.length));
    window.dispatchEvent(new CustomEvent('preview-click', { detail: targetLine }));
  }, [content]);

  // Memoize ReactMarkdown to prevent unnecessary re-renders
  const markdownContent = useMemo(
    () => (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkEmoji, remarkFrontmatter, remarkDirective, remarkGithubBlockquoteAlert]}
        rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight, rehypeAddLineNumbers]}
        components={{
          code({ className, children, ...props }: CodeProps) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            
            if (!isInline && match?.[1] === 'mermaid') {
              return <MermaidDiagram code={String(children)} />;
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    ),
    [content]
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="px-4 py-2 bg-muted/30 border-b border-border flex-shrink-0 no-print">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Preview
        </h2>
      </div>
      <div 
        ref={previewRef}
        className="flex-1 overflow-auto bg-preview-bg p-8 cursor-text preview-content"
        onClick={handleClick}
        role="document"
        aria-label="Markdown preview"
      >
        <article className="prose prose-slate dark:prose-invert max-w-none">
          {markdownContent}
        </article>
      </div>
    </div>
  );
};
