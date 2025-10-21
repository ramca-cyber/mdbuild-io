import { useEffect, useRef, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkEmoji from 'remark-emoji';
import remarkFrontmatter from 'remark-frontmatter';
import remarkDirective from 'remark-directive';
import remarkGithubBlockquoteAlert from 'remark-github-blockquote-alert';
import { remarkFootnotes } from '@/lib/remarkFootnotes';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { useEditorStore } from '@/store/editorStore';
import { useToast } from '@/hooks/use-toast';
import { MermaidDiagram } from '@/components/MermaidDiagram';
import { ErrorBoundary } from '@/components/ErrorBoundary';
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
  const { content, syncScroll, documentSettings, previewSettings } = useEditorStore();
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const syncScrollRef = useRef(syncScroll);
  const anchorsRef = useRef<{ line: number; top: number }[]>([]);
  
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

  // Handle content changes - add copy buttons after render (optimized)
  useEffect(() => {
    requestAnimationFrame(() => {
      addCopyButtons();
    });
  }, [content, addCopyButtons]);

  // Track syncScroll changes without re-rendering diagrams
  useEffect(() => {
    syncScrollRef.current = syncScroll;
  }, [syncScroll]);
  
  // Apply preview preferences
  useEffect(() => {
    const article = previewRef.current?.querySelector('article');
    if (!article) return;

    // Apply smooth scroll
    article.style.scrollBehavior = previewSettings.enableSmoothScroll ? 'smooth' : 'auto';

    // Apply compact headings
    if (previewSettings.compactHeadings) {
      article.classList.add('compact-headings');
    } else {
      article.classList.remove('compact-headings');
    }

    // Apply max image width
    article.setAttribute('data-image-width', previewSettings.maxImageWidth);
    
    // Apply lazy loading to images
    const images = article.querySelectorAll('img');
    images.forEach((img) => {
      if (previewSettings.enableImageLazyLoad) {
        img.setAttribute('loading', 'lazy');
      } else {
        img.removeAttribute('loading');
      }
    });
  }, [previewSettings]);

  // Re-sync when images or content size change (images, diagrams)
  useEffect(() => {
    if (!previewRef.current) return;
    const root = previewRef.current;

    // Build anchors map from preview content
    const rebuildAnchors = () => {
      const nodes = Array.from(root.querySelectorAll('[data-line]')) as HTMLElement[];
      const anchors = nodes
        .map((el) => ({ line: parseInt(el.getAttribute('data-line') || '0', 10) || 0, top: el.offsetTop }))
        .filter((a) => a.line > 0)
        .sort((a, b) => a.line - b.line);
      anchorsRef.current = anchors;
    };

    const emitCurrent = () => {
      if (!previewRef.current) return;
      rebuildAnchors();
      if (!syncScrollRef.current) return;
      const maxScroll = root.scrollHeight - root.clientHeight;
      if (maxScroll <= 0) return;
      const ratio = Math.max(0, Math.min(1, root.scrollTop / maxScroll));
      // Compute current top line from anchors
      const anchors = anchorsRef.current;
      let i = 0;
      while (i + 1 < anchors.length && anchors[i + 1].top <= root.scrollTop) i++;
      const line = anchors[i]?.line || 1;
      window.dispatchEvent(new CustomEvent('preview-scroll', { detail: { ratio, line } }));
    };

    // Initial build
    rebuildAnchors();

    const imgs = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
    imgs.forEach((img) => {
      if (img.complete) {
        requestAnimationFrame(emitCurrent);
      } else {
        img.addEventListener('load', emitCurrent);
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      // Content height changed (e.g., diagram render)
      requestAnimationFrame(emitCurrent);
    });
    resizeObserver.observe(root);

    window.addEventListener('resize', emitCurrent);

    return () => {
      imgs.forEach((img) => img.removeEventListener('load', emitCurrent));
      resizeObserver.disconnect();
      window.removeEventListener('resize', emitCurrent);
    };
  }, [content]);

  // Robust synchronized scrolling using RAF + lock to prevent feedback loops
  useEffect(() => {
    if (!previewRef.current) return;

    const preview = previewRef.current;
    let isSyncing = false;
    let rafId: number | null = null;

    const handleEditorScroll = (e: Event) => {
      if (!syncScrollRef.current) return;

      const customEvent = e as CustomEvent;
      const detail = customEvent.detail;

      isSyncing = true;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (detail && typeof detail === 'object' && 'line' in detail) {
          // Precise: map line -> preview top via anchors
          const anchors = anchorsRef.current;
          let idx = anchors.findIndex((a) => a.line >= detail.line);
          if (idx === -1) idx = anchors.length - 1;
          if (idx < 0) idx = 0;
          const targetTop = anchors[idx]?.top ?? 0;
          preview.scrollTop = targetTop;
        } else {
          // Fallback: simple ratio
          const scrollPercentage = typeof detail === 'number' ? detail : detail?.ratio ?? 0;
          const maxScroll = preview.scrollHeight - preview.clientHeight;
          preview.scrollTop = maxScroll * scrollPercentage;
        }

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
          const ratio = preview.scrollTop / maxScroll;
          // Determine top line from anchors
          const anchors = anchorsRef.current;
          let i = 0;
          while (i + 1 < anchors.length && anchors[i + 1].top <= preview.scrollTop) i++;
          const line = anchors[i]?.line || 1;
          window.dispatchEvent(new CustomEvent('preview-scroll', { detail: { ratio, line } }));
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
  const remarkPlugins = useMemo(() => {
    const plugins: any[] = [remarkGfm, remarkMath, remarkEmoji, remarkFrontmatter, remarkDirective, remarkGithubBlockquoteAlert, remarkFootnotes];
    return plugins;
  }, []);
  
  const rehypePlugins = useMemo(() => {
    const plugins: any[] = [rehypeRaw, rehypeKatex, rehypeAddLineNumbers];
    // Conditionally add syntax highlighting based on document settings
    if (documentSettings.syntaxHighlighting) {
      plugins.push(rehypeHighlight);
    }
    return plugins;
  }, [documentSettings.syntaxHighlighting]);

  const markdownContent = useMemo(
    () => (
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={{
          code({ className, children, ...props }: CodeProps) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            
            if (!isInline && match?.[1] === 'mermaid') {
              return (
                <ErrorBoundary fallback={
                  <div className="p-4 border border-destructive rounded bg-destructive/10 text-destructive">
                    <strong>Diagram Error:</strong> Failed to render Mermaid diagram
                  </div>
                }>
                  <MermaidDiagram code={String(children)} />
                </ErrorBoundary>
              );
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
    <div className="h-full w-full flex flex-col overflow-hidden bg-preview-bg">
      <div className="px-4 py-3 bg-muted/50 border-b-2 border-border/80 flex-shrink-0 no-print shadow-sm">
        <h2 className="text-sm font-bold text-foreground/70 uppercase tracking-wider">
          Preview
        </h2>
      </div>
      <div 
        ref={previewRef}
        className="flex-1 overflow-auto p-8 cursor-text preview-content"
        onClick={handleClick}
        role="document"
        aria-label="Markdown preview"
        style={{
          willChange: 'scroll-position',
          contain: 'layout style paint',
        }}
      >
        <article 
          className="prose prose-slate dark:prose-invert max-w-none"
          style={{
            contentVisibility: 'auto',
          }}
        >
          {markdownContent}
        </article>
      </div>
    </div>
  );
};
