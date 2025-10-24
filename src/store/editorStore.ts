// Legacy compatibility layer - re-exports from split stores
// This file maintains backward compatibility while we transition to the new store architecture

import { useDocumentStore, getDefaultContent } from './documentStore';
import { useSettingsStore } from './settingsStore';
import { useErrorStore } from './errorStore';
import { useSearchStore } from './searchStore';

export { useDocumentStore, getDefaultContent } from './documentStore';
export { useSettingsStore } from './settingsStore';
export { useErrorStore } from './errorStore';
export { useSearchStore } from './searchStore';

export type { SavedDocument } from './documentStore';
export type { Theme } from './settingsStore';
export type { EditorError } from './errorStore';

// Combined hook for components that need multiple stores
// Usage: const { content, theme, errors } = useEditorStore();
export const useEditorStore = () => {
  const documentStore = useDocumentStore();
  const settingsStore = useSettingsStore();
  const errorStore = useErrorStore();
  const searchStore = useSearchStore();

  return {
    ...documentStore,
    ...settingsStore,
    ...errorStore,
    ...searchStore,
  };
};
