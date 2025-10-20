export interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}

export interface SearchResult {
  line: number;
  column: number;
  length: number;
  text: string;
}

export interface Statistics {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  lines: number;
  paragraphs: number;
  sentences: number;
  readingTime: number;
  headings: { [key: string]: number };
  codeBlocks: number;
  links: number;
  images: number;
  tables: number;
}
