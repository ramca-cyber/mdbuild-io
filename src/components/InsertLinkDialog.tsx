import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InsertLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (url: string, text: string) => void;
  mode: 'link' | 'image';
}

export function InsertLinkDialog({ open, onOpenChange, onInsert, mode }: InsertLinkDialogProps) {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');

  const handleInsert = () => {
    if (url.trim()) {
      onInsert(url.trim(), text.trim());
      setUrl('');
      setText('');
      onOpenChange(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setUrl('');
      setText('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'link' ? 'Insert Link' : 'Insert Image'}</DialogTitle>
          <DialogDescription>
            {mode === 'link' ? 'Enter the URL and optional display text for your link.' : 'Enter the image URL and optional alt text.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="insert-url">{mode === 'image' ? 'Image URL' : 'URL'}</Label>
            <Input
              id="insert-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleInsert();
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="insert-text">{mode === 'image' ? 'Alt Text (optional)' : 'Display Text (optional)'}</Label>
            <Input
              id="insert-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={mode === 'image' ? 'image description' : 'link text'}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleInsert();
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button onClick={handleInsert} disabled={!url.trim()}>Insert</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
