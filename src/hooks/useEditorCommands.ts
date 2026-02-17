import { useEditorViewStore } from '@/store/editorViewStore';

/**
 * @deprecated Use useEditorViewStore directly instead.
 * This hook is kept for backward compatibility.
 */
export const useEditorCommands = () => {
  const store = useEditorViewStore();

  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    store.insert('wrap', { before, after, placeholder });
  };

  const insertDate = () => {
    const date = new Date().toLocaleDateString();
    store.insert('text', { text: date });
  };

  return {
    dispatchCommand: () => {}, // no-op, kept for compat
    insertText,
    undo: store.undo,
    redo: store.redo,
    deleteLine: store.deleteLine,
    moveLineUp: store.moveLineUp,
    moveLineDown: store.moveLineDown,
    duplicateLine: store.duplicateLine,
    insertDate,
  };
};
