export interface TableCell {
  content: string;
  start: number;
  end: number;
}

export interface TableRow {
  cells: TableCell[];
  start: number;
  end: number;
}

export interface TableInfo {
  rows: TableRow[];
  alignmentRow: number | null;
  start: number;
  end: number;
}

/**
 * Detects if cursor is inside a markdown table
 */
export function isInTable(text: string, cursorPos: number): boolean {
  const lines = text.split('\n');
  let currentPos = 0;
  let currentLineIndex = 0;
  
  // Find the line containing the cursor
  for (let i = 0; i < lines.length; i++) {
    const lineLength = lines[i].length + 1; // +1 for newline
    if (currentPos + lineLength > cursorPos) {
      currentLineIndex = i;
      break;
    }
    currentPos += lineLength;
  }
  
  const line = lines[currentLineIndex];
  
  // Check if current line is a table row (contains |)
  if (!line.includes('|')) {
    return false;
  }
  
  // Check if it's a valid table row (not just a random |)
  const trimmed = line.trim();
  if (!trimmed.startsWith('|') && !trimmed.endsWith('|') && trimmed.split('|').length < 2) {
    return false;
  }
  
  return true;
}

/**
 * Finds the complete table around the cursor position
 */
export function findTableAtCursor(text: string, cursorPos: number): TableInfo | null {
  const lines = text.split('\n');
  let currentPos = 0;
  let currentLineIndex = 0;
  
  // Find the line containing the cursor
  for (let i = 0; i < lines.length; i++) {
    const lineLength = lines[i].length + 1;
    if (currentPos + lineLength > cursorPos) {
      currentLineIndex = i;
      break;
    }
    currentPos += lineLength;
  }
  
  // Check if current line is part of a table
  if (!isTableRow(lines[currentLineIndex])) {
    return null;
  }
  
  // Find table boundaries
  let startLine = currentLineIndex;
  let endLine = currentLineIndex;
  
  // Go backwards to find table start
  for (let i = currentLineIndex - 1; i >= 0; i--) {
    if (isTableRow(lines[i])) {
      startLine = i;
    } else {
      break;
    }
  }
  
  // Go forwards to find table end
  for (let i = currentLineIndex + 1; i < lines.length; i++) {
    if (isTableRow(lines[i])) {
      endLine = i;
    } else {
      break;
    }
  }
  
  // Parse table
  const rows: TableRow[] = [];
  let alignmentRow: number | null = null;
  let pos = lines.slice(0, startLine).join('\n').length + (startLine > 0 ? 1 : 0);
  
  for (let i = startLine; i <= endLine; i++) {
    const line = lines[i];
    const rowStart = pos;
    const rowEnd = pos + line.length;
    
    // Check if it's an alignment row
    if (isAlignmentRow(line)) {
      alignmentRow = i - startLine;
      pos = rowEnd + 1;
      continue;
    }
    
    const cells = parseTableRow(line, rowStart);
    rows.push({ cells, start: rowStart, end: rowEnd });
    pos = rowEnd + 1;
  }
  
  const tableStart = lines.slice(0, startLine).join('\n').length + (startLine > 0 ? 1 : 0);
  const tableEnd = lines.slice(0, endLine + 1).join('\n').length;
  
  return {
    rows,
    alignmentRow,
    start: tableStart,
    end: tableEnd,
  };
}

/**
 * Checks if a line is a table row
 */
function isTableRow(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.includes('|') && trimmed.split('|').length >= 2;
}

/**
 * Checks if a line is an alignment row (|---|---|)
 */
function isAlignmentRow(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes('|')) return false;
  
  const parts = trimmed.split('|').filter(p => p.trim());
  if (parts.length === 0) return false;
  
  return parts.every(part => {
    const p = part.trim();
    return /^:?-+:?$/.test(p);
  });
}

/**
 * Parses a table row into cells
 */
