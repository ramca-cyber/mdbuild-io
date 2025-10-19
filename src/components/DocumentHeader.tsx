import { useState, useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { ChevronDown, Edit2, Check, X, Database, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { calculateStorageUsage, formatStorageSize } from '@/lib/storageUtils';
import { toast } from 'sonner';

export const DocumentHeader = () => {
  const { savedDocuments, currentDocId, loadDocument, renameDocument, deleteDocument } = useEditorStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [storageInfo, setStorageInfo] = useState(calculateStorageUsage());
  
  const currentDoc = currentDocId 
    ? savedDocuments.find(d => d.id === currentDocId) 
    : null;
  
  const displayName = currentDoc?.name || 'Untitled Document';
  
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
    }
  };
  
  const handleSaveEdit = () => {
    if (currentDoc && editName.trim()) {
      renameDocument(currentDoc.id, editName.trim());
      setIsEditing(false);
      toast.success('Document renamed');
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
                          className="h-6 w-6 text-destructive hover:text-destructive"
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
              
              {currentDoc && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleStartEdit}
                  className="h-7 w-7"
                  title="Rename document"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              )}
            </>
          )}
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
    </>
  );
};
