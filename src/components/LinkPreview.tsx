import { useState, useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';

export const LinkPreview = () => {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [url, setUrl] = useState<string>('');
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if hovering over a markdown link in the editor
      if (target.classList.contains('cm-link') || target.closest('.cm-link')) {
        const linkElement = target.classList.contains('cm-link') ? target : target.closest('.cm-link');
        if (linkElement) {
          // Extract URL from markdown link syntax
          const line = linkElement.closest('.cm-line');
          if (line) {
            const text = line.textContent || '';
            const linkMatch = text.match(/\[([^\]]+)\]\(([^)]+)\)/);
            if (linkMatch) {
              const linkUrl = linkMatch[2];
              setUrl(linkUrl);
              
              // Clear existing timeout
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
              
              // Show preview after short delay
              timeoutRef.current = setTimeout(() => {
                setPosition({ x: e.clientX, y: e.clientY + 20 });
                setVisible(true);
              }, 500);
              return;
            }
          }
        }
      }
      
      // Hide if not hovering over a link
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setVisible(false);
    };

    const handleMouseLeave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setVisible(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!visible || !position) return null;

  return (
    <div
      className="fixed z-50 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg px-3 py-2 max-w-md"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="flex items-center gap-2">
        <ExternalLink className="w-3 h-3 flex-shrink-0" />
        <span className="text-sm truncate">{url}</span>
      </div>
    </div>
  );
};
