import { useEffect, useState, useRef } from 'react';
import { Bold, Italic, Code, Link, Strikethrough } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InsertLinkDialog } from '@/components/InsertLinkDialog';

interface FloatingToolbarProps {
  onFormat: (before: string, after: string, placeholder: string) => void;
}

export const FloatingToolbar = ({ onFormat }: FloatingToolbarProps) => {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setVisible(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const selectedText = selection.toString().trim();

      // Only show if text is selected and it's in the editor
      const container = range.commonAncestorContainer;
      const isInEditor = container.nodeType === Node.TEXT_NODE 
        ? container.parentElement?.closest('.cm-content')
        : (container as Element).closest('.cm-content');

      if (selectedText && isInEditor) {
        const rect = range.getBoundingClientRect();
        const toolbarWidth = 240; // Approximate width
        const toolbarHeight = 48; // Approximate height
        
        const calcX = rect.left + rect.width / 2 - toolbarWidth / 2;
        const calcY = rect.top - toolbarHeight - 8;
        setPosition({
          x: Math.max(8, Math.min(window.innerWidth - toolbarWidth - 8, calcX)),
          y: calcY < 8 ? rect.bottom + 8 : calcY,
        });
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    const handleMouseUp = () => {
      setTimeout(handleSelectionChange, 10);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setVisible(false);
      } else {
        setTimeout(handleSelectionChange, 10);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        const selection = window.getSelection();
        if (selection && selection.toString().trim() === '') {
          setVisible(false);
        }
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [visible]);

  const handleFormat = (before: string, after: string, placeholder: string) => {
    onFormat(before, after, placeholder);
    setVisible(false);
  };

  const handleLinkInsert = () => {
    setLinkDialogOpen(true);
  };

  const onLinkInsert = (url: string, text: string) => {
    onFormat('[', `](${url})`, text || 'link text');
    setVisible(false);
  };

  if (!visible || !position) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="flex items-center gap-1 p-1 rounded-lg border bg-popover shadow-lg">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleFormat('**', '**', 'bold text')}
              >
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bold <kbd className="ml-1">Ctrl+B</kbd></p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleFormat('*', '*', 'italic text')}
              >
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Italic <kbd className="ml-1">Ctrl+I</kbd></p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleFormat('~~', '~~', 'strikethrough')}
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Strikethrough</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleFormat('`', '`', 'code')}
              >
                <Code className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Code</p>
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleLinkInsert}
              >
                <Link className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Link <kbd className="ml-1">Ctrl+K</kbd></p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <InsertLinkDialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen} onInsert={onLinkInsert} mode="link" />
    </div>
  );
};
