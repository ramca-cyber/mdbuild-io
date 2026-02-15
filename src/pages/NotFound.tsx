import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { SEO } from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // User attempted to access non-existent route
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SEO 
        title="404 - Page Not Found | MDBuild.io"
        description="The page you're looking for doesn't exist. Return to MDBuild.io markdown editor."
        keywords="404, page not found"
        canonicalUrl="https://mdbuild.io/"
      />
      <div className="text-center px-4">
        <h1 className="mb-4 text-6xl font-bold text-foreground" role="heading" aria-level={1}>404</h1>
        <p className="mb-6 text-xl text-muted-foreground">Oops! Page not found</p>
        <p className="mb-8 text-sm text-muted-foreground max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Return to home page"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
