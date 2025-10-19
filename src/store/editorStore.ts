import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface SavedDocument {
  id: string;
  name: string;
  content: string;
  timestamp: number;
}

interface EditorState {
  content: string;
  theme: Theme;
  fontSize: number;
  lineWrap: boolean;
  viewMode: 'split' | 'editor' | 'preview';
  showOutline: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  savedDocuments: SavedDocument[];
  currentDocId: string | null;
  versions: { content: string; timestamp: number }[];
  setContent: (content: string) => void;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: number) => void;
  setLineWrap: (wrap: boolean) => void;
  setViewMode: (mode: 'split' | 'editor' | 'preview') => void;
  setShowOutline: (show: boolean) => void;
  setLineNumbers: (show: boolean) => void;
  setAutoSave: (enabled: boolean) => void;
  setCurrentDocId: (id: string | null) => void;
  saveDocument: (name: string) => void;
  loadDocument: (id: string) => void;
  deleteDocument: (id: string) => void;
  renameDocument: (id: string, newName: string) => void;
  saveVersion: () => void;
  restoreVersion: (index: number) => void;
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
    (set, get) => ({
      content: defaultContent,
      theme: 'light',
      fontSize: 14,
      lineWrap: true,
      viewMode: 'split',
      showOutline: false,
      lineNumbers: true,
      autoSave: true,
      savedDocuments: [],
      currentDocId: null,
      versions: [],
      setContent: (content) => {
        set({ content });
        const state = get();
        if (state.autoSave) {
          setTimeout(() => get().saveVersion(), 1000);
        }
      },
      setTheme: (theme) => set({ theme }),
      setFontSize: (size) => set({ fontSize: size }),
      setLineWrap: (wrap) => set({ lineWrap: wrap }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setShowOutline: (show) => set({ showOutline: show }),
      setLineNumbers: (show) => set({ lineNumbers: show }),
      setAutoSave: (enabled) => set({ autoSave: enabled }),
      setCurrentDocId: (id) => set({ currentDocId: id }),
      saveDocument: (name) => {
        const state = get();
        const newDoc: SavedDocument = {
          id: Date.now().toString(),
          name,
          content: state.content,
          timestamp: Date.now(),
        };
        set({
          savedDocuments: [...state.savedDocuments, newDoc],
          currentDocId: newDoc.id,
        });
      },
      loadDocument: (id) => {
        const doc = get().savedDocuments.find((d) => d.id === id);
        if (doc) {
          set({ content: doc.content, currentDocId: id });
        }
      },
      deleteDocument: (id) => {
        const state = get();
        const wasCurrentDoc = state.currentDocId === id;
        set({
          savedDocuments: state.savedDocuments.filter((d) => d.id !== id),
          currentDocId: wasCurrentDoc ? null : state.currentDocId,
        });
        if (wasCurrentDoc) {
          set({ content: '# New Document\n\nStart writing...' });
        }
      },
      renameDocument: (id, newName) => {
        set({
          savedDocuments: get().savedDocuments.map((d) =>
            d.id === id ? { ...d, name: newName } : d
          ),
        });
      },
      saveVersion: () => {
        const state = get();
        const lastVersion = state.versions[state.versions.length - 1];
        if (!lastVersion || lastVersion.content !== state.content) {
          const newVersions = [
            ...state.versions,
            { content: state.content, timestamp: Date.now() },
          ].slice(-10);
          set({ versions: newVersions });
        }
      },
      restoreVersion: (index) => {
        const version = get().versions[index];
        if (version) {
          set({ content: version.content });
        }
      },
    }),
    {
      name: 'mdbuild-storage',
    }
  )
);
