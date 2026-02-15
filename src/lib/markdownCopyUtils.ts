import TurndownService from 'turndown';

// Create Turndown instance with custom rules for markdown elements
export function createTurndownService(): TurndownService {
  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*',
  });

  // Custom rule for footnote references
  turndown.addRule('footnoteRef', {
    filter: (node) => {
      return node.nodeName === 'SUP' && 
             node.querySelector('a.footnote-ref') !== null;
    },
    replacement: (_content, node) => {
      const anchor = (node as HTMLElement).querySelector('a.footnote-ref');
      const id = anchor?.textContent || '';
      return `[^${id}]`;
    },
  });

  // Custom rule for footnote backlinks (remove them)
  turndown.addRule('footnoteBackref', {
    filter: (node) => {
      return node.nodeName === 'A' && 
             (node as HTMLElement).classList.contains('footnote-backref');
    },
    replacement: () => '',
  });

  // Custom rule for footnotes section
  turndown.addRule('footnotesSection', {
    filter: (node) => {
      return node.nodeName === 'DIV' && 
             (node as HTMLElement).classList.contains('footnotes');
    },
    replacement: (_content, node) => {
      const items = (node as HTMLElement).querySelectorAll('li[id^="fn-"]');
      let result = '\n\n';
      items.forEach((item) => {
        const id = item.id.replace('fn-', '');
        // Get text content without the backref
        const clone = item.cloneNode(true) as HTMLElement;
        clone.querySelector('.footnote-backref')?.remove();
        const text = clone.textContent?.trim() || '';
        result += `[^${id}]: ${text}\n`;
      });
      return result;
    },
  });

  // Custom rule for GitHub-style alerts
  turndown.addRule('githubAlerts', {
    filter: (node) => {
      return node.nodeName === 'DIV' && 
             (node as HTMLElement).classList.contains('markdown-alert');
    },
    replacement: (_content, node) => {
      const el = node as HTMLElement;
      const alertType = el.classList.contains('markdown-alert-note') ? 'NOTE'
        : el.classList.contains('markdown-alert-tip') ? 'TIP'
        : el.classList.contains('markdown-alert-important') ? 'IMPORTANT'
        : el.classList.contains('markdown-alert-warning') ? 'WARNING'
        : el.classList.contains('markdown-alert-caution') ? 'CAUTION'
        : 'NOTE';
      
      // Get the content without the title
      const titleEl = el.querySelector('.markdown-alert-title');
      const contentEl = el.cloneNode(true) as HTMLElement;
      contentEl.querySelector('.markdown-alert-title')?.remove();
      const text = contentEl.textContent?.trim() || '';
      
      return `\n> [!${alertType}]\n> ${text.split('\n').join('\n> ')}\n`;
    },
  });

  // Custom rule for mermaid diagrams
  turndown.addRule('mermaidDiagram', {
    filter: (node) => {
      return node.nodeName === 'DIV' && 
             ((node as HTMLElement).classList.contains('mermaid-diagram-container') ||
              (node as HTMLElement).querySelector('.mermaid-diagram-container') !== null);
    },
    replacement: () => {
      // Can't recover mermaid code from rendered SVG
      return '\n```mermaid\n[Mermaid diagram - copy from source]\n```\n';
    },
  });

  // Custom rule for task list items
  turndown.addRule('taskListItem', {
    filter: (node) => {
      return node.nodeName === 'LI' && 
             (node as HTMLElement).querySelector('input[type="checkbox"]') !== null;
    },
    replacement: (content, node) => {
      const checkbox = (node as HTMLElement).querySelector('input[type="checkbox"]');
      const checked = checkbox?.hasAttribute('checked');
      const text = content.replace(/^\s*\[.\]\s*/, '').trim();
      return `- [${checked ? 'x' : ' '}] ${text}\n`;
    },
  });

  // Custom rule for strikethrough
  turndown.addRule('strikethrough', {
    filter: ['del', 's'],
    replacement: (content) => `~~${content}~~`,
  });

  // Custom rule for tables (improve default handling)
  turndown.addRule('tableCell', {
    filter: ['th', 'td'],
    replacement: (content, node) => {
      const trimmed = content.trim().replace(/\|/g, '\\|');
      return ` ${trimmed} |`;
    },
  });

  turndown.addRule('tableRow', {
    filter: 'tr',
    replacement: (content, node, options) => {
      const row = `|${content}\n`;
      const parent = node.parentNode;
      if (parent?.nodeName === 'THEAD') {
        const cells = (node as HTMLElement).querySelectorAll('th, td');
        const separator = `|${Array.from(cells).map(() => ' --- |').join('')}\n`;
        return row + separator;
      }
      return row;
    },
  });

  return turndown;
}