function parseTableRow(line: string, rowStart: number): TableCell[] {
  const cells: TableCell[] = [];
  let inCell = false;
  let cellStart = 0;
  let cellContent = '';
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '|') {
      if (inCell) {
        // End of cell
        cells.push({
          content: cellContent.trim(),
          start: rowStart + cellStart,
          end: rowStart + i,
        });
        cellContent = '';
        inCell = false;
      } else {
        // Start of new cell
        cellStart = i + 1;
        inCell = true;
      }
    } else if (inCell) {
      cellContent += char;
    }
  }
  
  // Handle last cell if line doesn't end with |
  if (inCell && cellContent) {
    cells.push({
      content: cellContent.trim(),
      start: rowStart + cellStart,
      end: rowStart + line.length,
    });
  }
  
  return cells;
}

/**
 * Finds the cell containing the cursor
 */
export function findCellAtCursor(table: TableInfo, cursorPos: number): { row: number; col: number } | null {
  for (let rowIndex = 0; rowIndex < table.rows.length; rowIndex++) {
    const row = table.rows[rowIndex];
    if (cursorPos >= row.start && cursorPos <= row.end) {
      for (let colIndex = 0; colIndex < row.cells.length; colIndex++) {
        const cell = row.cells[colIndex];
        if (cursorPos >= cell.start && cursorPos <= cell.end) {
          return { row: rowIndex, col: colIndex };
        }
      }
      // Cursor is in the row but not in a specific cell (e.g., on |)
      // Find the closest cell
      for (let colIndex = 0; colIndex < row.cells.length; colIndex++) {
        const cell = row.cells[colIndex];
        if (cursorPos < cell.start) {
          return { row: rowIndex, col: Math.max(0, colIndex - 1) };
        }
      }
      return { row: rowIndex, col: row.cells.length - 1 };
    }
  }
  return null;
}

/**
 * Gets the next cell position (for Tab navigation)
 */
export function getNextCell(table: TableInfo, row: number, col: number): { row: number; col: number; pos: number } | null {
  // Try next cell in same row
  if (col + 1 < table.rows[row].cells.length) {
    const cell = table.rows[row].cells[col + 1];
    return { row, col: col + 1, pos: cell.start };
  }
  
  // Try first cell in next row
  if (row + 1 < table.rows.length) {
    const cell = table.rows[row + 1].cells[0];
    return { row: row + 1, col: 0, pos: cell.start };
  }
  
  return null;
}

/**
 * Gets the previous cell position (for Shift+Tab navigation)
 */
export function getPreviousCell(table: TableInfo, row: number, col: number): { row: number; col: number; pos: number } | null {
  // Try previous cell in same row
  if (col > 0) {
    const cell = table.rows[row].cells[col - 1];
    return { row, col: col - 1, pos: cell.start };
  }
  
  // Try last cell in previous row
  if (row > 0) {
    const prevRow = table.rows[row - 1];
    const cell = prevRow.cells[prevRow.cells.length - 1];
    return { row: row - 1, col: prevRow.cells.length - 1, pos: cell.start };
  }
  
  return null;
}

/**
 * Adds a new row below the current row
 */
export function addRowBelow(text: string, table: TableInfo, rowIndex: number): { text: string; cursorPos: number } {
  const lines = text.split('\n');
  const currentRow = table.rows[rowIndex];
  const numCells = currentRow.cells.length;
  
  // Create new row with empty cells
  const newRow = '|' + ' '.repeat(10) + '|'.repeat(numCells);
  
  // Find insertion point (after current row)
  const insertPos = currentRow.end + 1;
  const newText = text.slice(0, insertPos) + '\n' + newRow + text.slice(insertPos);
  
  return { text: newText, cursorPos: insertPos + 2 }; // Position cursor in first cell
}

/**
 * Adds a new row above the current row
 */
export function addRowAbove(text: string, table: TableInfo, rowIndex: number): { text: string; cursorPos: number } {
  const currentRow = table.rows[rowIndex];
  const numCells = currentRow.cells.length;
  
  // Create new row with empty cells
  const newRow = '|' + ' '.repeat(10) + '|'.repeat(numCells);
  
  // Find insertion point (before current row)
  const insertPos = currentRow.start;
  const newText = text.slice(0, insertPos) + newRow + '\n' + text.slice(insertPos);
  
  return { text: newText, cursorPos: insertPos + 2 }; // Position cursor in first cell
}

