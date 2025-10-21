import { Statistics } from '@/types/editor';

export interface LimitStatus {
  type: 'success' | 'warning' | 'error';
  message: string;
  percentage: number;
}

export interface DocumentLimits {
  shortBlog: { min: 500; max: 800 };
  mediumArticle: { min: 1500; max: 2500 };
  longArticle: { min: 3000; max: 5000 };
  twitter: { chars: 280 };
  metaDescription: { chars: 160 };
}

export const documentLimits: DocumentLimits = {
  shortBlog: { min: 500, max: 800 },
  mediumArticle: { min: 1500, max: 2500 },
  longArticle: { min: 3000, max: 5000 },
  twitter: { chars: 280 },
  metaDescription: { chars: 160 },
};

export const checkWordLimit = (words: number, targetLimit: number | null): LimitStatus | null => {
  if (!targetLimit) return null;
  
  const percentage = (words / targetLimit) * 100;
  
  if (percentage < 90) {
    return {
      type: 'success',
      message: `${words} / ${targetLimit} words`,
      percentage,
    };
  } else if (percentage >= 90 && percentage <= 100) {
    return {
      type: 'warning',
      message: `Approaching limit: ${words} / ${targetLimit} words`,
      percentage,
    };
  } else {
    return {
      type: 'error',
      message: `Over limit: ${words - targetLimit} words over`,
      percentage,
    };
  }
};

export const checkCharLimit = (chars: number, targetLimit: number | null): LimitStatus | null => {
  if (!targetLimit) return null;
  
  const percentage = (chars / targetLimit) * 100;
  
  if (percentage < 90) {
    return {
      type: 'success',
      message: `${chars} / ${targetLimit} characters`,
      percentage,
    };
  } else if (percentage >= 90 && percentage <= 100) {
    return {
      type: 'warning',
      message: `Approaching limit: ${chars} / ${targetLimit} characters`,
      percentage,
    };
  } else {
    return {
      type: 'error',
      message: `Over limit: ${chars - targetLimit} characters over`,
      percentage,
    };
  }
};

export const calculateStatistics = (content: string): Statistics => {
  if (!content.trim()) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      lines: 0,
      paragraphs: 0,
      sentences: 0,
      readingTime: 0,
      headings: { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 },
      codeBlocks: 0,
      links: 0,
      images: 0,
      tables: 0,
    };
  }

  // Remove code blocks for accurate word/sentence counting
  const contentWithoutCode = content.replace(/```[\s\S]*?```/g, '');
  
  // Word count
  const words = contentWithoutCode
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;

  // Character counts
  const characters = content.length;
  const charactersNoSpaces = content.replace(/\s/g, '').length;

  // Line count
  const lines = content.split('\n').length;

  // Paragraph count (blocks of text separated by blank lines)
  const paragraphs = content
    .split(/\n\s*\n/)
    .filter(p => p.trim().length > 0).length;

  // Sentence count (approximate)
  const sentences = contentWithoutCode
    .split(/[.!?]+/)
    .filter(s => s.trim().length > 0).length;

  // Reading time (average 200 words per minute)
  const readingTime = Math.ceil(words / 200);

  // Heading counts
  const headings = {
    h1: (content.match(/^# /gm) || []).length,
    h2: (content.match(/^## /gm) || []).length,
    h3: (content.match(/^### /gm) || []).length,
    h4: (content.match(/^#### /gm) || []).length,
    h5: (content.match(/^##### /gm) || []).length,
    h6: (content.match(/^###### /gm) || []).length,
  };

  // Code blocks
  const codeBlocks = (content.match(/```/g) || []).length / 2;

  // Links
  const links = (content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []).length;

  // Images
  const images = (content.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || []).length;

  // Tables (count table header separators)
  const tables = (content.match(/\|[-:|\s]+\|/g) || []).length;

  return {
    words,
    characters,
    charactersNoSpaces,
    lines,
    paragraphs,
    sentences,
    readingTime,
    headings,
    codeBlocks,
    links,
    images,
    tables,
  };
};
