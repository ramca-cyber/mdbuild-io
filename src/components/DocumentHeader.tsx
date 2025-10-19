import { useState, useEffect } from 'react';
import { useEditorStore, getDefaultContent, SavedDocument } from '@/store/editorStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FileText, Plus, Save, Trash2, Database, Menu, Clock, FolderOpen, Edit2, X, Check, FileUp, FileDown, FileType, Code, Image as ImageIcon, BookTemplate } from 'lucide-react';
import { toast } from 'sonner';
import { calculateStorageUsage, formatStorageSize } from '@/lib/storageUtils';
import { SaveAsDialog } from './SaveAsDialog';
import { OpenDocumentDialog } from './OpenDocumentDialog';
import { templates } from '@/lib/templates';

export function DocumentHeader() {
  const {
    savedDocuments,
    currentDocId,
    createNewDocument,
    deleteDocument,
    renameDocument,
    loadDocument,
    autoSave,
    setAutoSave,
    saveDocument,
    saveDocumentAs,
    content,
    hasUnsavedChanges,
  } = useEditorStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [storageInfo, setStorageInfo] = useState(calculateStorageUsage());
  const [saveAsOpen, setSaveAsOpen] = useState(false);
  const [openDocOpen, setOpenDocOpen] = useState(false);

  const currentDoc = savedDocuments.find((doc) => doc.id === currentDocId);

  useEffect(() => {
    const interval = setInterval(() => {
      setStorageInfo(calculateStorageUsage());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S - Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleQuickSave();
      }
      // Ctrl/Cmd + N - New Document
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewDocument();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDoc, content]);

  const handleStartEdit = () => {
    if (currentDoc) {
      setEditName(currentDoc.name);
    } else {
      const suggestedName = content.match(/^#\s+(.+)$/m)?.[1] || 'Untitled';
      setEditName(suggestedName);
    }
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const trimmedName = editName.trim();
    if (!trimmedName) {
      toast.error('Document name cannot be empty');
      return;
    }
    
    if (trimmedName.length > 100) {
      toast.error('Document name must be less than 100 characters');
      return;
    }
    
    if (currentDoc) {
      renameDocument(currentDoc.id, trimmedName);
      toast.success('Document renamed');
    } else {
      saveDocument(trimmedName);
      toast.success('Document saved');
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName('');
  };

  const handleDelete = (id: string) => {
    deleteDocument(id);
    setDeleteConfirm(null);
    toast.success('Document deleted');
  };

  const handleNewDocument = () => {
    createNewDocument();
    toast.success('New document created');
  };

  const handleQuickSave = () => {
    if (currentDoc) {
      saveDocument(currentDoc.name);
      toast.success('Document saved');
    } else {
      const title = content.match(/^#\s+(.+)$/m)?.[1] || 'Untitled';
      saveDocument(title);
      toast.success('Document saved');
    }
  };

  const handleSaveAs = (name: string) => {
    saveDocumentAs(name);
    toast.success('Document saved as new file');
  };

  const handleExportMarkdown = () => {
    const fileName = currentDoc?.name || content.match(/^#\s+(.+)$/m)?.[1] || 'document';
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported as Markdown');
  };

  const handleExportHTML = async () => {
    try {
      const fileName = currentDoc?.name || content.match(/^#\s+(.+)$/m)?.[1] || 'document';
      const previewElement = document.querySelector('.preview-content')?.parentElement;
      
      if (!previewElement) {
        toast.error('Preview not available');
        return;
      }

      const { exportToHtmlWithInlineStyles } = await import('@/lib/exportUtils');
      
      await exportToHtmlWithInlineStyles(previewElement as HTMLElement, fileName);
      toast.success('Exported as HTML');
    } catch (error) {
      console.error('HTML export error:', error);
      toast.error('Failed to export HTML');
    }
  };

  const handleExportPDF = async () => {
    try {
      const fileName = currentDoc?.name || content.match(/^#\s+(.+)$/m)?.[1] || 'document';
      const previewElement = document.querySelector('.preview-content')?.parentElement;
      
      if (!previewElement) {
        toast.error('Preview not available');
        return;
      }

      toast.info('Generating PDF...');
      
      const { exportToPdfWithRendering } = await import('@/lib/exportUtils');
      await exportToPdfWithRendering(previewElement as HTMLElement, fileName);
      
      toast.success('Exported as PDF');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    }
  };

  const handleExportDOCX = async () => {
    try {
      const fileName = currentDoc?.name || content.match(/^#\s+(.+)$/m)?.[1] || 'document';
      const previewElement = document.querySelector('.preview-content')?.parentElement;
      
      if (!previewElement) {
        toast.error('Preview not available');
        return;
      }

      toast.info('Preparing DOCX export...');
      
      const { createDocxFromPreview } = await import('@/lib/exportUtils');
      const blob = await createDocxFromPreview(previewElement as HTMLElement, fileName);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Exported as DOCX');
    } catch (error) {
      console.error('DOCX export error:', error);
      toast.error('Failed to export DOCX');
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
          createNewDocument();
          // Use setTimeout to ensure new document is created first
          setTimeout(() => {
            useEditorStore.getState().setContent(text);
            toast.success('File imported successfully');
          }, 0);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const getRecentDocuments = () => {
    return [...savedDocuments]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  };

  return (
    <>
      <div className="h-12 border-b bg-background flex items-center justify-between px-4 gap-4">
        {/* LEFT: File Menu */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Menu className="h-4 w-4" />
                File
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>File Operations</DropdownMenuLabel>
              
              <DropdownMenuItem onClick={handleNewDocument} className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                New Document
                <DropdownMenuShortcut>Ctrl+N</DropdownMenuShortcut>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={handleQuickSave} 
                className="cursor-pointer"
                disabled={!hasUnsavedChanges && !!currentDoc}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
                {hasUnsavedChanges && <span className="ml-1 text-primary">•</span>}
                <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
              </DropdownMenuItem>
              
              {currentDoc && (
                <DropdownMenuItem onClick={() => setSaveAsOpen(true)} className="cursor-pointer">
                  <FileText className="h-4 w-4 mr-2" />
                  Save As...
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleImport} className="cursor-pointer">
                <FileUp className="h-4 w-4 mr-2" />
                Import File...
              </DropdownMenuItem>
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export As
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48">
                  <DropdownMenuItem onClick={handleExportMarkdown} className="cursor-pointer">
                    <Code className="h-4 w-4 mr-2" />
                    Markdown (.md)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportHTML} className="cursor-pointer">
                    <FileType className="h-4 w-4 mr-2" />
                    HTML (.html)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
                    <FileText className="h-4 w-4 mr-2" />
                    PDF (.pdf)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportDOCX} className="cursor-pointer">
                    <FileText className="h-4 w-4 mr-2" />
                    Word (.doc)
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <BookTemplate className="h-4 w-4 mr-2" />
                  Templates
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-56">
                  {templates.map((template) => (
                    <DropdownMenuItem
                      key={template.name}
                      onClick={() => {
                        useEditorStore.getState().setContent(template.content);
                        toast.success(`Applied ${template.name} template`);
                      }}
                      className="cursor-pointer"
                    >
                      <template.icon className="h-4 w-4 mr-2" />
                      {template.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              
              <DropdownMenuSeparator />
              
              {savedDocuments.length > 0 && (
                <>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Clock className="h-4 w-4 mr-2" />
                      Recent Documents
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-56">
                      {getRecentDocuments().map((doc) => (
                        <DropdownMenuItem
                          key={doc.id}
                          onClick={() => {
                            loadDocument(doc.id);
                            toast.success(`Opened "${doc.name}"`);
                          }}
                          className={`cursor-pointer ${doc.id === currentDocId ? 'bg-accent' : ''}`}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          <span className="truncate">{doc.name}</span>
                          {doc.id === currentDocId && <span className="ml-auto text-primary">✓</span>}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  
                  <DropdownMenuItem onClick={() => setOpenDocOpen(true)} className="cursor-pointer">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Open Document...
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                </>
              )}
              
              {currentDoc && (
                <DropdownMenuItem
                  onClick={() => setDeleteConfirm(currentDoc.id)}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Current Document
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* CENTER: Document Name (inline editable) */}
        <div className="flex-1 flex items-center justify-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2 max-w-md w-full">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                className="h-8 text-sm"
                autoFocus
              />
              <Button size="icon" variant="ghost" onClick={handleSaveEdit} className="h-7 w-7">
                <Check className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleCancelEdit} className="h-7 w-7">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <button
              onClick={handleStartEdit}
              className="flex items-center gap-2 px-3 py-1 rounded hover:bg-accent transition-colors group max-w-md"
              title="Click to rename"
            >
              <span className="font-medium truncate">
                {currentDoc ? currentDoc.name : 'Untitled'}
                {hasUnsavedChanges && <span className="text-primary ml-1">•</span>}
              </span>
              <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
            </button>
          )}
        </div>

        {/* RIGHT: Settings & Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="auto-save"
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
            <Label htmlFor="auto-save" className="text-sm cursor-pointer">
              Auto-save
            </Label>
          </div>

          <div
            className={`flex items-center gap-2 text-xs ${
              storageInfo.isCritical
                ? 'text-destructive'
                : storageInfo.isNearLimit
                ? 'text-yellow-600 dark:text-yellow-500'
                : 'text-muted-foreground'
            }`}
            title={`Storage: ${formatStorageSize(storageInfo.bytes)} / 4MB`}
          >
            <Database className="h-4 w-4" />
            <span>{storageInfo.percentage.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <SaveAsDialog
        open={saveAsOpen}
        onOpenChange={setSaveAsOpen}
        currentContent={content}
        onSave={handleSaveAs}
      />

      <OpenDocumentDialog
        open={openDocOpen}
        onOpenChange={setOpenDocOpen}
        documents={savedDocuments}
        currentDocId={currentDocId}
        onLoad={(id) => {
          loadDocument(id);
          const doc = savedDocuments.find(d => d.id === id);
          if (doc) toast.success(`Opened "${doc.name}"`);
        }}
        onDelete={(id) => {
          setDeleteConfirm(id);
        }}
      />

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "
              {savedDocuments.find((d) => d.id === deleteConfirm)?.name}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
