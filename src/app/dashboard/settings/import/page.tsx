"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Upload,
  Download,
  Database,
  Users,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  AlertCircle,
  Check,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const importOptions = [
  {
    id: "members",
    title: "Members",
    description: "Import members from another church management system",
    icon: Users,
    formats: ["CSV", "Excel", "Planning Center", "Church Community Builder"],
  },
  {
    id: "donations",
    title: "Donations",
    description: "Import donation history and recurring gifts",
    icon: DollarSign,
    formats: ["CSV", "Excel", "QuickBooks", "Stripe"],
  },
  {
    id: "events",
    title: "Events",
    description: "Import events and attendance records",
    icon: Calendar,
    formats: ["CSV", "Excel", "iCal", "Google Calendar"],
  },
  {
    id: "full",
    title: "Full Database Import",
    description: "Import a complete ChurchFlow backup",
    icon: Database,
    formats: ["ChurchFlow Backup (.cfb)"],
  },
];

const recentImports = [
  {
    id: 1,
    type: "Members",
    source: "Planning Center",
    date: "Jan 10, 2026",
    records: 245,
    status: "completed",
  },
  {
    id: 2,
    type: "Donations",
    source: "CSV Upload",
    date: "Dec 28, 2025",
    records: 1234,
    status: "completed",
  },
  {
    id: 3,
    type: "Events",
    source: "Google Calendar",
    date: "Dec 15, 2025",
    records: 52,
    status: "completed",
  },
];

export default function ImportSettingsPage() {
  const [selectedImport, setSelectedImport] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = (importId: string) => {
    setSelectedImport(importId);
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(`File "${file.name}" selected. Starting import...`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Data Import</h1>
          <p className="text-muted-foreground">
            Import data from other systems or restore from backup
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".csv,.xlsx,.xls,.cfb"
        onChange={handleFileSelect}
      />

      {/* Import Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {importOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Card 
              key={option.id}
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
              onClick={() => handleImportClick(option.id)}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {option.formats.map((format) => (
                    <span 
                      key={format}
                      className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium"
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Integration Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Connected Integrations
          </CardTitle>
          <CardDescription>
            Import data directly from connected services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">PC</span>
                </div>
                <div>
                  <p className="font-medium">Planning Center</p>
                  <p className="text-sm text-muted-foreground">Connected</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Sync Now
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-600 font-bold text-sm">MC</span>
                </div>
                <div>
                  <p className="font-medium">Mailchimp</p>
                  <p className="text-sm text-muted-foreground">Not connected</p>
                </div>
              </div>
              <Link href="/dashboard/settings/integrations">
                <Button variant="outline" size="sm">
                  Connect
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Imports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Recent Imports
          </CardTitle>
          <CardDescription>
            View history of your data imports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentImports.map((importItem) => (
              <div
                key={importItem.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{importItem.type}</p>
                    <p className="text-sm text-muted-foreground">
                      From {importItem.source} • {importItem.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{importItem.records.toLocaleString()} records</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Completed</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Download your data for backup or migration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">Full Backup</p>
              <p className="text-sm text-muted-foreground">
                Export all church data in ChurchFlow format
              </p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">Members Export</p>
              <p className="text-sm text-muted-foreground">
                Export member directory as CSV
              </p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Exports may take a few minutes for large datasets</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
