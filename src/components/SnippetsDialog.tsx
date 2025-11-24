import { useState } from 'react';
import { Plus, Trash2, Download, Upload } from 'lucide-react';
import { useSnippetsStore, Snippet } from '@/store/snippetsStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface SnippetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SnippetsDialog = ({ open, onOpenChange }: SnippetsDialogProps) => {
  const { snippets, addSnippet, updateSnippet, deleteSnippet, importSnippets, exportSnippets } = useSnippetsStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSnippet, setNewSnippet] = useState({ trigger: '', content: '', description: '' });

  const handleAdd = () => {
    if (!newSnippet.trigger || !newSnippet.content) {
      toast.error('Trigger and content are required');
      return;
    }
    addSnippet(newSnippet);
    setNewSnippet({ trigger: '', content: '', description: '' });
    toast.success('Snippet added');
  };

  const handleUpdate = (id: string, updates: Partial<Snippet>) => {
    updateSnippet(id, updates);
    setEditingId(null);
    toast.success('Snippet updated');
  };

  const handleDelete = (id: string) => {
    deleteSnippet(id);
    toast.success('Snippet deleted');
  };

  const handleExport = () => {
    const data = JSON.stringify(exportSnippets(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'snippets.json';
    a.click();
    toast.success('Snippets exported');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            importSnippets(data);
            toast.success('Snippets imported');
          } catch (error) {
            toast.error('Invalid snippets file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Manage Snippets</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleImport} variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">Add New Snippet</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="trigger">Trigger</Label>
                <Input
                  id="trigger"
                  placeholder="e.g., date"
                  value={newSnippet.trigger}
                  onChange={(e) => setNewSnippet({ ...newSnippet, trigger: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="e.g., Current date"
                  value={newSnippet.description}
                  onChange={(e) => setNewSnippet({ ...newSnippet, description: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAdd} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Snippet content (use ${date} for current date)"
                value={newSnippet.content}
                onChange={(e) => setNewSnippet({ ...newSnippet, content: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Your Snippets</h3>
            <ScrollArea className="h-[300px] border rounded-lg p-4">
              <div className="space-y-3">
                {snippets.map((snippet) => (
                  <div key={snippet.id} className="border rounded-lg p-3 space-y-2">
                    {editingId === snippet.id ? (
                      <div className="space-y-2">
                        <Input
                          value={snippet.trigger}
                          onChange={(e) => handleUpdate(snippet.id, { trigger: e.target.value })}
                          placeholder="Trigger"
                        />
                        <Input
                          value={snippet.description}
                          onChange={(e) => handleUpdate(snippet.id, { description: e.target.value })}
                          placeholder="Description"
                        />
                        <Textarea
                          value={snippet.content}
                          onChange={(e) => handleUpdate(snippet.id, { content: e.target.value })}
                          placeholder="Content"
                          rows={3}
                        />
                        <Button onClick={() => setEditingId(null)} size="sm">
                          Done
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                {snippet.trigger}
                              </code>
                              <span className="text-sm text-muted-foreground">
                                {snippet.description}
                              </span>
                            </div>
                            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                              {snippet.content}
                            </pre>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setEditingId(snippet.id)}
                              variant="ghost"
                              size="sm"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDelete(snippet.id)}
                              variant="ghost"
                              size="sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>How to use:</strong> Type the trigger word and press <kbd className="px-2 py-1 bg-muted rounded">Tab</kbd> to expand the snippet.</p>
            <p><strong>Variables:</strong> Use <code>${'{date}'}</code> in your snippet content for dynamic date insertion.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
