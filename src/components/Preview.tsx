import { useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkEmoji from 'remark-emoji';
import remarkFrontmatter from 'remark-frontmatter';
import rehypeKatex from 'rehype-katex';

import rehypeRaw from 'rehype-raw';
import { useEditorStore } from '@/store/editorStore';
import { useToast } from '@/hooks/use-toast';
import { MermaidDiagram } from '@/components/MermaidDiagram';
import { visit } from 'unist-util-visit';

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
  const { content, syncScroll } = useEditorStore();
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const syncScrollRef = useRef(syncScroll);

  // Add copy buttons to code blocks
  const addCopyButtons = () => {
    if (!previewRef.current) return;
    
    const codeBlocks = previewRef.current.querySelectorAll('pre');
    codeBlocks.forEach((pre) => {
      if (pre.querySelector('.copy-button')) return;
      
      const code = pre.querySelector('code');
      if (code && !code.classList.contains('mermaid-diagram-container')) {
        const button = document.createElement('button');
        button.className = 'copy-button';
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
          setTimeout(() => {
            button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
          }, 2000);
        });
        pre.style.position = 'relative';
        pre.appendChild(button);
      }
    });
  };

  // Handle content changes - add copy buttons after render
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        addCopyButtons();
      });
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [content, toast]);

  // Track syncScroll changes without re-rendering diagrams
  useEffect(() => {
    syncScrollRef.current = syncScroll;
  }, [syncScroll]);

  // Synchronized scrolling - setup once
  useEffect(() => {
    if (!previewRef.current) return;

    const preview = previewRef.current;
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleEditorScroll = (e: Event) => {
      if (!syncScrollRef.current || isScrolling) return;
      
      const customEvent = e as CustomEvent;
      const scrollPercentage = customEvent.detail;
      isScrolling = true;
      
      const maxScroll = preview.scrollHeight - preview.clientHeight;
      preview.scrollTop = maxScroll * scrollPercentage;
      
      setTimeout(() => {
        isScrolling = false;
      }, 50);
    };

    const handlePreviewScroll = () => {
      if (!syncScrollRef.current || isScrolling) return;
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const maxScroll = preview.scrollHeight - preview.clientHeight;
        if (maxScroll > 0) {
          const scrollPercentage = preview.scrollTop / maxScroll;
          window.dispatchEvent(new CustomEvent('preview-scroll', { detail: scrollPercentage }));
        }
      }, 10);
    };

    window.addEventListener('editor-scroll', handleEditorScroll);
    preview.addEventListener('scroll', handlePreviewScroll);
    
    return () => {
      clearTimeout(scrollTimeout);
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

  return (
    <div 
      ref={previewRef}
      className="h-full w-full overflow-auto bg-preview-bg p-8 cursor-text"
      onClick={handleClick}
    >
      <article className="prose prose-slate dark:prose-invert max-w-none preview-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath, remarkEmoji, remarkFrontmatter]}
          rehypePlugins={[rehypeRaw, rehypeKatex, rehypeAddLineNumbers]}
          components={{
          code({ className, children, ...props }: any) {
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
      </article>
    </div>
  );
};
