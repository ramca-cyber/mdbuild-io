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
  FileDown,
  FileUp,
  Moon,
  Sun,
  Eye,
  EyeOff,
  SplitSquareHorizontal,
  Save,
  Settings,
  BookTemplate,
  ListTree,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useEditorStore } from '@/store/editorStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { SettingsSheet } from '@/components/SettingsSheet';
import { TemplatesDrawer } from '@/components/TemplatesDrawer';
import { SavedDocuments } from '@/components/SavedDocuments';
import { toast } from 'sonner';
import React from 'react';

export const Toolbar = () => {
  const { 
    theme, 
    setTheme, 
    viewMode, 
    setViewMode, 
    content, 
    setContent, 
    showOutline,
    setShowOutline,
    saveDocument,
  } = useEditorStore();

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

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported as Markdown');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setContent(text);
          toast.success('File imported successfully');
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const cycleViewMode = () => {
    const modes: Array<'split' | 'editor' | 'preview'> = ['split', 'editor', 'preview'];
    const currentIndex = modes.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setViewMode(modes[nextIndex]);
  };

  const handleSave = () => {
    const title = content.match(/^#\s+(.+)$/m)?.[1] || 'Untitled';
    saveDocument(title);
    toast.success('Document saved successfully');
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

  return (
    <div className="flex items-center gap-2 px-2 sm:px-4 py-2 bg-toolbar-bg border-b border-border overflow-x-auto">
      {/* Save & Documents */}
      <div className="hidden lg:flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSave}
          title="Save Document (Ctrl+S)"
        >
          <Save className="h-4 w-4" />
        </Button>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" title="Saved Documents">
              <FileText className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Saved Documents</SheetTitle>
            </SheetHeader>
            <SavedDocuments />
          </SheetContent>
        </Sheet>

        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" title="Templates">
              <BookTemplate className="h-4 w-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Templates</DrawerTitle>
            </DrawerHeader>
            <div className="max-h-[60vh]">
              <TemplatesDrawer />
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      <Separator orientation="vertical" className="h-6 hidden lg:block" />

      {/* Formatting */}
      <div className="flex items-center gap-1">
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
          onClick={() => insertText('`', '`', 'code')}
          title="Code"
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => insertText('# ', '', 'Heading 1')}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => insertText('## ', '', 'Heading 2')}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
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

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => insertText('- ', '', 'list item')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => insertText('1. ', '', 'list item')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => insertText('- [ ] ', '', 'task')}
          title="Task List"
        >
          <CheckSquare className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => insertText('> ', '', 'quote')}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => insertBlock('| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |')}
          title="Table"
        >
          <Table className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => insertBlock('---')}
          title="Horizontal Rule"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1" />

      {/* View & Settings */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowOutline(!showOutline)}
          title="Toggle Outline"
          className="hidden lg:flex"
        >
          <ListTree className={`h-4 w-4 ${showOutline ? 'text-primary' : ''}`} />
        </Button>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" title="Settings" className="hidden lg:flex">
              <Settings className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>Settings</SheetTitle>
            </SheetHeader>
            <SettingsSheet />
          </SheetContent>
        </Sheet>

        <Separator orientation="vertical" className="h-6" />
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleImport}
          title="Import File"
        >
          <FileUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleExport}
          title="Export Document"
        >
          <FileDown className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={cycleViewMode}
          title={`View: ${viewMode}`}
        >
          {viewMode === 'split' && <SplitSquareHorizontal className="h-4 w-4" />}
          {viewMode === 'editor' && <Eye className="h-4 w-4" />}
          {viewMode === 'preview' && <EyeOff className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
