"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Church,
  MapPin,
  Users,
  Globe,
  Check,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

const steps = [
  { id: 1, title: "Church Info", icon: Church },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "Team Size", icon: Users },
  { id: 4, title: "Finish", icon: Check },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    churchName: "",
    denomination: "",
    website: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    teamSize: "",
    averageAttendance: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleNext = () => {
    if (currentStep === 1 && !formData.churchName.trim()) {
      toast.error("Please enter your church name");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!formData.churchName.trim()) {
      toast.error("Church name is required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/church", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create church");
      }

      toast.success("Church created successfully!");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create church"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="churchName">Church Name *</Label>
              <Input
                id="churchName"
                name="churchName"
                value={formData.churchName}
                onChange={handleChange}
                placeholder="e.g., Grace Community Church"
                required
              />
            </div>
            <div>
              <Label htmlFor="denomination">Denomination</Label>
              <select
                id="denomination"
                name="denomination"
                value={formData.denomination}
                onChange={handleChange}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                <option value="">Select denomination...</option>
                <option value="Baptist">Baptist</option>
                <option value="Catholic">Catholic</option>
                <option value="Methodist">Methodist</option>
                <option value="Presbyterian">Presbyterian</option>
                <option value="Lutheran">Lutheran</option>
                <option value="Pentecostal">Pentecostal</option>
                <option value="Episcopal">Episcopal</option>
                <option value="Non-Denominational">Non-Denominational</option>
                <option value="Evangelical">Evangelical</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://www.yourchurch.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="info@yourchurch.com"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main Street"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Springfield"
                />
              </div>
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="IL"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="62701"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-input bg-background px-3"
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="America/Anchorage">Alaska Time</option>
                <option value="Pacific/Honolulu">Hawaii Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Australia/Sydney">Sydney</option>
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="teamSize">Staff & Volunteer Team Size</Label>
              <select
                id="teamSize"
                name="teamSize"
                value={formData.teamSize}
                onChange={handleChange}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                <option value="">Select team size...</option>
                <option value="1-5">1-5 people</option>
                <option value="6-15">6-15 people</option>
                <option value="16-30">16-30 people</option>
                <option value="31-50">31-50 people</option>
                <option value="51-100">51-100 people</option>
                <option value="100+">100+ people</option>
              </select>
            </div>
            <div>
              <Label htmlFor="averageAttendance">Average Weekly Attendance</Label>
              <select
                id="averageAttendance"
                name="averageAttendance"
                value={formData.averageAttendance}
                onChange={handleChange}
                className="w-full h-10 rounded-md border border-input bg-background px-3"
              >
                <option value="">Select attendance...</option>
                <option value="1-50">1-50</option>
                <option value="51-100">51-100</option>
                <option value="101-250">101-250</option>
                <option value="251-500">251-500</option>
                <option value="501-1000">501-1,000</option>
                <option value="1001-2500">1,001-2,500</option>
                <option value="2500+">2,500+</option>
              </select>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Based on your church size:</h4>
              <p className="text-sm text-muted-foreground">
                We recommend starting with our{" "}
                <span className="font-semibold text-primary">Standard Plan</span>{" "}
                which includes all the essential features for growing churches.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 text-center">
            <div className="flex items-center justify-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                You&apos;re all set!
              </h3>
              <p className="text-muted-foreground">
                Click below to create your church profile and start managing your
                ministry.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-left">
              <h4 className="font-medium mb-2">{formData.churchName}</h4>
              {formData.city && formData.state && (
                <p className="text-sm text-muted-foreground">
                  {formData.city}, {formData.state}
                </p>
              )}
              {formData.denomination && (
                <p className="text-sm text-muted-foreground">
                  {formData.denomination}
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Church className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">ChurchFlow</span>
          </div>
          <CardTitle>Set Up Your Church</CardTitle>
          <p className="text-muted-foreground">
            Let&apos;s get your church management system ready
          </p>
        </CardHeader>

        {/* Progress Steps */}
        <div className="px-6">
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 sm:w-20 h-1 mx-2 ${
                        isCompleted ? "bg-green-500" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-center text-sm text-muted-foreground mb-4">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
          </p>
        </div>

        <CardContent className="space-y-6">
          {renderStep()}

          <div className="flex justify-between pt-4">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < steps.length ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Creating..." : "Complete Setup"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
