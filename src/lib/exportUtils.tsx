import { toPng } from 'html-to-image';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  WidthType,
  VerticalAlign,
} from 'docx';

// Wait for all async content to render
export const waitForContentToRender = async (): Promise<void> => {
  // Wait until Mermaid diagrams are rendered (presence of SVGs) with a max timeout
  const start = Date.now();
  const maxWait = 2500; // 2.5s cap
  while (Date.now() - start < maxWait) {
    const containers = Array.from(document.querySelectorAll('.mermaid-diagram-container'));
    const pending = containers.some((c) => !c.querySelector('svg'));
    if (!pending) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // A couple of extra frames for safety
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  await new Promise((resolve) => setTimeout(resolve, 150));
};

// Convert DOM element to PNG image data
export const convertElementToImage = async (element: HTMLElement): Promise<string> => {
  try {
    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      skipFonts: true, // Skip external fonts to avoid CORS issues
    });
    return dataUrl;
  } catch (error) {
    console.error('Error converting element to image:', error);
    throw error;
  }
};

// Extract base64 data from data URL
const getBase64FromDataUrl = (dataUrl: string): Uint8Array => {
  const base64 = dataUrl.split(',')[1];
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Helper to get rendered dimensions
const getRect = (el: HTMLElement) => {
  const r = el.getBoundingClientRect();
  let width = Math.round(r.width);
  let height = Math.round(r.height);
  
  // Fallback to clientWidth/Height if getBoundingClientRect returns 0
  if (width === 0 || height === 0) {
    width = el.clientWidth || width;
    height = el.clientHeight || height;
  }
  
  // Last resort: if it's an SVG, try viewBox
  if ((width === 0 || height === 0) && el.tagName === 'svg') {
    const svg = el as unknown as SVGElement;
    const viewBox = svg.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.split(/\s+/);
      if (parts.length === 4) {
        width = parseFloat(parts[2]) || width;
        height = parseFloat(parts[3]) || height;
      }
    }
  }
  
  return { width: Math.max(1, width), height: Math.max(1, height) };
};

// Helper to convert element to image bytes
const imageBytesFromEl = async (el: HTMLElement): Promise<Uint8Array> => {
  const dataUrl = await convertElementToImage(el);
  return getBase64FromDataUrl(dataUrl);
};

// Constants for DOCX sizing
const DOCX_MAX_WIDTH_PX = 620; // ~6.46in at 96dpi, good content width
const INLINE_MATH_MAX_HEIGHT_PX = 22; // ~12pt baseline height for inline equations

// Parse markdown content into structured sections
interface ContentSection {
  type: 'heading' | 'paragraph' | 'image' | 'table' | 'code' | 'list';
  content: any;
  level?: number;
  data?: any;
}

