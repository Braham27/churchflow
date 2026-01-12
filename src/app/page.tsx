import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  CreditCard, 
  MessageSquare, 
  UserCheck, 
  Globe,
  Play,
  QrCode,
  ChevronRight,
  Check,
  Star,
  ArrowRight,
  Church
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Member Management",
    description: "Keep an organized directory of all members and families, with easy tracking of attendance and involvement.",
  },
  {
    icon: Calendar,
    title: "Event Scheduling",
    description: "Plan services, events, and meetings with an integrated calendar – enable online sign-ups and reminders.",
  },
  {
    icon: CreditCard,
    title: "Online Giving & Finance",
    description: "Enable secure online donations and track tithes and offerings, with automatic receipts and reports.",
  },
  {
    icon: UserCheck,
    title: "Volunteer Coordination",
    description: "Schedule volunteers for events and ministries, send reminders, and avoid double-booking.",
  },
  {
    icon: MessageSquare,
    title: "Communication Tools",
    description: "Send out newsletters, mass emails or texts to your congregation in seconds with AI-powered assistance.",
  },
  {
    icon: Globe,
    title: "Website Builder",
    description: "Create a beautiful, mobile-friendly church website with our drag-and-drop builder. No coding required.",
  },
  {
    icon: Play,
    title: "Live Streaming",
    description: "Integrate with YouTube and Facebook Live to stream services directly on your website.",
  },
  {
    icon: QrCode,
    title: "Smart Check-In",
    description: "Self check-in via QR codes, kiosk mode for children's ministry with security tags.",
  },
];

const pricingPlans = [
  {
    name: "Basic",
    price: 29,
    description: "Perfect for small churches just getting started",
    features: [
      "Up to 100 members",
      "Member management",
      "Event calendar",
      "Basic communications",
      "Email support",
      "5 GB storage",
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
      "Priority support",
      "25 GB storage",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Premium",
    price: 149,
    description: "For large churches with full feature needs",
    features: [
      "Unlimited members",
      "Everything in Standard",
      "Website builder",
      "Live streaming integration",
      "Child check-in system",
      "Advanced analytics",
      "API access",
      "100 GB storage",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
];

const testimonials = [
  {
    quote: "ChurchFlow transformed how we manage our church. We've never been more organized!",
    author: "Pastor Michael Johnson",
    church: "Grace Community Church",
    rating: 5,
  },
  {
    quote: "The online giving feature alone increased our donations by 40%. Worth every penny.",
    author: "Sarah Williams",
    church: "New Life Fellowship",
    rating: 5,
  },
  {
    quote: "Finally, a system that our volunteers actually enjoy using. Setup was a breeze.",
    author: "David Chen",
    church: "Hope Valley Church",
    rating: 5,
  },
];

export default function HomePage() {
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
            <Link href="#features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-primary">
              Testimonials
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

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Organize, Engage, and{" "}
              <span className="text-primary">Grow Your Church</span> Community
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
              Our cloud-based church management platform simplifies your administration, 
              connects your members, and saves you time for what matters most – ministry. 
              Accessible anywhere, zero IT headaches.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/signup">
                <Button size="xl" className="w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="xl" variant="outline" className="w-full sm:w-auto">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              30 days free • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 blur-3xl opacity-30">
            <div className="aspect-square w-[600px] bg-gradient-to-br from-primary to-purple-400 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Everything Your Church Needs
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              From member management to online giving, we&apos;ve got you covered. 
              Use all these tools together, or start with just what you need.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              <strong>Modular by Design:</strong> Turn on additional modules anytime – you&apos;re in control.
            </p>
            <Link href="#pricing">
              <Button variant="outline">
                See All Features
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Flexible Pricing for Every Church
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you&apos;re a small community or a multi-campus church, we have a plan for you. 
              Choose the services you need and only pay for what you use.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border bg-card p-8 shadow-sm ${
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
                <div className="text-center">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">{plan.description}</p>
                  <div className="mt-6 mb-8">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className="block">
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
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              All plans include a 30-day free trial. No credit card required.{" "}
              <Link href="/pricing" className="text-primary hover:underline">
                View full pricing details →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Trusted by Churches Everywhere
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              See what church leaders are saying about ChurchFlow
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="rounded-xl border bg-card p-6 shadow-sm"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">&quot;{testimonial.quote}&quot;</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.church}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Ready to Transform Your Church Management?
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            Join thousands of churches using ChurchFlow to engage their congregations 
            and streamline operations. Start your free trial today.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="xl" variant="secondary" className="w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="xl" variant="outline" className="w-full sm:w-auto border-white/50 hover:bg-white/10 hover:text-white">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Church className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">ChurchFlow</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Modern church management for the digital age. 
                Empowering churches to focus on what matters most.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="/integrations" className="hover:text-foreground">Integrations</Link></li>
                <li><Link href="/updates" className="hover:text-foreground">What&apos;s New</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-foreground">Help Center</Link></li>
                <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="/webinars" className="hover:text-foreground">Webinars</Link></li>
                <li><Link href="/api-docs" className="hover:text-foreground">API Docs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ChurchFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
