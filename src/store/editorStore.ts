import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SearchOptions, SearchResult } from '@/types/editor';

export type Theme = 'light' | 'dark' | 'sepia';

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
  focusMode: boolean;
  zenMode: boolean;
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
  statisticsExpanded: boolean;
  
  // Cursor & Selection
  cursorLine: number;
  cursorColumn: number;
  selectedWords: number;
  
  // Zoom
  zoomLevel: number;
  
  // Search & Replace
  showSearchReplace: boolean;
  searchQuery: string;
  replaceQuery: string;
  searchResults: SearchResult[];
  currentSearchIndex: number;
  searchOptions: SearchOptions;
  
  // Save state
  isSaving: boolean;
  
  // Word/Character Limit Warnings
  wordLimitWarningsEnabled: boolean;
  customWordLimit: number | null;
  customCharLimit: number | null;
  
  // Print Settings
  printSettings: {
    paperSize: 'A4' | 'Letter' | 'Legal';
    orientation: 'portrait' | 'landscape';
    margins: 'normal' | 'narrow' | 'wide';
    includeLineNumbers: boolean;
    includePageNumbers: boolean;
    includeHeaderFooter: boolean;
    headerText: string;
    footerText: string;
    fontSize: 'small' | 'medium' | 'large';
    syntaxHighlighting: boolean;
    colorMode: 'color' | 'grayscale' | 'blackwhite';
    columns: 'single' | 'two';
    includeTableOfContents: boolean;
    breakPagesAtHeadings: boolean;
  };
  
  setContent: (content: string) => void;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: number) => void;
  setLineWrap: (wrap: boolean) => void;
  setViewMode: (mode: 'split' | 'editor' | 'preview') => void;
  setShowOutline: (show: boolean) => void;
  setFocusMode: (mode: boolean) => void;
  setZenMode: (mode: boolean) => void;
  setLineNumbers: (show: boolean) => void;
  setAutoSave: (enabled: boolean) => void;
  setSyncScroll: (enabled: boolean) => void;
  setCurrentDocId: (id: string | null) => void;
  forceRefreshPreview: () => void;
  setStatisticsExpanded: (expanded: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;
  saveDocument: (name: string) => void;
  saveDocumentAs: (name: string) => void;
  loadDocument: (id: string) => void;
  deleteDocument: (id: string) => void;
  renameDocument: (id: string, newName: string) => void;
  saveVersion: () => void;
  restoreVersion: (index: number) => void;
  createNewDocument: () => void;
  resetToDefaults: () => void;
  
  // Cursor & Selection actions
  setCursorPosition: (line: number, column: number) => void;
  setSelectedWords: (count: number) => void;
  
  // Zoom actions
  setZoomLevel: (level: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  
  // Search & Replace actions
  setShowSearchReplace: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  setReplaceQuery: (query: string) => void;
  setSearchResults: (results: SearchResult[]) => void;
  setCurrentSearchIndex: (index: number) => void;
  setSearchOptions: (options: SearchOptions) => void;
  performSearch: (query: string) => void;
  findNext: () => void;
  findPrevious: () => void;
  replaceOne: () => void;
  replaceAll: () => void;
  
  // Word/Character Limit Warnings actions
  setWordLimitWarningsEnabled: (enabled: boolean) => void;
  setCustomWordLimit: (limit: number | null) => void;
  setCustomCharLimit: (limit: number | null) => void;
  
  // Print Settings actions
  setPrintSettings: (settings: Partial<EditorState['printSettings']>) => void;
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

**Happy Writing!** ✨
`;

export const getDefaultContent = () => defaultContent;

// Handle multi-tab conflict resolution
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'editor-storage' && e.newValue) {
      try {
        const newState = JSON.parse(e.newValue);
        const currentState = useEditorStore.getState();
        
        // Check if content was modified in another tab
        if (newState.state.content !== currentState.content) {
          const shouldSync = window.confirm(
            'Content was modified in another tab. Do you want to sync with the latest version? (Cancel to keep current content)'
          );
          
          if (shouldSync) {
            useEditorStore.setState({ content: newState.state.content });
          }
        }
      } catch (error) {
        console.error('Failed to parse storage event:', error);
      }
    }
  });
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      content: defaultContent,
      theme: 'light',
      fontSize: 14,
      lineWrap: true,
      viewMode: 'split',
      showOutline: false,
      focusMode: false,
      zenMode: false,
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
      statisticsExpanded: false,
      
      // Cursor & Selection initial state
      cursorLine: 1,
      cursorColumn: 1,
      selectedWords: 0,
      
      // Zoom initial state
      zoomLevel: 100,
      
      // Search & Replace initial state
      showSearchReplace: false,
      searchQuery: '',
      replaceQuery: '',
      searchResults: [],
      currentSearchIndex: 0,
      searchOptions: {
        caseSensitive: false,
        wholeWord: false,
        useRegex: false,
      },
      
      // Save state
      isSaving: false,
      
      // Word/Character Limit Warnings initial state
      wordLimitWarningsEnabled: false,
      customWordLimit: null,
      customCharLimit: null,
      
      // Print Settings initial state
      printSettings: {
        paperSize: 'A4',
        orientation: 'portrait',
        margins: 'normal',
        includeLineNumbers: false,
        includePageNumbers: true,
        includeHeaderFooter: false,
        headerText: '',
        footerText: '',
        fontSize: 'medium',
        syntaxHighlighting: true,
        colorMode: 'color',
        columns: 'single',
        includeTableOfContents: false,
        breakPagesAtHeadings: false,
      },
      
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
      setFocusMode: (mode) => set({ focusMode: mode }),
      setZenMode: (mode) => set({ zenMode: mode }),
      setLineNumbers: (show) => set({ lineNumbers: show }),
      setAutoSave: (enabled) => set({ autoSave: enabled }),
      setSyncScroll: (enabled) => set({ syncScroll: enabled }),
      setCurrentDocId: (id) => set({ currentDocId: id }),
      forceRefreshPreview: () => set({ previewRefreshKey: get().previewRefreshKey + 1 }),
      setStatisticsExpanded: (expanded) => set({ statisticsExpanded: expanded }),
      setIsSaving: (isSaving) => set({ isSaving }),
      saveDocument: (name) => {
        const state = get();
        
        // Prevent race conditions
        if (state.isSaving) {
          console.warn('Save already in progress');
          return;
        }
        
        try {
          set({ isSaving: true });
          
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
                hasUnsavedChanges: false,
                isSaving: false
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
              hasUnsavedChanges: false,
              isSaving: false
            });
          }
        } catch (error) {
          console.error('Error saving document:', error);
          set({ isSaving: false });
          throw error;
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
      resetToDefaults: () => {
        set({
          theme: 'light',
          fontSize: 14,
          lineWrap: true,
          lineNumbers: true,
          autoSave: true,
          syncScroll: true,
          showOutline: false,
          viewMode: 'split',
        });
      },
      
      // Cursor & Selection methods
      setCursorPosition: (line, column) => set({ cursorLine: line, cursorColumn: column }),
      setSelectedWords: (count) => set({ selectedWords: count }),
      
      // Zoom methods
      setZoomLevel: (level) => set({ zoomLevel: Math.min(Math.max(level, 50), 200) }),
      zoomIn: () => {
        const current = get().zoomLevel;
        set({ zoomLevel: Math.min(current + 10, 200) });
      },
      zoomOut: () => {
        const current = get().zoomLevel;
        set({ zoomLevel: Math.max(current - 10, 50) });
      },
      resetZoom: () => set({ zoomLevel: 100 }),
      
      // Search & Replace methods
      setShowSearchReplace: (show) => set({ showSearchReplace: show }),
      setSearchQuery: (query) => {
        set({ searchQuery: query });
        get().performSearch(query);
      },
      setReplaceQuery: (query) => set({ replaceQuery: query }),
      setSearchResults: (results) => set({ searchResults: results }),
      setCurrentSearchIndex: (index) => set({ currentSearchIndex: index }),
      setSearchOptions: (options) => {
        set({ searchOptions: options });
        get().performSearch(get().searchQuery);
      },
      
      performSearch: (query: string) => {
        const { content, searchOptions } = get();
        if (!query) {
          set({ searchResults: [], currentSearchIndex: 0 });
          return;
        }

        const results: SearchResult[] = [];
        const lines = content.split('\n');
        
        try {
          let searchPattern: RegExp;
          
          // Validate regex before creating pattern
          if (searchOptions.useRegex) {
            try {
              // Test if the regex is valid
              new RegExp(query);
              searchPattern = new RegExp(query, searchOptions.caseSensitive ? 'g' : 'gi');
            } catch (regexError) {
              console.error('Invalid regex pattern:', regexError);
              set({ searchResults: [], currentSearchIndex: 0 });
              return;
            }
          } else {
            const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const pattern = searchOptions.wholeWord ? `\\b${escapedQuery}\\b` : escapedQuery;
            searchPattern = new RegExp(pattern, searchOptions.caseSensitive ? 'g' : 'gi');
          }

          lines.forEach((line, lineIndex) => {
            let match;
            const regex = new RegExp(searchPattern.source, searchPattern.flags);
            while ((match = regex.exec(line)) !== null) {
              results.push({
                line: lineIndex + 1,
                column: match.index,
                length: match[0].length,
                text: match[0],
              });
            }
          });

          set({ searchResults: results, currentSearchIndex: results.length > 0 ? 0 : 0 });
        } catch (error) {
          console.error('Search error:', error);
          set({ searchResults: [], currentSearchIndex: 0 });
        }
      },
      
      findNext: () => {
        const { searchResults, currentSearchIndex } = get();
        if (searchResults.length === 0) return;
        const nextIndex = (currentSearchIndex + 1) % searchResults.length;
        set({ currentSearchIndex: nextIndex });
      },
      
      findPrevious: () => {
        const { searchResults, currentSearchIndex } = get();
        if (searchResults.length === 0) return;
        const prevIndex = currentSearchIndex === 0 ? searchResults.length - 1 : currentSearchIndex - 1;
        set({ currentSearchIndex: prevIndex });
      },
      
      replaceOne: () => {
        const { content, searchResults, currentSearchIndex, replaceQuery } = get();
        if (searchResults.length === 0) return;
        
        const result = searchResults[currentSearchIndex];
        const lines = content.split('\n');
        const line = lines[result.line - 1];
        const newLine = line.substring(0, result.column) + replaceQuery + line.substring(result.column + result.length);
        lines[result.line - 1] = newLine;
        
        const newContent = lines.join('\n');
        set({ content: newContent });
        get().performSearch(get().searchQuery);
      },
      
      replaceAll: () => {
        const { content, searchQuery, replaceQuery, searchOptions } = get();
        if (!searchQuery) return;
        
        try {
          let searchPattern: RegExp;
          
          if (searchOptions.useRegex) {
            searchPattern = new RegExp(searchQuery, searchOptions.caseSensitive ? 'g' : 'gi');
          } else {
            const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const pattern = searchOptions.wholeWord ? `\\b${escapedQuery}\\b` : escapedQuery;
            searchPattern = new RegExp(pattern, searchOptions.caseSensitive ? 'g' : 'gi');
          }

          const newContent = content.replace(searchPattern, replaceQuery);
          set({ content: newContent });
          get().performSearch(searchQuery);
        } catch (error) {
          // Invalid regex
        }
      },
      
      // Word/Character Limit Warnings methods
      setWordLimitWarningsEnabled: (enabled) => set({ wordLimitWarningsEnabled: enabled }),
      setCustomWordLimit: (limit) => set({ customWordLimit: limit }),
      setCustomCharLimit: (limit) => set({ customCharLimit: limit }),
      
      // Print Settings methods
      setPrintSettings: (settings) => set({ 
        printSettings: { ...get().printSettings, ...settings } 
      }),
    }),
    {
      name: 'mdbuild-storage',
    }
  )
);
