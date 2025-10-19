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
import { ChevronDown, Edit2, Check, X, Database } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export const DocumentHeader = () => {
  const { savedDocuments, currentDocId, loadDocument, renameDocument } = useEditorStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  
  const currentDoc = currentDocId 
    ? savedDocuments.find(d => d.id === currentDocId) 
    : null;
  
  const displayName = currentDoc?.name || 'Untitled Document';
  
  useEffect(() => {
    if (currentDoc) {
      setEditName(currentDoc.name);
    }
  }, [currentDoc]);
  
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
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (currentDoc) {
      setEditName(currentDoc.name);
    }
  };
  
  return (
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
              <DropdownMenuContent align="start" className="w-64">
                {savedDocuments.length === 0 ? (
                  <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                    No saved documents
                  </div>
                ) : (
                  savedDocuments.map((doc) => (
                    <DropdownMenuItem
                      key={doc.id}
                      onClick={() => loadDocument(doc.id)}
                      className={cn(
                        "flex flex-col items-start gap-1 cursor-pointer",
                        currentDocId === doc.id && "bg-accent"
                      )}
                    >
                      <div className="font-medium text-sm">{doc.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(doc.timestamp, { addSuffix: true })}
                      </div>
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
      
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Database className="h-3 w-3" />
        <span className="hidden sm:inline">Local Storage</span>
      </div>
    </div>
  );
};