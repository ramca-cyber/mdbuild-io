import { useEffect, useState } from 'react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { 
  Bold, Italic, Strikethrough, Code, Hash, List, ListTodo, 
  Link, Image, Table, Minus, FileDown, Save, Search, 
  Settings, Eye, FileText, Undo2, Redo2, Trash2, Copy,
  ZoomIn, ZoomOut, AlertCircle, FileCode, Quote, Plus, ArrowDown, ArrowUp,
  Columns, AlignCenter, LucideIcon, ImageDown
} from 'lucide-react';
import { useEditorCommands } from '@/hooks/useEditorCommands';
import { useDocumentStore } from '@/store/documentStore';
import { useSearchStore } from '@/store/searchStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useEditorViewStore } from '@/store/editorViewStore';
import { toast } from 'sonner';
import { findTableAtCursor, findCellAtCursor, addRowBelow, addRowAbove, addColumnAfter, toggleColumnAlignment, deleteRow } from '@/lib/tableUtils';

type CommandGroupKey = 'formatting' | 'headings' | 'lists' | 'insert' | 'alerts' | 'table' | 'edit' | 'view' | 'document' | 'settings';

interface Command {
  icon: LucideIcon;
  label: string;
  description: string;
  action: () => void;
  shortcut?: string;
  group: CommandGroupKey;
}

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const { insertText, undo, redo, deleteLine, duplicateLine } = useEditorCommands();
  const { saveVersion } = useDocumentStore();
  const { setShowSearchReplace } = useSearchStore();
  const { zoomIn, zoomOut, resetZoom, setShowEditorSettings } = useSettingsStore();
  const { view } = useEditorViewStore();

  const handleExportPNG = async () => {
    try {
      const previewElement = document.querySelector('.preview-content')?.parentElement;
      if (!previewElement) { toast.error('Preview not available'); return; }
      const toastId = toast.loading('Exporting PNG...');
      const { convertElementToImage } = await import('@/lib/exportUtils');
      const dataUrl = await convertElementToImage(previewElement as HTMLElement);
      const a = document.createElement('a');
      a.href = dataUrl;
      const content = useDocumentStore.getState().content;
      const fileName = content.match(/^#\s+(.+)$/m)?.[1] || 'document';
      a.download = `${fileName}.png`;
      a.click();
      toast.success('Exported as PNG', { id: toastId });
    } catch {
      toast.error('Failed to export PNG');
    }
  };

  const handleExportAction = async (format: string) => {
    const content = useDocumentStore.getState().content;
    const currentDoc = useDocumentStore.getState().savedDocuments.find(
      d => d.id === useDocumentStore.getState().currentDocId
    );
    const fileName = currentDoc?.name || content.match(/^#\s+(.+)$/m)?.[1] || 'document';

    switch (format) {
      case 'md': {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.md`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Exported as Markdown');
        break;
      }
      case 'html': {
        const previewElement = document.querySelector('.preview-content')?.parentElement;
        if (!previewElement) { toast.error('Preview not available'); return; }
        const toastId = toast.loading('Exporting HTML...');
        const { exportToHtmlWithInlineStyles } = await import('@/lib/exportUtils');
        await exportToHtmlWithInlineStyles(previewElement as HTMLElement, fileName, (p) => toast.loading(`Exporting HTML... ${p}%`, { id: toastId }));
        toast.success('Exported as HTML', { id: toastId });
        break;
      }
      case 'pdf': {
        const previewElement = document.querySelector('.preview-content')?.parentElement;
        if (!previewElement) { toast.error('Preview not available'); return; }
        const toastId = toast.loading('Generating PDF...');
        const { exportToPdfWithRendering } = await import('@/lib/exportUtils');
        const { documentSettings } = useSettingsStore.getState();
        await exportToPdfWithRendering(previewElement as HTMLElement, fileName, (p) => toast.loading(`Generating PDF... ${p}%`, { id: toastId }), documentSettings);
        toast.success('Exported as PDF', { id: toastId });
        break;
      }
      case 'docx': {
        const previewElement = document.querySelector('.preview-content')?.parentElement;
        if (!previewElement) { toast.error('Preview not available'); return; }
        const toastId = toast.loading('Preparing DOCX...');
        const { createDocxFromPreview } = await import('@/lib/exportUtils');
        const { documentSettings } = useSettingsStore.getState();
        const blob = await createDocxFromPreview(previewElement as HTMLElement, fileName, (p) => toast.loading(`Preparing DOCX... ${p}%`, { id: toastId }), documentSettings);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.docx`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Exported as DOCX', { id: toastId });
        break;
      }
    }
  };

  const runTableCommand = (type: 'addRowBelow' | 'addRowAbove' | 'addColumn' | 'toggleAlignment' | 'deleteRow') => {
    if (!view) { toast.error('Editor not available'); return; }
    const text = view.state.doc.toString();
    const cursor = view.state.selection.main.from;
    const table = findTableAtCursor(text, cursor);
    if (!table) { toast.error('Place cursor inside a table first'); return; }
    const cell = findCellAtCursor(table, cursor);
    if (!cell) { toast.error('Place cursor inside a table cell'); return; }
    
    let result: { text: string; cursorPos?: number };
    switch (type) {
      case 'addRowBelow': result = addRowBelow(text, table, cell.row); break;
      case 'addRowAbove': result = addRowAbove(text, table, cell.row); break;
      case 'addColumn': result = addColumnAfter(text, table, cell.col); break;
      case 'toggleAlignment': result = toggleColumnAlignment(text, table, cell.col); break;
      case 'deleteRow': result = deleteRow(text, table, cell.row); break;
    }
    
    view.dispatch({
      changes: { from: 0, to: text.length, insert: result.text },
      ...(result.cursorPos != null ? { selection: { anchor: result.cursorPos } } : {}),
    });
  };

  const commands: Command[] = [
    // Formatting
    { icon: Bold, label: 'Bold', description: 'Make text bold', action: () => insertText('**', '**', 'bold text'), shortcut: 'Ctrl+B', group: 'formatting' },
    { icon: Italic, label: 'Italic', description: 'Make text italic', action: () => insertText('*', '*', 'italic text'), shortcut: 'Ctrl+I', group: 'formatting' },
    { icon: Strikethrough, label: 'Strikethrough', description: 'Strike through text', action: () => insertText('~~', '~~', 'strikethrough'), group: 'formatting' },
    { icon: Code, label: 'Inline Code', description: 'Add inline code', action: () => insertText('`', '`', 'code'), group: 'formatting' },
    { icon: FileCode, label: 'Code Block', description: 'Insert a code block', action: () => insertText('```\n', '\n```', 'code'), group: 'formatting' },
    
    // Headings
    { icon: Hash, label: 'Heading 1', description: 'Large section heading', action: () => insertText('# ', '', 'Heading'), group: 'headings' },
    { icon: Hash, label: 'Heading 2', description: 'Medium section heading', action: () => insertText('## ', '', 'Heading'), group: 'headings' },
    { icon: Hash, label: 'Heading 3', description: 'Small section heading', action: () => insertText('### ', '', 'Heading'), group: 'headings' },
    
    // Lists
    { icon: List, label: 'Bullet List', description: 'Create a bullet list', action: () => insertText('- ', '', 'List item'), group: 'lists' },
    { icon: List, label: 'Numbered List', description: 'Create a numbered list', action: () => insertText('1. ', '', 'List item'), group: 'lists' },
    { icon: ListTodo, label: 'Task List', description: 'Create a task list', action: () => insertText('- [ ] ', '', 'Task'), group: 'lists' },
    
    // Insert
    { icon: Link, label: 'Insert Link', description: 'Add a hyperlink', action: () => insertText('[', '](url)', 'link text'), group: 'insert' },
    { icon: Image, label: 'Insert Image', description: 'Add an image', action: () => insertText('![', '](url)', 'alt text'), group: 'insert' },
    { icon: Table, label: 'Insert Table', description: 'Add a table', action: () => insertText('| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |', '', ''), group: 'insert' },
    { icon: Minus, label: 'Horizontal Rule', description: 'Insert a divider', action: () => insertText('\n---\n', '', ''), group: 'insert' },
    { icon: Quote, label: 'Quote', description: 'Insert a blockquote', action: () => insertText('> ', '', 'Quote'), group: 'insert' },
    
    // Alerts
    { icon: AlertCircle, label: 'Note Alert', description: 'Insert a note callout', action: () => insertText('> [!NOTE]\n> ', '', 'Note content'), group: 'alerts' },
    { icon: AlertCircle, label: 'Warning Alert', description: 'Insert a warning', action: () => insertText('> [!WARNING]\n> ', '', 'Warning content'), group: 'alerts' },
    { icon: AlertCircle, label: 'Important Alert', description: 'Insert important info', action: () => insertText('> [!IMPORTANT]\n> ', '', 'Important content'), group: 'alerts' },
    
    // Table Commands
    { icon: ArrowDown, label: 'Add Row Below', description: 'Add a row below current cell (in table)', action: () => runTableCommand('addRowBelow'), shortcut: 'Ctrl+Shift+Enter', group: 'table' },
    { icon: ArrowUp, label: 'Add Row Above', description: 'Add a row above current cell (in table)', action: () => runTableCommand('addRowAbove'), shortcut: 'Ctrl+Shift+Alt+Enter', group: 'table' },
    { icon: Plus, label: 'Add Column', description: 'Add a column after current cell (in table)', action: () => runTableCommand('addColumn'), shortcut: 'Ctrl+Shift+\\', group: 'table' },
    { icon: AlignCenter, label: 'Toggle Alignment', description: 'Toggle column alignment (in table)', action: () => runTableCommand('toggleAlignment'), shortcut: 'Ctrl+Shift+A', group: 'table' },
    { icon: Trash2, label: 'Delete Row', description: 'Delete current row (in table)', action: () => runTableCommand('deleteRow'), shortcut: 'Ctrl+Shift+Backspace', group: 'table' },
    
    // Edit
    { icon: Undo2, label: 'Undo', description: 'Undo last change', action: undo, shortcut: 'Ctrl+Z', group: 'edit' },
    { icon: Redo2, label: 'Redo', description: 'Redo last change', action: redo, shortcut: 'Ctrl+Shift+Z', group: 'edit' },
    { icon: Trash2, label: 'Delete Line', description: 'Delete current line', action: deleteLine, shortcut: 'Ctrl+Shift+K', group: 'edit' },
    { icon: Copy, label: 'Duplicate Line', description: 'Duplicate current line', action: duplicateLine, shortcut: 'Ctrl+Shift+D', group: 'edit' },
    
    // View
    { icon: Search, label: 'Find & Replace', description: 'Search in document', action: () => setShowSearchReplace(true), shortcut: 'Ctrl+F', group: 'view' },
    { icon: ZoomIn, label: 'Zoom In', description: 'Increase zoom level', action: zoomIn, shortcut: 'Ctrl+=', group: 'view' },
    { icon: ZoomOut, label: 'Zoom Out', description: 'Decrease zoom level', action: zoomOut, shortcut: 'Ctrl+-', group: 'view' },
    { icon: Eye, label: 'Reset Zoom', description: 'Reset to 100%', action: resetZoom, shortcut: 'Ctrl+0', group: 'view' },
    
    // Document
    { icon: Save, label: 'Save Version', description: 'Save current version', action: saveVersion, shortcut: 'Ctrl+S', group: 'document' },
    { icon: FileDown, label: 'Export as PDF', description: 'Export document as PDF', action: () => handleExportAction('pdf'), group: 'document' },
    { icon: FileDown, label: 'Export as DOCX', description: 'Export as Word document', action: () => handleExportAction('docx'), group: 'document' },
    { icon: FileDown, label: 'Export as HTML', description: 'Export as HTML file', action: () => handleExportAction('html'), group: 'document' },
    { icon: FileText, label: 'Export as Markdown', description: 'Export as .md file', action: () => handleExportAction('md'), group: 'document' },
    { icon: ImageDown, label: 'Export as PNG', description: 'Export as PNG image', action: handleExportPNG, group: 'document' },
    
    // Settings
    { icon: Settings, label: 'Open Settings', description: 'Open editor settings', action: () => setShowEditorSettings(true), group: 'settings' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;
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

  const groups: { key: CommandGroupKey; heading: string }[] = [
    { key: 'formatting', heading: 'Formatting' },
    { key: 'headings', heading: 'Headings' },
    { key: 'lists', heading: 'Lists' },
    { key: 'insert', heading: 'Insert' },
    { key: 'alerts', heading: 'Alerts' },
    { key: 'table', heading: 'Table Commands' },
    { key: 'edit', heading: 'Edit' },
    { key: 'view', heading: 'View' },
    { key: 'document', heading: 'Document' },
    { key: 'settings', heading: 'Settings' },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {groups.map(({ key, heading }) => (
          <CommandGroup key={key} heading={heading}>
            {commands.filter(c => c.group === key).map((cmd) => {
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
        ))}
      </CommandList>
    </CommandDialog>
  );
};
