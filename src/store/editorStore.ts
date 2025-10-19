import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface EditorState {
  content: string;
  theme: Theme;
  fontSize: number;
  lineWrap: boolean;
  viewMode: 'split' | 'editor' | 'preview';
  setContent: (content: string) => void;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: number) => void;
  setLineWrap: (wrap: boolean) => void;
  setViewMode: (mode: 'split' | 'editor' | 'preview') => void;
}

const defaultContent = `# Welcome to MDBuild.io 🚀

A modern, powerful markdown editor with live preview.

## Features

- **GitHub Flavored Markdown** support
- **Mermaid diagrams** for visualizations
- **Math rendering** with KaTeX
- **Syntax highlighting** for code blocks
- **Split-pane** editor with live preview

## Try it out

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}! Welcome to MDBuild.io\`;
}

console.log(greet('World'));
\`\`\`

## Math Support

Inline math: $E = mc^2$

Block math:

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## Mermaid Diagrams

\`\`\`mermaid
graph LR
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
\`\`\`

## Task Lists

- [x] Setup editor
- [x] Add live preview
- [ ] Export to PDF
- [ ] Add templates

> **Tip:** Try editing this content to see the live preview in action!

---

Built with ❤️ for developers and writers.
`;

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      content: defaultContent,
      theme: 'light',
      fontSize: 14,
      lineWrap: true,
      viewMode: 'split',
      setContent: (content) => set({ content }),
      setTheme: (theme) => set({ theme }),
      setFontSize: (size) => set({ fontSize: size }),
      setLineWrap: (wrap) => set({ lineWrap: wrap }),
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    {
      name: 'mdbuild-storage',
    }
  )
);
