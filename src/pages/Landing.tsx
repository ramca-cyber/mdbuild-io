import { HeroSection } from "@/components/HeroSection";
import { FeatureCard } from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { 
  FileText, 
  GitBranch, 
  Sigma, 
  Download, 
  Shield, 
  Zap, 
  Lock,
  Edit3,
  Eye,
  Share2,
  BookOpen,
  CheckSquare,
  Database
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { PWAInstallButton } from '@/components/PWAInstallButton';
import { useEffect } from "react";

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleStartWriting = () => {
    localStorage.setItem('mdbuild-firstVisit', 'false');
    window.scrollTo(0, 0);
    navigate('/editor');
  };

  const handleSeeFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      const offsetTop = featuresSection.offsetTop - 80; // Account for header height
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  const landingStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "MDBuild.io",
    "description": "Fast, elegant markdown editor with live preview, GitHub Alerts, Mermaid diagrams, and math support",
    "url": "https://mdbuild.io",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Markdown editing with live preview",
      "GitHub Flavored Markdown support",
      "GitHub Alerts and Admonitions (Note, Tip, Warning, Important, Caution)",
      "Interactive clickable task lists",
      "Mermaid diagram creation (flowcharts, sequences, Gantt, etc.)",
      "Math equation rendering with KaTeX",
      "Syntax highlighting for code blocks",
      "Export to PNG, PDF, DOCX, HTML, and Markdown (5 formats)",
      "PWA installable as desktop or mobile app",
      "Offline functionality",
      "Auto-save functionality",
      "Version history",
      "Document templates",
      "Dark, light, and sepia themes"
    ],
    "screenshot": "https://mdbuild.io/og-image.png"
  };

  return (
    <div className="min-h-screen">
      <SEO 
        title="MDBuild.io - Markdown Editor with GitHub Alerts, Diagrams & Math"
        description="Free markdown editor with GitHub Alerts & Admonitions, live preview, Mermaid diagrams, KaTeX math, interactive task lists. Export to PNG, PDF, HTML, DOCX. No sign-up, 100% private, installable PWA."
        keywords="markdown editor, github alerts markdown, markdown admonitions, markdown callouts, mermaid markdown, latex markdown editor, katex markdown, interactive task list markdown, markdown to pdf, markdown to html, markdown to docx, markdown to png, live preview, technical documentation, offline markdown editor, free markdown editor, pwa markdown editor"
        canonicalUrl="https://mdbuild.io/"
        structuredData={landingStructuredData}
      />
      {/* Header with Logo */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">M</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none">MDBuild.io</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">Modern Markdown Editor</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PWAInstallButton />
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link to="/help">
                <BookOpen className="h-4 w-4 mr-2" />
                Help
              </Link>
            </Button>
            <Button onClick={handleStartWriting} size="sm">
              Start Writing
            </Button>
          </div>
        </div>
      </header>
      
      <HeroSection onStartWriting={handleStartWriting} onSeeFeatures={handleSeeFeatures} />
      
      {/* Demo Video Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-background via-muted/30 to-background">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Zap className="h-4 w-4" />
              <span>See It In Action</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              From Markdown to Beautiful Documents
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Watch how easy it is to create professional documentation with diagrams, math equations, and instant preview
            </p>
          </div>
          
          <div className="relative group">
            {/* Demo placeholder - replace with actual video/GIF */}
            <div className="relative rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-all duration-300 shadow-2xl bg-card">
              <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
                <div className="text-center p-8">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border animate-fade-in" style={{ animationDelay: '0.1s' }}>
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="font-medium">Type Markdown</span>
                    </div>
                    <div className="text-2xl text-muted-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>→</div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border animate-fade-in" style={{ animationDelay: '0.5s' }}>
                      <GitBranch className="h-5 w-5 text-primary" />
                      <span className="font-medium">Add Diagrams</span>
                    </div>
                    <div className="text-2xl text-muted-foreground animate-fade-in" style={{ animationDelay: '0.7s' }}>→</div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border animate-fade-in" style={{ animationDelay: '0.9s' }}>
                      <Sigma className="h-5 w-5 text-primary" />
                      <span className="font-medium">Math Equations</span>
                    </div>
                    <div className="text-2xl text-muted-foreground animate-fade-in" style={{ animationDelay: '1.1s' }}>→</div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border animate-fade-in" style={{ animationDelay: '1.3s' }}>
                      <Download className="h-5 w-5 text-primary" />
                      <span className="font-medium">Export PDF</span>
                    </div>
                  </div>
                  <div className="space-y-3 max-w-2xl mx-auto">
                    <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-4 text-left animate-fade-in" style={{ animationDelay: '1.5s' }}>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <div>
                          <p className="font-medium mb-1">Write naturally with Markdown</p>
                          <code className="text-sm text-muted-foreground">## Heading, **bold**, *italic*</code>
                        </div>
                      </div>
                    </div>
                    <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-4 text-left animate-fade-in" style={{ animationDelay: '1.7s' }}>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <div>
                          <p className="font-medium mb-1">Create diagrams with Mermaid</p>
                          <code className="text-sm text-muted-foreground">```mermaid graph TD; A--&gt;B; ```</code>
                        </div>
                      </div>
                    </div>
                    <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-4 text-left animate-fade-in" style={{ animationDelay: '1.9s' }}>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <div>
                          <p className="font-medium mb-1">Add math equations with LaTeX</p>
                          <code className="text-sm text-muted-foreground">$E = mc^2$</code>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    className="mt-8 animate-fade-in" 
                    style={{ animationDelay: '2.1s' }}
                    onClick={handleStartWriting}
                  >
                    Try It Yourself
                    <Eye className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-center mt-4 text-sm text-muted-foreground">
              ⚡ Real-time preview • No installation required • Works offline
            </p>
          </div>
        </div>
      </section>
      
      {/* Editor Preview */}
      <section className="py-12 px-4 bg-muted/50">
        <div className="container max-w-6xl mx-auto">
          <div 
            onClick={handleStartWriting}
            className="relative group cursor-pointer rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
            <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                Click to Try Editor
                <Edit3 className="h-4 w-4" />
              </div>
            </div>
            <img 
              src={`/editor-preview.png?v=${Date.now()}`}
              alt="MDBuild.io Editor Interface - Split view showing markdown editor and live preview"
              className="w-full h-auto"
              loading="eager"
            />
          </div>
          <p className="text-center mt-4 text-sm text-muted-foreground">
            ✨ Click the preview above to start editing
          </p>
        </div>
      </section>
      
      {/* Feature Comparison Table */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-lg text-muted-foreground">
              Powerful features for technical writing and documentation
            </p>
          </div>
          
          <div className="bg-card border rounded-lg overflow-hidden shadow-lg">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold">Feature</th>
                  <th className="text-left py-4 px-6 font-semibold hidden md:table-cell">Description</th>
                  <th className="text-center py-4 px-6 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="font-medium">Markdown + GFM</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-muted-foreground hidden md:table-cell">
                    Full GitHub-flavored Markdown support with tables, strikethrough, task lists
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30">
                      <span className="text-green-600 dark:text-green-500 text-lg">✓</span>
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors bg-primary/5">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <span className="font-medium">GitHub Alerts</span>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Unique</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-muted-foreground hidden md:table-cell">
                    Create beautiful callouts with [!NOTE], [!TIP], [!WARNING], [!IMPORTANT], [!CAUTION]
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30">
                      <span className="text-green-600 dark:text-green-500 text-lg">✓</span>
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-5 w-5 text-primary" />
                      <span className="font-medium">Mermaid Diagrams</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-muted-foreground hidden md:table-cell">
                    Flowchart, sequence, class, Gantt, pie charts and more
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30">
                      <span className="text-green-600 dark:text-green-500 text-lg">✓</span>
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Sigma className="h-5 w-5 text-primary" />
                      <span className="font-medium">Math (KaTeX)</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-muted-foreground hidden md:table-cell">
                    Inline and block math equations with LaTeX syntax
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30">
                      <span className="text-green-600 dark:text-green-500 text-lg">✓</span>
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors bg-primary/5">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-5 w-5 text-primary" />
                      <span className="font-medium">Interactive Tasks</span>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Unique</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-muted-foreground hidden md:table-cell">
                    Clickable checkboxes in task lists - check them off in preview mode
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30">
                      <span className="text-green-600 dark:text-green-500 text-lg">✓</span>
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Download className="h-5 w-5 text-primary" />
                      <span className="font-medium">5 Export Formats</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-muted-foreground hidden md:table-cell">
                    Export to MD, HTML, PDF, DOCX, and PNG (including diagrams!)
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30">
                      <span className="text-green-600 dark:text-green-500 text-lg">✓</span>
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-primary" />
                      <span className="font-medium">Offline & Private</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-muted-foreground hidden md:table-cell">
                    100% browser-based, all data stored locally
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30">
                      <span className="text-green-600 dark:text-green-500 text-lg">✓</span>
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      <span className="font-medium">PWA Ready</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-muted-foreground hidden md:table-cell">
                    Install as desktop or mobile app for offline use
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30">
                      <span className="text-green-600 dark:text-green-500 text-lg">✓</span>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Export Options */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto text-center">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Download className="h-4 w-4" />
              <span>Export in 5 Formats</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Export Anywhere</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Take your work with you in any format you need
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {[
              { format: '.md', label: 'Markdown', color: 'text-blue-500' },
              { format: '.pdf', label: 'PDF', color: 'text-red-500' },
              { format: '.html', label: 'HTML', color: 'text-orange-500' },
              { format: '.docx', label: 'Word', color: 'text-blue-600' },
              { format: '.png', label: 'Image', color: 'text-green-500' }
            ].map((item) => (
              <div 
                key={item.format}
                className="p-6 rounded-lg border bg-card hover-scale transition-all duration-300"
              >
                <div className={`text-3xl font-bold mb-2 ${item.color}`}>
                  {item.format}
                </div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Started in 10 Seconds</h2>
            <p className="text-lg text-muted-foreground">
              No installation, no sign-up, just start writing
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '1',
                icon: Edit3,
                title: 'Write Markdown',
                description: 'Use the editor to write your content with markdown syntax'
              },
              {
                step: '2',
                icon: Eye,
                title: 'See Live Preview',
                description: 'Watch your content render in real-time with diagrams and math'
              },
              {
                step: '3',
                icon: Share2,
                title: 'Export & Share',
                description: 'Download in your preferred format and share with anyone'
              }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <item.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" onClick={handleStartWriting}>
              Start Writing Now
              <Edit3 className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 px-4 border-t">
        <div className="container max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <Lock className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold">Privacy First</h3>
              <p className="text-sm text-muted-foreground">No login required, no tracking</p>
            </div>
            <div className="space-y-2">
              <Shield className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold">Local Storage</h3>
              <p className="text-sm text-muted-foreground">All data stored in your browser</p>
            </div>
            <div className="space-y-2">
              <Zap className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold">Works Offline</h3>
              <p className="text-sm text-muted-foreground">Install as PWA, use anywhere</p>
            </div>
            <div className="space-y-2">
              <FileText className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold">4MB Storage</h3>
              <p className="text-sm text-muted-foreground">Free local storage for your docs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Privacy Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Shield className="h-4 w-4" />
              <span>Built for Privacy & Security</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Enterprise-Ready Security
            </h2>
            <p className="text-lg text-muted-foreground">
              Designed for teams and individuals who value data privacy
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border rounded-lg p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">100% Client-Side</h3>
              <p className="text-sm text-muted-foreground">
                All processing happens in your browser. We never see your documents or personal information.
              </p>
            </div>
            
            <div className="bg-card border rounded-lg p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">No Account Required</h3>
              <p className="text-sm text-muted-foreground">
                Start writing immediately. No sign-up, no tracking, no data collection of any kind.
              </p>
            </div>
            
            <div className="bg-card border rounded-lg p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Your Data Stays Local</h3>
              <p className="text-sm text-muted-foreground">
                Documents stored in your browser only. Export anytime, anywhere, in any format.
              </p>
            </div>
          </div>
          
          <div className="mt-8 bg-card border rounded-lg p-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              For IT Administrators
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              MDBuild.io is safe for corporate environments with strict security policies.
            </p>
            <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Zero server-side data storage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>GDPR compliant</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>No cookies or tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Works offline (PWA)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Open source & auditable</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>No external API calls</span>
              </li>
            </ul>
            <Button variant="outline" size="sm" asChild>
              <Link to="/help#corporate">
                <BookOpen className="h-4 w-4 mr-2" />
                View IT Documentation
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-muted/30">
        <div className="container max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">M</span>
                </div>
                <h3 className="font-semibold">MDBuild.io</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Modern Markdown Editor with live preview, diagrams, and math support.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Button variant="link" asChild className="h-auto p-0">
                    <a href="#features">Features</a>
                  </Button>
                </li>
                <li>
                  <Button variant="link" asChild className="h-auto p-0">
                    <Link to="/editor">Start Writing</Link>
                  </Button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Button variant="link" asChild className="h-auto p-0">
                    <Link to="/about">About</Link>
                  </Button>
                </li>
                <li>
                  <Button variant="link" asChild className="h-auto p-0">
                    <Link to="/contact">Contact</Link>
                  </Button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Button variant="link" asChild className="h-auto p-0">
                    <Link to="/help">Help & Docs</Link>
                  </Button>
                </li>
                <li>
                  <Button variant="link" asChild className="h-auto p-0">
                    <Link to="/privacy">Privacy Policy</Link>
                  </Button>
                </li>
                <li>
                  <Button variant="link" asChild className="h-auto p-0">
                    <Link to="/terms">Terms of Service</Link>
                  </Button>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} MDBuild.io - Modern Markdown Editor • Built with React & TypeScript</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
