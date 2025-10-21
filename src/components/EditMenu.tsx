import {
  Undo,
  Redo,
  Scissors,
  Copy,
  Clipboard,
  AlignLeft,
  Search,
  Calendar,
  FileText,
  Trash2,
  CopyPlus,
  ArrowUp,
  ArrowDown,
  Layers,
  Eraser,
} from 'lucide-react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { useEditorStore } from '@/store/editorStore';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const EditMenu = () => {
  const { content, setContent, setShowSearchReplace } = useEditorStore();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Listen for history state updates from the editor
  useEffect(() => {
    const handleHistoryChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { canUndo: undo, canRedo: redo } = customEvent.detail;
      setCanUndo(undo);
      setCanRedo(redo);
    };

    window.addEventListener('editor-history-change', handleHistoryChange);
    return () => window.removeEventListener('editor-history-change', handleHistoryChange);
  }, []);

  const handleUndo = () => {
    window.dispatchEvent(new CustomEvent('editor-undo'));
  };

  const handleRedo = () => {
    window.dispatchEvent(new CustomEvent('editor-redo'));
  };

  const handleCut = () => {
    document.execCommand('cut');
    toast.success('Cut to clipboard');
  };

  const handleCopy = () => {
    document.execCommand('copy');
    toast.success('Copied to clipboard');
  };

  const handlePaste = () => {
    document.execCommand('paste');
  };

  const handleSelectAll = () => {
    window.dispatchEvent(new CustomEvent('editor-select-all'));
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('All content copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleFindReplace = () => {
    setShowSearchReplace(true);
  };

  const handleInsertDateTime = () => {
    const now = new Date();
    const formatted = now.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    window.dispatchEvent(
      new CustomEvent('editor-insert', {
        detail: { kind: 'wrap', before: formatted, after: '', placeholder: '' },
      })
    );
    toast.success('Date/time inserted');
  };

  const handleWordCount = () => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const chars = content.length;
    const charsNoSpaces = content.replace(/\s/g, '').length;
    const lines = content.split('\n').length;
    const paragraphs = content.split(/\n\s*\n/).filter(Boolean).length;

    toast.info(
      `📊 Statistics:\n${words} words • ${chars} characters (${charsNoSpaces} no spaces)\n${lines} lines • ${paragraphs} paragraphs`,
      { duration: 5000 }
    );
  };
  
  const handleDeleteLine = () => {
    window.dispatchEvent(new CustomEvent('editor-delete-line'));
  };
  
  const handleDuplicateLine = () => {
    window.dispatchEvent(new CustomEvent('editor-duplicate-line'));
  };
  
  const handleSelectLine = () => {
    window.dispatchEvent(new CustomEvent('editor-select-line'));
  };
  
  const handleMoveLineUp = () => {
    window.dispatchEvent(new CustomEvent('editor-move-line-up'));
  };
  
  const handleMoveLineDown = () => {
    window.dispatchEvent(new CustomEvent('editor-move-line-down'));
  };

  const handleClearContent = () => {
    setShowClearDialog(true);
  };

  const confirmClear = () => {
    setContent('');
    setShowClearDialog(false);
    toast.success('Content cleared');
  };

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';

  return (
    <>
      <Menubar className="border-0 bg-transparent">
        <MenubarMenu>
          <MenubarTrigger className="cursor-pointer">Edit</MenubarTrigger>
          <MenubarContent className="bg-popover z-50">
            <MenubarItem onClick={handleUndo} disabled={!canUndo}>
              <Undo className="h-4 w-4 mr-2" />
              Undo
              <MenubarShortcut>{modKey}+Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={handleRedo} disabled={!canRedo}>
              <Redo className="h-4 w-4 mr-2" />
              Redo
              <MenubarShortcut>{modKey}+Shift+Z</MenubarShortcut>
            </MenubarItem>

            <MenubarSeparator />

            <MenubarItem onClick={handleCut}>
              <Scissors className="h-4 w-4 mr-2" />
              Cut
              <MenubarShortcut>{modKey}+X</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
              <MenubarShortcut>{modKey}+C</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={handlePaste}>
              <Clipboard className="h-4 w-4 mr-2" />
              Paste
              <MenubarShortcut>{modKey}+V</MenubarShortcut>
            </MenubarItem>

            <MenubarSeparator />

            <MenubarItem onClick={handleSelectAll}>
              <AlignLeft className="h-4 w-4 mr-2" />
              Select All
              <MenubarShortcut>{modKey}+A</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={handleCopyAll}>
              <Copy className="h-4 w-4 mr-2" />
              Copy All
            </MenubarItem>

            <MenubarSeparator />
            
            <MenubarItem onClick={handleDeleteLine}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Line
              <MenubarShortcut>{modKey}+Shift+K</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={handleDuplicateLine}>
              <CopyPlus className="h-4 w-4 mr-2" />
              Duplicate Line
              <MenubarShortcut>{modKey}+Shift+D</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={handleSelectLine}>
              <Layers className="h-4 w-4 mr-2" />
              Select Line
              <MenubarShortcut>{modKey}+L</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={handleMoveLineUp}>
              <ArrowUp className="h-4 w-4 mr-2" />
              Move Line Up
              <MenubarShortcut>Alt+↑</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={handleMoveLineDown}>
              <ArrowDown className="h-4 w-4 mr-2" />
              Move Line Down
              <MenubarShortcut>Alt+↓</MenubarShortcut>
            </MenubarItem>

            <MenubarSeparator />

            <MenubarItem onClick={handleFindReplace}>
              <Search className="h-4 w-4 mr-2" />
              Find & Replace
              <MenubarShortcut>{modKey}+F</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={handleInsertDateTime}>
              <Calendar className="h-4 w-4 mr-2" />
              Insert Date/Time
              <MenubarShortcut>Alt+D</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={handleWordCount}>
              <FileText className="h-4 w-4 mr-2" />
              Word Count
            </MenubarItem>

            <MenubarSeparator />

            <MenubarItem onClick={handleClearContent} className="text-destructive">
              <Eraser className="h-4 w-4 mr-2" />
              Clear Content
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Content?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all content in the editor. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClear} className="bg-destructive text-destructive-foreground">
              Clear Content
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
