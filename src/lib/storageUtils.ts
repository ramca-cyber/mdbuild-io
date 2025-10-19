export interface StorageInfo {
  bytes: number;
  mb: number;
  percentage: number;
  isNearLimit: boolean;
  isCritical: boolean;
}

const STORAGE_LIMIT = 4 * 1024 * 1024; // 4MB soft limit
const WARNING_THRESHOLD = 0.8; // 80%
const CRITICAL_THRESHOLD = 0.95; // 95%

export const calculateStorageUsage = (): StorageInfo => {
  try {
    const data = localStorage.getItem('mdbuild-storage') || '';
    const bytes = new Blob([data]).size;
    const mb = bytes / (1024 * 1024);
    const percentage = (bytes / STORAGE_LIMIT) * 100;
    
    return {
      bytes,
      mb,
      percentage,
      isNearLimit: percentage >= WARNING_THRESHOLD * 100,
      isCritical: percentage >= CRITICAL_THRESHOLD * 100,
    };
  } catch (error) {
    console.error('Error calculating storage:', error);
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
