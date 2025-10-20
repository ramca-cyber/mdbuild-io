import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  FileText, GitBranch, Sigma, Code, Download, Keyboard, 
  BookOpen, ExternalLink, Home, Zap, Layout, Search, 
  Edit3, FileCode, Settings, Moon, Save, Copy, Eye, Zap as ZapIcon, Lock, Edit, Eye as EyeIcon, AlertCircle
} from "lucide-react";

const Help = () => {
  const externalLinkClass = "inline-flex items-center gap-1 text-primary hover:underline";

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Help & Documentation - MDBuild.io"
        description="Complete guide to using MDBuild.io markdown editor. Learn about GitHub Alerts, Markdown syntax, Mermaid diagrams, KaTeX math equations, interactive task lists, keyboard shortcuts, and export options."
        keywords="markdown help, github alerts tutorial, markdown admonitions guide, mermaid tutorial, katex guide, markdown shortcuts, interactive task lists, technical documentation, markdown editor guide, markdown to png"
        canonicalUrl="https://mdbuild.io/help"
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
              <div>
                <h4 className="font-semibold text-sm mb-2">Official Documentation:</h4>
                <ul className="space-y-1 text-sm">
                  <li>
                    <a href="https://mermaid.js.org/" target="_blank" rel="noopener noreferrer" className={externalLinkClass}>
                      Mermaid Official Site <ExternalLink className="h-3 w-3" />
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