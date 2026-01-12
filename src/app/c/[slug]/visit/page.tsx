"use client";

import { useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Car,
  Users,
  Baby,
  Coffee,
  Send,
  CheckCircle,
  ChevronRight,
} from "lucide-react";

const whatToExpect = [
  {
    icon: Clock,
    title: "Service Length",
    description: "Our services typically last about 75-90 minutes",
  },
  {
    icon: Coffee,
    title: "Casual Atmosphere",
    description: "Come as you are! Most people dress casually",
  },
  {
    icon: Baby,
    title: "Kids Programs",
    description: "Safe, fun programs for infants through 5th grade",
  },
  {
    icon: Car,
    title: "Easy Parking",
    description: "Free parking with greeters to help you find a spot",
  },
  {
    icon: Users,
    title: "Friendly Welcome",
    description: "Our team will help you feel right at home",
  },
];

export default function ChurchVisitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    serviceDate: "",
    numberOfGuests: "1",
    hasChildren: false,
    childrenAges: "",
    questions: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.email) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
      toast.success("Thank you! We'll see you soon!");
    } catch (error) {
      toast.error("Failed to submit form");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold mb-2">We Can&apos;t Wait to Meet You!</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for planning your visit. We&apos;ve sent a confirmation
              email with all the details you need.
            </p>
            <Link href={`/c/${resolvedParams.slug}`}>
              <Button>Return to Homepage</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href={`/c/${resolvedParams.slug}`} className="font-bold text-xl">
              Church Name
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href={`/c/${resolvedParams.slug}`}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                href={`/c/${resolvedParams.slug}/about`}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                About
              </Link>
              <Link
                href={`/c/${resolvedParams.slug}/events`}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Events
              </Link>
              <Link
                href={`/c/${resolvedParams.slug}/give`}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Give
              </Link>
              <Link
                href={`/c/${resolvedParams.slug}/visit`}
                className="text-sm font-medium text-primary"
              >
                Plan Your Visit
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Plan Your Visit</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            We&apos;re excited to meet you! Let us know you&apos;re coming so we can
            make your first visit special.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left: What to Expect */}
          <div>
            <h2 className="text-2xl font-bold mb-6">What to Expect</h2>
            <div className="space-y-4">
              {whatToExpect.map((item) => (
                <Card key={item.title}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Service Times */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Service Times
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-semibold">Sunday Services</p>
                    <p className="text-sm text-muted-foreground">
                      Traditional & Contemporary
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">9:00 AM</p>
                    <p className="font-bold">11:00 AM</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-semibold">Wednesday Night</p>
                    <p className="text-sm text-muted-foreground">
                      Bible Study & Youth
                    </p>
                  </div>
                  <p className="font-bold">7:00 PM</p>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">123 Church Street, City, State 12345</p>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Map placeholder</p>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <Car className="mr-2 h-4 w-4" />
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right: Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Let Us Know You&apos;re Coming</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="serviceDate">Which Service?</Label>
                    <select
                      id="serviceDate"
                      name="serviceDate"
                      value={formData.serviceDate}
                      onChange={handleChange}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="">Select a service</option>
                      <option value="sunday-9am">Sunday 9:00 AM</option>
                      <option value="sunday-11am">Sunday 11:00 AM</option>
                      <option value="wednesday">Wednesday 7:00 PM</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="numberOfGuests">How many in your group?</Label>
                    <select
                      id="numberOfGuests"
                      name="numberOfGuests"
                      value={formData.numberOfGuests}
                      onChange={handleChange}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, "10+"].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="hasChildren"
                      name="hasChildren"
                      checked={formData.hasChildren}
                      onChange={handleChange}
                      className="rounded"
                    />
                    <Label htmlFor="hasChildren" className="cursor-pointer">
                      I have children who will attend
                    </Label>
                  </div>

                  {formData.hasChildren && (
                    <div>
                      <Label htmlFor="childrenAges">
                        Children&apos;s ages (so we can prepare!)
                      </Label>
                      <Input
                        id="childrenAges"
                        name="childrenAges"
                        value={formData.childrenAges}
                        onChange={handleChange}
                        placeholder="e.g., 3, 5, and 10"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="questions">
                      Any questions or special needs?
                    </Label>
                    <Textarea
                      id="questions"
                      name="questions"
                      value={formData.questions}
                      onChange={handleChange}
                      placeholder="Let us know how we can help..."
                      rows={3}
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Submit
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Questions?</h3>
                <div className="space-y-3">
                  <a
                    href="tel:555-123-4567"
                    className="flex items-center gap-3 text-muted-foreground hover:text-foreground"
                  >
                    <Phone className="h-5 w-5" />
                    (555) 123-4567
                  </a>
                  <a
                    href="mailto:info@church.com"
                    className="flex items-center gap-3 text-muted-foreground hover:text-foreground"
                  >
                    <Mail className="h-5 w-5" />
                    info@church.com
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-12 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Church Name. Powered by ChurchFlow.
          </p>
        </div>
      </footer>
    </div>
  );
}
