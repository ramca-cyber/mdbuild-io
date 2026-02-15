import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Terms of Service - MDBuild.io"
        description="MDBuild.io Terms of Service: Free markdown editor terms, user responsibilities, and service usage guidelines."
        keywords="terms of service, terms and conditions, user agreement, markdown editor terms"
        canonicalUrl="https://mdbuild.io/terms"
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
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">Last updated: February 15, 2026</p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
            <p>
              By accessing and using MDBuild.io, you accept and agree to be bound by the terms and conditions of this agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
            <p>
              MDBuild.io is a free, browser-based markdown editor that provides:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Live markdown editing and preview</li>
              <li>Mermaid diagram support</li>
              <li>Math equation rendering with KaTeX</li>
              <li>Export functionality (PDF, HTML, DOCX, PNG, Markdown)</li>
              <li>Local storage of documents</li>
            </ul>
            <p>
              All features are provided "as is" without any warranties, expressed or implied.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">User Responsibilities</h2>
            <p>As a user of MDBuild.io, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the service in compliance with all applicable laws and regulations</li>
              <li>Not use the service for any illegal or unauthorized purpose</li>
              <li>Not attempt to interfere with or disrupt the service</li>
              <li>Maintain the security of your device and browser</li>
              <li>Back up important documents regularly</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data and Content Ownership</h2>
            <p>
              You retain full ownership of all content you create using MDBuild.io. Since all data is stored locally on your device, you maintain complete control over your documents.
            </p>
            <p>
              We do not claim any ownership rights to your content and will never access, view, or modify your documents.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Disclaimer of Warranties</h2>
            <p>
              MDBuild.io is provided "as is" and "as available" without any warranties of any kind, either express or implied, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Warranties of merchantability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement</li>
              <li>Uninterrupted or error-free operation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, MDBuild.io and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Loss of data or documents</li>
              <li>Loss of profits or revenue</li>
              <li>Service interruptions</li>
              <li>Any damages arising from use or inability to use the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Browser Storage Limitations</h2>
            <p>
              MDBuild.io uses browser localStorage for document storage. You acknowledge that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Storage capacity is limited by your browser</li>
              <li>Clearing browser data will delete all stored documents</li>
              <li>We are not responsible for data loss due to browser actions</li>
              <li>It is your responsibility to regularly back up important documents</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Third-Party Resources</h2>
            <p>
              MDBuild.io uses third-party libraries and CDNs (KaTeX, Highlight.js, etc.). These services have their own terms of service and we are not responsible for their availability or functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Export Functionality</h2>
            <p>
              The export features (PDF, DOCX, HTML, PNG) are provided as a convenience. While we strive for accuracy, exported documents may not perfectly match the preview due to format limitations. You are responsible for verifying exported content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of MDBuild.io after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Termination</h2>
            <p>
              You may stop using MDBuild.io at any time. We reserve the right to suspend or terminate access to the service for any reason, including violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <p>
              For questions about these Terms of Service, please visit our{" "}
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

export default TermsOfService;
