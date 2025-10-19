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

export const exportToMarkdown = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/markdown' });
  downloadBlob(blob, filename.endsWith('.md') ? filename : `${filename}.md`);
};

export const exportToHtml = async (content: string, filename: string) => {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename}</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    pre { background: #f4f4f4; padding: 1rem; overflow-x: auto; }
    code { background: #f4f4f4; padding: 0.2rem 0.4rem; border-radius: 3px; }
  </style>
</head>
<body>
  <pre>${content}</pre>
</body>
</html>`;
  
  const blob = new Blob([htmlContent], { type: 'text/html' });
  downloadBlob(blob, filename.endsWith('.html') ? filename : `${filename}.html`);
};

export const exportToPdf = async (content: string, filename: string) => {
  const { default: jsPDF } = await import('jspdf');
  
  const doc = new jsPDF();
  const lines = doc.splitTextToSize(content, 180);
  let y = 20;
  
  lines.forEach((line: string) => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 15, y);
    y += 7;
  });
  
  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
};

export const exportToImage = async (content: string, filename: string, format: 'png' | 'jpeg' = 'png') => {
  const { default: html2canvas } = await import('html2canvas');
  
  const container = document.createElement('div');
  container.style.cssText = `
    position: absolute;
    left: -9999px;
    top: 0;
    width: 800px;
    padding: 2rem;
    background: white;
    font-family: monospace;
    white-space: pre-wrap;
  `;
  container.textContent = content;
  document.body.appendChild(container);
  
  const canvas = await html2canvas(container);
  document.body.removeChild(container);
  
  canvas.toBlob((blob) => {
    if (blob) {
      const ext = format === 'jpeg' ? '.jpg' : '.png';
      downloadBlob(blob, filename.endsWith(ext) ? filename : `${filename}${ext}`);
    }
  }, `image/${format}`);
};

export const exportToDocx = async (content: string, filename: string) => {
  const htmlContent = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
<head><meta charset='utf-8'></head>
<body><pre>${content}</pre></body>
</html>`;
  
  const blob = new Blob([htmlContent], { type: 'application/msword' });
  downloadBlob(blob, filename.endsWith('.docx') ? filename : `${filename}.docx`);
};

export const exportToZip = async (content: string, filename: string, includeHtml: boolean = false) => {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  
  zip.file(`${filename}.md`, content);
  
  if (includeHtml) {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${filename}</title>
</head>
<body><pre>${content}</pre></body>
</html>`;
    zip.file(`${filename}.html`, htmlContent);
  }
  
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, filename.endsWith('.zip') ? filename : `${filename}.zip`);
};
