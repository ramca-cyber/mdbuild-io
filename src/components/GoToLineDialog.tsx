import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useEditorViewStore } from '@/store/editorViewStore';

interface GoToLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalLines: number;
}

export function GoToLineDialog({ open, onOpenChange, totalLines }: GoToLineDialogProps) {
  const [lineNumber, setLineNumber] = useState('');
  const { goToLine } = useEditorViewStore();

  useEffect(() => {
    if (open) {
      setLineNumber('');
    }
  }, [open]);

  const handleGoTo = () => {
    const line = parseInt(lineNumber);
    if (!isNaN(line) && line >= 1 && line <= totalLines) {
      goToLine(line);
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleGoTo();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Go To Line</DialogTitle>
          <DialogDescription>
            Enter a line number between 1 and {totalLines}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="line-number">Line number</Label>
            <Input
              id="line-number"
              type="number"
              min={1}
              max={totalLines}
              value={lineNumber}
              onChange={(e) => setLineNumber(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`1-${totalLines}`}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleGoTo}>Go To Line</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
