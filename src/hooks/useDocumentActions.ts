import { useState } from 'react';
import { useDocumentStore } from '@/store/documentStore';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from 'sonner';

/**
 * Encapsulates all document-level actions: create, save, delete, rename,
 * export (MD/HTML/PDF/DOCX), import, duplicate, print, clipboard copy, and clear.
 */
export function useDocumentActions() {
  const {
    savedDocuments,
    currentDocId,
    createNewDocument,
    deleteDocument,
    renameDocument,
    loadDocument,
    saveDocument,
    saveDocumentAs,
    content,
    hasUnsavedChanges,
  } = useDocumentStore();

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [clearAllConfirm, setClearAllConfirm] = useState(false);
  const [newDocConfirm, setNewDocConfirm] = useState(false);
  const [saveAsOpen, setSaveAsOpen] = useState(false);
  const [openDocOpen, setOpenDocOpen] = useState(false);

  const currentDoc = savedDocuments.find((doc) => doc.id === currentDocId);

  const handleNewDocument = () => {
    if (hasUnsavedChanges) {
      setNewDocConfirm(true);
    } else {
      createNewDocument();
      toast.success('New document created');
    }
  };

  const confirmNewDocument = () => {
    createNewDocument();
    setNewDocConfirm(false);
    toast.success('New document created');
  };

  const handleQuickSave = () => {
    if (currentDoc) {
      saveDocument(currentDoc.name);
      toast.success('Document saved');
    } else {
      const title = content.match(/^#\s+(.+)$/m)?.[1] || 'Untitled';
      saveDocument(title);
      toast.success('Document saved');
    }
  };

  const handleSaveAs = (name: string) => {
    saveDocumentAs(name);
    toast.success('Document saved as new file');
  };

  const handleDelete = (id: string) => {
    deleteDocument(id);
    setDeleteConfirm(null);
    toast.success('Document deleted');
  };

  const handleDuplicateDocument = () => {
    try {
      if (currentDoc) {
        const newName = `${currentDoc.name} (Copy)`;
        saveDocumentAs(newName);
        toast.success(`Document duplicated as "${newName}"`);
      } else {
        const title = content.match(/^#\s+(.+)$/m)?.[1] || 'Untitled';
        saveDocument(`${title} (Copy)`);
        toast.success('Document duplicated');
      }
    } catch {
      toast.error('Failed to duplicate document. Please try again.');
    }
  };

  const handleExportMarkdown = () => {
    try {
      const fileName = currentDoc?.name || content.match(/^#\s+(.+)$/m)?.[1] || 'document';
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported as Markdown');
    } catch {
      toast.error('Failed to export as Markdown');
    }
  };

  const handleExportHTML = async () => {
    try {
      const fileName = currentDoc?.name || content.match(/^#\s+(.+)$/m)?.[1] || 'document';
      const previewElement = document.querySelector('.preview-content')?.parentElement;
      if (!previewElement) { toast.error('Preview not available'); return; }

      const toastId = toast.loading('Exporting HTML...');
      const { exportToHtmlWithInlineStyles } = await import('@/lib/exportUtils');

      await exportToHtmlWithInlineStyles(
        previewElement as HTMLElement,
        fileName,
        (progress) => { toast.loading(`Exporting HTML... ${progress}%`, { id: toastId }); }
      );
      toast.success('Exported as HTML', { id: toastId });
    } catch {
      toast.error('Failed to export HTML');
    }
  };

  const handleExportPDF = async () => {
    try {
      const fileName = currentDoc?.name || content.match(/^#\s+(.+)$/m)?.[1] || 'document';
      const previewElement = document.querySelector('.preview-content')?.parentElement;
      if (!previewElement) { toast.error('Preview not available'); return; }

      const toastId = toast.loading('Generating PDF...');
      const { exportToPdfWithRendering } = await import('@/lib/exportUtils');
      const { documentSettings } = useSettingsStore.getState();

      await exportToPdfWithRendering(
        previewElement as HTMLElement,
        fileName,
        (progress) => { toast.loading(`Generating PDF... ${progress}%`, { id: toastId }); },
        documentSettings
      );
      toast.success('Exported as PDF', { id: toastId });
    } catch {
      toast.error('Failed to export PDF');
    }
  };

  const handleExportDOCX = async () => {
    try {
      const fileName = currentDoc?.name || content.match(/^#\s+(.+)$/m)?.[1] || 'document';
      const previewElement = document.querySelector('.preview-content')?.parentElement;
      if (!previewElement) { toast.error('Preview not available'); return; }

      const toastId = toast.loading('Preparing DOCX export...');
      const { createDocxFromPreview } = await import('@/lib/exportUtils');
      const { documentSettings } = useSettingsStore.getState();

      const blob = await createDocxFromPreview(
        previewElement as HTMLElement,
        fileName,
        (progress) => { toast.loading(`Preparing DOCX... ${progress}%`, { id: toastId }); },
        documentSettings
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported as DOCX', { id: toastId });
    } catch {
      toast.error('Failed to export DOCX');
    }
  };

  const handleImport = () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.md,.txt';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          if (file.size > 5 * 1024 * 1024) {
            toast.error('File too large. Maximum size is 5MB.');
            return;
          }
          const reader = new FileReader();
          reader.onload = (ev) => {
            try {
              const text = ev.target?.result as string;
              if (!text) throw new Error('Failed to read file content');
              createNewDocument();
              setTimeout(() => {
                useDocumentStore.getState().setContent(text);
                toast.success('File imported successfully');
              }, 0);
            } catch {
              toast.error('Failed to import file. Please check the file format.');
            }
          };
          reader.onerror = () => { toast.error('Failed to read file'); };
          reader.readAsText(file);
        }
      };
      input.click();
    } catch {
      toast.error('Failed to import file. Please try again.');
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Content copied to clipboard');
    } catch {
      toast.error('Failed to copy to clipboard. Please try again.');
    }
  };

  const handleClearAll = () => {
    try {
      useDocumentStore.getState().setContent('');
      setClearAllConfirm(false);
      toast.success('Document cleared');
    } catch {
      toast.error('Failed to clear document. Please try again.');
    }
  };

  const handlePrint = async () => {
    const { waitForPrintReady, prepareArticleForPrint, restoreArticleAfterPrint } = await import('@/lib/exportUtils');
    const savedStyles = prepareArticleForPrint();
    await waitForPrintReady();
    const cleanup = () => {
      restoreArticleAfterPrint(savedStyles);
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
  };

  const getRecentDocuments = () => {
    return [...savedDocuments]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  };

  return {
    // State
    savedDocuments,
    currentDocId,
    currentDoc,
    content,
    hasUnsavedChanges,
    loadDocument,
    renameDocument,
    saveDocument,

    // Dialog state
    deleteConfirm, setDeleteConfirm,
    clearAllConfirm, setClearAllConfirm,
    newDocConfirm, setNewDocConfirm,
    saveAsOpen, setSaveAsOpen,
    openDocOpen, setOpenDocOpen,

    // Actions
    handleNewDocument,
    confirmNewDocument,
    handleQuickSave,
    handleSaveAs,
    handleDelete,
    handleDuplicateDocument,
    handleExportMarkdown,
    handleExportHTML,
    handleExportPDF,
    handleExportDOCX,
    handleImport,
    handleCopyToClipboard,
    handleClearAll,
    handlePrint,
    getRecentDocuments,
  };
}
