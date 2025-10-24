import { toast } from "@/hooks/use-toast";

export interface StorageInfo {
  bytes: number;
  mb: number;
  percentage: number;
  isNearLimit: boolean;
  isCritical: boolean;
}

const STORAGE_LIMIT = 5 * 1024 * 1024; // 5MB soft limit (browsers typically allow 5-10MB)
const WARNING_THRESHOLD = 0.8; // 80%
const CRITICAL_THRESHOLD = 0.95; // 95%

export const calculateStorageUsage = (): StorageInfo => {
  try {
    const data = localStorage.getItem('mdbuild-storage') || '';
    const bytes = new Blob([data]).size;
    const mb = bytes / (1024 * 1024);
    const percentage = (bytes / STORAGE_LIMIT) * 100;
    
    const result = {
      bytes,
      mb,
      percentage,
      isNearLimit: percentage >= WARNING_THRESHOLD * 100,
      isCritical: percentage >= CRITICAL_THRESHOLD * 100,
    };
    
    // Show warnings for storage issues
    if (result.isCritical) {
      toast({
        title: "Storage Critical",
        description: `You're using ${percentage.toFixed(0)}% of available storage. Consider deleting old documents.`,
        variant: "destructive",
      });
    } else if (result.isNearLimit) {
      toast({
        title: "Storage Warning",
        description: `You're using ${percentage.toFixed(0)}% of available storage.`,
      });
    }
    
    return result;
  } catch (error) {
    // Error calculating storage
    toast({
      title: "Storage Error",
      description: "Failed to calculate storage usage. Please try again.",
      variant: "destructive",
    });
    return {
      bytes: 0,
      mb: 0,
      percentage: 0,
      isNearLimit: false,
      isCritical: false,
    };
  }
};

export const formatStorageSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};
