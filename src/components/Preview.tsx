import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkEmoji from 'remark-emoji';
import remarkFrontmatter from 'remark-frontmatter';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { useEditorStore } from '@/store/editorStore';
import mermaid from 'mermaid';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});

interface DiagramMetadata {
  code: string;
  containerId: string;
}

export const Preview = () => {
  const { content, theme, syncScroll } = useEditorStore();
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const diagramsRef = useRef<Map<string, DiagramMetadata>>(new Map());
  const renderingRef = useRef(false);

  // Unified function to render mermaid diagrams
  const renderMermaidDiagrams = async () => {
    if (!previewRef.current || renderingRef.current) return;
    
    renderingRef.current = true;
    
    try {
      const mermaidElements = previewRef.current.querySelectorAll('.language-mermaid');
      
      for (let index = 0; index < mermaidElements.length; index++) {
        const element = mermaidElements[index] as HTMLElement;
        const code = element.textContent || '';
        const containerId = `mermaid-container-${index}`;
        
        // Store metadata
        diagramsRef.current.set(containerId, { code, containerId });
        
        // Wrap in a container with stable ID
        const container = document.createElement('div');
        container.id = containerId;
        container.className = 'mermaid-diagram-container';
        element.parentNode?.replaceChild(container, element);
        
        try {
          const renderID = `mermaid-${Date.now()}-${index}`;
          const { svg } = await mermaid.render(renderID, code);
          container.innerHTML = svg;
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          container.innerHTML = `<div class="text-destructive">Error rendering diagram</div>`;
        }
      }
    } finally {
      renderingRef.current = false;
    }
  };

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
        button.onclick = () => {
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
        };
        pre.style.position = 'relative';
        pre.appendChild(button);
      }
    });
  };

  // Handle content changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        renderMermaidDiagrams();
        addCopyButtons();
      });
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [content, toast]);

  // Handle theme changes
  useEffect(() => {
    const isDark = theme === 'dark';
    
    // Update mermaid configuration
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: isDark ? 'dark' : 'default',
      themeVariables: isDark
        ? {
            background: 'transparent',
            mainBkg: '#111827',
            primaryColor: '#1f2937',
            secondaryColor: '#111827',
            tertiaryColor: '#0b1220',
            textColor: '#e5e7eb',
            primaryTextColor: '#e5e7eb',
            lineColor: '#94a3b8',
            nodeBorder: '#94a3b8',
            clusterBkg: '#111827',
            clusterBorder: '#94a3b8',
            edgeLabelBackground: '#111827',
          }
        : {
            background: 'transparent',
            mainBkg: '#ffffff',
            primaryColor: '#f8fafc',
            secondaryColor: '#f1f5f9',
            tertiaryColor: '#e2e8f0',
            textColor: '#0f172a',
            primaryTextColor: '#0f172a',
            lineColor: '#334155',
            nodeBorder: '#94a3b8',
            clusterBkg: '#f8fafc',
            clusterBorder: '#cbd5e1',
            edgeLabelBackground: '#f8fafc',
          },
    });

    // Re-render existing diagrams with new theme
    const timeoutId = setTimeout(() => {
      const reRenderDiagrams = async () => {
        if (!previewRef.current || renderingRef.current) return;
        
        renderingRef.current = true;
        
        try {
          const containers = previewRef.current.querySelectorAll('.mermaid-diagram-container');
          
          for (let index = 0; index < containers.length; index++) {
            const container = containers[index] as HTMLElement;
            const containerId = container.id;
            const metadata = diagramsRef.current.get(containerId);
            
            if (!metadata || !metadata.code) continue;
            
            try {
              const renderID = `mermaid-theme-${Date.now()}-${index}`;
              const { svg } = await mermaid.render(renderID, metadata.code);
              if (container && container.parentNode) {
                container.innerHTML = svg;
              }
            } catch (e) {
              console.error('Mermaid re-render error:', e);
            }
          }
        } finally {
          renderingRef.current = false;
        }
      };

      requestAnimationFrame(() => {
        reRenderDiagrams();
      });
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [theme]);

  // Listen to editor scroll events
  useEffect(() => {
    if (!syncScroll || !previewRef.current) return;

    const handleEditorScroll = (e: Event) => {
      const customEvent = e as CustomEvent;
      const scrollPercentage = customEvent.detail;
      if (previewRef.current) {
        const maxScroll = previewRef.current.scrollHeight - previewRef.current.clientHeight;
        previewRef.current.scrollTop = maxScroll * scrollPercentage;
      }
    };

    window.addEventListener('editor-scroll', handleEditorScroll);
    return () => window.removeEventListener('editor-scroll', handleEditorScroll);
  }, [syncScroll]);

  // Dispatch preview scroll events for bidirectional sync
  useEffect(() => {
    if (!syncScroll || !previewRef.current) return;

    const preview = previewRef.current;
    const handleScroll = () => {
      const maxScroll = preview.scrollHeight - preview.clientHeight;
      if (maxScroll > 0) {
        const scrollPercentage = preview.scrollTop / maxScroll;
        window.dispatchEvent(new CustomEvent('preview-scroll', { detail: scrollPercentage }));
      }
    };

    preview.addEventListener('scroll', handleScroll);
    return () => preview.removeEventListener('scroll', handleScroll);
  }, [syncScroll]);

  return (
    <div 
      ref={previewRef}
      className="h-full w-full overflow-auto bg-preview-bg p-8"
    >
      <article className="prose prose-slate dark:prose-invert max-w-none preview-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath, remarkEmoji, remarkFrontmatter]}
          rehypePlugins={[rehypeKatex, rehypeHighlight]}
          components={{
          code({ className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              const isInline = !match;
              
              if (!isInline && match?.[1] === 'mermaid') {
                return (
                  <div className="language-mermaid">
                    <code>{children}</code>
                  </div>
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
      </article>
    </div>
  );
};
