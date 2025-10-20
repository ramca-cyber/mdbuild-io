export const LoadingSpinner = ({ text = "Loading..." }: { text?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4" role="status" aria-live="polite">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" aria-hidden="true"></div>
      <p className="text-sm text-muted-foreground">{text}</p>
      <span className="sr-only">{text}</span>
    </div>
  );
};
