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

export const Preview = () => {
  const { content, theme } = useEditorStore();
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (previewRef.current) {
      const mermaidElements = previewRef.current.querySelectorAll('.language-mermaid');
      mermaidElements.forEach(async (element, index) => {
        const code = element.textContent || '';
        const id = `mermaid-${Date.now()}-${index}`;
        
        try {
          const { svg } = await mermaid.render(id, code);
          element.innerHTML = svg;
          element.classList.remove('language-mermaid');
          element.classList.add('mermaid-diagram');
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          element.innerHTML = `<div class="text-destructive">Error rendering diagram</div>`;
        }
      });

      // Add copy buttons to code blocks
      const codeBlocks = previewRef.current.querySelectorAll('pre');
      codeBlocks.forEach((pre) => {
        if (pre.querySelector('.copy-button')) return;
        
        const code = pre.querySelector('code');
        if (code && !code.classList.contains('mermaid-diagram')) {
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
    }
  }, [content, toast]);

  useEffect(() => {
    if (theme === 'dark') {
      mermaid.initialize({ theme: 'dark' });
    } else {
      mermaid.initialize({ theme: 'default' });
    }
  }, [theme]);

  return (
    <div 
      ref={previewRef}
      className="h-full w-full overflow-auto bg-preview-bg p-8 preview-content"
    >
      <article className="prose prose-slate dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath, remarkEmoji, remarkFrontmatter]}
          rehypePlugins={[rehypeKatex, rehypeHighlight]}
          components={{
          code({ className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              const isInline = !match;
              
              if (!isInline && match?.[1] === 'mermaid') {
                return (
                  <pre className="language-mermaid">
                    <code>{children}</code>
                  </pre>
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
