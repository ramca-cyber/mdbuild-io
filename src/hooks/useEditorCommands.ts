import { useCallback } from 'react';

export const useEditorCommands = () => {
  const dispatchCommand = useCallback((command: string, payload?: any) => {
    window.dispatchEvent(new CustomEvent(command, { detail: payload }));
  }, []);

  const insertText = useCallback((before: string, after: string = '', placeholder: string = '') => {
    dispatchCommand('editor-insert', { before, after, placeholder });
  }, [dispatchCommand]);

  const undo = useCallback(() => {
    dispatchCommand('editor-undo');
  }, [dispatchCommand]);

  const redo = useCallback(() => {
    dispatchCommand('editor-redo');
  }, [dispatchCommand]);

  const deleteLine = useCallback(() => {
    dispatchCommand('editor-delete-line');
  }, [dispatchCommand]);

  const moveLineUp = useCallback(() => {
    dispatchCommand('editor-move-line-up');
  }, [dispatchCommand]);

  const moveLineDown = useCallback(() => {
    dispatchCommand('editor-move-line-down');
  }, [dispatchCommand]);

  const duplicateLine = useCallback(() => {
    dispatchCommand('editor-duplicate-line');
  }, [dispatchCommand]);

  const insertDate = useCallback(() => {
    const date = new Date().toLocaleDateString();
    insertText(date);
  }, [insertText]);

  return {
    dispatchCommand,
    insertText,
    undo,
    redo,
    deleteLine,
    moveLineUp,
    moveLineDown,
    duplicateLine,
    insertDate,
  };
};
