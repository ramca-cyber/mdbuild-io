import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

export interface SavedDocument {
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
  syncScroll: boolean;
  savedDocuments: SavedDocument[];
  currentDocId: string | null;
  versions: { content: string; timestamp: number }[];
  lastSavedContent: string;
  hasUnsavedChanges: boolean;
  autoSaveTimeoutId: ReturnType<typeof setTimeout> | null;
  previewRefreshKey: number;
  setContent: (content: string) => void;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: number) => void;
  setLineWrap: (wrap: boolean) => void;
  setViewMode: (mode: 'split' | 'editor' | 'preview') => void;
  setShowOutline: (show: boolean) => void;
  setLineNumbers: (show: boolean) => void;
  setAutoSave: (enabled: boolean) => void;
  setSyncScroll: (enabled: boolean) => void;
  setCurrentDocId: (id: string | null) => void;
  forceRefreshPreview: () => void;
  saveDocument: (name: string) => void;
  saveDocumentAs: (name: string) => void;
  loadDocument: (id: string) => void;
  deleteDocument: (id: string) => void;
  renameDocument: (id: string, newName: string) => void;
  saveVersion: () => void;
  restoreVersion: (index: number) => void;
  createNewDocument: () => void;
}

const defaultContent = `# Welcome to MDBuild.io 🚀

A modern, powerful markdown editor with live preview and advanced features.

## ✨ Features Overview

- **GitHub Flavored Markdown** - Full GFM support with tables, strikethrough, and more
- **Live Preview** - See changes instantly as you type
- **Mermaid Diagrams** - Create flowcharts, sequences, and more
- **Math Equations** - Beautiful math rendering with KaTeX
- **Syntax Highlighting** - Code blocks with language-specific highlighting
- **Emoji Support** - :rocket: :sparkles: :heart:
- **Auto-save** - Never lose your work
- **Export Options** - Save as Markdown, HTML, PDF, and more

---

## 📝 Text Formatting

**Bold text** and *italic text* and ***bold italic***

~~Strikethrough text~~

\`inline code\` and keyboard shortcuts like <kbd>Ctrl</kbd> + <kbd>S</kbd>

> Blockquotes for highlighting important information
> 
> Can span multiple lines

---

## 📊 Tables

| Feature | Status | Priority |
|---------|--------|----------|
| Markdown Support | ✅ Done | High |
| Live Preview | ✅ Done | High |
| Export to PDF | ✅ Done | Medium |
| Cloud Sync | ⏳ Planned | Low |

---

## 💻 Code Blocks

### JavaScript Example
\`\`\`javascript
// Function to greet users
function greet(name) {
  return \`Hello, \${name}! Welcome to MDBuild.io\`;
}

console.log(greet('World'));

// Async/await example
async function fetchData() {
  const response = await fetch('https://api.example.com');
  return await response.json();
}
\`\`\`

### Python Example
\`\`\`python
# List comprehension
squares = [x**2 for x in range(10)]

# Class definition
class Developer:
    def __init__(self, name):
        self.name = name
    
    def code(self):
        return f"{self.name} is coding!"
\`\`\`

---

## 🧮 Math Equations

### Inline Math
The famous equation $E = mc^2$ shows the relationship between energy and mass.

The quadratic formula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

### Block Math

**Pythagorean Theorem:**
$$
a^2 + b^2 = c^2
$$

**Integral:**
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

**Matrix:**
$$
\\begin{bmatrix}
a & b \\\\
c & d
\\end{bmatrix}
$$

**Summation:**
$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$

---

## 📈 Mermaid Diagrams

### Flowchart
\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Awesome!]
    B -->|No| D[Debug]
    D --> B
    C --> E[Ship it!]
\`\`\`

### Sequence Diagram
\`\`\`mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Server
    User->>Browser: Enter URL
    Browser->>Server: HTTP Request
    Server-->>Browser: HTML Response
    Browser-->>User: Render Page
\`\`\`

### Pie Chart
\`\`\`mermaid
pie title Project Time Distribution
    "Coding" : 40
    "Debugging" : 30
    "Meetings" : 15
    "Coffee Breaks" : 15
\`\`\`

---

## ✅ Task Lists

### Today's Tasks
- [x] Learn markdown basics
- [x] Try out code blocks
- [x] Create a mermaid diagram
- [ ] Write my first document
- [ ] Share with team

### Project Roadmap
- [x] Phase 1: Core editor
- [x] Phase 2: Live preview
- [ ] Phase 3: Collaboration
- [ ] Phase 4: Mobile app

---

## 🔗 Links and Images

[Visit MDBuild.io](https://mdbuild.io)

[Link with title](https://example.com "Example Website")

Automatic link: https://www.example.com

---

## 📋 Lists

### Unordered List
- First item
- Second item
  - Nested item
  - Another nested item
- Third item

### Ordered List
1. First step
2. Second step
   1. Substep A
   2. Substep B
3. Third step

---

## 🎯 Getting Started

1. **Start typing** in the left panel
2. **See the preview** update in real-time on the right
3. **Save your work** with the Save button or <kbd>Ctrl</kbd> + <kbd>S</kbd>
4. **Export** to multiple formats (MD, HTML, PDF, DOCX)
5. **Use templates** for quick starts

> **Pro Tip:** Toggle between Editor, Preview, and Split views using the view mode button in the toolbar!

---

## 🎨 Emoji Support

Express yourself with emojis! :tada: :rocket: :sparkles:

- :heart: Love it!
- :fire: Hot feature!
- :bulb: Great idea!
- :zap: Fast performance!
- :star: Favorite!

---

**Happy Writing!** ✨

*Built with ❤️ for developers and writers.*
`;

