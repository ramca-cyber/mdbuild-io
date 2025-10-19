export interface StorageInfo {
  bytes: number;
  kb: number;
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
    const kb = bytes / 1024;
    const mb = bytes / (1024 * 1024);
    const percentage = (bytes / STORAGE_LIMIT) * 100;
    
    return {
      bytes,
      kb,
      mb,
      percentage,
      isNearLimit: percentage >= WARNING_THRESHOLD * 100,
      isCritical: percentage >= CRITICAL_THRESHOLD * 100,
    };
  } catch (error) {
    console.error('Error calculating storage:', error);
    return {
      bytes: 0,
      kb: 0,
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

export const canSaveDocument = (content: string): { allowed: boolean; reason?: string } => {
  const currentUsage = calculateStorageUsage();
  
  if (currentUsage.isCritical) {
    return {
      allowed: false,
      reason: 'Storage is critically full (>95%). Please delete some documents.',
    };
  }
  
  const estimatedNewSize = new Blob([content]).size;
  const totalAfterSave = currentUsage.bytes + estimatedNewSize;
  
  if (totalAfterSave > STORAGE_LIMIT) {
    return {
      allowed: false,
      reason: `Would exceed storage limit (${formatStorageSize(totalAfterSave)} > 4MB)`,
    };
  }
  
  return { allowed: true };
};
