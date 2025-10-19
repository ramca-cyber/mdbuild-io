import LZString from 'lz-string';

export const generateShareLink = (content: string): string => {
  const compressed = LZString.compressToEncodedURIComponent(content);
  return `${window.location.origin}?doc=${compressed}`;
};

export const loadFromShareLink = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  const docData = params.get('doc');

  if (docData) {
    try {
      return LZString.decompressFromEncodedURIComponent(docData);
    } catch (error) {
      console.error('Failed to decompress shared document:', error);
      return null;
    }
  }

  return null;
};

export const createGithubGist = async (
  content: string,
  filename: string,
  token: string,
  isPublic: boolean = false
): Promise<string> => {
  try {
    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: `${filename} - Created with MDBuild.io`,
        public: isPublic,
        files: {
          [`${filename}.md`]: {
            content: content,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create gist');
    }

    const data = await response.json();
    return data.html_url;
  } catch (error) {
    console.error('GitHub Gist creation error:', error);
    throw new Error('Failed to create GitHub Gist');
  }
};

export const createEmailLink = (content: string, filename: string): string => {
  const blob = new Blob([content], { type: 'text/markdown' });
  const dataUrl = URL.createObjectURL(blob);
  
  const subject = encodeURIComponent(`${filename} - Shared from MDBuild.io`);
  const body = encodeURIComponent(
    `Hi,\n\nI'm sharing a document created with MDBuild.io.\n\nDocument: ${filename}\n\nYou can download the markdown file from the attachment or view it at: ${window.location.origin}\n\nBest regards`
  );

  return `mailto:?subject=${subject}&body=${body}`;
};
