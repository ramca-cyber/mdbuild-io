import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

export const exportToMarkdown = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  downloadBlob(blob, `${filename}.md`);
};

export const exportToHtml = (content: string, filename: string, previewElement?: HTMLElement) => {
  let htmlContent = '';
  
  if (previewElement) {
    const styles = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
        } catch {
          return '';
        }
      })
      .join('\n');
    
    htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename}</title>
  <style>${styles}</style>
</head>
<body>
  ${previewElement.innerHTML}
</body>
</html>`;
  } else {
    htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename}</title>
</head>
<body>
  <pre>${content}</pre>
</body>
</html>`;
  }
  
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  downloadBlob(blob, `${filename}.html`);
};

export const exportToPdf = async (previewElement: HTMLElement, filename: string) => {
  const canvas = await html2canvas(previewElement, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height],
  });
  
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save(`${filename}.pdf`);
};

export const exportToImage = async (
  previewElement: HTMLElement,
  filename: string,
  format: 'png' | 'jpeg' = 'png'
) => {
  const canvas = await html2canvas(previewElement, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: format === 'jpeg' ? '#ffffff' : null,
  });
  
  canvas.toBlob((blob) => {
    if (blob) {
      downloadBlob(blob, `${filename}.${format}`);
    }
  }, `image/${format}`, 0.95);
};

export const exportToDocx = (content: string, filename: string) => {
  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'></head>
    <body>
      <pre>${content}</pre>
    </body>
    </html>
  `;
  
  const blob = new Blob([htmlContent], { 
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
  });
  downloadBlob(blob, `${filename}.docx`);
};

export const exportToZip = async (
  content: string,
  filename: string,
  includeHtml: boolean = false,
  previewElement?: HTMLElement
) => {
  const zip = new JSZip();
  
  zip.file(`${filename}.md`, content);
  
  if (includeHtml && previewElement) {
    const styles = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
        } catch {
          return '';
        }
      })
      .join('\n');
    
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename}</title>
  <style>${styles}</style>
</head>
<body>
  ${previewElement.innerHTML}
</body>
</html>`;
    
    zip.file(`${filename}.html`, htmlContent);
  }
  
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, `${filename}.zip`);
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
