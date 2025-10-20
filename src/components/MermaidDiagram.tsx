import { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { useEditorStore } from '@/store/editorStore';

interface MermaidDiagramProps {
  code: string;
}

export const MermaidDiagram = ({ code }: MermaidDiagramProps) => {
  const { theme, previewRefreshKey } = useEditorStore();
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const renderDiagram = async () => {
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
        const { svg: renderedSvg } = await mermaid.render(renderID, code);
        setSvg(renderedSvg);
        setError('');
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError('Error rendering diagram');
        setSvg('');
      }
    };

    renderDiagram();
  }, [code, theme, previewRefreshKey]);

  if (error) {
    return (
      <div className="mermaid-diagram-container text-destructive p-4 border border-destructive rounded">
        {error}
      </div>
    );
  }

  return (
    <div 
      className="mermaid-diagram-container"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};
