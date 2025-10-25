import mermaid from 'mermaid';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useErrorStore } from '@/store/errorStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Loader2 } from 'lucide-react';

interface MermaidDiagramProps {
  code: string;
  lineNumber?: number;
}

export const MermaidDiagram = ({ code, lineNumber }: MermaidDiagramProps) => {
  const { theme } = useSettingsStore();
  const { addError, removeError } = useErrorStore();
  const [svg, setSvg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const errorIdRef = useRef<string | null>(null);

  // Memoize code with hash to prevent unnecessary re-renders
  const memoizedCode = useMemo(() => code.trim(), [code]);
  const codeHash = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      hash = ((hash << 5) - hash) + code.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }, [code]);

  useEffect(() => {
    let isMounted = true;

    const renderDiagram = async () => {
      if (!memoizedCode || !isMounted) {
        return;
      }

      setIsLoading(true);

      try {
        // First, validate the diagram syntax using parse
        try {
          await mermaid.parse(memoizedCode);
        } catch (parseError) {
          // Syntax error detected - report it
          const errorMessage = parseError instanceof Error ? parseError.message : 'Syntax error in diagram';
          throw new Error(errorMessage);
        }

        // Initialize mermaid with theme-specific settings
        const isDark = theme === 'dark';
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          flowchart: {
            htmlLabels: true,
            curve: 'basis',
          },
          sequence: {
            diagramMarginX: 50,
            diagramMarginY: 10,
            actorMargin: 50,
            width: 150,
            height: 65,
            boxMargin: 10,
            boxTextMargin: 5,
            noteMargin: 10,
            messageMargin: 35,
          },
        });

        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(id, memoizedCode);

        if (isMounted) {
          setSvg(renderedSvg);
          setError('');
          setIsLoading(false);
          // Clear error from store if it was previously added
          if (errorIdRef.current) {
            removeError(errorIdRef.current);
            errorIdRef.current = null;
          }
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to render diagram';
          setError(errorMessage);
          setSvg('');
          setIsLoading(false);
          
          // Detect common issues and provide helpful suggestions
          let enhancedDetails = errorMessage;
          const codeLines = memoizedCode.toLowerCase();
          
          // Check if using old 'graph' syntax with newlines
          if (codeLines.includes('graph ') && memoizedCode.includes('\\n')) {
            enhancedDetails += '\n\n💡 Tip: You\'re using the old "graph" syntax with \\n for newlines. Use "flowchart" instead:\n- Change "graph TD" to "flowchart TD"\n- Or use <br> tags instead of \\n';
          }
          
          // Check for common bracket/parenthesis issues
          if (errorMessage.toLowerCase().includes('bracket') || errorMessage.toLowerCase().includes('parse')) {
            enhancedDetails += '\n\n💡 Tip: For labels with special characters:\n- Use quotes: A["Label (with parens)"]\n- Escape quotes inside: A["Label with \\"quotes\\""]\n- Use markdown strings: A[`**Bold** text`]';
          }
          
          // Add error to global error store
          const id = addError({
            type: 'error',
            category: 'mermaid',
            line: lineNumber,
            message: 'Mermaid diagram syntax error',
            details: enhancedDetails
          });
          errorIdRef.current = id;
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
      // Clean up error when component unmounts
      if (errorIdRef.current) {
        removeError(errorIdRef.current);
        errorIdRef.current = null;
      }
    };
  }, [codeHash, theme, lineNumber, memoizedCode, addError, removeError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Rendering diagram...</span>
      </div>
    );
  }

  if (error) {
    // Error is already reported to the error console, don't show inline
    return null;
  }

  if (!svg) {
    return null;
  }

  return (
    <div 
      className="mermaid-diagram-container" 
      dangerouslySetInnerHTML={{ __html: svg }}
      aria-label="Mermaid diagram"
      role="img"
    />
  );
};