// Create DOCX from rendered preview
export const createDocxFromPreview = async (
  previewElement: HTMLElement,
  fileName: string
): Promise<Blob> => {
  await waitForContentToRender();

  const sections: any[] = [];

  // Process all child elements
  const processElement = async (element: Element): Promise<any[]> => {
    const elements: any[] = [];
    const tagName = element.tagName.toLowerCase();

    // If this element itself is a mermaid container, export it as an image
    if ((element as HTMLElement).classList?.contains('mermaid-diagram-container')) {
      try {
        const target = (element as HTMLElement);
        const svgElement = target.querySelector('svg');
        const baseEl = (svgElement as unknown as HTMLElement) || target;
        
        const { width, height } = getRect(baseEl);
        const ratio = Math.min(1, DOCX_MAX_WIDTH_PX / width);
        const targetW = Math.round(width * ratio);
        const targetH = Math.round(height * ratio);

        const imageBytes = await imageBytesFromEl(target);

        elements.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: imageBytes,
                transformation: { width: targetW, height: targetH },
                type: 'png',
              }),
            ],
            spacing: { before: 120, after: 120 },
          })
        );
        return elements;
      } catch (error) {
        console.error('Error converting diagram to image:', error);
        elements.push(new Paragraph({ text: '[Diagram could not be exported]', spacing: { before: 120, after: 120 } }));
        return elements;
      }
    }

    // Headings
    if (/^h[1-6]$/.test(tagName)) {
      const level = parseInt(tagName[1]);
      const headingLevels: { [key: number]: typeof HeadingLevel[keyof typeof HeadingLevel] } = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
        4: HeadingLevel.HEADING_4,
        5: HeadingLevel.HEADING_5,
        6: HeadingLevel.HEADING_6,
      };
      elements.push(
        new Paragraph({ text: element.textContent || '', heading: headingLevels[level] || HeadingLevel.HEADING_1, spacing: { before: 240, after: 120 } })
      );
      return elements;
    }

    // Display math equations (KaTeX) — block-level only
    if ((element as HTMLElement).classList?.contains('katex-display')) {
      try {
        const target = element as HTMLElement;
        const { width, height } = getRect(target);
        const ratio = Math.min(1, DOCX_MAX_WIDTH_PX / width);
        const targetW = Math.round(width * ratio);
        const targetH = Math.round(height * ratio);

        const imageBytes = await imageBytesFromEl(target);

        elements.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: imageBytes,
                transformation: { width: targetW, height: targetH },
                type: 'png',
              }),
            ],
            spacing: { before: 120, after: 120 },
          })
        );
        return elements;
      } catch (error) {
        console.error('Error converting equation to image:', error);
      }
    }

    // Tables
    if (tagName === 'table') {
      const rows: TableRow[] = [];
      const tableRows = element.querySelectorAll('tr');

      tableRows.forEach((tr) => {
        const cells: TableCell[] = [];
        const tableCells = tr.querySelectorAll('td, th');

        tableCells.forEach((cell) => {
          cells.push(
            new TableCell({
              children: [new Paragraph({ text: cell.textContent || '', alignment: AlignmentType.LEFT })],
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 100, bottom: 100, left: 100, right: 100 },
            })
          );
        });

        if (cells.length > 0) rows.push(new TableRow({ children: cells }));
      });

      if (rows.length > 0) {
        elements.push(
          new Table({
            rows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
              left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
              right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            },
          })
        );
        elements.push(new Paragraph({ text: '' }));
      }
      return elements;
    }

    // Code blocks and Mermaid nested in <pre>
    if (tagName === 'pre') {
      const mermaidContainer = element.querySelector('.mermaid-diagram-container') as HTMLElement | null;
      if (mermaidContainer) {
        // Export the diagram instead of the pre wrapper
        const diag = await processElement(mermaidContainer);
        elements.push(...diag);
        return elements;
      }

      const codeElement = element.querySelector('code');
      if (codeElement) {
        try {
          const target = element as HTMLElement;
          const { width, height } = getRect(target);
          const ratio = Math.min(1, DOCX_MAX_WIDTH_PX / width);
          const targetW = Math.round(width * ratio);
          const targetH = Math.round(height * ratio);

          const imageBytes = await imageBytesFromEl(target);

          elements.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageBytes,
                  transformation: { width: targetW, height: targetH },
                  type: 'png',
                }),
              ],
              spacing: { before: 120, after: 120 },
            })
          );
        } catch (error) {
          console.error('Error converting code block to image:', error);
          elements.push(new Paragraph({ text: codeElement.textContent || '', spacing: { before: 120, after: 120 } }));
        }
      }
      return elements;
    }

    // Paragraphs (with inline math support)
    if (tagName === 'p') {
      const textContent = element.textContent?.trim() || '';
      if (textContent) {
        const runs: (TextRun | ImageRun)[] = [];
        
        const processNode = async (node: Node): Promise<void> => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent || '';
            if (text.trim()) runs.push(new TextRun(text));
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const text = el.textContent || '';
            
            // Handle inline KaTeX (not display mode)
            if (el.classList.contains('katex') && !el.classList.contains('katex-display')) {
              try {
                const { width, height } = getRect(el);
                const ratio = height > INLINE_MATH_MAX_HEIGHT_PX ? INLINE_MATH_MAX_HEIGHT_PX / height : 1;
                const targetW = Math.round(width * ratio);
                const targetH = Math.round(height * ratio);
                
                const imageBytes = await imageBytesFromEl(el);
                runs.push(new ImageRun({
                  data: imageBytes,
                  transformation: { width: targetW, height: targetH },
                  type: 'png',
                }));
              } catch (error) {
                console.error('Error converting inline equation:', error);
                runs.push(new TextRun(text));
              }
              return;
            }
            
            // Handle formatting
            if (el.tagName === 'STRONG' || el.tagName === 'B') {
              runs.push(new TextRun({ text, bold: true }));
            } else if (el.tagName === 'EM' || el.tagName === 'I') {
              runs.push(new TextRun({ text, italics: true }));
            } else if (el.tagName === 'CODE') {
              runs.push(new TextRun({ text, font: 'Courier New' }));
            } else {
              // Recurse into children
              for (const child of Array.from(el.childNodes)) {
                await processNode(child);
              }
            }
          }
        };
        
        // Process all child nodes
        for (const child of Array.from(element.childNodes)) {
          await processNode(child);
        }
        
        if (runs.length > 0) {
          elements.push(new Paragraph({ children: runs, spacing: { before: 120, after: 120 } }));
        }
      }
      
      // Return early to prevent duplicate processing
      return elements;
    }

    // Lists
    if (tagName === 'ul' || tagName === 'ol') {
      const listItems = element.querySelectorAll('li');
      listItems.forEach((li, index) => {
        const bullet = tagName === 'ul' ? '•' : `${index + 1}.`;
        elements.push(new Paragraph({ text: `${bullet} ${li.textContent || ''}`, spacing: { before: 60, after: 60 }, indent: { left: 720 } }));
      });
      return elements;
    }

    // Recurse into children to catch nested diagrams/equations/etc.
    const children = Array.from(element.children);
    for (const child of children) {
      const processed = await processElement(child);
      elements.push(...processed);
    }

    return elements;
  };

  // Process the article content
  const article = previewElement.querySelector('article');
  if (article) {
    const children = Array.from(article.children);
    
    for (const child of children) {
      const processedElements = await processElement(child);
      sections.push(...processedElements);
    }
  }

  // Create the document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections.length > 0 ? sections : [
          new Paragraph({ text: 'No content to export' }),
        ],
      },
    ],
  });

  // Generate blob
  const blob = await Packer.toBlob(doc);
  return blob;
};

