"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plug,
  Mail,
  MessageSquare,
  CreditCard,
  Video,
  Calendar,
  Database,
  Settings,
  Check,
  ExternalLink,
  Zap,
} from "lucide-react";

const integrations = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Accept online donations and payments",
    icon: CreditCard,
    category: "Payments",
    connected: true,
    popular: true,
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Email marketing and newsletter management",
    icon: Mail,
    category: "Email",
    connected: false,
    popular: true,
  },
  {
    id: "twilio",
    name: "Twilio",
    description: "SMS messaging and notifications",
    icon: MessageSquare,
    category: "SMS",
    connected: false,
    popular: true,
  },
  {
    id: "youtube",
    name: "YouTube Live",
    description: "Embed live streams on your church website",
    icon: Video,
    category: "Streaming",
    connected: false,
  },
  {
    id: "facebook",
    name: "Facebook Live",
    description: "Stream services directly to Facebook",
    icon: Video,
    category: "Streaming",
    connected: false,
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sync events with Google Calendar",
    icon: Calendar,
    category: "Calendar",
    connected: false,
  },
  {
    id: "planning-center",
    name: "Planning Center",
    description: "Import members and volunteers",
    icon: Database,
    category: "Church Management",
    connected: false,
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect with 5,000+ apps",
    icon: Zap,
    category: "Automation",
    connected: false,
  },
];

export default function IntegrationsPage() {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([
    "stripe",
  ]);

  const handleConnect = async (id: string) => {
    setConnecting(id);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setConnectedIntegrations((prev) => [...prev, id]);
      toast.success(`Successfully connected to ${integrations.find((i) => i.id === id)?.name}`);
    } catch (error) {
      toast.error("Failed to connect integration");
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm("Are you sure you want to disconnect this integration?")) return;

    try {
      setConnectedIntegrations((prev) => prev.filter((i) => i !== id));
      toast.success("Integration disconnected");
    } catch (error) {
      toast.error("Failed to disconnect integration");
    }
  };

  const categories = [...new Set(integrations.map((i) => i.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">
            Connect ChurchFlow with your favorite services
          </p>
        </div>
      </div>

      {/* Connected Summary */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
              <Plug className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {connectedIntegrations.length} Integration
                {connectedIntegrations.length !== 1 ? "s" : ""} Connected
              </h3>
              <p className="text-muted-foreground">
                {integrations.length - connectedIntegrations.length} more available to connect
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Integrations */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Popular Integrations</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations
            .filter((i) => i.popular)
            .map((integration) => {
              const isConnected = connectedIntegrations.includes(integration.id);
              return (
                <Card key={integration.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <integration.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{integration.name}</h3>
                            {isConnected && (
                              <Badge className="bg-green-100 text-green-800">
                                <Check className="h-3 w-3 mr-1" />
                                Connected
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {integration.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {isConnected ? (
                        <>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleDisconnect(integration.id)}
                          >
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleConnect(integration.id)}
                          disabled={connecting === integration.id}
                        >
                          {connecting === integration.id
                            ? "Connecting..."
                            : "Connect"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>

      {/* All Integrations by Category */}
      {categories.map((category) => (
        <div key={category}>
          <h2 className="text-xl font-semibold mb-4">{category}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {integrations
              .filter((i) => i.category === category)
              .map((integration) => {
                const isConnected = connectedIntegrations.includes(
                  integration.id
                );
                return (
                  <Card key={integration.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <integration.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{integration.name}</h3>
                            {isConnected && (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {integration.description}
                          </p>
                        </div>
                        {isConnected ? (
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConnect(integration.id)}
                            disabled={connecting === integration.id}
                          >
                            {connecting === integration.id
                              ? "..."
                              : "Connect"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      ))}

      {/* API Access */}
      <Card>
        <CardHeader>
          <CardTitle>API Access</CardTitle>
          <CardDescription>
            Build custom integrations with the ChurchFlow API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Developer API</p>
              <p className="text-sm text-muted-foreground">
                Access our REST API for custom integrations
              </p>
            </div>
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
