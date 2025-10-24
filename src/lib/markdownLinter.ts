import { EditorError } from '@/store/editorStore';

export interface LintResult {
  errors: Omit<EditorError, 'id' | 'timestamp'>[];
}

export const lintMarkdown = (content: string): LintResult => {
  const errors: Omit<EditorError, 'id' | 'timestamp'>[] = [];
  const lines = content.split('\n');

  // Check for unclosed code blocks
  const codeBlockStarts: number[] = [];
  lines.forEach((line, index) => {
    if (line.trim().startsWith('```')) {
      codeBlockStarts.push(index + 1);
    }
  });
  if (codeBlockStarts.length % 2 !== 0) {
    errors.push({
      type: 'error',
      category: 'markdown',
      line: codeBlockStarts[codeBlockStarts.length - 1],
      message: 'Unclosed code block',
      details: 'Code block started with ``` but never closed. Add closing ``` to fix.'
    });
  }

  // Check for images without alt text
  lines.forEach((line, index) => {
    const imageRegex = /!\[\s*\]\(([^)]+)\)/g;
    let match;
    while ((match = imageRegex.exec(line)) !== null) {
      errors.push({
        type: 'warning',
        category: 'accessibility',
        line: index + 1,
        message: 'Image missing alt text',
        details: `Image at "${match[1]}" has no alt text. Add descriptive text between the brackets for accessibility: ![description](${match[1]})`
      });
    }
  });

  // Check for broken reference-style links
  const referenceDefs = new Set<string>();
  const referenceUses = new Map<string, number[]>();

  lines.forEach((line, index) => {
    // Find reference definitions [ref]: url
    const defMatch = /^\[([^\]]+)\]:\s*\S+/.exec(line);
    if (defMatch) {
      referenceDefs.add(defMatch[1].toLowerCase());
    }

    // Find reference uses [text][ref]
    const useRegex = /\[([^\]]+)\]\[([^\]]+)\]/g;
    let useMatch;
    while ((useMatch = useRegex.exec(line)) !== null) {
      const ref = useMatch[2].toLowerCase();
      if (!referenceUses.has(ref)) {
        referenceUses.set(ref, []);
      }
      referenceUses.get(ref)!.push(index + 1);
    }
  });

  // Report broken references
  referenceUses.forEach((lineNums, ref) => {
    if (!referenceDefs.has(ref)) {
      lineNums.forEach(lineNum => {
        errors.push({
          type: 'error',
          category: 'link',
          line: lineNum,
          message: `Broken reference link: [${ref}]`,
          details: `Reference "[${ref}]" is used but not defined. Add a definition like: [${ref}]: https://example.com`
        });
      });
    }
  });

  // Check for malformed tables
  lines.forEach((line, index) => {
    if (line.includes('|')) {
      const cells = line.split('|').filter(c => c.trim() !== '');
      
      // Check if this is a separator row
      const isSeparator = cells.every(cell => /^[\s:-]+$/.test(cell));
      
      if (!isSeparator && cells.length > 0) {
        // Check if next line is separator
        if (index + 1 < lines.length) {
          const nextLine = lines[index + 1];
          if (nextLine.includes('|')) {
            const nextCells = nextLine.split('|').filter(c => c.trim() !== '');
            const nextIsSeparator = nextCells.every(cell => /^[\s:-]+$/.test(cell));
            
            if (nextIsSeparator && cells.length !== nextCells.length) {
              errors.push({
                type: 'error',
                category: 'markdown',
                line: index + 1,
                message: 'Malformed table',
                details: `Table header has ${cells.length} columns but separator has ${nextCells.length}. Column counts must match.`
              });
            }
          }
        }
      }
    }
  });

  // Check for multiple H1 tags (SEO warning)
  const h1Lines: number[] = [];
  lines.forEach((line, index) => {
    if (/^#\s+[^\s]/.test(line.trim())) {
      h1Lines.push(index + 1);
    }
  });
  if (h1Lines.length > 1) {
    h1Lines.slice(1).forEach(lineNum => {
      errors.push({
        type: 'info',
        category: 'accessibility',
        line: lineNum,
        message: 'Multiple H1 headings detected',
        details: 'For better SEO and accessibility, documents should typically have only one H1 heading. Consider using H2 (##) or lower.'
      });
    });
  }

  // Check for heading level skips
  const headings: { level: number; line: number }[] = [];
  lines.forEach((line, index) => {
    const match = /^(#{1,6})\s+[^\s]/.exec(line.trim());
    if (match) {
      headings.push({ level: match[1].length, line: index + 1 });
    }
  });

  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1];
    const curr = headings[i];
    if (curr.level > prev.level + 1) {
      errors.push({
        type: 'info',
        category: 'accessibility',
        line: curr.line,
        message: `Heading level skip detected`,
        details: `Heading jumps from H${prev.level} to H${curr.level}. For better accessibility, heading levels should only increase by one.`
      });
    }
  }

  return { errors };
};
