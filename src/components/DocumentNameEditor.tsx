import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit2, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentNameEditorProps {
  currentDoc: { id: string; name: string } | undefined;
  hasUnsavedChanges: boolean;
  content: string;
  renameDocument: (id: string, name: string) => void;
  saveDocument: (name: string) => void;
}

export function DocumentNameEditor({
  currentDoc,
  hasUnsavedChanges,
  content,
  renameDocument,
  saveDocument,
}: DocumentNameEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

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

  if (isEditing) {
    return (
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
    );
  }

  return (
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
  );
}
