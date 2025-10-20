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

  const insertText = (before: string, after: string = '', placeholder: string = 'text') => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    setContent(newText);
  };

  const insertBlock = (text: string) => {
    setContent(content + '\n\n' + text + '\n\n');
  };

  const handleViewMode = (mode: 'split' | 'editor' | 'preview') => {
    setViewMode(mode);
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          insertBlock(`![${file.name}](${dataUrl})`);
          toast.success('Image uploaded');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2 px-2 sm:px-4 py-2 bg-toolbar-bg border-b border-border overflow-x-auto no-print">
      {/* LEFT SIDE: Content Formatting - Always visible on desktop */}
      <div className="hidden sm:flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => insertText('**', '**', 'bold')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => insertText('*', '*', 'italic')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => insertText('~~', '~~', 'strikethrough')}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => insertText('`', '`', 'code')}
          title="Code"
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 hidden sm:block" />

      {/* Headings */}
      <div className="hidden sm:flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="Headings">
              <Heading className="h-4 w-4" />
              <ChevronDown className="h-3 w-3 -ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-popover">
            <DropdownMenuItem onClick={() => insertText('# ', '', 'Heading 1')}>
              <Heading1 className="h-4 w-4 mr-2" />
              Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertText('## ', '', 'Heading 2')}>
              <Heading2 className="h-4 w-4 mr-2" />
              Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertText('### ', '', 'Heading 3')}>
              <Heading className="h-4 w-4 mr-2" />
              Heading 3
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertText('#### ', '', 'Heading 4')}>
              <Heading className="h-4 w-4 mr-2" />
              Heading 4
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertText('##### ', '', 'Heading 5')}>
              <Heading className="h-4 w-4 mr-2" />
              Heading 5
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertText('###### ', '', 'Heading 6')}>
              <Heading className="h-4 w-4 mr-2" />
              Heading 6
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator orientation="vertical" className="h-6 hidden sm:block" />

      {/* Link & Image */}
      <div className="hidden sm:flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => insertText('[', '](url)', 'link text')}
          title="Link"
        >
          <Link2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleImageUpload}
          title="Upload Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 hidden sm:block" />

      {/* Lists Dropdown */}
      <div className="hidden sm:flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="Lists">
              <List className="h-4 w-4" />
              <ChevronDown className="h-3 w-3 -ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-popover">
            <DropdownMenuItem onClick={() => insertText('- ', '', 'list item')}>
              <List className="h-4 w-4 mr-2" />
              Bullet List
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertText('1. ', '', 'list item')}>
              <ListOrdered className="h-4 w-4 mr-2" />
              Numbered List
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertText('- [ ] ', '', 'task')}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Task List
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator orientation="vertical" className="h-6 hidden sm:block" />

      {/* Insert Elements Dropdown */}
      <div className="hidden sm:flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="Insert">
              <Plus className="h-4 w-4" />
              <ChevronDown className="h-3 w-3 -ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-popover">
            <DropdownMenuItem onClick={() => insertText('> ', '', 'quote')}>
              <Quote className="h-4 w-4 mr-2" />
              Quote
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertBlock('| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |')}>
              <Table className="h-4 w-4 mr-2" />
              Table
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertBlock('---')}>
              <Minus className="h-4 w-4 mr-2" />
              Horizontal Rule
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertBlock('```\ncode\n```')}>
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
          onClick={() => insertText('**', '**', 'bold')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => insertText('*', '*', 'italic')}
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
            <DropdownMenuItem onClick={() => insertText('# ', '', 'Heading 1')}>
              <Heading1 className="h-4 w-4 mr-2" />
              Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertText('## ', '', 'Heading 2')}>
              <Heading2 className="h-4 w-4 mr-2" />
              Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertText('### ', '', 'Heading 3')}>
              <Heading className="h-4 w-4 mr-2" />
              Heading 3
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => insertText('[', '](url)', 'link text')}
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
            <DropdownMenuItem onClick={() => insertText('- ', '', 'list item')}>
              <List className="h-4 w-4 mr-2" />
              Bullet List
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertText('1. ', '', 'list item')}>
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
                  insertText('~~', '~~', 'strikethrough');
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
                  insertText('`', '`', 'code');
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
                  insertText('> ', '', 'quote');
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
                  insertBlock('| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |');
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
                  insertText('- [ ] ', '', 'task');
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
      <div className="flex items-center gap-1">
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

        {/* View Mode Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="View Mode">
              {viewMode === 'split' && <SplitSquareHorizontal className="h-4 w-4" />}
              {viewMode === 'editor' && <Eye className="h-4 w-4" />}
              {viewMode === 'preview' && <Eye className="h-4 w-4" />}
              <ChevronDown className="h-3 w-3 -ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover">
            <DropdownMenuItem onClick={() => handleViewMode('split')}>
              <SplitSquareHorizontal className="h-4 w-4 mr-2" />
              Split View
              {viewMode === 'split' && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleViewMode('editor')}>
              <Eye className="h-4 w-4 mr-2" />
              Editor Only
              {viewMode === 'editor' && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleViewMode('preview')}>
              <Eye className="h-4 w-4 mr-2" />
              Preview Only
              {viewMode === 'preview' && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-6" />

        <Button
          variant={focusMode ? "default" : "ghost"}
          size="icon"
          onClick={() => setFocusMode(!focusMode)}
          title={focusMode ? "Exit Focus Mode (Esc)" : "Focus Mode (F11)"}
        >
          {focusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrint}
          title="Print (Ctrl+P)"
        >
          <Printer className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
