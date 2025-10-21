import { Helmet } from "react-helmet-async";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface ArticleData {
  headline: string;
  datePublished: string;
  dateModified: string;
  author?: string;
  image?: string;
}

interface OrganizationData {
  name: string;
  url: string;
  logo: string;
  sameAs?: string[];
}

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: string;
  ogImage?: string;
  structuredData?: object;
  breadcrumb?: BreadcrumbItem[];
  faqItems?: FAQItem[];
  articleData?: ArticleData;
  organization?: OrganizationData;
}

export const SEO = ({
  title = "MDBuild.io - Modern Markdown Editor & Preview",
  description = "Markdown Editor + Live Preview + GitHub Alerts + Diagrams + Math - All in Your Browser. Write technical docs with Mermaid diagrams, KaTeX equations, GitHub admonitions, interactive task lists. Export to PDF, HTML, DOCX, PNG. No sign-up required, 100% private, installable PWA.",
  keywords = "markdown editor, github alerts markdown, markdown admonitions, markdown callouts, mermaid markdown, latex markdown editor, katex markdown, interactive task list markdown, markdown to pdf, markdown to html, markdown to docx, markdown to png, live preview, technical documentation, offline markdown editor, free markdown editor, pwa markdown editor, browser based markdown, installable markdown app, github flavored markdown editor",
  canonicalUrl = "https://mdbuild.io/",
  ogType = "website",
  ogImage = "https://mdbuild.io/og-image.png",
  structuredData,
  breadcrumb,
  faqItems,
  articleData,
  organization,
}: SEOProps) => {
  // Generate breadcrumb schema
  const breadcrumbSchema = breadcrumb ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumb.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  } : null;

  // Generate FAQ schema
  const faqSchema = faqItems ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  } : null;

  // Generate article schema
  const articleSchema = articleData ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": articleData.headline,
    "author": {
      "@type": "Organization",
      "name": articleData.author || "MDBuild.io"
    },
    "publisher": {
      "@type": "Organization",
      "name": "MDBuild.io",
      "logo": {
        "@type": "ImageObject",
        "url": "https://mdbuild.io/favicon.png"
      }
    },
    "datePublished": articleData.datePublished,
    "dateModified": articleData.dateModified,
    ...(articleData.image && { "image": articleData.image })
  } : null;

  // Generate organization schema
  const organizationSchema = organization ? {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": organization.name,
    "url": organization.url,
    "logo": organization.logo,
    ...(organization.sameAs && { "sameAs": organization.sameAs })
  } : null;

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
      <meta property="og:site_name" content="MDBuild.io" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@mdbuild" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}
      {articleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}
      {organizationSchema && (
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
      )}
    </Helmet>
  );
};
