import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Database, ListTree, Link } from 'lucide-react';
import { toast } from 'sonner';
import { calculateStorageUsage, formatStorageSize } from '@/lib/storageUtils';
import { useDocumentActions } from '@/hooks/useDocumentActions';
import { FileMenu } from './FileMenu';
import { DocumentNameEditor } from './DocumentNameEditor';
import { StorageDialog } from './StorageDialog';
import { SaveAsDialog } from './SaveAsDialog';
import { OpenDocumentDialog } from './OpenDocumentDialog';
import { EditMenu } from './EditMenu';
import { FormatMenu } from './FormatMenu';
import { ViewMenu } from './ViewMenu';
import { SettingsMenu } from './SettingsMenu';
import { SnippetsMenu } from './SnippetsMenu';
import { DocumentSettingsDialog } from './DocumentSettingsDialog';
import { ViewModeSwitcher } from './ViewModeSwitcher';

export function DocumentHeader() {
  const {
    autoSave,
    setAutoSave,
    viewMode,
    showOutline,
    setShowOutline,
    syncScroll,
    setSyncScroll,
  } = useSettingsStore();

  const actions = useDocumentActions();

  const [storageInfo, setStorageInfo] = useState(calculateStorageUsage());
  const [storageDialogOpen, setStorageDialogOpen] = useState(false);
  const [showDocumentSettings, setShowDocumentSettings] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setStorageInfo(calculateStorageUsage()), 5000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts (Ctrl+S, Ctrl+N)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const modifier = navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? e.metaKey : e.ctrlKey;
      if (modifier && e.key === 's') { e.preventDefault(); actions.handleQuickSave(); }
      if (modifier && e.key === 'n') { e.preventDefault(); actions.handleNewDocument(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions.handleQuickSave, actions.handleNewDocument]);

  return (
    <>
      <div className="h-12 border-b bg-background flex items-center justify-between px-4 gap-4 no-print">
        {/* LEFT: Menus */}
        <div className="flex items-center gap-2">
          <FileMenu
            currentDoc={actions.currentDoc}
            savedDocuments={actions.savedDocuments}
            currentDocId={actions.currentDocId}
            hasUnsavedChanges={actions.hasUnsavedChanges}
            onNewDocument={actions.handleNewDocument}
            onQuickSave={actions.handleQuickSave}
            onOpenSaveAs={() => actions.setSaveAsOpen(true)}
            onOpenDocDialog={() => actions.setOpenDocOpen(true)}
            onDuplicate={actions.handleDuplicateDocument}
            onPrint={actions.handlePrint}
            onImport={actions.handleImport}
            onExportMarkdown={actions.handleExportMarkdown}
            onExportHTML={actions.handleExportHTML}
            onExportPDF={actions.handleExportPDF}
            onExportDOCX={actions.handleExportDOCX}
            onDeleteCurrent={() => actions.currentDoc && actions.setDeleteConfirm(actions.currentDoc.id)}
            loadDocument={actions.loadDocument}
            getRecentDocuments={actions.getRecentDocuments}
          />
          <EditMenu />
          <FormatMenu />
          <ViewMenu />
          <SnippetsMenu />
          <SettingsMenu />
        </div>

        {/* CENTER: Document Name */}
        <div className="flex-1 flex items-center justify-center gap-2">
          <DocumentNameEditor
            currentDoc={actions.currentDoc}
            hasUnsavedChanges={actions.hasUnsavedChanges}
            content={actions.content}
            renameDocument={actions.renameDocument}
            saveDocument={actions.saveDocument}
          />
        </div>

        {/* RIGHT: Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch id="auto-save" checked={autoSave} onCheckedChange={setAutoSave} aria-label="Toggle auto-save" />
            <Label htmlFor="auto-save" className="text-xs cursor-pointer text-muted-foreground">Auto-save</Label>
          </div>

          <button
            onClick={() => setStorageDialogOpen(true)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-colors hover:bg-accent ${
              storageInfo.isCritical
                ? 'text-destructive font-semibold'
                : storageInfo.isNearLimit
                ? 'text-yellow-600 dark:text-yellow-500 font-medium'
                : 'text-muted-foreground'
            }`}
            title={`Storage: ${formatStorageSize(storageInfo.bytes)} used (${storageInfo.percentage.toFixed(0)}%). Click for details.`}
            aria-label={`Storage usage: ${storageInfo.percentage.toFixed(0)}% used. Click to view details.`}
          >
            <Database className="h-3.5 w-3.5" />
            <span className="font-mono">{storageInfo.percentage.toFixed(0)}%</span>
          </button>

          <div className="w-px h-6 bg-border mx-2" />
          <ViewModeSwitcher />
          <div className="w-px h-6 bg-border mx-2" />

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={showOutline ? 'default' : 'ghost'} size="sm" onClick={() => setShowOutline(!showOutline)} className="h-8 gap-1.5" aria-label="Toggle outline panel">
                  <ListTree className="h-4 w-4" />
                  <span className="hidden lg:inline text-xs">Outline</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Toggle Outline (Ctrl+B)</p></TooltipContent>
            </Tooltip>

            {viewMode === 'split' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={syncScroll ? 'default' : 'ghost'} size="sm" onClick={() => setSyncScroll(!syncScroll)} className="h-8 gap-1.5" aria-label="Toggle sync scrolling">
                    <Link className="h-4 w-4" />
                    <span className="hidden lg:inline text-xs">Sync</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Sync Scrolling</p></TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <SaveAsDialog open={actions.saveAsOpen} onOpenChange={actions.setSaveAsOpen} currentContent={actions.content} onSave={actions.handleSaveAs} />

      <OpenDocumentDialog
        open={actions.openDocOpen}
        onOpenChange={actions.setOpenDocOpen}
        documents={actions.savedDocuments}
        currentDocId={actions.currentDocId}
        onLoad={(id) => {
          actions.loadDocument(id);
          const doc = actions.savedDocuments.find(d => d.id === id);
          if (doc) toast.success(`Opened "${doc.name}"`);
        }}
        onDelete={(id) => actions.setDeleteConfirm(id)}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!actions.deleteConfirm} onOpenChange={() => actions.setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{actions.savedDocuments.find((d) => d.id === actions.deleteConfirm)?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => actions.deleteConfirm && actions.handleDelete(actions.deleteConfirm)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New document confirmation */}
      <AlertDialog open={actions.newDocConfirm} onOpenChange={actions.setNewDocConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Creating a new document will discard them. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={actions.confirmNewDocument}>Create New</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear all confirmation */}
      <AlertDialog open={actions.clearAllConfirm} onOpenChange={actions.setClearAllConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear all content? This will completely empty the editor.
              {actions.hasUnsavedChanges && " You have unsaved changes that will be lost."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={actions.handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Clear All</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <StorageDialog open={storageDialogOpen} onOpenChange={setStorageDialogOpen} storageInfo={storageInfo} documentCount={actions.savedDocuments.length} />

      <DocumentSettingsDialog open={showDocumentSettings} onOpenChange={setShowDocumentSettings} />
    </>
  );
}
