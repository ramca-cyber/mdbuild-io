import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

interface HeroSectionProps {
  onStartWriting: () => void;
  onSeeFeatures: () => void;
}

export const HeroSection = ({ onStartWriting, onSeeFeatures }: HeroSectionProps) => {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 -z-10" />
      
      <div className="container max-w-6xl mx-auto text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <span className="text-primary-foreground font-bold text-4xl">M</span>
          </div>
        </div>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium animate-fade-in">
          <Sparkles className="h-4 w-4" />
          <span>Free • Private • No Sign-up Required</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-in">
          Markdown Editor + Live Preview
          <br />
          <span className="text-primary">+ Diagrams + Math</span>
          <br />
          <span className="text-muted-foreground text-3xl md:text-4xl">All in Your Browser</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in">
          Write technical docs with Mermaid diagrams, LaTeX equations, and export to PDF, HTML, DOCX, or Markdown—no sign-up, 100% private.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
          <Button 
            size="lg" 
            onClick={onStartWriting}
            className="group"
          >
            Start Writing (Free)
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={onSeeFeatures}
          >
            See Features
          </Button>
        </div>
      </div>
    </section>
  );
};
