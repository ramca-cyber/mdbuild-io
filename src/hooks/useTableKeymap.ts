import { useMemo } from 'react';
import { keymap } from '@codemirror/view';
import { EditorSelection, Prec } from '@codemirror/state';
import {
  isInTable,
  findTableAtCursor,
  findCellAtCursor,
  getNextCell,
  getPreviousCell,
  addRowBelow,
  addRowAbove,
  addColumnAfter,
  toggleColumnAlignment,
  deleteRow,
} from '@/lib/tableUtils';
import { toast } from 'sonner';

/**
 * Returns a CodeMirror keymap extension for table navigation and editing.
 * Handles Tab/Shift-Tab cell navigation, row/column operations, alignment toggling, and row deletion.
 */
export function useTableKeymap() {
  return useMemo(
    () =>
      Prec.high(
        keymap.of([
          {
            key: 'Tab',
            run: (view) => {
              const selection = view.state.selection.main;
              const text = view.state.doc.toString();
              if (!isInTable(text, selection.from)) return false;
              const table = findTableAtCursor(text, selection.from);
              if (!table) return false;
              const cell = findCellAtCursor(table, selection.from);
              if (!cell) return false;
              const nextCell = getNextCell(table, cell.row, cell.col);
              if (nextCell) {
                view.dispatch({
                  selection: EditorSelection.cursor(nextCell.pos),
                  scrollIntoView: true,
                });
                return true;
              }
              return false;
            },
          },
          {
            key: 'Shift-Tab',
            run: (view) => {
              const selection = view.state.selection.main;
              const text = view.state.doc.toString();
              if (!isInTable(text, selection.from)) return false;
              const table = findTableAtCursor(text, selection.from);
              if (!table) return false;
              const cell = findCellAtCursor(table, selection.from);
              if (!cell) return false;
              const prevCell = getPreviousCell(table, cell.row, cell.col);
              if (prevCell) {
                view.dispatch({
                  selection: EditorSelection.cursor(prevCell.pos),
                  scrollIntoView: true,
                });
                return true;
              }
              return false;
            },
          },
          {
            key: 'Ctrl-Shift-Enter',
            run: (view) => {
              const selection = view.state.selection.main;
              const text = view.state.doc.toString();
              if (!isInTable(text, selection.from)) return false;
              const table = findTableAtCursor(text, selection.from);
              if (!table) return false;
              const cell = findCellAtCursor(table, selection.from);
              if (!cell) return false;
              const result = addRowBelow(text, table, cell.row);
              view.dispatch({
                changes: { from: 0, to: text.length, insert: result.text },
                selection: EditorSelection.cursor(result.cursorPos),
                scrollIntoView: true,
              });
              toast.success('Row added below');
              return true;
            },
          },
          {
            key: 'Ctrl-Shift-Alt-Enter',
            run: (view) => {
              const selection = view.state.selection.main;
              const text = view.state.doc.toString();
              if (!isInTable(text, selection.from)) return false;
              const table = findTableAtCursor(text, selection.from);
              if (!table) return false;
              const cell = findCellAtCursor(table, selection.from);
              if (!cell) return false;
              const result = addRowAbove(text, table, cell.row);
              view.dispatch({
                changes: { from: 0, to: text.length, insert: result.text },
                selection: EditorSelection.cursor(result.cursorPos),
                scrollIntoView: true,
              });
              toast.success('Row added above');
              return true;
            },
          },
          {
            key: 'Ctrl-Shift-\\',
            run: (view) => {
              const selection = view.state.selection.main;
              const text = view.state.doc.toString();
              if (!isInTable(text, selection.from)) return false;
              const table = findTableAtCursor(text, selection.from);
              if (!table) return false;
              const cell = findCellAtCursor(table, selection.from);
              if (!cell) return false;
              const result = addColumnAfter(text, table, cell.col);
              view.dispatch({
                changes: { from: 0, to: text.length, insert: result.text },
                selection: EditorSelection.cursor(result.cursorPos),
                scrollIntoView: true,
              });
              toast.success('Column added');
              return true;
            },
          },
          {
            key: 'Ctrl-Shift-A',
            run: (view) => {
              const selection = view.state.selection.main;
              const text = view.state.doc.toString();
              if (!isInTable(text, selection.from)) return false;
              const table = findTableAtCursor(text, selection.from);
              if (!table) return false;
              const cell = findCellAtCursor(table, selection.from);
              if (!cell) return false;
              const result = toggleColumnAlignment(text, table, cell.col);
              view.dispatch({
                changes: { from: 0, to: text.length, insert: result.text },
                selection: EditorSelection.cursor(selection.from),
              });
              toast.success('Column alignment toggled');
              return true;
            },
          },
          {
            key: 'Ctrl-Shift-Backspace',
            run: (view) => {
              const selection = view.state.selection.main;
              const text = view.state.doc.toString();
              if (!isInTable(text, selection.from)) return false;
              const table = findTableAtCursor(text, selection.from);
              if (!table) return false;
              const cell = findCellAtCursor(table, selection.from);
              if (!cell) return false;
              if (table.rows.length <= 2) {
                toast.error('Cannot delete row - table must have at least 2 rows');
                return true;
              }
              const result = deleteRow(text, table, cell.row);
              view.dispatch({
                changes: { from: 0, to: text.length, insert: result.text },
                selection: EditorSelection.cursor(result.cursorPos),
                scrollIntoView: true,
              });
              toast.success('Row deleted');
              return true;
            },
          },
        ])
      ),
    []
  );
}
