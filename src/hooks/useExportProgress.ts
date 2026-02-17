import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export const useExportProgress = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const startExport = useCallback(() => {
    setIsExporting(true);
    setProgress(0);
  }, []);

  const updateProgress = useCallback((value: number) => {
    setProgress(value);
  }, []);

  const finishExport = useCallback(() => {
    setProgress(100);
    setTimeout(() => {
      setIsExporting(false);
      setProgress(0);
    }, 500);
  }, []);

  const exportWithProgress = useCallback(
    async <T,>(
      exportFn: (onProgress: (progress: number) => void) => Promise<T>,
      successMessage: string
    ): Promise<T | null> => {
      try {
        // Flush any pending debounced content before export
        window.dispatchEvent(new CustomEvent('editor-flush-content'));
        startExport();
        const result = await exportFn(updateProgress);
        finishExport();
        toast.success(successMessage);
        return result;
      } catch (error) {
        // Error in export progress hook
        toast.error('Export failed. Please try again.');
        setIsExporting(false);
        setProgress(0);
        return null;
      }
    },
    [startExport, updateProgress, finishExport]
  );

  return {
    isExporting,
    progress,
    exportWithProgress,
  };
};
