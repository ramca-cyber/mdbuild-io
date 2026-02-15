import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Privacy Policy - MDBuild.io"
        description="MDBuild.io Privacy Policy: Learn how we protect your privacy. All data stored locally, no tracking, no sign-up required."
        keywords="privacy policy, data protection, local storage, privacy-focused markdown editor"
        canonicalUrl="https://mdbuild.io/privacy"
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
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">Last updated: February 15, 2026</p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p>
              At MDBuild.io, we take your privacy seriously. This Privacy Policy explains how we handle your information when you use our markdown editor application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Storage</h2>
            <p>
              <strong>Local Storage Only:</strong> All your documents, settings, and preferences are stored locally in your browser's localStorage. We do not collect, transmit, or store any of your data on our servers.
            </p>
            <p>
              Your markdown documents, templates, and editor preferences remain entirely on your device. We have no access to this information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">No User Accounts</h2>
            <p>
              MDBuild.io does not require user registration or login. We do not collect any personally identifiable information such as names, email addresses, or passwords.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
            <p>
              We do not use cookies for tracking purposes. The only data stored in your browser is:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your markdown documents</li>
              <li>Editor preferences (theme, font size, etc.)</li>
              <li>Application settings</li>
            </ul>
            <p>
              We may use analytics services to understand how our application is used, but these are configured to respect user privacy and do not collect personally identifiable information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <p>
              MDBuild.io may load resources from third-party CDNs (Content Delivery Networks) for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>KaTeX (math rendering)</li>
              <li>Syntax highlighting libraries</li>
            </ul>
            <p>
              These services may have their own privacy policies. We recommend reviewing their policies if you have concerns.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p>
              Since all data is stored locally on your device, the security of your information depends on your device's security measures. We recommend:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Keeping your browser updated</li>
              <li>Using device encryption</li>
              <li>Regularly backing up important documents</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
            <p>
              MDBuild.io does not knowingly collect any information from children under 13 years of age. Since we don't collect user data, this application can be safely used by individuals of all ages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please visit our{" "}
              <Link to="/contact" className="text-primary hover:underline">
                Contact page
              </Link>
              .
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
