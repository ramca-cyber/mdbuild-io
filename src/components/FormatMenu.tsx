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
import { 
  WrapText, Hash, ZoomIn, ZoomOut, RotateCcw, Type, Eraser,
  Bold, Italic, Strikethrough, Code, Heading, Heading1, Heading2,
  List, ListOrdered, CheckSquare, Link2, Image as ImageIcon,
  Quote, Table, Minus
} from 'lucide-react';
import { toast } from 'sonner';

export function FormatMenu() {
  const { lineWrap, setLineWrap, lineNumbers, setLineNumbers, content, setContent, zoomIn, zoomOut, resetZoom, fontSize, setFontSize } = useEditorStore();

  // Dispatch wrap insertion (for inline formatting)
  const dispatchWrap = (before: string, after: string = '', placeholder: string = 'text') => {
    window.dispatchEvent(new CustomEvent('editor-insert', { 
      detail: { kind: 'wrap', before, after, placeholder } 
    }));
  };

  // Dispatch block insertion (for block elements)
  const dispatchBlock = (block: string) => {
    window.dispatchEvent(new CustomEvent('editor-insert', { 
      detail: { kind: 'block', block } 
    }));
  };

  const handleLinkInsert = () => {
    try {
      const url = prompt('Enter link URL:', 'https://');
      if (url && url.trim()) {
        const linkText = prompt('Enter link text (or leave empty to use URL):', '');
        const text = linkText?.trim() || url.trim();
        dispatchWrap('[', `](${url.trim()})`, text);
        toast.success('Link inserted successfully');
      }
    } catch (error) {
      console.error('Error inserting link:', error);
      toast.error('Failed to insert link. Please try again.');
    }
  };

  const handleImageUpload = () => {
    try {
      const url = prompt('Enter image URL:', 'https://');
      if (url && url.trim()) {
        const altText = prompt('Enter image description (optional):', 'image');
        dispatchBlock(`![${altText || 'image'}](${url.trim()})`);
        toast.success('Image inserted successfully');
      }
    } catch (error) {
      console.error('Error inserting image:', error);
      toast.error('Failed to insert image. Please try again.');
    }
  };

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

  const handleIncreaseFontSize = () => {
    if (fontSize < 24) {
      setFontSize(fontSize + 1);
      toast.success(`Font size: ${fontSize + 1}px`);
    }
  };

  const handleDecreaseFontSize = () => {
    if (fontSize > 12) {
      setFontSize(fontSize - 1);
      toast.success(`Font size: ${fontSize - 1}px`);
    }
  };

  const handleResetFontSize = () => {
    setFontSize(16);
    toast.success('Font size reset to 16px');
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
          
          <MenubarItem onClick={() => dispatchWrap('**', '**', 'bold')}>
            <Bold className="h-4 w-4 mr-2" />
            Bold
            <MenubarShortcut>{modKey}+B</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={() => dispatchWrap('*', '*', 'italic')}>
            <Italic className="h-4 w-4 mr-2" />
            Italic
            <MenubarShortcut>{modKey}+I</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={() => dispatchWrap('~~', '~~', 'strikethrough')}>
            <Strikethrough className="h-4 w-4 mr-2" />
            Strikethrough
          </MenubarItem>
          <MenubarItem onClick={() => dispatchWrap('`', '`', 'code')}>
            <Code className="h-4 w-4 mr-2" />
            Inline Code
          </MenubarItem>
          
          <MenubarSeparator />
          
          <MenubarSub>
            <MenubarSubTrigger>
              <Heading className="h-4 w-4 mr-2" />
              Heading
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={() => dispatchWrap('# ', '', 'Heading 1')}>
                <Heading1 className="h-4 w-4 mr-2" />
                Heading 1
                <MenubarShortcut>{modKey}+1</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => dispatchWrap('## ', '', 'Heading 2')}>
                <Heading2 className="h-4 w-4 mr-2" />
                Heading 2
                <MenubarShortcut>{modKey}+2</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => dispatchWrap('### ', '', 'Heading 3')}>
                <Heading className="h-4 w-4 mr-2" />
                Heading 3
              </MenubarItem>
              <MenubarItem onClick={() => dispatchWrap('#### ', '', 'Heading 4')}>
                <Heading className="h-4 w-4 mr-2" />
                Heading 4
              </MenubarItem>
              <MenubarItem onClick={() => dispatchWrap('##### ', '', 'Heading 5')}>
                <Heading className="h-4 w-4 mr-2" />
                Heading 5
              </MenubarItem>
              <MenubarItem onClick={() => dispatchWrap('###### ', '', 'Heading 6')}>
                <Heading className="h-4 w-4 mr-2" />
                Heading 6
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          
          <MenubarSub>
            <MenubarSubTrigger>
              <List className="h-4 w-4 mr-2" />
              Lists
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={() => dispatchWrap('- ', '', 'list item')}>
                <List className="h-4 w-4 mr-2" />
                Bullet List
              </MenubarItem>
              <MenubarItem onClick={() => dispatchWrap('1. ', '', 'list item')}>
                <ListOrdered className="h-4 w-4 mr-2" />
                Numbered List
              </MenubarItem>
              <MenubarItem onClick={() => dispatchWrap('- [ ] ', '', 'task')}>
                <CheckSquare className="h-4 w-4 mr-2" />
                Task List
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          
          <MenubarSub>
            <MenubarSubTrigger>
              <ImageIcon className="h-4 w-4 mr-2" />
              Insert
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={handleLinkInsert}>
                <Link2 className="h-4 w-4 mr-2" />
                Link
                <MenubarShortcut>{modKey}+K</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={handleImageUpload}>
                <ImageIcon className="h-4 w-4 mr-2" />
                Image
              </MenubarItem>
              <MenubarItem onClick={() => dispatchWrap('> ', '', 'quote')}>
                <Quote className="h-4 w-4 mr-2" />
                Quote
              </MenubarItem>
              <MenubarItem onClick={() => dispatchBlock('| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |')}>
                <Table className="h-4 w-4 mr-2" />
                Table
              </MenubarItem>
              <MenubarItem onClick={() => dispatchBlock('---')}>
                <Minus className="h-4 w-4 mr-2" />
                Horizontal Rule
              </MenubarItem>
              <MenubarItem onClick={() => dispatchBlock('```\ncode\n```')}>
                <Code className="h-4 w-4 mr-2" />
                Code Block
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          
          <MenubarSeparator />
          
          <MenubarSub>
            <MenubarSubTrigger>
              <Type className="h-4 w-4 mr-2" />
              Text Size
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={handleIncreaseFontSize} disabled={fontSize >= 24}>
                <ZoomIn className="h-4 w-4 mr-2" />
                Increase Font Size
              </MenubarItem>
              <MenubarItem onClick={handleDecreaseFontSize} disabled={fontSize <= 12}>
                <ZoomOut className="h-4 w-4 mr-2" />
                Decrease Font Size
              </MenubarItem>
              <MenubarItem onClick={handleResetFontSize}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Font Size
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem disabled>
                Current: {fontSize}px
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          
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
