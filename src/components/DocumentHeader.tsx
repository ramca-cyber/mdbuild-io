import { useState, useEffect } from 'react';
import { useEditorStore, getDefaultContent, SavedDocument } from '@/store/editorStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import { ChevronDown, Edit2, Check, X, Database, Trash2, FilePlus, Save } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { calculateStorageUsage, formatStorageSize } from '@/lib/storageUtils';
import { toast } from 'sonner';

export const DocumentHeader = () => {
  const { 
    savedDocuments, 
    currentDocId, 
    loadDocument, 
    renameDocument, 
    deleteDocument,
    setContent,
    setCurrentDocId,
    autoSave,
    setAutoSave,
    saveDocument,
    saveDocumentAs,
    content,
  } = useEditorStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [storageInfo, setStorageInfo] = useState(calculateStorageUsage());
  
  const currentDoc = currentDocId 
    ? savedDocuments.find(d => d.id === currentDocId) 
    : null;
  
  const displayName = currentDoc?.name || 'Untitled Project';
  
  useEffect(() => {
    if (currentDoc) {
      setEditName(currentDoc.name);
    }
  }, [currentDoc]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStorageInfo(calculateStorageUsage());
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  
  const handleStartEdit = () => {
    if (currentDoc) {
      setEditName(currentDoc.name);
      setIsEditing(true);
    } else {
      // For untitled documents, suggest a name from content
      const suggestedName = content.match(/^#\s+(.+)$/m)?.[1] || 'Untitled';
      setEditName(suggestedName);
      setIsEditing(true);
    }
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
      setIsEditing(false);
      toast.success('Document renamed');
    } else {
      // Save as new document for untitled files
      saveDocument(trimmedName);
      setIsEditing(false);
      toast.success('Document saved');
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (currentDoc) {
      setEditName(currentDoc.name);
    }
  };

  const handleDelete = (docId: string) => {
    deleteDocument(docId);
    setDeleteConfirm(null);
    toast.success('Document deleted');
  };

  const handleNewDocument = () => {
    setContent(getDefaultContent());
    setCurrentDocId(null);
    toast.success('New document created');
  };

  const handleSave = () => {
    const title = content.match(/^#\s+(.+)$/m)?.[1] || 'Untitled';
    saveDocument(title);
    toast.success('Document saved successfully');
  };

  const handleSaveAs = () => {
    // Create a copy with a new name
    const title = content.match(/^#\s+(.+)$/m)?.[1] || 'Untitled';
    const newName = prompt('Enter new document name:', title);
    if (newName && newName.trim()) {
      saveDocumentAs(newName.trim());
      toast.success('Document saved as new file');
    }
  };
  
  return (
    <>
    <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 border-b border-border">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-1 flex-1 max-w-md">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              className="h-7 text-sm"
              autoFocus
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSaveEdit}
              className="h-7 w-7"
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCancelEdit}
              className="h-7 w-7"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-7 px-2 text-sm font-medium hover:bg-accent max-w-xs"
                >
                  <span className="truncate">{displayName}</span>
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72 z-50 bg-popover">
                <DropdownMenuItem
                  onClick={handleNewDocument}
                  className="flex items-center gap-2 cursor-pointer font-medium"
                >
                  <FilePlus className="h-4 w-4" />
                  New Document
                </DropdownMenuItem>
                
                {currentDoc && (
                  <DropdownMenuItem
                    onClick={handleSaveAs}
                    className="flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Save className="h-4 w-4" />
                    Save As...
                  </DropdownMenuItem>
                )}
                
                {savedDocuments.length > 0 && <DropdownMenuSeparator />}
                
                {savedDocuments.length === 0 ? (
                  <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                    No saved documents
                  </div>
                ) : (
                  savedDocuments.map((doc) => (
                    <DropdownMenuItem
                      key={doc.id}
                      className={cn(
                        "flex items-center justify-between gap-2 cursor-pointer",
                        currentDocId === doc.id && "bg-accent"
                      )}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <div 
                        className="flex flex-col items-start gap-1 flex-1 min-w-0"
                        onClick={() => loadDocument(doc.id)}
                      >
                        <div className="font-medium text-sm truncate w-full">{doc.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(doc.timestamp, { addSuffix: true })}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(doc.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              size="icon"
              variant="ghost"
              onClick={handleStartEdit}
              className="h-7 w-7"
              title={currentDoc ? "Rename document" : "Name and save document"}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSave}
              className="h-7 w-7"
              title="Save document (Ctrl+S)"
            >
              <Save className="h-3 w-3" />
            </Button>
          </>
        )}
        
        <div className="flex items-center gap-2 ml-2">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="autosave" className="text-xs text-muted-foreground cursor-pointer hidden sm:inline">
              Auto-save
            </Label>
            <Switch
              id="autosave"
              checked={autoSave}
              onCheckedChange={setAutoSave}
              className="scale-75"
            />
          </div>
          
          <div 
            className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-help"
            title={`Using ${formatStorageSize(storageInfo.bytes)} of 4MB`}
          >
            <Database className={cn(
              "h-3 w-3",
              storageInfo.isCritical && "text-destructive",
              storageInfo.isNearLimit && !storageInfo.isCritical && "text-warning"
            )} />
            <span className="hidden sm:inline">
              {storageInfo.mb.toFixed(1)} MB / 4 MB
            </span>
            <span className="sm:hidden">{storageInfo.percentage.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The document will be permanently deleted from your browser storage.
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
    </div>
    </>
  );
};