/**
 * Adds a new column after the current column
 */
export function addColumnAfter(text: string, table: TableInfo, colIndex: number): { text: string; cursorPos: number } {
  const lines = text.split('\n');
  let newText = text;
  let offset = 0;
  let newCursorPos = 0;
  
  // Process each row
  for (let rowIndex = 0; rowIndex < table.rows.length; rowIndex++) {
    const row = table.rows[rowIndex];
    const cell = row.cells[colIndex];
    
    // Insert new cell after current cell
    const insertPos = cell.end + offset;
    const newCell = ' ' + ' '.repeat(8) + ' |';
    newText = newText.slice(0, insertPos) + newCell + newText.slice(insertPos);
    offset += newCell.length;
    
    if (rowIndex === 0) {
      newCursorPos = insertPos + 2;
    }
  }
  
  // Add alignment separator if table has one
  if (table.alignmentRow !== null) {
    // Find and update alignment row
    const alignmentLines = newText.split('\n');
    const alignmentLineIndex = Math.floor((table.start + alignmentLines.slice(0, table.alignmentRow + 1).join('\n').length) / (text.length / lines.length));
    if (alignmentLineIndex < alignmentLines.length) {
      const alignLine = alignmentLines[alignmentLineIndex];
      const parts = alignLine.split('|');
      parts.splice(colIndex + 2, 0, '---'); // +2 because of leading/trailing |
      alignmentLines[alignmentLineIndex] = parts.join('|');
      newText = alignmentLines.join('\n');
    }
  }
  
  return { text: newText, cursorPos: newCursorPos };
}

/**
 * Toggles column alignment (left -> center -> right -> left)
 */
export function toggleColumnAlignment(text: string, table: TableInfo, colIndex: number): { text: string } {
  if (table.alignmentRow === null) {
    // No alignment row, can't toggle
    return { text };
  }
  
  const lines = text.split('\n');
  const tableStartLine = text.slice(0, table.start).split('\n').length - 1;
  const alignmentLineIndex = tableStartLine + table.alignmentRow + 1; // +1 to account for header
  
  if (alignmentLineIndex >= lines.length) {
    return { text };
  }
  
  let alignLine = lines[alignmentLineIndex];
  const parts = alignLine.split('|').filter(p => p.trim());
  
  if (colIndex >= parts.length) {
    return { text };
  }
  
  let alignment = parts[colIndex].trim();
  
  // Detect current alignment
  const startsWithColon = alignment.startsWith(':');
  const endsWithColon = alignment.endsWith(':');
  
  // Toggle: left (---) -> center (:---:) -> right (---:) -> left
  if (!startsWithColon && !endsWithColon) {
    // Currently left, make center
    alignment = ':' + alignment.replace(/^:+|:+$/g, '') + ':';
  } else if (startsWithColon && endsWithColon) {
    // Currently center, make right
    alignment = alignment.replace(/^:+/, '') + ':';
  } else if (endsWithColon) {
    // Currently right, make left
    alignment = alignment.replace(/:+$/g, '');
  }
  
  // Ensure minimum dashes
  alignment = alignment.replace(/-+/, '---');
  
  parts[colIndex] = ' ' + alignment + ' ';
  alignLine = '|' + parts.join('|') + '|';
  lines[alignmentLineIndex] = alignLine;
  
  return { text: lines.join('\n') };
}

/**
 * Deletes the current row
 */
export function deleteRow(text: string, table: TableInfo, rowIndex: number): { text: string; cursorPos: number } {
  const row = table.rows[rowIndex];
  
  // Find line boundaries including the newline
  let startPos = row.start;
  let endPos = row.end + 1; // Include newline
  
  // If it's the last row, don't include the newline after
  if (rowIndex === table.rows.length - 1 && startPos > 0) {
    startPos -= 1; // Remove newline before instead
    endPos = row.end;
  }
  
  const newText = text.slice(0, startPos) + text.slice(endPos);
  
  // Position cursor at the start of where the row was
  const cursorPos = Math.max(0, startPos);
  
  return { text: newText, cursorPos };
}
