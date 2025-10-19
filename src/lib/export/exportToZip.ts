import JSZip from 'jszip';

export const exportToZip = async (
  content: string,
  htmlContent: string,
  filename: string = 'document'
): Promise<void> => {
  try {
    const zip = new JSZip();

    // Add markdown file
    zip.file(`${filename}.md`, content);

    // Add HTML file
    zip.file(`${filename}.html`, htmlContent);

    // Add README
    zip.file(
      'README.txt',
      `MDBuild.io Export\n\nContents:\n- ${filename}.md (Markdown source)\n- ${filename}.html (Rendered HTML)\n\nGenerated: ${new Date().toLocaleString()}`
    );

    // Generate and download zip
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('ZIP export error:', error);
    throw new Error('Failed to create ZIP archive');
  }
};
