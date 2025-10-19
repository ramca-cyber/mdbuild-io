import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, MessageSquare, Github, Twitter } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
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
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Have questions, feedback, or suggestions? We'd love to hear from you!
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover-scale transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Email Support</CardTitle>
              <CardDescription>
                Send us an email and we'll get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a 
                href="mailto:support@mdbuild.io"
                className="text-primary hover:underline font-medium"
              >
                support@mdbuild.io
              </a>
            </CardContent>
          </Card>

          <Card className="hover-scale transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Bug Reports</CardTitle>
              <CardDescription>
                Found a bug? Let us know so we can fix it
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a 
                href="mailto:bugs@mdbuild.io"
                className="text-primary hover:underline font-medium"
              >
                bugs@mdbuild.io
              </a>
            </CardContent>
          </Card>

          <Card className="hover-scale transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Github className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>GitHub</CardTitle>
              <CardDescription>
                Check out our code, contribute, or open an issue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a 
                href="https://github.com/mdbuild/mdbuild"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                github.com/mdbuild
              </a>
            </CardContent>
          </Card>

          <Card className="hover-scale transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Twitter className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>
                Follow us for updates and announcements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a 
                href="https://twitter.com/mdbuild"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                @mdbuild
              </a>
            </CardContent>
          </Card>
        </div>

        <section className="mt-12 p-6 bg-muted/30 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Is MDBuild.io really free?</h3>
              <p className="text-muted-foreground">
                Yes! MDBuild.io is completely free with no hidden costs, subscriptions, or premium features. All functionality is available to everyone.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Where is my data stored?</h3>
              <p className="text-muted-foreground">
                All your documents are stored locally in your browser's localStorage. We never upload or store your data on our servers.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Can I use MDBuild.io offline?</h3>
              <p className="text-muted-foreground">
                Yes! MDBuild.io works as a Progressive Web App (PWA), so you can install it and use it offline once loaded.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">How do I back up my documents?</h3>
              <p className="text-muted-foreground">
                You can export any document to Markdown, PDF, HTML, or DOCX format. We recommend regularly downloading important documents as backups.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Do you have an API?</h3>
              <p className="text-muted-foreground">
                Not yet, but we're considering it for future releases. Contact us if you're interested in API access.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Still have questions? Don't hesitate to reach out!
          </p>
          <Button size="lg" asChild>
            <a href="mailto:support@mdbuild.io">
              <Mail className="mr-2 h-4 w-4" />
              Email Us
            </a>
          </Button>
        </section>
      </main>
    </div>
  );
};

export default Contact;
