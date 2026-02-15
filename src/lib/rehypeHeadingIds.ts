import { visit } from 'unist-util-visit';

function extractText(node: any): string {
  if (node.type === 'text') return node.value || '';
  if (node.children) return node.children.map(extractText).join('');
  return '';
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export const rehypeHeadingIds = () => {
  return (tree: any) => {
    const slugCounts = new Map<string, number>();

    visit(tree, 'element', (node: any) => {
      if (/^h[1-6]$/.test(node.tagName)) {
        const text = extractText(node);
        let slug = slugify(text);
        if (!slug) return;

        const count = slugCounts.get(slug) || 0;
        slugCounts.set(slug, count + 1);
        if (count > 0) slug = `${slug}-${count}`;

        node.properties = node.properties || {};
        if (!node.properties.id) {
          node.properties.id = slug;
        }
      }
    });
  };
};
