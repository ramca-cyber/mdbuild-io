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
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { useDocumentStore } from '@/store/documentStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useErrorStore } from '@/store/errorStore';
import { useToast } from '@/hooks/use-toast';
import { MermaidDiagram } from '@/components/MermaidDiagram';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { lintMarkdown } from '@/lib/markdownLinter';
import { rehypeHeadingIds } from '@/lib/rehypeHeadingIds';
import { visit } from 'unist-util-visit';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ZoomIn, ZoomOut, Printer, Copy, FileText } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { copyMarkdownToClipboard, copyRichTextToClipboard } from '@/lib/markdownCopyUtils';

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
  const { content } = useDocumentStore();
  const { 
    syncScroll, 
    documentSettings, 
    previewSettings, 
    setPreviewSettings,
    showOutline,
    setShowOutline,
  } = useSettingsStore();
  const { replaceErrorsByCategory } = useErrorStore();
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const syncScrollRef = useRef(syncScroll);
  const anchorsRef = useRef<{ line: number; top: number }[]>([]);
  const lintTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  // Lint markdown content with debouncing
  useEffect(() => {
    if (lintTimeoutRef.current) {
      clearTimeout(lintTimeoutRef.current);
    }

    lintTimeoutRef.current = setTimeout(() => {
      const result = lintMarkdown(content);
      // Replace only lint-related error categories, keeping other errors (mermaid, math, etc.)
      replaceErrorsByCategory(['markdown', 'link', 'accessibility'], result.errors);
    }, 500);

    return () => {
      if (lintTimeoutRef.current) {
        clearTimeout(lintTimeoutRef.current);
      }
    };
  }, [content, replaceErrorsByCategory]);

  // Handle zoom controls
  const handleZoomIn = () => {
    const newZoom = Math.min(previewSettings.previewZoom + 10, 200);
    setPreviewSettings({ previewZoom: newZoom });
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(previewSettings.previewZoom - 10, 50);
    setPreviewSettings({ previewZoom: newZoom });
  };

  const handlePrint = async () => {
    const { waitForPrintReady, prepareArticleForPrint, restoreArticleAfterPrint } = await import('@/lib/exportUtils');
    
    // Prepare article for full rendering
    const savedStyles = prepareArticleForPrint();
    
    // Wait for content to be ready
    await waitForPrintReady();
    
    // Setup cleanup after print
    const cleanup = () => {
      restoreArticleAfterPrint(savedStyles);
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    
    // Trigger print
    window.print();
  };

  // Copy full document as markdown
  const handleCopyMarkdown = useCallback(() => {
    copyMarkdownToClipboard(content, toast);
  }, [content, toast]);

  // Copy as rich text (for Medium, Substack, etc.)
  const handleCopyRichText = useCallback(() => {
    if (previewRef.current) {
      copyRichTextToClipboard(previewRef.current, toast);
    }
  }, [toast]);
  
  // Optimized copy buttons with WeakMap tracking to prevent duplicate buttons
  const processedCodeBlocks = useRef(new WeakMap<HTMLPreElement, boolean>());
  
  const addCopyButtons = useCallback(() => {
    if (!previewRef.current) return;
    
    const codeBlocks = previewRef.current.querySelectorAll('pre');
    codeBlocks.forEach((pre) => {
      // Skip if button already added using WeakMap
      if (processedCodeBlocks.current.get(pre)) return;
      
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
        
        // Mark as processed using WeakMap
        processedCodeBlocks.current.set(pre, true);
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
    const zoomWrapper = previewRef.current?.querySelector('.zoom-wrapper') as HTMLElement;
    if (!article || !zoomWrapper) return;

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
    
    // Apply preview zoom to wrapper instead of article
    const zoomScale = previewSettings.previewZoom / 100;
    zoomWrapper.style.transform = `scale(${zoomScale})`;
    zoomWrapper.style.transformOrigin = 'top left';
    zoomWrapper.style.width = `${100 / zoomScale}%`;
    
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

  // Preserve scroll position when outline panel opens/closes or zoom changes
  useEffect(() => {
    if (!previewRef.current) return;
    
    const preview = previewRef.current;
    const savedScrollRatio = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
    
    // Wait for layout to settle after outline toggle or zoom change
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!isNaN(savedScrollRatio) && isFinite(savedScrollRatio)) {
          const newMaxScroll = preview.scrollHeight - preview.clientHeight;
          preview.scrollTop = newMaxScroll * savedScrollRatio;
        }
      });
    });
  }, [showOutline, previewSettings.previewZoom]);

  // Re-sync when images or content size change (images, diagrams)
  useEffect(() => {
    if (!previewRef.current) return;
    const root = previewRef.current;

    // Build anchors map from preview content, accounting for zoom
    const rebuildAnchors = () => {
      const nodes = Array.from(root.querySelectorAll('[data-line]')) as HTMLElement[];
      const zoomScale = previewSettings.previewZoom / 100;
      const anchors = nodes
        .map((el) => ({ 
          line: parseInt(el.getAttribute('data-line') || '0', 10) || 0, 
          top: el.offsetTop * zoomScale 
        }))
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
  }, [content, previewSettings.previewZoom, showOutline]);

  // Smooth synchronized scrolling using RAF + interpolation
  useEffect(() => {
    if (!previewRef.current) return;

    const preview = previewRef.current;
    let isSyncing = false;
    let rafId: number | null = null;
    let smoothRafId: number | null = null;
    let currentScrollTop = preview.scrollTop;
    let targetScrollTop = preview.scrollTop;

    // Smooth scroll animation
    const animateScroll = () => {
      const diff = Math.abs(targetScrollTop - currentScrollTop);
      
      if (diff < 0.5) {
        currentScrollTop = targetScrollTop;
        preview.scrollTop = currentScrollTop;
        smoothRafId = null;
        // Release sync lock
        requestAnimationFrame(() => {
          isSyncing = false;
        });
        return;
      }

      // Smooth interpolation
      currentScrollTop += (targetScrollTop - currentScrollTop) * 0.15;
      preview.scrollTop = currentScrollTop;
      
      smoothRafId = requestAnimationFrame(animateScroll);
    };

    const handleEditorScroll = (e: Event) => {
      if (!syncScrollRef.current) return;

      const customEvent = e as CustomEvent;
      const detail = customEvent.detail;

      isSyncing = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (smoothRafId) cancelAnimationFrame(smoothRafId);
      
      rafId = requestAnimationFrame(() => {
        if (detail && typeof detail === 'object' && 'line' in detail) {
          // Precise: map line -> preview top via anchors
          const anchors = anchorsRef.current;
          let idx = anchors.findIndex((a) => a.line >= detail.line);
          if (idx === -1) idx = anchors.length - 1;
          if (idx < 0) idx = 0;
          const targetTop = anchors[idx]?.top ?? 0;
          
          // Set target and start smooth animation
          targetScrollTop = targetTop;
          currentScrollTop = preview.scrollTop;
          animateScroll();
        } else {
          // Fallback: simple ratio
          const scrollPercentage = typeof detail === 'number' ? detail : detail?.ratio ?? 0;
          const maxScroll = preview.scrollHeight - preview.clientHeight;
          
          // Set target and start smooth animation
          targetScrollTop = maxScroll * scrollPercentage;
          currentScrollTop = preview.scrollTop;
          animateScroll();
        }

        rafId = null;
      });
    };

    const handlePreviewScroll = () => {
      if (!syncScrollRef.current || isSyncing) return;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        currentScrollTop = preview.scrollTop;
        targetScrollTop = preview.scrollTop;
        
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

    // Keyboard shortcut: Ctrl+Shift+C for copy as markdown
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        copyMarkdownToClipboard(content, toast);
      }
    };
    preview.addEventListener('keydown', handleKeydown);
    
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (smoothRafId) cancelAnimationFrame(smoothRafId);
      window.removeEventListener('editor-scroll', handleEditorScroll);
      preview.removeEventListener('scroll', handlePreviewScroll);
      preview.removeEventListener('keydown', handleKeydown);
    };
  }, [content, toast]);

  // Handle clicks to sync cursor position - only when not selecting text
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Don't interfere with text selection
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }

    if (!previewRef.current) return;

    const root = previewRef.current;
    let el = e.target as HTMLElement | null;

    // Don't trigger on copy button clicks
    if (el?.closest('.copy-button')) {
      return;
    }

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
  
  const sanitizeSchema = useMemo(() => ({
    ...defaultSchema,
    tagNames: [
      ...(defaultSchema.tagNames || []),
      'details', 'summary', 'kbd', 'sup', 'sub', 'mark', 'abbr', 'ins', 'del',
    ],
    attributes: {
      ...defaultSchema.attributes,
      '*': [...(defaultSchema.attributes?.['*'] || []), 'className', 'class', 'id', 'dataLine', 'data-line', 'style'],
      code: [...(defaultSchema.attributes?.code || []), 'className', 'class'],
      img: [...(defaultSchema.attributes?.img || []), 'src', 'alt', 'title', 'loading', 'width', 'height'],
      a: [...(defaultSchema.attributes?.a || []), 'href', 'title', 'target', 'rel'],
    },
  }), []);

  const rehypePlugins = useMemo(() => {
    const plugins: any[] = [rehypeRaw, [rehypeSanitize, sanitizeSchema], rehypeKatex, rehypeHeadingIds, rehypeAddLineNumbers];
    // Conditionally add syntax highlighting based on document settings
    if (documentSettings.syntaxHighlighting) {
      plugins.push(rehypeHighlight);
    }
    return plugins;
  }, [documentSettings.syntaxHighlighting, sanitizeSchema]);

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
              // Calculate approximate line number for the code block
              const lines = content.split('\n');
              let lineNumber: number | undefined;
              const codeStr = String(children);
              for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes(codeStr.substring(0, 20))) {
                  lineNumber = i + 1;
                  break;
                }
              }
              
              return (
                <ErrorBoundary fallback={
                  <div className="p-4 border border-destructive rounded bg-destructive/10 text-destructive">
                    <strong>Diagram Error:</strong> Failed to render Mermaid diagram
                  </div>
                }>
                  <MermaidDiagram code={codeStr} lineNumber={lineNumber} />
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
    [content, remarkPlugins, rehypePlugins]
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-preview-bg">
      <div className="px-4 py-2 bg-muted/50 border-b-2 border-border/80 flex-shrink-0 no-print shadow-sm flex items-center justify-between gap-3">
        {/* Left side: Preview title */}
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-foreground/70 uppercase tracking-wider">
            Preview
          </h2>
        </div>

        {/* Right side: Tools */}
        <div className="flex items-center gap-2">


          {/* Zoom Controls */}
          <div className="hidden md:flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={previewSettings.previewZoom <= 50}
                  className="h-8 px-2"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Zoom Out (Min: 50%)</p>
              </TooltipContent>
            </Tooltip>

            <span className="text-xs font-medium text-muted-foreground min-w-[3rem] text-center">
              {previewSettings.previewZoom}%
            </span>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={previewSettings.previewZoom >= 200}
                  className="h-8 px-2"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Zoom In (Max: 200%)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-6 hidden md:block" />

          {/* Print Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrint}
                className="h-8 px-2 gap-1.5 hidden md:flex"
                aria-label="Print preview"
              >
                <Printer className="h-4 w-4" />
                <span className="hidden xl:inline text-xs">Print</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Print Preview</p>
            </TooltipContent>
          </Tooltip>

          {/* Copy as Rich Text Button (for Medium, Substack) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyRichText}
                className="h-8 px-2 gap-1.5 hidden md:flex"
                aria-label="Copy as Rich Text"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden xl:inline text-xs">Copy Rich</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Copy as Rich Text (for Medium, Substack)</p>
            </TooltipContent>
          </Tooltip>

          {/* Copy as Markdown Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyMarkdown}
                className="h-8 px-2 gap-1.5 hidden md:flex"
                aria-label="Copy as Markdown"
              >
                <Copy className="h-4 w-4" />
                <span className="hidden xl:inline text-xs">Copy MD</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Copy as Markdown (Ctrl+Shift+C)</p>
            </TooltipContent>
          </Tooltip>

        </div>
      </div>
      <div
        ref={previewRef}
        className="flex-1 overflow-auto p-8 cursor-text preview-content"
        tabIndex={0}
        onClick={handleClick}
        role="document"
        aria-label="Markdown preview"
        style={{
          willChange: 'scroll-position',
          contain: 'layout style paint',
        }}
      >
        <div className="zoom-wrapper">
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
    </div>
  );
};
