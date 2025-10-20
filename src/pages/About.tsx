import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { ArrowLeft, Github, Heart, Zap, Shield, Code } from "lucide-react";

const About = () => {
  const aboutStructuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About MDBuild.io",
    "description": "Learn about MDBuild.io - a privacy-focused, free markdown editor with live preview, diagrams, and math support.",
    "url": "https://mdbuild.io/about"
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="About MDBuild.io - Modern Markdown Editor"
        description="Learn about MDBuild.io: a privacy-first, free markdown editor built for developers and writers. Features Mermaid diagrams, LaTeX math, and offline support."
        keywords="about mdbuild, markdown editor features, privacy-focused editor, open source markdown"
        canonicalUrl="https://mdbuild.io/about"
        structuredData={aboutStructuredData}
      />
      <header className="border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link to="/landing" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">About MDBuild.io</h1>
        
        <div className="space-y-8">
          <section className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground">
              MDBuild.io is a modern, powerful markdown editor designed for developers, writers, and anyone who loves working with markdown. Built with privacy and simplicity in mind.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-muted-foreground mb-4">
              To provide a fast, free, and privacy-focused markdown editing experience that works entirely in your browser—no sign-up, no tracking, just pure productivity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Core Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Privacy First</h3>
                  <p className="text-sm text-muted-foreground">
                    All your data stays on your device. We never see, store, or transmit your documents.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Lightning Fast</h3>
                  <p className="text-sm text-muted-foreground">
                    Built with React and optimized for performance. Start writing instantly.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Developer Friendly</h3>
                  <p className="text-sm text-muted-foreground">
                    Syntax highlighting, Mermaid diagrams, and LaTeX math support out of the box.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Always Free</h3>
                  <p className="text-sm text-muted-foreground">
                    No subscriptions, no paywalls, no premium tiers. All features, free forever.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Technology Stack</h2>
            <div className="bg-muted/30 rounded-lg p-6">
              <ul className="space-y-2 text-muted-foreground">
                <li><strong>Frontend:</strong> React, TypeScript, Vite</li>
                <li><strong>Styling:</strong> Tailwind CSS, Radix UI</li>
                <li><strong>Markdown:</strong> react-markdown, remark-gfm</li>
                <li><strong>Diagrams:</strong> Mermaid.js</li>
                <li><strong>Math:</strong> KaTeX</li>
                <li><strong>Export:</strong> jsPDF, docx, html-to-image</li>
                <li><strong>Storage:</strong> Browser localStorage</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Features</h2>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li>Real-time markdown preview with split-view mode</li>
              <li>GitHub Flavored Markdown (GFM) support</li>
              <li>Mermaid diagram rendering (flowcharts, sequences, etc.)</li>
              <li>Mathematical equation support with KaTeX</li>
              <li>Syntax highlighting for code blocks</li>
              <li>Export to PDF, HTML, DOCX, and Markdown</li>
              <li>Auto-save functionality</li>
              <li>Document templates</li>
              <li>Dark and light themes</li>
              <li>Document outline navigation</li>
              <li>Emoji support 🚀</li>
              <li>Works offline (PWA)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Future Roadmap</h2>
            <p className="text-muted-foreground mb-4">
              We're constantly improving MDBuild.io. Here's what's coming:
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc pl-6">
              <li>Cloud sync (optional, for those who want it)</li>
              <li>Collaborative editing</li>
              <li>More export formats</li>
              <li>Custom themes and plugins</li>
              <li>Mobile apps</li>
            </ul>
          </section>

          <section className="pt-8 border-t">
            <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
            <p className="text-muted-foreground mb-4">
              Have questions, suggestions, or feedback? We'd love to hear from you!
            </p>
            <Button asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
          </section>
        </div>
      </main>
    </div>
  );
};

export default About;
