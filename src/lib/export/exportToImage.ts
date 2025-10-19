import { toPng, toJpeg, toSvg } from 'html-to-image';

export type ImageFormat = 'png' | 'jpeg' | 'svg';

export const exportToImage = async (
  element: HTMLElement,
  format: ImageFormat = 'png',
  filename: string = 'document'
): Promise<void> => {
  try {
    let dataUrl: string;

    switch (format) {
      case 'png':
        dataUrl = await toPng(element, { quality: 1.0, pixelRatio: 2 });
        break;
      case 'jpeg':
        dataUrl = await toJpeg(element, { quality: 0.95, pixelRatio: 2 });
        break;
      case 'svg':
        dataUrl = await toSvg(element, { quality: 1.0 });
        break;
      default:
        throw new Error('Unsupported image format');
    }

    const link = document.createElement('a');
    link.download = `${filename}_${Date.now()}.${format}`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Image export error:', error);
    throw new Error(`Failed to export ${format.toUpperCase()}`);
  }
};
