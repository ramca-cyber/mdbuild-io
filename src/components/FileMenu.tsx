import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { useDocumentStore } from '@/store/documentStore';
import { templates } from '@/lib/templates';
import { toast } from 'sonner';
import {
  Menu, Plus, Save, Trash2, FolderOpen, Clock, FileText, FileUp, FileDown,
  FileType, Code, BookTemplate, Files, Printer,
} from 'lucide-react';

interface FileMenuProps {
  currentDoc: { id: string; name: string } | undefined;
  savedDocuments: { id: string; name: string; timestamp: number }[];
  currentDocId: string | null;
  hasUnsavedChanges: boolean;
  onNewDocument: () => void;
  onQuickSave: () => void;
  onOpenSaveAs: () => void;
  onOpenDocDialog: () => void;
  onDuplicate: () => void;
  onPrint: () => void;
  onImport: () => void;
  onExportMarkdown: () => void;
  onExportHTML: () => void;
  onExportPDF: () => void;
  onExportDOCX: () => void;
  onDeleteCurrent: () => void;
  loadDocument: (id: string) => void;
  getRecentDocuments: () => { id: string; name: string; timestamp: number }[];
}

export function FileMenu({
  currentDoc,
  savedDocuments,
  currentDocId,
  hasUnsavedChanges,
  onNewDocument,
  onQuickSave,
  onOpenSaveAs,
  onOpenDocDialog,
  onDuplicate,
  onPrint,
  onImport,
  onExportMarkdown,
  onExportHTML,
  onExportPDF,
  onExportDOCX,
  onDeleteCurrent,
  loadDocument,
  getRecentDocuments,
}: FileMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" aria-label="File menu">
          <Menu className="h-4 w-4" />
          File
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>File Operations</DropdownMenuLabel>

        <DropdownMenuItem onClick={onNewDocument} className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          New Document
          <DropdownMenuShortcut>Ctrl+N</DropdownMenuShortcut>
        </DropdownMenuItem>

        {savedDocuments.length > 0 && (
          <DropdownMenuItem onClick={onOpenDocDialog} className="cursor-pointer">
            <FolderOpen className="h-4 w-4 mr-2" />
            Open Document...
          </DropdownMenuItem>
        )}

        {savedDocuments.length > 0 && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Clock className="h-4 w-4 mr-2" />
              Recent Documents
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-56">
              {getRecentDocuments().map((doc) => (
                <DropdownMenuItem
                  key={doc.id}
                  onClick={() => {
                    loadDocument(doc.id);
                    toast.success(`Opened "${doc.name}"`);
                  }}
                  className={`cursor-pointer ${doc.id === currentDocId ? 'bg-accent' : ''}`}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="truncate">{doc.name}</span>
                  {doc.id === currentDocId && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onQuickSave}
          className="cursor-pointer"
          disabled={!hasUnsavedChanges && !!currentDoc}
        >
          <Save className="h-4 w-4 mr-2" />
          Save
          {hasUnsavedChanges && <span className="ml-1 text-primary">•</span>}
          <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
        </DropdownMenuItem>

        {currentDoc && (
          <DropdownMenuItem onClick={onOpenSaveAs} className="cursor-pointer">
            <FileText className="h-4 w-4 mr-2" />
            Save As...
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={onDuplicate} className="cursor-pointer">
          <Files className="h-4 w-4 mr-2" />
          Duplicate Document
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onPrint} className="cursor-pointer">
          <Printer className="h-4 w-4 mr-2" />
          Print
          <DropdownMenuShortcut>Ctrl+P</DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <BookTemplate className="h-4 w-4 mr-2" />
            Templates
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-56">
            {templates.map((template) => (
              <DropdownMenuItem
                key={template.name}
                onClick={() => {
                  useDocumentStore.getState().setContent(template.content);
                  toast.success(`Applied ${template.name} template`);
                }}
                className="cursor-pointer"
              >
                <template.icon className="h-4 w-4 mr-2" />
                {template.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem onClick={onImport} className="cursor-pointer">
          <FileUp className="h-4 w-4 mr-2" />
          Import File...
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FileDown className="h-4 w-4 mr-2" />
            Export As
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem onClick={onExportMarkdown} className="cursor-pointer">
              <Code className="h-4 w-4 mr-2" />
              Markdown (.md)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportHTML} className="cursor-pointer">
              <FileType className="h-4 w-4 mr-2" />
              HTML (.html)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportPDF} className="cursor-pointer">
              <FileText className="h-4 w-4 mr-2" />
              PDF (.pdf)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportDOCX} className="cursor-pointer">
              <FileText className="h-4 w-4 mr-2" />
              Word (.docx)
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {currentDoc && (
          <DropdownMenuItem
            onClick={onDeleteCurrent}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Current Document
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
