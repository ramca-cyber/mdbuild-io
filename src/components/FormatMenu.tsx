import { useEditorStore } from '@/store/editorStore';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { WrapText, Hash, ZoomIn, ZoomOut, RotateCcw, Type, Eraser } from 'lucide-react';
import { toast } from 'sonner';

export function FormatMenu() {
  const { lineWrap, setLineWrap, lineNumbers, setLineNumbers, content, setContent, zoomIn, zoomOut, resetZoom } = useEditorStore();

  const handleConvertCase = (caseType: 'upper' | 'lower' | 'title') => {
    window.dispatchEvent(
      new CustomEvent('editor-convert-case', {
        detail: { caseType },
      })
    );
  };

  const handleTextCleanup = (cleanupType: 'trailing' | 'empty' | 'trim') => {
    let newContent = content;
    
    switch (cleanupType) {
      case 'trailing':
        newContent = content.split('\n').map(line => line.trimEnd()).join('\n');
        toast.success('Removed trailing spaces');
        break;
      case 'empty':
        newContent = content.split('\n').filter(line => line.trim() !== '').join('\n');
        toast.success('Removed empty lines');
        break;
      case 'trim':
        newContent = content.split('\n').map(line => line.trim()).join('\n');
        toast.success('Trimmed whitespace');
        break;
    }
    
    setContent(newContent);
  };

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';

  return (
    <Menubar className="border-0 bg-transparent p-0 h-auto">
      <MenubarMenu>
        <MenubarTrigger className="cursor-pointer px-3 py-1.5 text-sm font-medium">
          Format
        </MenubarTrigger>
        <MenubarContent className="min-w-[200px]">
          <MenubarItem onClick={() => setLineWrap(!lineWrap)}>
            <WrapText className="h-4 w-4 mr-2" />
            Word Wrap {lineWrap && '✓'}
          </MenubarItem>
          <MenubarItem onClick={() => setLineNumbers(!lineNumbers)}>
            <Hash className="h-4 w-4 mr-2" />
            Line Numbers {lineNumbers && '✓'}
          </MenubarItem>
          
          <MenubarSeparator />
          
          <MenubarSub>
            <MenubarSubTrigger>
              <ZoomIn className="h-4 w-4 mr-2" />
              Zoom
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={zoomIn}>
                <ZoomIn className="h-4 w-4 mr-2" />
                Zoom In
                <MenubarShortcut>{modKey}++</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={zoomOut}>
                <ZoomOut className="h-4 w-4 mr-2" />
                Zoom Out
                <MenubarShortcut>{modKey}+-</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={resetZoom}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Zoom
                <MenubarShortcut>{modKey}+0</MenubarShortcut>
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          
          <MenubarSeparator />
          
          <MenubarSub>
            <MenubarSubTrigger>
              <Type className="h-4 w-4 mr-2" />
              Convert Case
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={() => handleConvertCase('upper')}>
                UPPERCASE
              </MenubarItem>
              <MenubarItem onClick={() => handleConvertCase('lower')}>
                lowercase
              </MenubarItem>
              <MenubarItem onClick={() => handleConvertCase('title')}>
                Title Case
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          
          <MenubarSeparator />
          
          <MenubarSub>
            <MenubarSubTrigger>
              <Eraser className="h-4 w-4 mr-2" />
              Text Cleanup
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={() => handleTextCleanup('trailing')}>
                Remove Trailing Spaces
              </MenubarItem>
              <MenubarItem onClick={() => handleTextCleanup('empty')}>
                Remove Empty Lines
              </MenubarItem>
              <MenubarItem onClick={() => handleTextCleanup('trim')}>
                Trim Whitespace
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
