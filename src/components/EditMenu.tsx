import {
  Undo,
  Redo,
  Scissors,
  Copy,
  Clipboard,
  Search,
  Calendar,
  FileText,
  Trash2,
  ArrowUp,
  ArrowDown,
  Square,
  Trash,
  FileBarChart,
} from 'lucide-react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
} from '@/components/ui/menubar';
import { useDocumentStore } from '@/store/documentStore';
import { useSearchStore } from '@/store/searchStore';
import { useEditorViewStore } from '@/store/editorViewStore';
import { toast } from 'sonner';
import { useState } from 'react';
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
  const { content, setContent } = useDocumentStore();
  const { setShowSearchReplace } = useSearchStore();
  const { canUndo, canRedo, undo, redo, selectAll, deleteLine, duplicateLine, selectLine, moveLineUp, moveLineDown, insert } = useEditorViewStore();
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleUndo = () => {
    undo();
    toast.success('Undone');
  };

  const handleRedo = () => {
    redo();
    toast.success('Redone');
  };

  const handleCut = async () => {
    try {
      await navigator.clipboard.writeText(window.getSelection()?.toString() || '');
      document.execCommand('cut');
      toast.success('Cut to clipboard');
    } catch (error) {
      toast.error('Failed to cut');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.getSelection()?.toString() || '');
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      insert('text', { text });
      toast.success('Pasted from clipboard');
    } catch (error) {
      toast.error('Failed to paste');
    }
  };

  const handleSelectAll = () => {
    selectAll();
    toast.success('Selected all');
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('All content copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy all content');
    }
  };

  const handleFindReplace = () => {
    setShowSearchReplace(true);
  };

  const handleInsertDateTime = () => {
    const now = new Date();
    const dateTime = now.toLocaleString();
    insert('text', { text: dateTime });
    toast.success('Date/time inserted');
  };

  const handleWordCount = () => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    const chars = content.length;
    const lines = content.split('\n').length;
    toast.success(`Words: ${words} | Characters: ${chars} | Lines: ${lines}`);
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
      <Menubar className="border-0 bg-transparent p-0 h-auto">
        <MenubarMenu>
          <MenubarTrigger className="cursor-pointer px-3 py-1.5 text-sm font-medium">
            Edit
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={handleUndo} disabled={!canUndo}>
              <Undo className="h-4 w-4 mr-2" />
              Undo
              <MenubarShortcut>{modKey}+Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={handleRedo} disabled={!canRedo}>
              <Redo className="h-4 w-4 mr-2" />
              Redo
              <MenubarShortcut>{modKey}+Y</MenubarShortcut>
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
              <Square className="h-4 w-4 mr-2" />
              Select All
              <MenubarShortcut>{modKey}+A</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={handleCopyAll}>
              <Copy className="h-4 w-4 mr-2" />
              Copy All
            </MenubarItem>

            <MenubarSeparator />

            <MenubarSub>
              <MenubarSubTrigger>
                <FileText className="h-4 w-4 mr-2" />
                Line Operations
              </MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={() => deleteLine()}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Line
                  <MenubarShortcut>{modKey}+D</MenubarShortcut>
                </MenubarItem>
                <MenubarItem onClick={() => duplicateLine()}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate Line
                  <MenubarShortcut>{modKey}+Shift+D</MenubarShortcut>
                </MenubarItem>
                <MenubarItem onClick={() => selectLine()}>
                  <Square className="h-4 w-4 mr-2" />
                  Select Line
                  <MenubarShortcut>{modKey}+L</MenubarShortcut>
                </MenubarItem>
                <MenubarItem onClick={() => moveLineUp()}>
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Move Line Up
                  <MenubarShortcut>Alt+↑</MenubarShortcut>
                </MenubarItem>
                <MenubarItem onClick={() => moveLineDown()}>
                  <ArrowDown className="h-4 w-4 mr-2" />
                  Move Line Down
                  <MenubarShortcut>Alt+↓</MenubarShortcut>
                </MenubarItem>
              </MenubarSubContent>
            </MenubarSub>

            <MenubarSeparator />

            <MenubarItem onClick={handleFindReplace}>
              <Search className="h-4 w-4 mr-2" />
              Find & Replace
              <MenubarShortcut>{modKey}+F</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={handleInsertDateTime}>
              <Calendar className="h-4 w-4 mr-2" />
              Insert Date/Time
            </MenubarItem>
            <MenubarItem onClick={handleWordCount}>
              <FileBarChart className="h-4 w-4 mr-2" />
              Word Count
              <MenubarShortcut>{modKey}+Shift+W</MenubarShortcut>
            </MenubarItem>

            <MenubarSeparator />

            <MenubarItem onClick={handleClearContent} className="text-destructive">
              <Trash className="h-4 w-4 mr-2" />
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
