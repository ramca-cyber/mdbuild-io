import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { Database, ListTree, Link as LinkIcon, Home, HelpCircle, Moon, Sun, Keyboard, Menu } from 'lucide-react';
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
import { InsertMenu } from './InsertMenu';
import { ViewMenu } from './ViewMenu';
import { SettingsMenu } from './SettingsMenu';

import { ViewModeSwitcher } from './ViewModeSwitcher';
import { PWAInstallButton } from './PWAInstallButton';
import { MobileMenuSheet } from './MobileMenuSheet';

interface DocumentHeaderProps {
  setMobilePanel: (panel: 'documents' | 'templates' | 'outline' | null) => void;
}

export function DocumentHeader({ setMobilePanel }: DocumentHeaderProps) {
  const {
    theme,
    setTheme,
    autoSave,
    setAutoSave,
    viewMode,
    showOutline,
    setShowOutline,
    syncScroll,
    setSyncScroll,
    setShowKeyboardShortcuts,
  } = useSettingsStore();

  const actions = useDocumentActions();

  const [storageInfo, setStorageInfo] = useState(calculateStorageUsage());
  const [storageDialogOpen, setStorageDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (storageDialogOpen) setStorageInfo(calculateStorageUsage());
  }, [storageDialogOpen]);

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
      <div className="h-12 border-b bg-background flex items-center justify-between px-3 gap-2 no-print">
        {/* LEFT: Logo + Menus */}
        <div className="flex items-center gap-2">
          <Link to="/landing" className="flex items-center gap-1.5 mr-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </div>
          </Link>
          
          <div className="hidden sm:flex items-center gap-1">
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
              onExportPNG={actions.handleExportPNG}
              onExportDOCX={actions.handleExportDOCX}
              onDeleteCurrent={() => actions.currentDoc && actions.setDeleteConfirm(actions.currentDoc.id)}
              loadDocument={actions.loadDocument}
              getRecentDocuments={actions.getRecentDocuments}
            />
            <EditMenu />
            <FormatMenu />
            <InsertMenu />
            <ViewMenu />
            <SettingsMenu />
          </div>

          {/* Mobile hamburger */}
          <div className="sm:hidden">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* CENTER: Document Name */}
        <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
          <DocumentNameEditor
            currentDoc={actions.currentDoc}
            hasUnsavedChanges={actions.hasUnsavedChanges}
            content={actions.content}
            renameDocument={actions.renameDocument}
            saveDocument={actions.saveDocument}
          />
        </div>

        {/* RIGHT: Controls */}
        <div className="flex items-center gap-1.5">
          <div className="hidden xl:flex items-center gap-1.5">
            <Switch id="auto-save" checked={autoSave} onCheckedChange={setAutoSave} aria-label="Toggle auto-save" className="scale-90" />
            <Label htmlFor="auto-save" className="text-xs cursor-pointer text-muted-foreground">Auto</Label>
          </div>

          <div className="hidden lg:block">
            <button
              onClick={() => setStorageDialogOpen(true)}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors hover:bg-accent ${
                storageInfo.isCritical
                  ? 'text-destructive font-semibold'
                  : storageInfo.isNearLimit
                  ? 'text-yellow-600 dark:text-yellow-500 font-medium'
                  : 'text-muted-foreground'
              }`}
              title={`Storage: ${formatStorageSize(storageInfo.bytes)} used`}
              aria-label={`Storage usage: ${storageInfo.percentage.toFixed(0)}% used`}
            >
              <Database className="h-3.5 w-3.5" />
              <span className="font-mono">{storageInfo.percentage.toFixed(0)}%</span>
            </button>
          </div>

          <div className="w-px h-5 bg-border" />
          <ViewModeSwitcher />
          <div className="w-px h-5 bg-border hidden lg:block" />

          <div className="hidden lg:flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={showOutline ? 'default' : 'ghost'} size="sm" onClick={() => setShowOutline(!showOutline)} className="h-8 gap-1" aria-label="Toggle outline panel">
                  <ListTree className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Toggle Outline</p></TooltipContent>
            </Tooltip>

            {viewMode === 'split' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant={syncScroll ? 'default' : 'ghost'} size="sm" onClick={() => setSyncScroll(!syncScroll)} className="h-8 gap-1" aria-label="Toggle sync scrolling">
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Sync Scrolling</p></TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="w-px h-5 bg-border hidden lg:block" />

          {/* Nav & Utility */}
          <div className="hidden lg:flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                  <Link to="/landing"><Home className="h-4 w-4" /></Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Home</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                  <Link to="/help"><HelpCircle className="h-4 w-4" /></Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Help</p></TooltipContent>
            </Tooltip>
            <PWAInstallButton />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {
                  const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'sepia' : theme === 'sepia' ? 'system' : 'light';
                  setTheme(nextTheme);
                }}>
                  {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Toggle Theme</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowKeyboardShortcuts(true)}>
                  <Keyboard className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Keyboard Shortcuts</p></TooltipContent>
            </Tooltip>
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

      <MobileMenuSheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} onOpenDocuments={() => setMobilePanel('documents')} />
    </>
  );
}
