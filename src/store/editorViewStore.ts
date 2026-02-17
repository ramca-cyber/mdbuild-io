import { create } from 'zustand';
import { EditorView } from '@codemirror/view';
import { EditorSelection } from '@codemirror/state';
import {
  undo as cmUndo,
  redo as cmRedo,
  undoDepth,
  redoDepth,
  deleteLine as cmDeleteLine,
  copyLineDown,
  moveLineUp as cmMoveLineUp,
  moveLineDown as cmMoveLineDown,
  selectLine as cmSelectLine,
} from '@codemirror/commands';

type InsertKind = 'wrap' | 'block' | 'text';
type CaseType = 'upper' | 'lower' | 'title';
type CleanupType = 'trailing' | 'empty' | 'trim';

interface DebouncedFn {
  flush: () => void;
}

interface EditorViewState {
  view: EditorView | null;
  canUndo: boolean;
  canRedo: boolean;
  debouncedSetContent: DebouncedFn | null;
  showGoToDialog: boolean;

  setView: (view: EditorView | null) => void;
  setDebouncedSetContent: (fn: DebouncedFn | null) => void;
  setShowGoToDialog: (show: boolean) => void;
  updateHistoryState: () => void;

  // Commands
  undo: () => void;
  redo: () => void;
  selectAll: () => void;
  deleteLine: () => void;
  duplicateLine: () => void;
  selectLine: () => void;
  moveLineUp: () => void;
  moveLineDown: () => void;
  goToLine: (line: number) => void;
  convertCase: (caseType: CaseType) => void;
  textCleanup: (cleanupType: CleanupType) => void;
  flushContent: () => void;
  insert: (kind: InsertKind, opts: {
    before?: string;
    after?: string;
    placeholder?: string;
    block?: string;
    text?: string;
  }) => void;
}

export const useEditorViewStore = create<EditorViewState>((set, get) => ({
  view: null,
  canUndo: false,
  canRedo: false,
  debouncedSetContent: null,
  showGoToDialog: false,

  setView: (view) => set({ view }),
  setDebouncedSetContent: (fn) => set({ debouncedSetContent: fn }),
  setShowGoToDialog: (show) => set({ showGoToDialog: show }),

  updateHistoryState: () => {
    const { view } = get();
    if (!view) return;
    set({
      canUndo: undoDepth(view.state) > 0,
      canRedo: redoDepth(view.state) > 0,
    });
  },

  undo: () => {
    const { view, updateHistoryState } = get();
    if (!view) return;
    cmUndo(view);
    updateHistoryState();
  },

  redo: () => {
    const { view, updateHistoryState } = get();
    if (!view) return;
    cmRedo(view);
    updateHistoryState();
  },

  selectAll: () => {
    const { view } = get();
    if (!view) return;
    const doc = view.state.doc;
    view.dispatch({
      selection: { anchor: 0, head: doc.length },
    });
    view.focus();
  },

  deleteLine: () => {
    const { view, updateHistoryState } = get();
    if (!view) return;
    cmDeleteLine(view);
    updateHistoryState();
  },

  duplicateLine: () => {
    const { view, updateHistoryState } = get();
    if (!view) return;
    copyLineDown(view);
    updateHistoryState();
  },

  selectLine: () => {
    const { view } = get();
    if (!view) return;
    cmSelectLine(view);
  },

  moveLineUp: () => {
    const { view, updateHistoryState } = get();
    if (!view) return;
    cmMoveLineUp(view);
    updateHistoryState();
  },

  moveLineDown: () => {
    const { view, updateHistoryState } = get();
    if (!view) return;
    cmMoveLineDown(view);
    updateHistoryState();
  },

  goToLine: (line: number) => {
    const { view } = get();
    if (!view || typeof line !== 'number') return;
    const doc = view.state.doc;
    const lineCount = doc.lines;
    const targetLine = Math.min(Math.max(1, line), lineCount);
    const pos = doc.line(targetLine).from;
    view.dispatch({
      selection: { anchor: pos },
      scrollIntoView: true,
    });
    view.focus();
  },

  convertCase: (caseType: CaseType) => {
    const { view, updateHistoryState } = get();
    if (!view) return;
    const selection = view.state.selection.main;
    if (selection.from === selection.to) return;

    const selectedText = view.state.sliceDoc(selection.from, selection.to);
    let convertedText = selectedText;

    switch (caseType) {
      case 'upper':
        convertedText = selectedText.toUpperCase();
        break;
      case 'lower':
        convertedText = selectedText.toLowerCase();
        break;
      case 'title':
        convertedText = selectedText.replace(/\w\S*/g, (txt) =>
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
        break;
    }

    view.dispatch({
      changes: { from: selection.from, to: selection.to, insert: convertedText },
      selection: { anchor: selection.from, head: selection.from + convertedText.length },
    });
    updateHistoryState();
  },

  textCleanup: (cleanupType: CleanupType) => {
    const { view, updateHistoryState } = get();
    if (!view) return;
    const text = view.state.doc.toString();
    let cleaned = text;

    switch (cleanupType) {
      case 'trailing':
        cleaned = text.split('\n').map((line) => line.replace(/\s+$/, '')).join('\n');
        break;
      case 'empty':
        cleaned = text.replace(/\n{3,}/g, '\n\n');
        break;
      case 'trim':
        cleaned = text.trim();
        break;
    }

    if (cleaned !== text) {
      view.dispatch({
        changes: { from: 0, to: text.length, insert: cleaned },
      });
      updateHistoryState();
    }
  },

  flushContent: () => {
    get().debouncedSetContent?.flush();
  },

  insert: (kind, opts) => {
    const { view, updateHistoryState } = get();
    if (!view) return;

    const state = view.state;
    const selection = state.selection.main;

    if (kind === 'text') {
      // Plain text insertion at cursor
      const text = opts.text || '';
      view.dispatch({
        changes: { from: selection.from, to: selection.to, insert: text },
        selection: EditorSelection.cursor(selection.from + text.length),
        scrollIntoView: true,
      });
    } else if (kind === 'wrap') {
      const before = opts.before || '';
      const after = opts.after || '';
      const placeholder = opts.placeholder || 'text';
      const selectedText = state.sliceDoc(selection.from, selection.to);
      const textToInsert = selectedText || placeholder;
      const fullText = before + textToInsert + after;

      view.dispatch({
        changes: { from: selection.from, to: selection.to, insert: fullText },
        selection: EditorSelection.cursor(
          selection.from + before.length + textToInsert.length + after.length
        ),
        scrollIntoView: true,
      });
    } else if (kind === 'block') {
      const block = opts.block || '';
      const doc = state.doc;
      const line = doc.lineAt(selection.from);
      const isStartOfLine = selection.from === line.from;
      const isEndOfDoc = selection.from === doc.length;

      const prefix = isStartOfLine || line.text.trim() === '' ? '' : '\n\n';
      const suffix = isEndOfDoc ? '' : '\n\n';
      const fullBlock = prefix + block + suffix;

      view.dispatch({
        changes: { from: selection.from, to: selection.from, insert: fullBlock },
        selection: EditorSelection.cursor(selection.from + fullBlock.length),
        scrollIntoView: true,
      });
    }

    view.focus();
    updateHistoryState();
  },
}));
