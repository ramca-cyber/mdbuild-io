import { useState, useEffect } from 'react';
import { Search, X, ChevronUp, ChevronDown, Replace } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { useSearchStore } from '@/store/searchStore';
import { useDocumentStore } from '@/store/documentStore';

export const SearchReplace = () => {
  const {
    showSearchReplace,
    setShowSearchReplace,
    searchQuery,
    setSearchQuery,
    replaceQuery,
    setReplaceQuery,
    searchOptions,
    setSearchOptions,
    findNext,
    findPrevious,
    searchResults,
    currentSearchIndex,
    replaceOne: storeReplaceOne,
    replaceAll: storeReplaceAll,
    performSearch,
  } = useSearchStore();
  
  const { content, setContent } = useDocumentStore();
  
  const handleReplaceOne = () => {
    storeReplaceOne(content, setContent);
  };
  
  const handleReplaceAll = () => {
    storeReplaceAll(content, setContent);
  };

  const [showReplace, setShowReplace] = useState(false);

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery, content);
    }
  }, [searchQuery, searchOptions, content, performSearch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === 'f') {
        e.preventDefault();
        setShowSearchReplace(true);
      }
      if (modifier && e.shiftKey && e.key === 'h') {
        e.preventDefault();
        setShowSearchReplace(true);
        setShowReplace(true);
      }
      if (e.key === 'Escape' && showSearchReplace) {
        setShowSearchReplace(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSearchReplace, setShowSearchReplace]);

  if (!showSearchReplace) return null;

  const matchCount = searchResults.length;
  const currentMatch = matchCount > 0 ? currentSearchIndex + 1 : 0;

  return (
    <div 
      className="absolute top-4 right-4 z-50 w-80 bg-card border rounded-lg shadow-lg animate-slide-in-right"
      role="search"
      aria-label="Search and replace"
    >
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Search</span>
            {matchCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {currentMatch} of {matchCount}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearchReplace(false)}
            className="h-6 w-6 p-0"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="pr-20"
            autoFocus
            aria-label="Search query"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.shiftKey ? findPrevious() : findNext();
              }
            }}
          />
          <div className="absolute right-1 top-1 flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={findPrevious}
              disabled={matchCount === 0}
              className="h-7 w-7 p-0"
              aria-label="Previous match"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={findNext}
              disabled={matchCount === 0}
              className="h-7 w-7 p-0"
              aria-label="Next match"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showReplace && (
          <div className="space-y-2 animate-accordion-down">
            <div className="relative">
              <Input
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                placeholder="Replace with..."
                aria-label="Replace text"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReplaceOne}
                disabled={matchCount === 0}
                className="flex-1"
              >
                Replace
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReplaceAll}
                disabled={matchCount === 0}
                className="flex-1"
              >
                Replace All
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 border-t">
          <Toggle
            pressed={searchOptions.caseSensitive}
            onPressedChange={(pressed) =>
              setSearchOptions({ ...searchOptions, caseSensitive: pressed })
            }
            size="sm"
            aria-label="Match case"
            className="text-xs h-7"
          >
            Aa
          </Toggle>
          <Toggle
            pressed={searchOptions.wholeWord}
            onPressedChange={(pressed) =>
              setSearchOptions({ ...searchOptions, wholeWord: pressed })
            }
            size="sm"
            aria-label="Match whole word"
            className="text-xs h-7"
          >
            |W|
          </Toggle>
          <Toggle
            pressed={searchOptions.useRegex}
            onPressedChange={(pressed) =>
              setSearchOptions({ ...searchOptions, useRegex: pressed })
            }
            size="sm"
            aria-label="Use regular expression"
            className="text-xs h-7"
          >
            .*
          </Toggle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplace(!showReplace)}
            className="ml-auto h-7"
          >
            <Replace className="h-3 w-3 mr-1" />
            {showReplace ? 'Hide' : 'Replace'}
          </Button>
        </div>
      </div>
    </div>
  );
};
