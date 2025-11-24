import { useEffect, useState } from 'react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { 
  Bold, Italic, Strikethrough, Code, Hash, List, ListTodo, 
  Link, Image, Table, Minus, FileDown, Save, Search, 
  Settings, Eye, FileText, Undo2, Redo2, Trash2, Copy,
  ZoomIn, ZoomOut, AlertCircle, FileCode, Quote, Plus, ArrowDown, ArrowUp,
  Columns, AlignCenter
} from 'lucide-react';
import { useEditorCommands } from '@/hooks/useEditorCommands';
import { useDocumentStore } from '@/store/documentStore';
import { useSearchStore } from '@/store/searchStore';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from 'sonner';

interface Command {
  icon: any;
  label: string;
  description: string;
  action: () => void;
  shortcut?: string;
}

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const { insertText, undo, redo, deleteLine, duplicateLine } = useEditorCommands();
  const { saveVersion } = useDocumentStore();
  const { setShowSearchReplace } = useSearchStore();
  const { zoomIn, zoomOut, resetZoom } = useSettingsStore();

  const handleExport = (format: string) => {
    window.dispatchEvent(new CustomEvent('export-document', { detail: { format } }));
    toast.success(`Exporting as ${format.toUpperCase()}...`);
  };

  const commands: Command[] = [
    // Formatting
    { icon: Bold, label: 'Bold', description: 'Make text bold', action: () => insertText('**', '**', 'bold text'), shortcut: 'Ctrl+B' },
    { icon: Italic, label: 'Italic', description: 'Make text italic', action: () => insertText('*', '*', 'italic text'), shortcut: 'Ctrl+I' },
    { icon: Strikethrough, label: 'Strikethrough', description: 'Strike through text', action: () => insertText('~~', '~~', 'strikethrough') },
    { icon: Code, label: 'Inline Code', description: 'Add inline code', action: () => insertText('`', '`', 'code') },
    { icon: FileCode, label: 'Code Block', description: 'Insert a code block', action: () => insertText('```\n', '\n```', 'code') },
    
    // Headings
    { icon: Hash, label: 'Heading 1', description: 'Large section heading', action: () => insertText('# ', '', 'Heading') },
    { icon: Hash, label: 'Heading 2', description: 'Medium section heading', action: () => insertText('## ', '', 'Heading') },
    { icon: Hash, label: 'Heading 3', description: 'Small section heading', action: () => insertText('### ', '', 'Heading') },
    
    // Lists
    { icon: List, label: 'Bullet List', description: 'Create a bullet list', action: () => insertText('- ', '', 'List item') },
    { icon: List, label: 'Numbered List', description: 'Create a numbered list', action: () => insertText('1. ', '', 'List item') },
    { icon: ListTodo, label: 'Task List', description: 'Create a task list', action: () => insertText('- [ ] ', '', 'Task') },
    
    // Insert
    { icon: Link, label: 'Insert Link', description: 'Add a hyperlink', action: () => insertText('[', '](url)', 'link text') },
    { icon: Image, label: 'Insert Image', description: 'Add an image', action: () => insertText('![', '](url)', 'alt text') },
    { icon: Table, label: 'Insert Table', description: 'Add a table', action: () => insertText('| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |', '', '') },
    { icon: Minus, label: 'Horizontal Rule', description: 'Insert a divider', action: () => insertText('\n---\n', '', '') },
    { icon: Quote, label: 'Quote', description: 'Insert a blockquote', action: () => insertText('> ', '', 'Quote') },
    
    // Alerts
    { icon: AlertCircle, label: 'Note Alert', description: 'Insert a note callout', action: () => insertText('> [!NOTE]\n> ', '', 'Note content') },
    { icon: AlertCircle, label: 'Warning Alert', description: 'Insert a warning', action: () => insertText('> [!WARNING]\n> ', '', 'Warning content') },
    { icon: AlertCircle, label: 'Important Alert', description: 'Insert important info', action: () => insertText('> [!IMPORTANT]\n> ', '', 'Important content') },
    
    // Table Commands
    { icon: ArrowDown, label: 'Add Row Below', description: 'Add a row below current cell (in table)', action: () => window.dispatchEvent(new CustomEvent('table-add-row-below')), shortcut: 'Ctrl+Shift+Enter' },
    { icon: ArrowUp, label: 'Add Row Above', description: 'Add a row above current cell (in table)', action: () => window.dispatchEvent(new CustomEvent('table-add-row-above')), shortcut: 'Ctrl+Shift+Alt+Enter' },
    { icon: Plus, label: 'Add Column', description: 'Add a column after current cell (in table)', action: () => window.dispatchEvent(new CustomEvent('table-add-column')), shortcut: 'Ctrl+Shift+\\' },
    { icon: AlignCenter, label: 'Toggle Alignment', description: 'Toggle column alignment (in table)', action: () => window.dispatchEvent(new CustomEvent('table-toggle-alignment')), shortcut: 'Ctrl+Shift+A' },
    { icon: Trash2, label: 'Delete Row', description: 'Delete current row (in table)', action: () => window.dispatchEvent(new CustomEvent('table-delete-row')), shortcut: 'Ctrl+Shift+Backspace' },
    
    // Edit
    { icon: Undo2, label: 'Undo', description: 'Undo last change', action: undo, shortcut: 'Ctrl+Z' },
    { icon: Redo2, label: 'Redo', description: 'Redo last change', action: redo, shortcut: 'Ctrl+Shift+Z' },
    { icon: Trash2, label: 'Delete Line', description: 'Delete current line', action: deleteLine, shortcut: 'Ctrl+Shift+K' },
    { icon: Copy, label: 'Duplicate Line', description: 'Duplicate current line', action: duplicateLine, shortcut: 'Ctrl+Shift+D' },
    
    // View
    { icon: Search, label: 'Find & Replace', description: 'Search in document', action: () => setShowSearchReplace(true), shortcut: 'Ctrl+F' },
    { icon: ZoomIn, label: 'Zoom In', description: 'Increase zoom level', action: zoomIn, shortcut: 'Ctrl+=' },
    { icon: ZoomOut, label: 'Zoom Out', description: 'Decrease zoom level', action: zoomOut, shortcut: 'Ctrl+-' },
    { icon: Eye, label: 'Reset Zoom', description: 'Reset to 100%', action: resetZoom, shortcut: 'Ctrl+0' },
    
    // Document
    { icon: Save, label: 'Save Version', description: 'Save current version', action: saveVersion, shortcut: 'Ctrl+S' },
    { icon: FileDown, label: 'Export as PDF', description: 'Export document as PDF', action: () => handleExport('pdf') },
    { icon: FileDown, label: 'Export as DOCX', description: 'Export as Word document', action: () => handleExport('docx') },
    { icon: FileDown, label: 'Export as HTML', description: 'Export as HTML file', action: () => handleExport('html') },
    { icon: FileText, label: 'Export as Markdown', description: 'Export as .md file', action: () => handleExport('md') },
    
    // Settings
    { icon: Settings, label: 'Open Settings', description: 'Open editor settings', action: () => window.dispatchEvent(new CustomEvent('show-settings')) },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd+K to open command palette
      if (modifier && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Formatting">
          {commands.slice(0, 5).map((cmd) => {
            const Icon = cmd.icon;
            return (
              <CommandItem key={cmd.label} onSelect={() => handleSelect(cmd.action)}>
                <Icon className="mr-2 h-4 w-4" />
                <span className="flex-1">{cmd.label}</span>
                {cmd.shortcut && (
                  <kbd className="ml-auto text-xs text-muted-foreground">{cmd.shortcut}</kbd>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>
        
        <CommandGroup heading="Headings">
          {commands.slice(5, 8).map((cmd) => {
            const Icon = cmd.icon;
            return (
              <CommandItem key={cmd.label} onSelect={() => handleSelect(cmd.action)}>
                <Icon className="mr-2 h-4 w-4" />
                <span>{cmd.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        
        <CommandGroup heading="Lists">
          {commands.slice(8, 11).map((cmd) => {
            const Icon = cmd.icon;
            return (
              <CommandItem key={cmd.label} onSelect={() => handleSelect(cmd.action)}>
                <Icon className="mr-2 h-4 w-4" />
                <span>{cmd.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        
        <CommandGroup heading="Insert">
          {commands.slice(11, 16).map((cmd) => {
            const Icon = cmd.icon;
            return (
              <CommandItem key={cmd.label} onSelect={() => handleSelect(cmd.action)}>
                <Icon className="mr-2 h-4 w-4" />
                <span>{cmd.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        
        <CommandGroup heading="Alerts">
          {commands.slice(16, 19).map((cmd) => {
            const Icon = cmd.icon;
            return (
              <CommandItem key={cmd.label} onSelect={() => handleSelect(cmd.action)}>
                <Icon className="mr-2 h-4 w-4" />
                <span>{cmd.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        
        <CommandGroup heading="Table Commands">
          {commands.slice(19, 24).map((cmd) => {
            const Icon = cmd.icon;
            return (
              <CommandItem key={cmd.label} onSelect={() => handleSelect(cmd.action)}>
                <Icon className="mr-2 h-4 w-4" />
                <span className="flex-1">{cmd.label}</span>
                {cmd.shortcut && (
                  <kbd className="ml-auto text-xs text-muted-foreground">{cmd.shortcut}</kbd>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>
        
        <CommandGroup heading="Edit">
          {commands.slice(24, 28).map((cmd) => {
            const Icon = cmd.icon;
            return (
              <CommandItem key={cmd.label} onSelect={() => handleSelect(cmd.action)}>
                <Icon className="mr-2 h-4 w-4" />
                <span className="flex-1">{cmd.label}</span>
                {cmd.shortcut && (
                  <kbd className="ml-auto text-xs text-muted-foreground">{cmd.shortcut}</kbd>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>
        
        <CommandGroup heading="View">
          {commands.slice(28, 32).map((cmd) => {
            const Icon = cmd.icon;
            return (
              <CommandItem key={cmd.label} onSelect={() => handleSelect(cmd.action)}>
                <Icon className="mr-2 h-4 w-4" />
                <span className="flex-1">{cmd.label}</span>
                {cmd.shortcut && (
                  <kbd className="ml-auto text-xs text-muted-foreground">{cmd.shortcut}</kbd>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>
        
        <CommandGroup heading="Document">
          {commands.slice(32, 37).map((cmd) => {
            const Icon = cmd.icon;
            return (
              <CommandItem key={cmd.label} onSelect={() => handleSelect(cmd.action)}>
                <Icon className="mr-2 h-4 w-4" />
                <span className="flex-1">{cmd.label}</span>
                {cmd.shortcut && (
                  <kbd className="ml-auto text-xs text-muted-foreground">{cmd.shortcut}</kbd>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>
        
        <CommandGroup heading="Settings">
          {commands.slice(37).map((cmd) => {
            const Icon = cmd.icon;
            return (
              <CommandItem key={cmd.label} onSelect={() => handleSelect(cmd.action)}>
                <Icon className="mr-2 h-4 w-4" />
                <span>{cmd.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
