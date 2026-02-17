import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatStorageSize } from '@/lib/storageUtils';

interface StorageInfo {
  bytes: number;
  percentage: number;
  isNearLimit: boolean;
  isCritical: boolean;
}

interface StorageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storageInfo: StorageInfo;
  documentCount: number;
}

export function StorageDialog({ open, onOpenChange, storageInfo, documentCount }: StorageDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Storage Usage</AlertDialogTitle>
          <AlertDialogDescription>
            Local browser storage information for your documents.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Used Storage:</span>
              <span>{formatStorageSize(storageInfo.bytes)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Total Available:</span>
              <span>4 MB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium">Percentage:</span>
              <span className={storageInfo.isCritical ? 'text-destructive font-semibold' : storageInfo.isNearLimit ? 'text-yellow-600 dark:text-yellow-500 font-semibold' : ''}>
                {storageInfo.percentage.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                storageInfo.isCritical
                  ? 'bg-destructive'
                  : storageInfo.isNearLimit
                  ? 'bg-yellow-500'
                  : 'bg-primary'
              }`}
              style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Saved Documents:</span>
              <span>{documentCount}</span>
            </div>
          </div>

          {storageInfo.isNearLimit && (
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Storage is running low. Consider deleting old documents or exporting them to free up space.
              </p>
            </div>
          )}

          {storageInfo.isCritical && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
              <p className="text-sm text-destructive">
                🚨 Critical storage level! Delete documents immediately to avoid data loss.
              </p>
            </div>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
