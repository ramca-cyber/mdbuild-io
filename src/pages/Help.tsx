import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  FileText, GitBranch, Sigma, Code, Download, Keyboard, 
  BookOpen, ExternalLink, Home, Zap, Layout, Search, 
  Edit3, FileCode, Settings, Moon, Save, Copy, Eye, Zap as ZapIcon, Lock, Edit, Eye as EyeIcon, AlertCircle, Shield, Database
} from "lucide-react";

const Help = () => {
  const externalLinkClass = "inline-flex items-center gap-1 text-primary hover:underline";

  const breadcrumb = [
    { name: "Home", url: "https://mdbuild.io" },
    { name: "Help", url: "https://mdbuild.io/help" }
  ];

  const faqItems = [
    {
      question: "How do I use GitHub Alerts?",
      answer: "Create highlighted callouts using GitHub's special blockquote syntax. Start a blockquote with [!NOTE], [!TIP], [!IMPORTANT], [!WARNING], or [!CAUTION] to create beautiful, semantic alerts."
    },
    {
      question: "How do I create Mermaid diagrams?",
      answer: "Create flowcharts, sequence diagrams, Gantt charts, and more using simple text syntax. Use code blocks with 'mermaid' language identifier and write your diagram syntax inside."
    },
    {
      question: "How do I write math equations?",
      answer: "Write beautiful math equations using LaTeX syntax, powered by KaTeX. Use $ for inline math and $$ for block math equations."
    },
    {
      question: "What keyboard shortcuts are available?",
      answer: "Use Ctrl+N for new document, Ctrl+S to save, Ctrl+B for bold, Ctrl+I for italic, Ctrl+E for editor view, and Ctrl+P for preview mode."
    },
    {
      question: "How do I export my documents?",
      answer: "Export your documents to PDF, HTML, DOCX, PNG, or Markdown format using the export menu. All exports preserve formatting, diagrams, and math equations."
    }
  ];

  const articleData = {
    headline: "Help & Documentation - MDBuild.io Markdown Editor",
    datePublished: "2025-01-01",
    dateModified: "2025-01-20",
    author: "MDBuild.io"
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Help & Documentation - MDBuild.io"
        description="Complete guide to using MDBuild.io markdown editor. Learn about GitHub Alerts, Markdown syntax, Mermaid diagrams, KaTeX math equations, interactive task lists, keyboard shortcuts, and export options."
        keywords="markdown help, github alerts tutorial, markdown admonitions guide, mermaid tutorial, katex guide, markdown shortcuts, interactive task lists, technical documentation, markdown editor guide, markdown to png"
        canonicalUrl="https://mdbuild.io/help"
        breadcrumb={breadcrumb}
        faqItems={faqItems}
        articleData={articleData}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">M</span>
            </div>
            <span className="font-bold text-lg">MDBuild.io</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/editor">
                <Edit3 className="h-4 w-4 mr-2" />
                Open Editor
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <BookOpen className="h-4 w-4" />
            <span>Help & Documentation</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to Know
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Complete guide to using MDBuild.io, including all features, shortcuts, and official documentation links
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container max-w-5xl mx-auto px-4 py-12">
        
        {/* Quick Start */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Start Guide
            </CardTitle>
            <CardDescription>Get started in 3 simple steps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">1</div>
              <div>
                <h4 className="font-semibold mb-1">Start Writing</h4>
                <p className="text-sm text-muted-foreground">Type or paste your Markdown content in the editor. Use the toolbar for formatting help.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">2</div>
              <div>
                <h4 className="font-semibold mb-1">See Live Preview</h4>
                <p className="text-sm text-muted-foreground">Toggle between Editor, Split, or Preview modes using the view controls (Ctrl+E/P).</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">3</div>
              <div>
                <h4 className="font-semibold mb-1">Save & Export</h4>
                <p className="text-sm text-muted-foreground">Use Ctrl+S to save, or export to PDF, HTML, DOCX, or Markdown format.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Accordion type="single" collapsible className="space-y-4">
          
          {/* Markdown */}
          <AccordionItem value="markdown" className="border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">Markdown Basics</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Markdown is a lightweight markup language that lets you format text using plain text syntax. MDBuild.io supports GitHub Flavored Markdown (GFM) with tables, task lists, and more.
              </p>
              <div>
                <h4 className="font-semibold text-sm mb-2">Official Documentation:</h4>
                <ul className="space-y-1 text-sm">
                  <li>
                    <a href="https://www.markdownguide.org/" target="_blank" rel="noopener noreferrer" className={externalLinkClass}>
                      Markdown Guide <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <a href="https://github.github.com/gfm/" target="_blank" rel="noopener noreferrer" className={externalLinkClass}>
                      GitHub Flavored Markdown <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* GitHub Alerts */}
          <AccordionItem value="alerts" className="border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">GitHub Alerts & Admonitions</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Create highlighted callouts and alerts using GitHub's special blockquote syntax. Perfect for emphasizing important information.
              </p>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Available Alert Types:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <code className="px-2 py-1 bg-muted rounded text-xs">[!NOTE]</code>
                    <span className="text-muted-foreground">Useful information that users should know</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="px-2 py-1 bg-muted rounded text-xs">[!TIP]</code>
                    <span className="text-muted-foreground">Helpful advice for doing things better or more easily</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="px-2 py-1 bg-muted rounded text-xs">[!IMPORTANT]</code>
                    <span className="text-muted-foreground">Key information users need to know to succeed</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="px-2 py-1 bg-muted rounded text-xs">[!WARNING]</code>
                    <span className="text-muted-foreground">Urgent info that needs immediate attention</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <code className="px-2 py-1 bg-muted rounded text-xs">[!CAUTION]</code>
                    <span className="text-muted-foreground">Advises about risks or negative outcomes</span>
                  </div>
                </div>
                <div className="bg-muted p-3 rounded text-xs">
                  <p className="font-semibold mb-2">Example Syntax:</p>
                  <pre className="overflow-x-auto">{`> [!NOTE]
> This is a note alert. Useful for highlighting information!

> [!WARNING]
> Be careful with this operation!`}</pre>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Learn More:</h4>
                <ul className="space-y-1 text-sm">
                  <li>
                    <a href="https://github.com/orgs/community/discussions/16925" target="_blank" rel="noopener noreferrer" className={externalLinkClass}>
                      GitHub Alerts Documentation <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Mermaid */}
          <AccordionItem value="mermaid" className="border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">Mermaid Diagrams</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Create flowcharts, sequence diagrams, Gantt charts, and more using simple text syntax.
              </p>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Quick Start:</h4>
                <div className="bg-muted p-3 rounded text-xs">
                  <pre className="overflow-x-auto">{`\`\`\`mermaid
flowchart TD
    A[Start] --> B{Decision?}
    B -->|Yes| C[Action]
    B -->|No| D[End]
\`\`\``}</pre>
                </div>
              </div>

              <div className="space-y-3 border-t pt-3">
                <h4 className="font-semibold text-sm">Common Syntax Tips:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="font-medium min-w-[120px]">Newlines:</span>
                    <div>
                      <p className="text-muted-foreground">Use <code className="px-1 py-0.5 bg-muted rounded text-xs">flowchart</code> syntax with <code className="px-1 py-0.5 bg-muted rounded text-xs">\n</code> or <code className="px-1 py-0.5 bg-muted rounded text-xs">&lt;br&gt;</code> tags</p>
                      <code className="text-xs mt-1 block">A["Line 1\nLine 2"]</code>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium min-w-[120px]">Special chars:</span>
                    <div>
                      <p className="text-muted-foreground">Use quotes for labels with parentheses or spaces</p>
                      <code className="text-xs mt-1 block">A["Text (with parens)"]</code>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-medium min-w-[120px]">Markdown:</span>
                    <div>
                      <p className="text-muted-foreground">Use backticks for formatted text</p>
                      <code className="text-xs mt-1 block">A[`**Bold** text`]</code>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded text-sm">
                  <p className="font-semibold text-yellow-700 dark:text-yellow-400 mb-1">⚠️ Common Pitfall</p>
                  <p className="text-xs text-muted-foreground">
                    Old <code className="px-1 py-0.5 bg-muted rounded">graph</code> syntax doesn't support <code className="px-1 py-0.5 bg-muted rounded">\n</code> for newlines. 
                    Use <code className="px-1 py-0.5 bg-muted rounded">flowchart</code> instead for better compatibility!
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Official Documentation:</h4>
                <ul className="space-y-1 text-sm">
                  <li>
                    <a href="https://mermaid.js.org/" target="_blank" rel="noopener noreferrer" className={externalLinkClass}>
                      Mermaid Official Site <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <a href="https://mermaid.js.org/syntax/flowchart.html" target="_blank" rel="noopener noreferrer" className={externalLinkClass}>
                      Flowchart Syntax Guide <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Math */}
          <AccordionItem value="math" className="border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Sigma className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">Math Equations (KaTeX)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Write beautiful math equations using LaTeX syntax, powered by KaTeX.
              </p>
              <div>
                <h4 className="font-semibold text-sm mb-2">Official Documentation:</h4>
                <ul className="space-y-1 text-sm">
                  <li>
                    <a href="https://katex.org/" target="_blank" rel="noopener noreferrer" className={externalLinkClass}>
                      KaTeX Official Site <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Shortcuts */}
          <AccordionItem value="shortcuts" className="border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">Keyboard Shortcuts</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm mb-3">File Operations</h4>
                  <div className="flex justify-between text-sm">
                    <span>New Document</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+N</kbd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Save</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+S</kbd>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm mb-3">View</h4>
                  <div className="flex justify-between text-sm">
                    <span>Editor View</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+E</kbd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Preview</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+P</kbd>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Corporate Network Access */}
          <AccordionItem value="corporate" className="border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">Corporate Network Access</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                MDBuild.io is a privacy-focused, client-side markdown editor designed for technical documentation.
              </p>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">For IT Administrators</h4>
                
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div>
                    <h5 className="font-semibold text-sm mb-2">Security Profile:</h5>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>✅ 100% client-side processing (no server-side data storage)</li>
                      <li>✅ All documents stored locally in browser localStorage</li>
                      <li>✅ No user authentication or account creation required</li>
                      <li>✅ No analytics tracking or data collection</li>
                      <li>✅ Works completely offline after initial load (PWA)</li>
                      <li>✅ Open source and auditable code</li>
                      <li>✅ Zero external API calls for document processing</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-sm mb-2">Network Requirements:</h5>
                    <p className="text-sm text-muted-foreground mb-2">MDBuild requires access to these trusted CDN domains:</p>
                    <ul className="space-y-1 text-sm font-mono text-muted-foreground">
                      <li>• mdbuild.io (primary application domain)</li>
                      <li>• cdn.jsdelivr.net (KaTeX math rendering library)</li>
                      <li>• cdnjs.cloudflare.com (Syntax highlighting library)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-sm mb-2">Firewall Configuration:</h5>
                    <p className="text-sm text-muted-foreground mb-2">If MDBuild.io is blocked on your corporate network:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Verify the site category in your web filter console</li>
                      <li>Request recategorization to "Software/Technology" or "Productivity Tools"</li>
                      <li>Whitelist domain: <code className="px-1 py-0.5 bg-muted rounded text-xs">mdbuild.io</code></li>
                      <li>Optionally whitelist CDN domains listed above</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-sm mb-2">Privacy & Compliance:</h5>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• GDPR compliant (no personal data collection)</li>
                      <li>• No cookies used for tracking</li>
                      <li>• No third-party analytics</li>
                      <li>• Suitable for handling sensitive technical documentation</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-primary/10 border border-primary/20 p-3 rounded text-sm">
                  <p className="font-semibold text-primary mb-1">Need Help?</p>
                  <p className="text-xs text-muted-foreground">
                    For security assessments or whitelisting support, contact: <a href="mailto:support@mdbuild.io" className="text-primary hover:underline">support@mdbuild.io</a>
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* CTA */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold mb-4">Ready to Start Writing?</h3>
          <p className="text-muted-foreground mb-6">Jump into the editor and try it yourself</p>
          <Button size="lg" asChild>
            <Link to="/editor">
              <Edit3 className="h-5 w-5 mr-2" />
              Open Editor
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 px-4 bg-muted/30">
        <div className="container max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
          <div>
            © 2025 MDBuild.io - Free & Open Source Markdown Editor
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Help;