import { FileText, BookOpen, Briefcase, Calendar, GitBranch, FlaskConical } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

const templates = [
  {
    name: 'README',
    icon: FileText,
    content: `# Project Name

## Description
A brief description of your project.

## Installation
\`\`\`bash
npm install
\`\`\`

## Usage
\`\`\`javascript
import { example } from 'package';
\`\`\`

## Features
- Feature 1
- Feature 2
- Feature 3

## Contributing
Pull requests are welcome!

## License
MIT
`,
  },
  {
    name: 'Technical Spec',
    icon: Briefcase,
    content: `# Technical Specification

## Overview
Brief overview of the system or feature.

## Requirements
### Functional Requirements
- [ ] Requirement 1
- [ ] Requirement 2

### Non-Functional Requirements
- Performance: Response time < 200ms
- Security: End-to-end encryption

## Architecture
\`\`\`mermaid
graph LR
    A[Client] --> B[API Gateway]
    B --> C[Service 1]
    B --> D[Service 2]
\`\`\`

## Implementation Plan
1. Phase 1: Foundation
2. Phase 2: Core features
3. Phase 3: Polish

## Testing Strategy
- Unit tests
- Integration tests
- E2E tests
`,
  },
  {
    name: 'Meeting Notes',
    icon: Calendar,
    content: `# Meeting Notes - [Date]

## Attendees
- Person 1
- Person 2
- Person 3

## Agenda
1. Topic 1
2. Topic 2
3. Topic 3

## Discussion Points
### Topic 1
- Key point
- Decision made

### Topic 2
- Discussion summary
- Next steps

## Action Items
- [ ] Task 1 - @person1 - Due: [date]
- [ ] Task 2 - @person2 - Due: [date]

## Next Meeting
Date: [date]
Topics: [topics]
`,
  },
  {
    name: 'Blog Post',
    icon: BookOpen,
    content: `# Blog Post Title

*Published on [Date] by [Author]*

## Introduction
Hook your readers with an engaging opening paragraph.

## Main Content
### Section 1
Your first main point with supporting details.

### Section 2
Your second main point.

> **Pro Tip:** Add callouts to highlight important information.

### Code Example
\`\`\`javascript
const example = () => {
  console.log('Hello, World!');
};
\`\`\`

## Conclusion
Wrap up your post with key takeaways.

---

*Tags: #tag1 #tag2 #tag3*
`,
  },
  {
    name: 'Mermaid Examples',
    icon: GitBranch,
    content: `# Mermaid Diagram Examples

## Flowchart
\`\`\`mermaid
graph TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    B -->|No| D[End]
    C --> D
\`\`\`

## Sequence Diagram
\`\`\`mermaid
sequenceDiagram
    Alice->>John: Hello John!
    John-->>Alice: Hi Alice!
    Alice->>John: How are you?
\`\`\`

## Pie Chart
\`\`\`mermaid
pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15
\`\`\`

## Gantt Chart
\`\`\`mermaid
gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Phase 1
    Task 1: 2024-01-01, 30d
    Task 2: 2024-02-01, 20d
\`\`\`
`,
  },
  {
    name: 'Math Examples',
    icon: FlaskConical,
    content: `# Mathematical Formulas

## Inline Math
The famous equation $E = mc^2$ shows the relationship between energy and mass.

The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.

## Block Math

### Pythagorean Theorem
$$
a^2 + b^2 = c^2
$$

### Integral
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

### Matrix
$$
\\begin{bmatrix}
a & b \\\\
c & d
\\end{bmatrix}
$$

### Summation
$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$

## Greek Letters
$\\alpha, \\beta, \\gamma, \\delta, \\epsilon, \\theta, \\lambda, \\mu, \\sigma, \\omega$
`,
  },
];

export const TemplatesDrawer = () => {
  const { setContent } = useEditorStore();

  const handleTemplateClick = (template: typeof templates[0]) => {
    setContent(template.content);
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        <h3 className="font-semibold mb-3 text-sm text-foreground">Templates</h3>
        {templates.map((template) => (
          <Card
            key={template.name}
            className="p-4 cursor-pointer hover:bg-accent transition-colors"
            onClick={() => handleTemplateClick(template)}
          >
            <div className="flex items-start gap-3">
              <template.icon className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-sm mb-1">{template.name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {template.content.split('\n')[0].replace(/^#\s*/, '')}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};
