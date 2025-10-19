import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Link2, 
  Image, 
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
  SplitSquareHorizontal,
  Save,
  Settings,
  Share2,
  FileText,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useEditorStore } from '@/store/editorStore';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShareDialog } from './ShareDialog';
import { useState } from 'react';
import jsPDF from 'jspdf';

export const EnhancedToolbar = () => {
  const { theme, setTheme, viewMode, setViewMode, content, setContent, saveDocument } = useEditorStore();
  const { toast } = useToast();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [documentName, setDocumentName] = useState('');

  const insertText = (before: string, after: string = '', placeholder: string = 'text') => {
    const textarea = document.querySelector('.cm-content') as HTMLElement;
    if (textarea) {
      const selection = window.getSelection();
      const selectedText = selection?.toString() || placeholder;
      const newText = before + selectedText + after;
      
      document.execCommand('insertText', false, newText);
    }
  };

  const insertBlock = (text: string) => {
    setContent(content + '\n\n' + text + '\n\n');
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'Exported!',
      description: 'Markdown file downloaded',
    });
  };

  const handleExportHTML = () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Exported Document</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">
  <style>
    body { max-width: 800px; margin: 40px auto; padding: 20px; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 16px; border-radius: 6px; overflow-x: auto; }
  </style>
</head>
<body>
  ${document.querySelector('.preview-content')?.innerHTML || ''}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'Exported!',
      description: 'HTML file downloaded',
    });
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const text = content.replace(/[#*`_\[\]]/g, '');
      const lines = doc.splitTextToSize(text, 180);
      doc.text(lines, 15, 15);
      doc.save('document.pdf');
      toast({
        title: 'Exported!',
        description: 'PDF file downloaded',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export PDF',
        variant: 'destructive',
      });
    }
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
          toast({
            title: 'Imported!',
            description: 'File loaded successfully',
          });
        };
        reader.readAsText(file);
      }
    };
    input.click();
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
          const base64 = e.target?.result as string;
          insertBlock(`![Image](${base64})`);
          toast({
            title: 'Image added!',
            description: 'Image embedded as base64',
          });
        };
        reader.readAsDataURL(file);
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
    if (documentName.trim()) {
      saveDocument(documentName);
      toast({
        title: 'Saved!',
        description: `Document "${documentName}" saved`,
      });
      setSaveDialogOpen(false);
      setDocumentName('');
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-toolbar-bg border-b border-border overflow-x-auto">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => insertText('**', '**', 'bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => insertText('*', '*', 'italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => insertText('`', '`', 'code')}
          title="Code (Ctrl+`)"
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
          title="Link (Ctrl+K)"
        >
          <Link2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleImageUpload}
          title="Upload Image"
        >
          <Image className="h-4 w-4" />
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

      <div className="flex items-center gap-1">
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" title="Save Document">
              <Save className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="doc-name">Document Name</Label>
                <Input
                  id="doc-name"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="My Document"
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" title="Share">
              <Share2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Document</DialogTitle>
            </DialogHeader>
            <ShareDialog />
          </DialogContent>
        </Dialog>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleImport}
          title="Import File"
        >
          <FileUp className="h-4 w-4" />
        </Button>

        <div className="relative group">
          <Button variant="ghost" size="icon" title="Export">
            <FileDown className="h-4 w-4" />
          </Button>
          <div className="absolute right-0 top-full mt-1 bg-popover border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[120px]">
            <button
              onClick={handleExportMarkdown}
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
            >
              Markdown
            </button>
            <button
              onClick={handleExportHTML}
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
            >
              HTML
            </button>
            <button
              onClick={handleExportPDF}
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
            >
              PDF
            </button>
          </div>
        </div>

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
          {viewMode === 'editor' && <FileText className="h-4 w-4" />}
          {viewMode === 'preview' && <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
