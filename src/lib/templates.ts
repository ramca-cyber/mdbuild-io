import { FileText, BookOpen, Briefcase, Calendar, GitBranch, FlaskConical, Sparkles, LucideIcon } from 'lucide-react';

export interface Template {
  name: string;
  icon: LucideIcon;
  content: string;
}

export const templates: Template[] = [
  {
    name: 'Feature Showcase',
    icon: Sparkles,
    content: `# MDBuild.io Feature Showcase 🚀

This template demonstrates **ALL** available features in MDBuild.io.

---

## 📝 Basic Text Formatting

**Bold text** and *italic text* and ***bold italic***

~~Strikethrough text~~ and \`inline code\`

Keyboard shortcuts: <kbd>Ctrl</kbd> + <kbd>S</kbd>

> Simple blockquote for highlighting information
> Can span multiple lines

Horizontal rule below:

---

## 🎯 GitHub Alerts (Admonitions)

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

---

## 📋 Lists

### Unordered List
- First item
- Second item
  - Nested item 2.1
  - Nested item 2.2
- Third item

### Ordered List
1. First step
2. Second step
   1. Substep A
   2. Substep B
3. Third step

### Task Lists (Interactive!)
- [x] Completed task
- [x] Another done task
- [ ] Todo item
- [ ] Another todo

---

## 📊 Tables

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| GitHub Alerts | ✅ Done | High | All 5 types supported |
| Mermaid Diagrams | ✅ Done | High | Multiple diagram types |
| Math Equations | ✅ Done | High | KaTeX powered |
| Footnotes | ✅ Done | Medium | Full support |
| Export to PNG | ✅ Done | Medium | High quality |

---

## 💻 Code Blocks with Syntax Highlighting

### JavaScript
\`\`\`javascript
// Arrow function with async/await
const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
\`\`\`

### Python
\`\`\`python
# List comprehension and class
squares = [x**2 for x in range(10)]

class Developer:
    def __init__(self, name, language):
        self.name = name
        self.language = language
    
    def code(self):
        return f"{self.name} codes in {self.language}!"
\`\`\`

### Bash
\`\`\`bash
# Install dependencies and run
npm install
npm run dev
\`\`\`

---

## 🧮 Math Equations (KaTeX)

### Inline Math
The famous equation $E = mc^2$ and the quadratic formula $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.

### Block Math Equations

**Pythagorean Theorem:**
$$
a^2 + b^2 = c^2
$$

**Integral:**
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

**Matrix:**
$$
\\begin{bmatrix}
a & b & c \\\\
d & e & f \\\\
g & h & i
\\end{bmatrix}
$$

**Summation:**
$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$

**Greek Letters:**
$\\alpha, \\beta, \\gamma, \\delta, \\epsilon, \\theta, \\lambda, \\mu, \\sigma, \\omega$

---

## 📈 Mermaid Diagrams

### Flowchart
\`\`\`mermaid
graph TD
    A[Start] --> B{Decision?}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
    E --> F{Another?}
    F -->|Yes| A
    F -->|No| G[Complete]
\`\`\`

### Sequence Diagram
\`\`\`mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    
    User->>Frontend: Click Button
    Frontend->>Backend: API Request
    Backend->>Database: Query
    Database-->>Backend: Results
    Backend-->>Frontend: Response
    Frontend-->>User: Update UI
\`\`\`

### Pie Chart
\`\`\`mermaid
pie title Development Time Distribution
    "Coding" : 40
    "Debugging" : 25
    "Meetings" : 20
    "Documentation" : 10
    "Coffee" : 5
\`\`\`

### Gantt Chart
\`\`\`mermaid
gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Planning
    Research           :2024-01-01, 15d
    Design            :2024-01-10, 20d
    section Development
    Backend           :2024-01-20, 30d
    Frontend          :2024-02-01, 30d
    section Testing
    QA Testing        :2024-03-01, 15d
\`\`\`

---

## 🔗 Links and Images

### Links
[Visit MDBuild.io](https://mdbuild.io)

[Link with title](https://example.com "Example Website")

Auto-link: https://www.example.com

### Images
![Mountain landscape at sunset](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80)
*Beautiful mountain landscape - Always use descriptive alt text*

![Code on laptop screen](https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80)
*Developer workspace*

---

## 🎨 Emojis

Express yourself with emojis! :tada: :rocket: :sparkles:

**Common emojis:**
- :heart: :fire: :bulb: :zap: :star:
- :white_check_mark: :x: :warning: :information_source:
- :computer: :keyboard: :mouse: :printer:
- :smile: :thumbsup: :clap: :eyes:

---

## 📚 Footnotes

Here's a sentence with a footnote[^1].

Multiple footnotes[^2] work great for citations[^3] and references.

You can use named footnotes[^note-name] for better organization.

[^1]: This is the first footnote. It can contain **formatting** and [links](https://example.com).

[^2]: Here's another footnote with detailed information.

[^3]: Footnotes are perfect for citations and references in academic or technical writing.

[^note-name]: Named footnotes make it easier to manage footnotes in long documents.

---

## ⚡ Quick Tips

> [!TIP]
> - Use **Ctrl+S** to save your document
> - Use **Ctrl+B** for bold, **Ctrl+I** for italic
> - Toggle view modes with the toolbar buttons
> - Export to PNG, PDF, HTML, DOCX, or Markdown

> [!IMPORTANT]
> All your data is stored locally in your browser. Your documents never leave your device!

---

**🎉 You've seen all the features! Start creating amazing documents with MDBuild.io!**
`,
  },
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

![Hero image showing a scenic mountain landscape](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80)

## Introduction
Hook your readers with an engaging opening paragraph that draws readers in and sets up what they'll learn.

## Main Content
### Section 1
Your first main point with supporting details.

![Code editor on a desk](https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80)

### Section 2
Your second main point with examples and evidence.

> **Pro Tip:** Add callouts to highlight important information.

### Code Example
\`\`\`javascript
const example = () => {
  console.log('Hello, World!');
};
\`\`\`

## Image Examples
You can add images from any public URL. Always include descriptive alt text for accessibility:

![Laptop with code on screen showing web development](https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80)

*Photo by [Unsplash](https://unsplash.com) - Always credit your sources*

## Conclusion
Wrap up your post with key takeaways and actionable next steps.

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
