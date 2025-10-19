import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SavedDocument } from '@/store/editorStore';
import { Search, FileText, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface OpenDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: SavedDocument[];
  currentDocId: string | null;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}

export function OpenDocumentDialog({ 
  open, 
  onOpenChange, 
  documents, 
  currentDocId,
  onLoad, 
  onDelete 
}: OpenDocumentDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');

  const filteredAndSortedDocs = useMemo(() => {
    let filtered = documents.filter(doc => 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return b.timestamp - a.timestamp;
    });

    return filtered;
  }, [documents, searchQuery, sortBy]);

  const handleLoad = (id: string) => {
    onLoad(id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Open Document</DialogTitle>
          <DialogDescription>
            Search and open your saved documents
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy(sortBy === 'name' ? 'date' : 'name')}
            >
              Sort by {sortBy === 'name' ? 'Date' : 'Name'}
            </Button>
          </div>

          <ScrollArea className="h-[400px] pr-4">
            {filteredAndSortedDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mb-4 opacity-50" />
                <p>No documents found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAndSortedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      doc.id === currentDocId 
                        ? 'bg-accent border-primary' 
                        : 'hover:bg-accent/50 cursor-pointer'
                    }`}
                    onClick={() => doc.id !== currentDocId && handleLoad(doc.id)}
                  >
                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{format(doc.timestamp, 'MMM d, yyyy - h:mm a')}</span>
                      </div>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(doc.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
