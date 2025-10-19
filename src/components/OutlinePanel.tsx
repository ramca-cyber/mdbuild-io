import { useEffect, useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { List } from 'lucide-react';

interface Heading {
  level: number;
  text: string;
  id: string;
}

export const OutlinePanel = () => {
  const { content } = useEditorStore();
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const lines = content.split('\n');
    const found: Heading[] = [];
    
    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        found.push({
          level: match[1].length,
          text: match[2],
          id: `heading-${index}`,
        });
      }
    });
    
    setHeadings(found);
  }, [content]);

  const scrollToHeading = (text: string) => {
    const previewElement = document.querySelector('.preview-content');
    if (previewElement) {
      const headingElements = previewElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const target = Array.from(headingElements).find(
        (el) => el.textContent?.trim() === text
      );
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  if (headings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
        <List className="w-12 h-12 mb-2 opacity-20" />
        <p className="text-sm">No headings found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-1">
        <h3 className="font-semibold mb-3 text-sm text-foreground">Table of Contents</h3>
        {headings.map((heading, index) => (
          <button
            key={index}
            onClick={() => scrollToHeading(heading.text)}
            className="block w-full text-left px-2 py-1.5 text-sm hover:bg-muted rounded transition-colors"
            style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}
          >
            <span className="text-muted-foreground mr-2">
              {heading.level === 1 && '▸'}
              {heading.level === 2 && '▹'}
              {heading.level >= 3 && '·'}
            </span>
            {heading.text}
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};
