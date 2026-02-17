import { useState, useEffect } from "react";

export const AnimatedPreview = () => {
  const [typedText, setTypedText] = useState("");
  
  const fullMarkdown = `# Quick Start Guide

> [!NOTE]
> This editor supports GitHub Alerts!

\`\`\`mermaid
graph LR
  A[Write] --> B[Preview]
  B --> C[Export]
\`\`\``;

  useEffect(() => {
    let currentIndex = 0;
    let cycles = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullMarkdown.length) {
        setTypedText(fullMarkdown.slice(0, currentIndex));
        currentIndex++;
      } else {
        cycles++;
        if (cycles >= 2) {
          clearInterval(interval);
          return;
        }
        setTimeout(() => {
          currentIndex = 0;
          setTypedText("");
        }, 2000);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 rounded-lg border bg-card shadow-lg overflow-hidden">
      <div className="grid md:grid-cols-2 gap-0">
        {/* Editor Side */}
        <div className="p-4 bg-muted/30 border-r">
          <div className="text-xs text-muted-foreground mb-2 font-mono">Editor</div>
          <pre className="text-sm font-mono whitespace-pre-wrap min-h-[200px]">
            {typedText}
            <span className="animate-pulse">|</span>
          </pre>
        </div>
        
        {/* Preview Side */}
        <div className="p-4 bg-background">
          <div className="text-xs text-muted-foreground mb-2 font-mono">Live Preview</div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {typedText.includes("# Quick Start") && (
              <h1 className="text-2xl font-bold mb-4 animate-fade-in">Quick Start Guide</h1>
            )}
            
            {typedText.includes("[!NOTE]") && (
              <div className="my-4 p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 rounded animate-fade-in">
                <div className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-400 mb-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                  </svg>
                  NOTE
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  This editor supports GitHub Alerts!
                </p>
              </div>
            )}
            
            {typedText.includes("```mermaid") && (
              <div className="my-4 p-4 bg-muted rounded animate-fade-in">
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className="px-3 py-2 bg-primary/10 text-primary rounded border border-primary/20">
                    Write
                  </div>
                  <div className="text-muted-foreground">→</div>
                  <div className="px-3 py-2 bg-primary/10 text-primary rounded border border-primary/20">
                    Preview
                  </div>
                  <div className="text-muted-foreground">→</div>
                  <div className="px-3 py-2 bg-primary/10 text-primary rounded border border-primary/20">
                    Export
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
