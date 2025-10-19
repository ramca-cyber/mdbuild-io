import { HeroSection } from "@/components/HeroSection";
import { FeatureCard } from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
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
  Share2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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

  return (
    <div className="min-h-screen">
      <HeroSection onStartWriting={handleStartWriting} onSeeFeatures={handleSeeFeatures} />
      
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
              src="/editor-preview.png"
              alt="MDBuild.io Editor Interface - Split view showing markdown editor and live preview"
              className="w-full h-auto"
            />
          </div>
          <p className="text-center mt-4 text-sm text-muted-foreground">
            ✨ Click the preview above to start editing
          </p>
        </div>
      </section>
      
      {/* Feature Showcase */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-lg text-muted-foreground">
              Powerful features for technical writing and documentation
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={GitBranch}
              title="Mermaid Diagrams"
              description="Create flowcharts, sequence diagrams, and more using simple text syntax"
              example="graph TD; A-->B; B-->C;"
            />
            <FeatureCard
              icon={Sigma}
              title="Math Equations"
              description="Write beautiful mathematical formulas with KaTeX/LaTeX support"
              example="E = mc^2"
            />
            <FeatureCard
              icon={FileText}
              title="Live Preview"
              description="See your rendered markdown in real-time as you type"
            />
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

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-muted/30">
        <div className="container max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>MDBuild.io - Modern Markdown Editor • Built with React & TypeScript</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
