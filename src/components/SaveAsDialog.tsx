import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface SaveAsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentContent: string;
  onSave: (name: string) => void;
}

export function SaveAsDialog({ open, onOpenChange, currentContent, onSave }: SaveAsDialogProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      // Suggest name from content
      const suggestedName = currentContent.match(/^#\s+(.+)$/m)?.[1] || 'Untitled';
      setName(suggestedName);
      setError('');
    }
  }, [open, currentContent]);

  const handleSave = () => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError('Document name cannot be empty');
      return;
    }
    
    if (trimmedName.length > 100) {
      setError('Document name must be less than 100 characters');
      return;
    }
    
    onSave(trimmedName);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save As</DialogTitle>
          <DialogDescription>
            Create a copy of this document with a new name.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="doc-name">Document Name</Label>
            <Input
              id="doc-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter document name"
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
