import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: string;
  ogImage?: string;
  structuredData?: object;
}

export const SEO = ({
  title = "MDBuild.io - Modern Markdown Editor & Preview",
  description = "Markdown Editor + Live Preview + Diagrams + Math - All in Your Browser. Write technical docs with Mermaid diagrams, LaTeX equations, and export to PDF, HTML, DOCX. No sign-up required, 100% private.",
  keywords = "markdown editor, mermaid markdown, latex markdown editor, markdown to pdf, markdown to html, markdown to docx, live preview, technical documentation, offline markdown editor, free markdown editor, diagram editor, math editor",
  canonicalUrl = "https://mdbuild.io/",
  ogType = "website",
  ogImage = "https://mdbuild.io/og-image.png",
  structuredData,
}: SEOProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};
