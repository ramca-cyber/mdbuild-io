import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavedDocument {
  id: string;
  name: string;
  content: string;
  timestamp: number;
}

interface DocumentState {
  content: string;
  savedDocuments: SavedDocument[];
  currentDocId: string | null;
  versions: { content: string; timestamp: number }[];
  lastSavedContent: string;
  hasUnsavedChanges: boolean;
  autoSaveTimeoutId: ReturnType<typeof setTimeout> | null;
  isSaving: boolean;
  
  setContent: (content: string) => void;
  setCurrentDocId: (id: string | null) => void;
  setIsSaving: (isSaving: boolean) => void;
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

## ⚡ New Power User Features

### Quick Commands
- **Press \`Ctrl+K\`** to open the Command Palette - search all actions and features
- **Type \`/\` at the start of any line** for the Slash Command Menu - quickly insert headings, lists, tables, and more
- **Select text** to see the Floating Toolbar - format bold, italic, code, or add links instantly

### Multiple Cursors
- **Ctrl+Click** to add cursors at multiple positions
- **Ctrl+D** to select the next occurrence of selected text
- **Alt+Shift+↑/↓** to add cursors above/below
- Edit multiple locations simultaneously for maximum productivity!

### Smart Paste
- **Copy from anywhere** - Word, Google Docs, web pages
- Paste into the editor and it automatically converts to clean Markdown
- No more messy HTML or formatting issues!

---

## ✨ Features Overview

- **GitHub Flavored Markdown** - Full GFM support with tables, strikethrough, and more
- **GitHub Alerts** - Beautiful callouts for notes, tips, warnings, and more
- **Live Preview** - See changes instantly as you type
- **Mermaid Diagrams** - Create flowcharts, sequences, and more
- **Math Equations** - Beautiful math rendering with KaTeX
- **Syntax Highlighting** - Code blocks with language-specific highlighting
- **Emoji Support** - :rocket: :sparkles: :heart:
- **Footnotes** - Add references and citations[^1]
- **Auto-save** - Never lose your work
- **Export Options** - Save as Markdown, HTML, PDF, PNG, DOCX

---

## 🎯 GitHub Alerts

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

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

### Links
[Visit MDBuild.io](https://mdbuild.io)

[Link with title](https://example.com "Example Website")

Automatic link: https://www.example.com

### Images
Add beautiful images to your documents using public URLs:

![Beautiful mountain landscape at sunset](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80)
*Photo: Mountain landscape - Always use descriptive alt text for accessibility*

![Code editor on a desk](https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80)
*Photo: Developer workspace*

You can add images from any public URL - just click the Insert menu in the toolbar!

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

## 📚 Footnotes

You can add footnotes to your documents[^1]. They appear at the bottom of the page.

Here's another footnote reference[^2].

You can even use named footnotes[^note-name] for better organization.

[^1]: This is the first footnote with detailed information.

[^2]: Here's the second footnote with more context and links: https://example.com

[^note-name]: Named footnotes are great for longer documents with many references.

---

**Happy Writing!** ✨
`;

export const getDefaultContent = () => defaultContent;

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      content: defaultContent,
      savedDocuments: [],
      currentDocId: null,
      versions: [],
      lastSavedContent: defaultContent,
      hasUnsavedChanges: false,
      autoSaveTimeoutId: null,
      isSaving: false,

      setContent: (content: string) => {
        set({ content, hasUnsavedChanges: content !== get().lastSavedContent });
      },

      setCurrentDocId: (id: string | null) => set({ currentDocId: id }),
      
      setIsSaving: (isSaving: boolean) => set({ isSaving }),

      saveDocument: (name: string) => {
        const state = get();
        if (state.isSaving) return;
        
        set({ isSaving: true });
        
        try {
          const existingDoc = state.savedDocuments.find(
            (doc) => doc.name === name
          );

          if (existingDoc) {
            const updatedDocs = state.savedDocuments.map((doc) =>
              doc.name === name
                ? { ...doc, content: state.content, timestamp: Date.now() }
                : doc
            );
            set({
              savedDocuments: updatedDocs,
              currentDocId: existingDoc.id,
              lastSavedContent: state.content,
              hasUnsavedChanges: false,
            });
          } else {
            const newDoc: SavedDocument = {
              id: crypto.randomUUID(),
              name,
              content: state.content,
              timestamp: Date.now(),
            };
            set({
              savedDocuments: [...state.savedDocuments, newDoc],
              currentDocId: newDoc.id,
              lastSavedContent: state.content,
              hasUnsavedChanges: false,
            });
          }
        } finally {
          set({ isSaving: false });
        }
      },

      saveDocumentAs: (name: string) => {
        const state = get();
        if (state.isSaving) return;
        
        set({ isSaving: true });
        
        try {
          const newDoc: SavedDocument = {
            id: crypto.randomUUID(),
            name,
            content: state.content,
            timestamp: Date.now(),
          };
          set({
            savedDocuments: [...state.savedDocuments, newDoc],
            currentDocId: newDoc.id,
            lastSavedContent: state.content,
            hasUnsavedChanges: false,
          });
        } finally {
          set({ isSaving: false });
        }
      },

      loadDocument: (id: string) => {
        const doc = get().savedDocuments.find((d) => d.id === id);
        if (doc) {
          set({
            content: doc.content,
            currentDocId: id,
            lastSavedContent: doc.content,
            hasUnsavedChanges: false,
          });
        }
      },

      deleteDocument: (id: string) => {
        const state = get();
        set({
          savedDocuments: state.savedDocuments.filter((doc) => doc.id !== id),
          currentDocId: state.currentDocId === id ? null : state.currentDocId,
        });
      },

      renameDocument: (id: string, newName: string) => {
        set({
          savedDocuments: get().savedDocuments.map((doc) =>
            doc.id === id ? { ...doc, name: newName } : doc
          ),
        });
      },

      saveVersion: () => {
        const state = get();
        const newVersion = {
          content: state.content,
          timestamp: Date.now(),
        };
        set({
          versions: [...state.versions, newVersion].slice(-50), // Keep last 50 versions
        });
      },

      restoreVersion: (index: number) => {
        const version = get().versions[index];
        if (version) {
          set({
            content: version.content,
            hasUnsavedChanges: true,
          });
        }
      },

      createNewDocument: () => {
        set({
          content: defaultContent,
          currentDocId: null,
          lastSavedContent: defaultContent,
          hasUnsavedChanges: false,
          versions: [],
        });
      },
    }),
    {
      name: 'document-storage',
    }
  )
);
