import TurndownService from 'turndown';
import mammoth from 'mammoth';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

export const importMarkdown = async (file: File): Promise<string> => {
  return await file.text();
};

export const importHtml = async (file: File): Promise<string> => {
  const html = await file.text();
  return turndownService.turndown(html);
};

export const importDocx = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return turndownService.turndown(result.value);
  } catch (error) {
    console.error('DOCX import error:', error);
    throw new Error('Failed to import DOCX file');
  }
};

export const importZip = async (file: File): Promise<string> => {
  const JSZip = (await import('jszip')).default;
  
  try {
    const zip = await JSZip.loadAsync(file);
    
    // Find first .md file
    const mdFile = Object.keys(zip.files).find((name) => name.endsWith('.md'));
    
    if (mdFile) {
      const content = await zip.files[mdFile].async('text');
      return content;
    }
    
    throw new Error('No markdown file found in ZIP');
  } catch (error) {
    console.error('ZIP import error:', error);
    throw new Error('Failed to import ZIP file');
  }
};

export const detectFileType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'txt':
      return 'text';
    case 'html':
    case 'htm':
      return 'html';
    case 'docx':
      return 'docx';
    case 'zip':
      return 'zip';
    default:
      return 'unknown';
  }
};

export const getFilePreview = (content: string, maxLength: number = 200): string => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
};
