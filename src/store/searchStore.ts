import { create } from 'zustand';
import { SearchOptions, SearchResult } from '@/types/editor';

interface SearchState {
  showSearchReplace: boolean;
  searchQuery: string;
  replaceQuery: string;
  searchResults: SearchResult[];
  currentSearchIndex: number;
  searchOptions: SearchOptions;
  cursorLine: number;
  cursorColumn: number;
  selectedWords: number;
  
  setShowSearchReplace: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  setReplaceQuery: (query: string) => void;
  setSearchResults: (results: SearchResult[]) => void;
  setCurrentSearchIndex: (index: number) => void;
  setSearchOptions: (options: SearchOptions) => void;
  setCursorPosition: (line: number, column: number) => void;
  setSelectedWords: (count: number) => void;
  performSearch: (query: string, content: string) => void;
  findNext: () => void;
  findPrevious: () => void;
  replaceOne: (content: string, onReplace: (newContent: string) => void) => void;
  replaceAll: (content: string, onReplace: (newContent: string) => void) => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  showSearchReplace: false,
  searchQuery: '',
  replaceQuery: '',
  searchResults: [],
  currentSearchIndex: -1,
  searchOptions: {
    caseSensitive: false,
    wholeWord: false,
    useRegex: false,
  },
  cursorLine: 1,
  cursorColumn: 1,
  selectedWords: 0,

  setShowSearchReplace: (show) => set({ showSearchReplace: show }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setReplaceQuery: (query) => set({ replaceQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
  setCurrentSearchIndex: (index) => set({ currentSearchIndex: index }),
  setSearchOptions: (options) => set({ searchOptions: options }),
  setCursorPosition: (line, column) => set({ cursorLine: line, cursorColumn: column }),
  setSelectedWords: (count) => set({ selectedWords: count }),

  performSearch: (query, content) => {
    if (!query) {
      set({ searchResults: [], currentSearchIndex: -1 });
      return;
    }

    try {
      const { searchOptions } = get();
      let searchRegex: RegExp;

      if (searchOptions.useRegex) {
        try {
          searchRegex = new RegExp(
            query,
            searchOptions.caseSensitive ? 'g' : 'gi'
          );
        } catch {
          set({ searchResults: [], currentSearchIndex: -1 });
          return;
        }
      } else {
        let escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        if (searchOptions.wholeWord) {
          escapedQuery = `\\b${escapedQuery}\\b`;
        }
        
        searchRegex = new RegExp(
          escapedQuery,
          searchOptions.caseSensitive ? 'g' : 'gi'
        );
      }

      const results: SearchResult[] = [];
      const lines = content.split('\n');
      
      lines.forEach((line, lineIndex) => {
        let match;
        while ((match = searchRegex.exec(line)) !== null) {
          results.push({
            line: lineIndex + 1,
            column: match.index + 1,
            length: match[0].length,
            text: match[0],
          });
        }
      });

      set({
        searchResults: results,
        currentSearchIndex: results.length > 0 ? 0 : -1,
      });
    } catch (error) {
      set({ searchResults: [], currentSearchIndex: -1 });
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
    
    const prevIndex = currentSearchIndex <= 0 ? searchResults.length - 1 : currentSearchIndex - 1;
    set({ currentSearchIndex: prevIndex });
  },

  replaceOne: (content, onReplace) => {
    const { searchResults, currentSearchIndex, searchQuery, replaceQuery } = get();
    if (searchResults.length === 0 || currentSearchIndex === -1) return;

    const result = searchResults[currentSearchIndex];
    const lines = content.split('\n');
    const line = lines[result.line - 1];
    
    const before = line.substring(0, result.column - 1);
    const after = line.substring(result.column - 1 + result.length);
    lines[result.line - 1] = before + replaceQuery + after;
    
    onReplace(lines.join('\n'));
    
    // Re-search after replace
    setTimeout(() => {
      get().performSearch(searchQuery, lines.join('\n'));
    }, 10);
  },

  replaceAll: (content, onReplace) => {
    const { searchQuery, replaceQuery, searchOptions } = get();
    if (!searchQuery) return;

    try {
      let searchRegex: RegExp;
      
      if (searchOptions.useRegex) {
        searchRegex = new RegExp(
          searchQuery,
          searchOptions.caseSensitive ? 'g' : 'gi'
        );
      } else {
        let escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        if (searchOptions.wholeWord) {
          escapedQuery = `\\b${escapedQuery}\\b`;
        }
        
        searchRegex = new RegExp(
          escapedQuery,
          searchOptions.caseSensitive ? 'g' : 'gi'
        );
      }

      const newContent = content.replace(searchRegex, replaceQuery);
      onReplace(newContent);
      
      set({ searchResults: [], currentSearchIndex: -1 });
    } catch (error) {
      // Invalid regex or other error
    }
  },
}));
