import { useEffect, useState, useMemo, useRef } from 'react';
import mermaid from 'mermaid';
import { useEditorStore } from '@/store/editorStore';

interface MermaidDiagramProps {
  code: string;
  lineNumber?: number;
}

export const MermaidDiagram = ({ code, lineNumber }: MermaidDiagramProps) => {
  const { theme, addError, removeError } = useEditorStore();
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState<number>(0);
  const errorIdRef = useRef<string | null>(null);

  // Memoize code to prevent unnecessary re-renders
  const memoizedCode = useMemo(() => code.trim(), [code]);

  useEffect(() => {
    let isMounted = true;
    
    const renderDiagram = async () => {
      if (!memoizedCode) {
        setError('Empty diagram code');
        return;
      }

      try {
        // Initialize mermaid with theme-specific settings
        const isDark = theme === 'dark';
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: isDark ? 'dark' : 'default',
          themeVariables: isDark
            ? {
                background: 'transparent',
                mainBkg: '#1a2332',
                primaryColor: '#2d3748',
                secondaryColor: '#1a2332',
                tertiaryColor: '#151d28',
                textColor: '#f7f8f9',
                primaryTextColor: '#f7f8f9',
                lineColor: '#94a3b8',
                nodeBorder: '#4a5568',
                clusterBkg: '#1a2332',
                clusterBorder: '#4a5568',
                edgeLabelBackground: '#1a2332',
              }
            : {
                background: 'transparent',
                mainBkg: '#ffffff',
                primaryColor: '#f8fafc',
                secondaryColor: '#ffffff',
                tertiaryColor: '#f1f5f9',
                textColor: '#1a202c',
                primaryTextColor: '#1a202c',
                lineColor: '#4a5568',
                nodeBorder: '#cbd5e1',
                clusterBkg: '#ffffff',
                clusterBorder: '#cbd5e1',
                edgeLabelBackground: '#ffffff',
              },
        });

        // Render the diagram
        const renderID = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(renderID, memoizedCode);
        
        if (isMounted) {
          setSvg(renderedSvg);
          setError('');
          setRetryCount(0);
          // Clear error from store if it was previously added
          if (errorIdRef.current) {
            removeError(errorIdRef.current);
            errorIdRef.current = null;
          }
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          setError(`Failed to render diagram: ${errorMessage}`);
          setSvg('');
          
          // Only add error to store once
          if (errorIdRef.current === null) {
            const id = addError({
              type: 'error',
              category: 'mermaid',
              line: lineNumber,
              message: 'Mermaid diagram rendering failed',
              details: errorMessage
            });
            errorIdRef.current = id;
            
            // Log once using console.debug
            console.debug('Mermaid rendering error:', errorMessage);
          }
          
          // Smart retry logic: no retries for parse errors, max 2 for others
          const isParseError = /Parse error|Syntax error/i.test(errorMessage);
          if (!isParseError && retryCount < 2) {
            setTimeout(() => {
              if (isMounted) setRetryCount(prev => prev + 1);
            }, 500);
          }
        }
      }
    };

    renderDiagram();
    
    return () => {
      isMounted = false;
      // Clean up error when component unmounts
      if (errorIdRef.current) {
        removeError(errorIdRef.current);
      }
    };
  }, [memoizedCode, theme, retryCount, lineNumber, addError, removeError]);

  if (error) {
    return (
      <div 
        className="mermaid-diagram-container text-destructive p-4 border border-destructive rounded bg-destructive/10"
        role="alert"
        aria-live="polite"
      >
        <strong>Diagram Error:</strong> {error}
        {retryCount > 0 && <p className="text-sm mt-2">Retry attempt {retryCount}/2...</p>}
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="mermaid-diagram-container p-4 text-muted-foreground">
        Loading diagram...
      </div>
    );
  }

  return (
    <div 
      className="mermaid-diagram-container"
      dangerouslySetInnerHTML={{ __html: svg }}
      role="img"
      aria-label="Mermaid diagram"
    />
  );
};
