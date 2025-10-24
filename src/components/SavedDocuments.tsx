import { useState, useMemo } from 'react';
import { useDocumentStore } from '@/store/documentStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Trash2, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const SavedDocuments = () => {
  const { savedDocuments, currentDocId, loadDocument, deleteDocument } = useDocumentStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLoadDocument = (id: string) => {
    try {
      loadDocument(id);
    } catch (error) {
      // Error loading document
      // Toast will be shown by the store if there's an error
    }
  };

  const handleDeleteDocument = (id: string) => {
    try {
      deleteDocument(id);
    } catch (error) {
      // Error deleting document
      // Toast will be shown by the store if there's an error
    }
  };

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return savedDocuments;
    
    const query = searchQuery.toLowerCase();
    return savedDocuments.filter(doc => 
      doc.name.toLowerCase().includes(query) ||
      doc.content.toLowerCase().includes(query)
    );
  }, [savedDocuments, searchQuery]);

  if (savedDocuments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
        <FileText className="w-12 h-12 mb-2 opacity-20" />
        <p className="text-sm">No saved documents</p>
        <p className="text-xs mt-1">Use the Save button in the toolbar</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-foreground">Saved Documents</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
              aria-label="Search documents"
            />
          </div>
          {searchQuery && (
            <p className="text-xs text-muted-foreground">
              {filteredDocuments.length} of {savedDocuments.length} document{savedDocuments.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-center">
            <Search className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">No documents found</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        ) : (
          filteredDocuments.map((doc) => (
          <div
            key={doc.id}
            className={`p-3 rounded-lg border transition-colors ${
              currentDocId === doc.id ? 'bg-accent border-primary' : 'hover:bg-muted'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <button
                onClick={() => handleLoadDocument(doc.id)}
                className="flex-1 text-left focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded p-1 -m-1"
                aria-label={`Load document ${doc.name}`}
              >
                <div className="font-medium text-sm mb-1">{doc.name}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(doc.timestamp, { addSuffix: true })}
                </div>
              </button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDeleteDocument(doc.id)}
                className="h-7 w-7"
                aria-label={`Delete document ${doc.name}`}
                title="Delete document"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
};