// Map selection in preview back to source markdown lines
export function getSourceLinesFromSelection(
  selection: Selection,
  previewElement: HTMLElement,
  sourceContent: string
): string | null {
  if (!selection.rangeCount) return null;

  const range = selection.getRangeAt(0);
  const sourceLines = sourceContent.split('\n');
  
  // Find elements with data-line attributes that contain the selection
  const startNode = range.startContainer;
  const endNode = range.endContainer;
  
  const getLineNumber = (node: Node): number | null => {
    let el: Element | null = node.nodeType === Node.TEXT_NODE 
      ? node.parentElement 
      : node as Element;
    
    while (el && el !== previewElement) {
      const lineAttr = el.getAttribute('data-line');
      if (lineAttr) {
        return parseInt(lineAttr, 10);
      }
      el = el.parentElement;
    }
    return null;
  };

  const startLine = getLineNumber(startNode);
  const endLine = getLineNumber(endNode);

  if (startLine !== null && endLine !== null) {
    // Extract source lines for the selection
    const minLine = Math.max(1, Math.min(startLine, endLine));
    const maxLine = Math.min(sourceLines.length, Math.max(startLine, endLine));
    
    // Expand to include full blocks (paragraphs, code blocks, etc.)
    let expandedStart = minLine - 1;
    let expandedEnd = maxLine - 1;
    
    // Expand start backwards to find block start
    while (expandedStart > 0 && sourceLines[expandedStart - 1].trim() !== '') {
      expandedStart--;
    }
    
    // Expand end forwards to find block end
    while (expandedEnd < sourceLines.length - 1 && sourceLines[expandedEnd + 1].trim() !== '') {
      expandedEnd++;
    }
    
    return sourceLines.slice(expandedStart, expandedEnd + 1).join('\n');
  }

  return null;
}

// Convert HTML selection to markdown using Turndown as fallback
export function htmlToMarkdown(html: string): string {
  const turndown = createTurndownService();
  return turndown.turndown(html);
}

// Prepare HTML for rich text copy (Medium, Substack, Google Docs)
// Sanitizes footnotes and internal links to work in external editors
export function prepareHtmlForRichTextCopy(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  
  // Build a map of footnote definitions: id → text
  const footnoteMap: Record<string, string> = {};
  div.querySelectorAll('li[id^="fn-"]').forEach(li => {
    const id = li.id.replace('fn-', '');
    const clone = li.cloneNode(true) as HTMLElement;
    clone.querySelector('.footnote-backref')?.remove();
    footnoteMap[id] = clone.textContent?.trim() || '';
  });
  
  // Replace footnote refs with inline parenthetical text
  div.querySelectorAll('sup').forEach(sup => {
    const anchor = sup.querySelector('a.footnote-ref');
    if (anchor) {
      const id = anchor.getAttribute('data-footnote-id') || anchor.textContent || '';
      const footnoteText = footnoteMap[id];
      if (footnoteText) {
        const span = document.createElement('span');
        span.textContent = ` (${footnoteText})`;
        sup.replaceWith(span);
      } else {
        sup.remove();
      }
    }
  });
  
  // Remove the entire footnotes section
  div.querySelectorAll('.footnotes').forEach(el => el.remove());
  
  // Remove footnote back-links if any remain
  div.querySelectorAll('a.footnote-backref').forEach(a => a.remove());
  
  // Convert internal anchor links to plain text (keep external links)
  div.querySelectorAll('a[href^="#"]').forEach(a => {
    const text = a.textContent || '';
    const span = document.createElement('span');
    span.textContent = text;
    a.replaceWith(span);
  });
  
  return div.innerHTML;
}

// Copy markdown to clipboard with toast notification
export async function copyMarkdownToClipboard(
  markdown: string, 
  showToast: (options: { title: string; description: string }) => void
): Promise<void> {
  try {
    await navigator.clipboard.writeText(markdown);
    showToast({
      title: 'Copied as Markdown',
      description: 'Content copied to clipboard',
    });
  } catch (error) {
    console.error('Failed to copy:', error);
    showToast({
      title: 'Copy failed',
      description: 'Could not copy to clipboard',
    });
  }
}

// Copy rich text to clipboard (for Medium, Substack, etc.)
export async function copyRichTextToClipboard(
  previewElement: HTMLElement,
  showToast: (options: { title: string; description: string }) => void
): Promise<void> {
  try {
    const selection = window.getSelection();
    let html: string;
    
    if (selection && !selection.isCollapsed) {
      // Copy selection
      const range = selection.getRangeAt(0);
      const container = document.createElement('div');
      container.appendChild(range.cloneContents());
      html = container.innerHTML;
    } else {
      // Copy full article
      const article = previewElement.querySelector('article');
      html = article?.innerHTML || '';
    }
    
    const sanitizedHtml = prepareHtmlForRichTextCopy(html);
    
    // Write both HTML and plain text to clipboard
    const blob = new Blob([sanitizedHtml], { type: 'text/html' });
    const textBlob = new Blob([previewElement.querySelector('article')?.textContent || ''], { type: 'text/plain' });
    
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': blob,
        'text/plain': textBlob,
      }),
    ]);
    
    showToast({
      title: 'Copied as Rich Text',
      description: 'Paste into Medium, Substack, or Google Docs',
    });
  } catch (error) {
    console.error('Failed to copy:', error);
    showToast({
      title: 'Copy failed',
      description: 'Could not copy to clipboard',
    });
  }
}
