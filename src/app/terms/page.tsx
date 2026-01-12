import Link from "next/link";
import { Church } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - ChurchFlow",
  description: "Read the terms and conditions for using ChurchFlow.",
};

export default function TermsPage() {
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
            <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last updated: January 11, 2026</p>
            
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground mb-4">
                By accessing or using ChurchFlow&apos;s services, you agree to be bound by these 
                Terms of Service and all applicable laws and regulations. If you do not agree 
                with any of these terms, you are prohibited from using our services.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground mb-4">
                ChurchFlow provides a cloud-based church management platform that includes 
                member management, event scheduling, online giving, volunteer coordination, 
                communication tools, and website building capabilities.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">3. Account Registration</h2>
              <p className="text-muted-foreground mb-4">
                To use our services, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your password</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">4. Subscription and Payment</h2>
              <p className="text-muted-foreground mb-4">
                Some features require a paid subscription. You agree to pay all fees 
                associated with your chosen plan. Subscriptions will automatically renew 
                unless cancelled before the renewal date.
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Prices are subject to change with 30 days notice</li>
                <li>No refunds for partial months of service</li>
                <li>Annual subscriptions may be refunded within 14 days</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Acceptable Use</h2>
              <p className="text-muted-foreground mb-4">
                You agree not to use ChurchFlow to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit malware or viruses</li>
                <li>Send spam or unsolicited communications</li>
                <li>Collect data about other users without consent</li>
                <li>Interfere with the proper operation of the service</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data Ownership</h2>
              <p className="text-muted-foreground mb-4">
                You retain all rights to the data you enter into ChurchFlow. We do not 
                claim ownership of your content. You grant us a license to use, store, 
                and process your data solely to provide the services.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">7. Service Availability</h2>
              <p className="text-muted-foreground mb-4">
                We strive for 99.9% uptime but do not guarantee uninterrupted access. 
                We may perform scheduled maintenance with advance notice. We are not 
                liable for any loss arising from service interruptions.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                ChurchFlow shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages resulting from your use or inability 
                to use the service. Our total liability shall not exceed the amount paid 
                by you in the 12 months preceding the claim.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">9. Termination</h2>
              <p className="text-muted-foreground mb-4">
                Either party may terminate this agreement at any time. Upon termination:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>You will have 30 days to export your data</li>
                <li>We will delete your data after 30 days</li>
                <li>Any outstanding fees become immediately due</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">10. Modifications</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to modify these terms at any time. Material changes 
                will be communicated via email or in-app notification at least 30 days 
                before taking effect.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">11. Governing Law</h2>
              <p className="text-muted-foreground mb-4">
                These terms shall be governed by the laws of the State of Tennessee, 
                United States, without regard to conflict of law provisions.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">12. Contact</h2>
              <p className="text-muted-foreground mb-4">
                For questions about these Terms, please contact us at:
              </p>
              <p className="text-muted-foreground mb-4">
                Email: <a href="mailto:legal@churchflow.com" className="text-primary hover:underline">legal@churchflow.com</a><br />
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
