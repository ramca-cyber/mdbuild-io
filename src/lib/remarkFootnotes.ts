// Custom remark plugin to support markdown footnotes
// Supports syntax: [^1] for reference and [^1]: footnote text for definition
import { visit } from 'unist-util-visit';

export function remarkFootnotes() {
  return (tree: any) => {
    const footnotes: { [key: string]: any } = {};
    const footnoteRefs: string[] = [];

    // First pass: collect footnote definitions and mark for removal
    const nodesToRemove: Set<any> = new Set();
    
    visit(tree, 'paragraph', (node, _index, parent) => {
      if (node.children && node.children.length > 0) {
        const firstChild = node.children[0];
        if (firstChild.type === 'text' && firstChild.value) {
          const match = firstChild.value.match(/^\[\^(\w+)\]:\s*(.+)/);
          if (match) {
            const [, id, text] = match;
            footnotes[id] = {
              id,
              text: text + node.children.slice(1).map((c: any) => c.value || '').join(''),
            };
            nodesToRemove.add(node);
          }
        }
      }
    });

    // Remove footnote definition nodes in a separate pass
    visit(tree, (node: any) => {
      if (node.children) {
        node.children = node.children.filter((child: any) => !nodesToRemove.has(child));
      }
    });

    // Second pass: collect text node replacements
    const replacements: { parent: any; index: number; parts: any[] }[] = [];

    visit(tree, 'text', (node, index, parent) => {
      if (node.value) {
        const regex = /\[\^(\w+)\]/g;
        let match;
        const parts: any[] = [];
        let lastIndex = 0;

        while ((match = regex.exec(node.value)) !== null) {
          const [fullMatch, id] = match;
          
          // Add text before match
          if (match.index > lastIndex) {
            parts.push({
              type: 'text',
              value: node.value.substring(lastIndex, match.index),
            });
          }

          // Add footnote reference with data attribute for copy mapping
          parts.push({
            type: 'html',
            value: `<sup data-footnote-ref="${id}"><a href="#fn-${id}" id="fnref-${id}" class="footnote-ref" data-footnote-id="${id}">${id}</a></sup>`,
          });
          
          footnoteRefs.push(id);
          lastIndex = match.index + fullMatch.length;
        }

        // Collect replacement if we found matches
        if (parts.length > 0) {
          if (lastIndex < node.value.length) {
            parts.push({
              type: 'text',
              value: node.value.substring(lastIndex),
            });
          }

          if (parent && typeof index === 'number') {
            replacements.push({ parent, index, parts });
          }
        }
      }
    });

    // Apply text node replacements in reverse order to preserve indices
    for (let i = replacements.length - 1; i >= 0; i--) {
      const { parent, index, parts } = replacements[i];
      parent.children.splice(index, 1, ...parts);
    }

    // Third pass: add footnotes section at the end if there are any
    if (Object.keys(footnotes).length > 0) {
      const footnotesSection = {
        type: 'html',
        value: `
          <div class="footnotes">
            <hr />
            <ol>
              ${footnoteRefs.map(id => {
                const footnote = footnotes[id];
                return footnote ? `
                  <li id="fn-${id}" data-footnote-def="${id}">
                    ${footnote.text}
                    <a href="#fnref-${id}" class="footnote-backref" data-footnote-backref="${id}">↩</a>
                  </li>
                ` : '';
              }).join('')}
            </ol>
          </div>
        `,
      };
      
      tree.children.push(footnotesSection);
    }
  };
}
