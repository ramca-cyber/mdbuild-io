import { useEditorStore } from '@/store/editorStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const SavedDocuments = () => {
  const { savedDocuments, currentDocId, loadDocument, deleteDocument } = useEditorStore();

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
      <div className="p-4 space-y-2">
        <h3 className="font-semibold mb-3 text-sm text-foreground">Saved Documents</h3>
        {savedDocuments.map((doc) => (
          <div
            key={doc.id}
            className={`p-3 rounded-lg border transition-colors ${
              currentDocId === doc.id ? 'bg-accent border-primary' : 'hover:bg-muted'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <button
                onClick={() => loadDocument(doc.id)}
                className="flex-1 text-left"
              >
                <div className="font-medium text-sm mb-1">{doc.name}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(doc.timestamp, { addSuffix: true })}
                </div>
              </button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteDocument(doc.id)}
                className="h-7 w-7"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
