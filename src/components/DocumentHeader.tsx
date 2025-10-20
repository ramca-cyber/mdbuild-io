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
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Save, Trash2, Database, Menu, Clock, FolderOpen, Edit2, X, Check, FileUp, FileDown, FileType, Code, Image as ImageIcon, BookTemplate, Copy, Eraser, Files, Github } from 'lucide-react';
import { toast } from 'sonner';
import { calculateStorageUsage, formatStorageSize } from '@/lib/storageUtils';
import { SaveAsDialog } from './SaveAsDialog';
import { OpenDocumentDialog } from './OpenDocumentDialog';
import { GitHubFileBrowser } from './GitHubFileBrowser';
import { GitHubCommitDialog } from './GitHubCommitDialog';
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
    githubConnected,
    currentGithubFile,
    saveToGitHub,
  } = useEditorStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [clearAllConfirm, setClearAllConfirm] = useState(false);
  const [storageInfo, setStorageInfo] = useState(calculateStorageUsage());
  const [saveAsOpen, setSaveAsOpen] = useState(false);
  const [openDocOpen, setOpenDocOpen] = useState(false);
  const [storageDialogOpen, setStorageDialogOpen] = useState(false);
  const [githubBrowserOpen, setGithubBrowserOpen] = useState(false);
  const [githubCommitOpen, setGithubCommitOpen] = useState(false);

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
    try {
      const fileName = currentDoc?.name || content.match(/^#\s+(.+)$/m)?.[1] || 'document';
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported as Markdown');
    } catch (error) {
      console.error('Markdown export error:', error);
      toast.error('Failed to export as Markdown');
    }
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
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.md,.txt';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          // Check file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            toast.error('File too large. Maximum size is 5MB.');
            return;
          }

          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const text = e.target?.result as string;
              if (!text) {
                throw new Error('Failed to read file content');
              }
              createNewDocument();
              // Use setTimeout to ensure new document is created first
              setTimeout(() => {
                useEditorStore.getState().setContent(text);
                toast.success('File imported successfully');
              }, 0);
            } catch (error) {
              console.error('Error processing imported file:', error);
              toast.error('Failed to import file');
            }
          };
          reader.onerror = () => {
            toast.error('Failed to read file');
          };
          reader.readAsText(file);
        }
      };
      input.click();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import file');
    }
  };

  const getRecentDocuments = () => {
    return [...savedDocuments]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Content copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleClearAll = () => {
    try {
      useEditorStore.getState().setContent('');
      setClearAllConfirm(false);
      toast.success('Document cleared');
    } catch (error) {
      console.error('Failed to clear document:', error);
      toast.error('Failed to clear document');
    }
  };

  const handleDuplicateDocument = () => {
    try {
      if (currentDoc) {
        const newName = `${currentDoc.name} (Copy)`;
        saveDocumentAs(newName);
        toast.success(`Document duplicated as "${newName}"`);
      } else {
        // If no current doc, save current content as new document
        const title = content.match(/^#\s+(.+)$/m)?.[1] || 'Untitled';
        saveDocument(`${title} (Copy)`);
        toast.success('Document duplicated');
      }
    } catch (error) {
      console.error('Failed to duplicate document:', error);
      toast.error('Failed to duplicate document');
    }
  };

  const handleGitHubCommit = async (message: string) => {
    try {
      await saveToGitHub(message);
      toast.success('Changes committed to GitHub');
    } catch (error: any) {
      console.error('Failed to commit to GitHub:', error);
      toast.error(error.message || 'Failed to commit to GitHub');
    }
  };

  return (
    <>
      <div className="h-12 border-b bg-background flex items-center justify-between px-4 gap-4 no-print">
        {/* LEFT: File Menu */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2" aria-label="File menu">
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
              
              {savedDocuments.length > 0 && (
                <DropdownMenuItem onClick={() => setOpenDocOpen(true)} className="cursor-pointer">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Open Document...
                </DropdownMenuItem>
              )}
              
              {savedDocuments.length > 0 && (
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
              )}
              
              <DropdownMenuSeparator />
              
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
              
              <DropdownMenuItem onClick={handleDuplicateDocument} className="cursor-pointer">
                <Files className="h-4 w-4 mr-2" />
                Duplicate Document
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel>GitHub</DropdownMenuLabel>
              
              {githubConnected && (
                <DropdownMenuItem onClick={() => setGithubBrowserOpen(true)} className="cursor-pointer">
                  <Github className="h-4 w-4 mr-2" />
                  Open from GitHub...
                </DropdownMenuItem>
              )}
              
              {githubConnected && currentGithubFile && (
                <DropdownMenuItem 
                  onClick={() => setGithubCommitOpen(true)} 
                  className="cursor-pointer"
                  disabled={!hasUnsavedChanges}
                >
                  <Github className="h-4 w-4 mr-2" />
                  Commit to GitHub
                  {hasUnsavedChanges && <span className="ml-1 text-primary">•</span>}
                </DropdownMenuItem>
              )}
              
              {!githubConnected && (
                <DropdownMenuItem disabled className="text-muted-foreground">
                  <Github className="h-4 w-4 mr-2" />
                  Connect GitHub in Settings
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel>Edit</DropdownMenuLabel>
              
              <DropdownMenuItem onClick={handleCopyToClipboard} className="cursor-pointer">
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => setClearAllConfirm(true)} 
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Eraser className="h-4 w-4 mr-2" />
                Clear All
              </DropdownMenuItem>
              
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

        {/* CENTER: Document Name (inline editable) + GitHub Badge */}
        <div className="flex-1 flex items-center justify-center gap-2">
          {currentGithubFile && (
            <Badge variant="outline" className="gap-1 flex-shrink-0">
              <Github className="h-3 w-3" />
              <span className="text-xs truncate max-w-[150px]">
                {currentGithubFile.owner}/{currentGithubFile.repo}
              </span>
            </Badge>
          )}
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
              aria-label="Edit document name"
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
              aria-label="Toggle auto-save"
            />
            <Label htmlFor="auto-save" className="text-sm cursor-pointer">
              Auto-save
            </Label>
          </div>

          <button
            onClick={() => setStorageDialogOpen(true)}
            className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-md transition-colors hover:bg-accent ${
              storageInfo.isCritical
                ? 'text-destructive'
                : storageInfo.isNearLimit
                ? 'text-yellow-600 dark:text-yellow-500'
                : 'text-muted-foreground'
            }`}
            title="Click for storage details"
            aria-label="View storage usage details"
          >
            <Database className="h-4 w-4" />
            <span>{storageInfo.percentage.toFixed(0)}%</span>
          </button>
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

      <AlertDialog open={clearAllConfirm} onOpenChange={setClearAllConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear all content? This will completely empty the editor. 
              {hasUnsavedChanges && " You have unsaved changes that will be lost."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={storageDialogOpen} onOpenChange={setStorageDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Storage Usage</AlertDialogTitle>
            <AlertDialogDescription>
              Local browser storage information for your documents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Used Storage:</span>
                <span>{formatStorageSize(storageInfo.bytes)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Documents:</span>
                <span>{savedDocuments.length}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-4">
                Storage is saved in your browser's local storage. Clearing browser data will remove your documents.
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* GitHub Dialogs */}
      <GitHubFileBrowser 
        open={githubBrowserOpen} 
        onOpenChange={setGithubBrowserOpen} 
      />
      
      <GitHubCommitDialog
        open={githubCommitOpen}
        onOpenChange={setGithubCommitOpen}
        onCommit={handleGitHubCommit}
        fileName={currentGithubFile?.path}
      />
    </>
  );
}
