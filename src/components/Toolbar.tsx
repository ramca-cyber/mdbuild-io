import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Link2, 
  Image as ImageIcon, 
  List, 
  ListOrdered,
  CheckSquare,
  Code,
  Quote,
  Table,
  Minus,
  Eye,
  SplitSquareHorizontal,
  ListTree,
  Link,
  Strikethrough,
  Heading,
  ChevronDown,
  Printer,
  Maximize2,
  Minimize2,
  Plus,
  MoreHorizontal,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { useEditorStore } from '@/store/editorStore';
import { toast } from 'sonner';
import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ViewModeSwitcher } from '@/components/ViewModeSwitcher';

export const Toolbar = () => {
  const { 
    viewMode, 
    setViewMode, 
    content, 
    setContent, 
    showOutline,
    setShowOutline,
    focusMode,
    setFocusMode,
    syncScroll,
    setSyncScroll,
  } = useEditorStore();

  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

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

  const handleViewMode = (mode: 'split' | 'editor' | 'preview') => {
    setViewMode(mode);
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2 px-2 sm:px-4 py-2 bg-toolbar-bg border-b border-border overflow-x-auto no-print">
      {/* LEFT SIDE: Content Formatting - Always visible on desktop */}
      <div className="hidden sm:flex items-center gap-1 bg-muted/30 rounded-md px-2 py-1 border border-border/50">
        <span className="text-xs font-semibold text-muted-foreground mr-1 hidden md:inline">Format</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatchWrap('**', '**', 'bold')}
          title="Bold (Ctrl+B)"
          aria-label="Bold formatting"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatchWrap('*', '*', 'italic')}
          title="Italic (Ctrl+I)"
          aria-label="Italic formatting"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatchWrap('~~', '~~', 'strikethrough')}
          title="Strikethrough"
          aria-label="Strikethrough formatting"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatchWrap('`', '`', 'code')}
          title="Inline Code"
          aria-label="Inline code formatting"
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 hidden sm:block mx-1" />

      {/* Headings */}
      <div className="hidden sm:flex items-center gap-1 bg-muted/30 rounded-md px-2 py-1 border border-border/50">
        <span className="text-xs font-semibold text-muted-foreground mr-1 hidden md:inline">Structure</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="Insert Heading" aria-label="Insert heading">
              <Heading className="h-4 w-4" />
              <ChevronDown className="h-3 w-3 -ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-popover">
            <DropdownMenuItem onClick={() => dispatchWrap('# ', '', 'Heading 1')}>
              <Heading1 className="h-4 w-4 mr-2" />
              Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => dispatchWrap('## ', '', 'Heading 2')}>
              <Heading2 className="h-4 w-4 mr-2" />
              Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => dispatchWrap('### ', '', 'Heading 3')}>
              <Heading className="h-4 w-4 mr-2" />
              Heading 3
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => dispatchWrap('#### ', '', 'Heading 4')}>
              <Heading className="h-4 w-4 mr-2" />
              Heading 4
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => dispatchWrap('##### ', '', 'Heading 5')}>
              <Heading className="h-4 w-4 mr-2" />
              Heading 5
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => dispatchWrap('###### ', '', 'Heading 6')}>
              <Heading className="h-4 w-4 mr-2" />
              Heading 6
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator orientation="vertical" className="h-6 hidden sm:block mx-1" />

      {/* Lists Dropdown */}
      <div className="hidden sm:flex items-center gap-1 bg-muted/30 rounded-md px-2 py-1 border border-border/50">
        <span className="text-xs font-semibold text-muted-foreground mr-1 hidden md:inline">Lists</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="Insert List" aria-label="Insert list">
              <List className="h-4 w-4" />
              <ChevronDown className="h-3 w-3 -ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-popover">
            <DropdownMenuItem onClick={() => dispatchWrap('- ', '', 'list item')}>
              <List className="h-4 w-4 mr-2" />
              Bullet List
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => dispatchWrap('1. ', '', 'list item')}>
              <ListOrdered className="h-4 w-4 mr-2" />
              Numbered List
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => dispatchWrap('- [ ] ', '', 'task')}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Task List
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator orientation="vertical" className="h-6 hidden sm:block mx-1" />

      {/* Insert Elements Dropdown */}
      <div className="hidden sm:flex items-center gap-1 bg-muted/30 rounded-md px-2 py-1 border border-border/50">
        <span className="text-xs font-semibold text-muted-foreground mr-1 hidden md:inline">Insert</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="Insert Elements" aria-label="Insert elements menu">
              <Plus className="h-4 w-4" />
              <ChevronDown className="h-3 w-3 -ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-popover">
            <DropdownMenuItem onClick={handleLinkInsert}>
              <Link2 className="h-4 w-4 mr-2" />
              Link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleImageUpload}>
              <ImageIcon className="h-4 w-4 mr-2" />
              Image
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => dispatchWrap('> ', '', 'quote')}>
              <Quote className="h-4 w-4 mr-2" />
              Quote
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => dispatchBlock('| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |')}>
              <Table className="h-4 w-4 mr-2" />
              Table
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => dispatchBlock('---')}>
              <Minus className="h-4 w-4 mr-2" />
              Horizontal Rule
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => dispatchBlock('```\ncode\n```')}>
              <Code className="h-4 w-4 mr-2" />
              Code Block
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile: Essential buttons + More menu */}
      <div className="flex sm:hidden items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatchWrap('**', '**', 'bold')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatchWrap('*', '*', 'italic')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="Headings">
              <Heading className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-popover">
            <DropdownMenuItem onClick={() => dispatchWrap('# ', '', 'Heading 1')}>
              <Heading1 className="h-4 w-4 mr-2" />
              Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => dispatchWrap('## ', '', 'Heading 2')}>
              <Heading2 className="h-4 w-4 mr-2" />
              Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => dispatchWrap('### ', '', 'Heading 3')}>
              <Heading className="h-4 w-4 mr-2" />
              Heading 3
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLinkInsert}
          title="Link"
        >
          <Link2 className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="Lists">
              <List className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-popover">
            <DropdownMenuItem onClick={() => dispatchWrap('- ', '', 'list item')}>
              <List className="h-4 w-4 mr-2" />
              Bullet List
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => dispatchWrap('1. ', '', 'list item')}>
              <ListOrdered className="h-4 w-4 mr-2" />
              Numbered List
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Sheet open={mobileMoreOpen} onOpenChange={setMobileMoreOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" title="More">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[400px]">
            <SheetHeader>
              <SheetTitle>More Formatting</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button
                variant="outline"
                className="h-16 flex-col gap-1"
                onClick={() => {
                  dispatchWrap('~~', '~~', 'strikethrough');
                  setMobileMoreOpen(false);
                }}
              >
                <Strikethrough className="h-5 w-5" />
                <span className="text-xs">Strikethrough</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex-col gap-1"
                onClick={() => {
                  dispatchWrap('`', '`', 'code');
                  setMobileMoreOpen(false);
                }}
              >
                <Code className="h-5 w-5" />
                <span className="text-xs">Code</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex-col gap-1"
                onClick={() => {
                  handleImageUpload();
                  setMobileMoreOpen(false);
                }}
              >
                <ImageIcon className="h-5 w-5" />
                <span className="text-xs">Image</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex-col gap-1"
                onClick={() => {
                  dispatchWrap('> ', '', 'quote');
                  setMobileMoreOpen(false);
                }}
              >
                <Quote className="h-5 w-5" />
                <span className="text-xs">Quote</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex-col gap-1"
                onClick={() => {
                  dispatchBlock('| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |');
                  setMobileMoreOpen(false);
                }}
              >
                <Table className="h-5 w-5" />
                <span className="text-xs">Table</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex-col gap-1"
                onClick={() => {
                  dispatchWrap('- [ ] ', '', 'task');
                  setMobileMoreOpen(false);
                }}
              >
                <CheckSquare className="h-5 w-5" />
                <span className="text-xs">Task List</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex-1" />

      {/* RIGHT SIDE: View & Settings */}
      <div className="flex items-center gap-1 bg-muted/30 rounded-md px-2 py-1 border border-border/50">
        <span className="text-xs font-semibold text-muted-foreground mr-1 hidden md:inline">Tools</span>
        
        <ViewModeSwitcher />
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Toggle
          pressed={showOutline}
          onPressedChange={setShowOutline}
          aria-label="Toggle Outline"
          title="Toggle Outline"
          className="hidden lg:flex"
          size="sm"
        >
          <ListTree className="h-4 w-4" />
        </Toggle>
        
        <Toggle
          pressed={syncScroll}
          onPressedChange={setSyncScroll}
          aria-label="Toggle Synced Scrolling"
          title="Toggle Synced Scrolling"
          size="sm"
          className={syncScroll ? "bg-primary/20" : ""}
        >
          <Link className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="h-6" />

        <Button
          variant={focusMode ? "default" : "ghost"}
          size="icon"
          onClick={() => setFocusMode(!focusMode)}
          title={focusMode ? "Exit Focus Mode (Esc)" : "Focus Mode (F11)"}
          aria-label={focusMode ? "Exit focus mode" : "Enter focus mode"}
          aria-pressed={focusMode}
        >
          {focusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrint}
          title="Print Document (Ctrl+P)"
          aria-label="Print document"
        >
          <Printer className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
