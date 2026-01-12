import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Church, ArrowRight, HelpCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - ChurchFlow",
  description: "Flexible pricing plans for churches of all sizes. Start free and scale as you grow.",
};

const plans = [
  {
    name: "Free",
    price: 0,
    description: "For very small churches just getting started",
    features: [
      "Up to 50 members",
      "Basic member directory",
      "Event calendar",
      "Email support",
      "1 GB storage",
    ],
    notIncluded: [
      "Online giving",
      "Volunteer scheduling",
      "Website builder",
      "SMS messaging",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Basic",
    price: 29,
    description: "Perfect for small churches",
    features: [
      "Up to 100 members",
      "Member management",
      "Event calendar & registration",
      "Basic communications (email)",
      "Email support",
      "5 GB storage",
      "Check-in system",
    ],
    notIncluded: [
      "Online giving",
      "Volunteer scheduling",
      "Website builder",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Standard",
    price: 79,
    description: "For growing churches with more needs",
    features: [
      "Up to 500 members",
      "Everything in Basic",
      "Online giving & donations",
      "Volunteer scheduling",
      "SMS messaging",
      "Priority email support",
      "25 GB storage",
      "Basic reports",
      "Groups management",
    ],
    notIncluded: [
      "Website builder",
      "Live streaming",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Premium",
    price: 149,
    description: "Full feature set for large churches",
    features: [
      "Unlimited members",
      "Everything in Standard",
      "Drag & drop website builder",
      "Live streaming integration",
      "Advanced check-in (kiosk mode)",
      "Advanced analytics & reports",
      "API access",
      "Phone support",
      "100 GB storage",
      "Custom branding",
    ],
    notIncluded: [],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For multi-campus churches & organizations",
    features: [
      "Everything in Premium",
      "Multi-campus support",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "Unlimited storage",
      "Training sessions",
      "Priority phone support",
      "Custom development",
    ],
    notIncluded: [],
    cta: "Contact Sales",
    popular: false,
  },
];

const faqs = [
  {
    q: "Is there a free trial?",
    a: "Yes! All paid plans come with a 30-day free trial. No credit card required to start.",
  },
  {
    q: "Can I change plans anytime?",
    a: "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect immediately.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards, debit cards, and bank transfers for annual plans.",
  },
  {
    q: "Is my data secure?",
    a: "Yes, we use bank-level encryption (256-bit SSL) and are GDPR compliant. Your data is backed up daily.",
  },
  {
    q: "Do you offer discounts for annual billing?",
    a: "Yes, you save 15% when you choose annual billing instead of monthly.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "You can export all your data at any time. After cancellation, we retain your data for 30 days before deletion.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Church className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">ChurchFlow</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-primary">
              Pricing
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-primary">
              Contact
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Flexible Pricing for Every Church
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the services you need and only pay for what you use. 
            No contracts, no hidden fees. Scale as your church grows.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            All paid plans include a 30-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-5 md:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border bg-card p-6 shadow-sm ${
                  plan.popular ? "border-primary ring-2 ring-primary" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">{plan.description}</p>
                  <div className="mt-4">
                    {typeof plan.price === "number" ? (
                      <>
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </>
                    ) : (
                      <span className="text-4xl font-bold">{plan.price}</span>
                    )}
                  </div>
                </div>
                <ul className="space-y-3 mb-6 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-muted-foreground">
                      <span className="h-4 w-4 flex-shrink-0 mt-0.5 text-center">—</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.name === "Enterprise" ? "/contact" : "/auth/signup"} className="block">
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
            <p className="mt-4 text-muted-foreground">
              Have questions? We have answers.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-card rounded-lg p-6 border">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">{faq.q}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            Join thousands of churches using ChurchFlow. Start your 30-day free trial today.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white/50 hover:bg-white/10 hover:text-white">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

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