export const getDefaultContent = () => defaultContent;

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
      syncScroll: true,
      savedDocuments: [],
      currentDocId: null,
      versions: [],
      lastSavedContent: defaultContent,
      hasUnsavedChanges: false,
      autoSaveTimeoutId: null,
      previewRefreshKey: 0,
      setContent: (content) => {
        const state = get();
        const hasChanges = content !== state.lastSavedContent;
        
        set({ 
          content,
          hasUnsavedChanges: hasChanges
        });
        
        if (state.autoSave) {
          if (state.autoSaveTimeoutId) {
            clearTimeout(state.autoSaveTimeoutId);
          }
          
          const timeoutId = setTimeout(() => {
            get().saveVersion();
            const currentState = get();
            
            if (currentState.currentDocId) {
              const doc = currentState.savedDocuments.find(d => d.id === currentState.currentDocId);
              if (doc) {
                set({
                  savedDocuments: currentState.savedDocuments.map((d) =>
                    d.id === currentState.currentDocId
                      ? { ...d, content: currentState.content, timestamp: Date.now() }
                      : d
                  ),
                  lastSavedContent: currentState.content,
                  hasUnsavedChanges: false
                });
              }
            } else {
              const title = currentState.content.match(/^#\s+(.+)$/m)?.[1] || 'Untitled';
              const newDoc: SavedDocument = {
                id: Date.now().toString(),
                name: title,
                content: currentState.content,
                timestamp: Date.now(),
              };
              set({
                savedDocuments: [...currentState.savedDocuments, newDoc],
                currentDocId: newDoc.id,
                lastSavedContent: currentState.content,
                hasUnsavedChanges: false
              });
            }
            set({ autoSaveTimeoutId: null });
          }, 2000);
          
          set({ autoSaveTimeoutId: timeoutId });
        }
      },
      setTheme: (theme) => set({ theme }),
      setFontSize: (size) => set({ fontSize: size }),
      setLineWrap: (wrap) => set({ lineWrap: wrap }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setShowOutline: (show) => set({ showOutline: show }),
      setLineNumbers: (show) => set({ lineNumbers: show }),
      setAutoSave: (enabled) => set({ autoSave: enabled }),
      setSyncScroll: (enabled) => set({ syncScroll: enabled }),
      setCurrentDocId: (id) => set({ currentDocId: id }),
      forceRefreshPreview: () => set({ previewRefreshKey: get().previewRefreshKey + 1 }),
      saveDocument: (name) => {
        const state = get();
        
        if (state.currentDocId) {
          const docIndex = state.savedDocuments.findIndex(
            (d) => d.id === state.currentDocId
          );
          
          if (docIndex !== -1) {
            const updatedDocs = [...state.savedDocuments];
            updatedDocs[docIndex] = {
              ...updatedDocs[docIndex],
              name,
              content: state.content,
              timestamp: Date.now(),
            };
            set({ 
              savedDocuments: updatedDocs,
              lastSavedContent: state.content,
              hasUnsavedChanges: false
            });
          }
        } else {
          const newDoc: SavedDocument = {
            id: Date.now().toString(),
            name,
            content: state.content,
            timestamp: Date.now(),
          };
          set({
            savedDocuments: [...state.savedDocuments, newDoc],
            currentDocId: newDoc.id,
            lastSavedContent: state.content,
            hasUnsavedChanges: false
          });
        }
      },
      saveDocumentAs: (name) => {
        // Save as a new document (creates a copy)
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
          lastSavedContent: state.content,
          hasUnsavedChanges: false
        });
      },
      loadDocument: (id) => {
        const doc = get().savedDocuments.find((d) => d.id === id);
        if (doc) {
          set({ 
            content: doc.content, 
            currentDocId: id,
            lastSavedContent: doc.content,
            hasUnsavedChanges: false
          });
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
          set({ content: defaultContent });
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
      createNewDocument: () => {
        set({ 
          content: defaultContent, 
          currentDocId: null,
          lastSavedContent: defaultContent,
          hasUnsavedChanges: false
        });
      },
    }),
    {
      name: 'mdbuild-storage',
    }
  )
);
