import Link from "next/link";
import { Church } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - ChurchFlow",
  description: "Learn how ChurchFlow protects your data and privacy.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Church className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">ChurchFlow</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: January 11, 2026</p>
            
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-semibold mt-8 mb-4">Introduction</h2>
              <p className="text-muted-foreground mb-4">
                ChurchFlow (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                information when you use our church management platform.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
              <p className="text-muted-foreground mb-4">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Account information (name, email, password)</li>
                <li>Church information (name, address, contact details)</li>
                <li>Member data that you enter into the system</li>
                <li>Financial information for processing donations</li>
                <li>Communications and correspondence with us</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Protect against fraudulent or illegal activity</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
              <p className="text-muted-foreground mb-4">
                We implement industry-standard security measures to protect your data, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>256-bit SSL encryption for all data in transit</li>
                <li>Encrypted data storage at rest</li>
                <li>Regular security audits and penetration testing</li>
                <li>Role-based access controls</li>
                <li>Daily automated backups</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Data Retention</h2>
              <p className="text-muted-foreground mb-4">
                We retain your data for as long as your account is active or as needed to provide 
                services. If you cancel your subscription, we will retain your data for 30 days 
                before deletion, during which time you can export your data.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
              <p className="text-muted-foreground mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data in a portable format</li>
                <li>Object to processing of your data</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Third-Party Services</h2>
              <p className="text-muted-foreground mb-4">
                We may share data with third-party service providers who assist us in operating 
                the platform, such as payment processors, email services, and cloud hosting 
                providers. These providers are contractually bound to protect your data.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Cookies</h2>
              <p className="text-muted-foreground mb-4">
                We use cookies and similar tracking technologies to track activity on our 
                platform and improve user experience. You can instruct your browser to refuse 
                all cookies or indicate when a cookie is being sent.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Children&apos;s Privacy</h2>
              <p className="text-muted-foreground mb-4">
                Our service is not directed to children under 13. We do not knowingly collect 
                personal information from children under 13. If you become aware that a child 
                has provided us with personal information, please contact us.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to This Policy</h2>
              <p className="text-muted-foreground mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any 
                changes by posting the new Privacy Policy on this page and updating the 
                &quot;Last updated&quot; date.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-muted-foreground mb-4">
                Email: <a href="mailto:privacy@churchflow.com" className="text-primary hover:underline">privacy@churchflow.com</a><br />
                Address: 123 Ministry Lane, Suite 456, Nashville, TN 37201
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Church className="h-6 w-6 text-primary" />
              <span className="font-bold">ChurchFlow</span>
            </Link>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground">Terms</Link>
              <Link href="/contact" className="hover:text-foreground">Contact</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ChurchFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