// Improved PDF export with better rendering
export const exportToPdfWithRendering = async (
  previewElement: HTMLElement,
  fileName: string
): Promise<void> => {
  const { jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;

  // Wait for all content to render
  await waitForContentToRender();

  const article = previewElement.querySelector('article');
  if (!article) {
    throw new Error('Article element not found');
  }

  // Capture with appropriate quality and size
  const canvas = await html2canvas(article as HTMLElement, {
    scale: 2, // Good quality without oversizing
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: 900, // Match typical content width
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const availableWidth = pageWidth - margin * 2;
  
  // Convert pixels to mm properly (assuming 96 DPI)
  const pixelToMm = 0.264583;
  const imgWidthMm = (canvas.width / 2) * pixelToMm; // Divide by scale
  const imgHeightMm = (canvas.height / 2) * pixelToMm;
  
  // Calculate scaling to fit page width
  const scale = Math.min(1, availableWidth / imgWidthMm);
  const scaledWidth = imgWidthMm * scale;
  const scaledHeight = imgHeightMm * scale;
  const availableHeight = pageHeight - margin * 2;

  // Handle multi-page content
  let heightLeft = scaledHeight;
  let position = margin;
  let page = 0;

  while (heightLeft > 0) {
    if (page > 0) {
      pdf.addPage();
    }

    pdf.addImage(
      imgData,
      'PNG',
      margin,
      position - (page * availableHeight),
      scaledWidth,
      scaledHeight
    );

    heightLeft -= availableHeight;
    page++;
  }

  pdf.save(`${fileName}.pdf`);
};

// Improved HTML export with inline styles - captures already-rendered preview
export const exportToHtmlWithInlineStyles = async (
  previewElement: HTMLElement,
  fileName: string
): Promise<void> => {
  await waitForContentToRender();

  // Get the article content that's already rendered (includes Mermaid diagrams)
  const article = previewElement.querySelector('article');
  if (!article) {
    throw new Error('Article element not found');
  }

  // Clone the article to avoid modifying the original
  const clonedArticle = article.cloneNode(true) as HTMLElement;
  
  // Remove copy buttons from code blocks
  const copyButtons = clonedArticle.querySelectorAll('.copy-button');
  copyButtons.forEach(button => button.remove());

  // Rasterize complex elements to embedded images for robust formatting
  const rasterizeToImg = async (selector: string, altFactory: (el: Element) => string) => {
    const nodes = Array.from(clonedArticle.querySelectorAll(selector));
    for (const node of nodes) {
      try {
        const dataUrl = await convertElementToImage(node as HTMLElement);
        const img = document.createElement('img');
        img.src = dataUrl;
        img.alt = altFactory(node);
        img.loading = 'lazy';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        node.replaceWith(img);
      } catch (e) {
        console.error('Rasterize error:', e);
      }
    }
  };

  // Mermaid and KaTeX tend to shift styles across environments – turn them into PNGs
  await rasterizeToImg('.mermaid-diagram-container', () => 'Mermaid diagram');
  await rasterizeToImg('.katex-display, .katex', () => 'Mathematical equation');
  
  const renderedContent = clonedArticle.innerHTML;

  // Inline CSS styles
  const inlineStyles = `
    <style>
      /* Reset and base styles */
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #24292e;
        background: #ffffff;
        max-width: 900px;
        margin: 40px auto;
        padding: 0 20px;
      }
      
      /* GitHub markdown styles */
      h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; }
      h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
      h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
      h3 { font-size: 1.25em; }
      p { margin-bottom: 16px; }
      a { color: #0366d6; text-decoration: none; }
      a:hover { text-decoration: underline; }
      code { padding: 0.2em 0.4em; margin: 0; font-size: 85%; background-color: rgba(27,31,35,0.05); border-radius: 3px; font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; }
      pre { padding: 16px; overflow: auto; font-size: 85%; line-height: 1.45; background-color: #f6f8fa; border-radius: 6px; margin-bottom: 16px; }
      pre code { padding: 0; background: transparent; border: 0; }
      table { border-spacing: 0; border-collapse: collapse; margin-bottom: 16px; width: 100%; }
      table th, table td { padding: 6px 13px; border: 1px solid #dfe2e5; }
      table th { font-weight: 600; background-color: #f6f8fa; }
      table tr { background-color: #fff; border-top: 1px solid #c6cbd1; }
      table tr:nth-child(2n) { background-color: #f6f8fa; }
      blockquote { padding: 0 1em; color: #6a737d; border-left: 0.25em solid #dfe2e5; margin-bottom: 16px; }
      ul, ol { padding-left: 2em; margin-bottom: 16px; }
      img { max-width: 100%; height: auto; }
      
      /* KaTeX styles */
      .katex { font-size: 1.1em; }
      .katex-display { overflow: auto hidden; padding: 1em 0; }
      
      /* Mermaid diagram styles */
      .mermaid-diagram-container { margin: 20px 0; text-align: center; }
      .mermaid-diagram-container svg { max-width: 100%; height: auto; }
      
      /* Syntax highlighting */
      .hljs { display: block; overflow-x: auto; padding: 0.5em; background: #f6f8fa; }
      .hljs-comment, .hljs-quote { color: #6a737d; }
      .hljs-keyword, .hljs-selector-tag, .hljs-type { color: #d73a49; }
      .hljs-string, .hljs-meta-string { color: #032f62; }
      .hljs-number, .hljs-literal, .hljs-variable { color: #005cc5; }
      .hljs-title, .hljs-section { color: #6f42c1; }
      .hljs-attr, .hljs-attribute { color: #005cc5; }
    </style>
  `;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName}</title>
  ${inlineStyles}
</head>
<body>
${renderedContent}
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.html`;
  a.click();
  URL.revokeObjectURL(url);
};
