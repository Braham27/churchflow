import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  ArrowLeft,
  FileText,
  Copy,
  Settings,
  Mail,
  MessageSquare,
  Bell,
} from "lucide-react";

async function getTemplates(churchId: string) {
  return prisma.messageTemplate.findMany({
    where: { churchId },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
}

async function getChurchData(userId: string) {
  return prisma.churchUser.findFirst({
    where: { userId },
    include: { church: { select: { id: true } } },
  });
}

export default async function CommunicationTemplatesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const churchData = await getChurchData(session.user.id);

  if (!churchData) {
    redirect("/onboarding");
  }

  const templates = await getTemplates(churchData.churchId);

  // Group templates by category
  const templatesByCategory = templates.reduce(
    (acc, template) => {
      const cat = template.category || "General";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(template);
      return acc;
    },
    {} as Record<string, typeof templates>
  );

  const categories = Object.keys(templatesByCategory).sort();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "EMAIL":
        return Mail;
      case "SMS":
        return MessageSquare;
      case "PUSH":
        return Bell;
      default:
        return FileText;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/communications">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Message Templates</h1>
            <p className="text-muted-foreground">
              Create reusable templates for common communications
            </p>
          </div>
        </div>
        <Link href="/dashboard/communications/templates/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </Link>
      </div>

      {/* Template Categories */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10">
          All ({templates.length})
        </Badge>
        {categories.map((cat) => (
          <Badge
            key={cat}
            variant="outline"
            className="cursor-pointer hover:bg-primary/10"
          >
            {cat} ({templatesByCategory[cat].length})
          </Badge>
        ))}
      </div>

      {/* Templates List */}
      {categories.length > 0 ? (
        <div className="space-y-6">
          {categories.map((category) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {templatesByCategory[category].map((template) => {
                    const TypeIcon = getTypeIcon(template.type);
                    return (
                      <div
                        key={template.id}
                        className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                            <TypeIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-medium">{template.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">
                              {template.subject || template.content.slice(0, 100)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {template.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" title="Duplicate">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Link
                            href={`/dashboard/communications/templates/${template.id}`}
                          >
                            <Button variant="outline" size="sm">
                              <Settings className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                          </Link>
                          <Link
                            href={`/dashboard/communications/new?templateId=${template.id}`}
                          >
                            <Button size="sm">Use Template</Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">No templates yet</h3>
            <p className="text-muted-foreground mb-4">
              Create reusable templates for welcome emails, event reminders,
              and more.
            </p>
            <Link href="/dashboard/communications/templates/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create First Template
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Suggested Templates */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Suggested Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Welcome Email", desc: "New member welcome" },
              { name: "Event Reminder", desc: "24h before event" },
              { name: "Birthday Greeting", desc: "Automated birthday" },
              { name: "Follow-up", desc: "First-time visitor" },
              { name: "Thank You", desc: "Donation acknowledgment" },
              { name: "Weekly Update", desc: "Newsletter format" },
              { name: "Prayer Request", desc: "Response template" },
              { name: "Volunteer Call", desc: "Help needed" },
            ].map((suggestion) => (
              <Link
                key={suggestion.name}
                href={`/dashboard/communications/templates/new?suggested=${suggestion.name}`}
              >
                <div className="p-3 rounded-lg border bg-background hover:bg-primary/5 transition-colors cursor-pointer">
                  <p className="font-medium text-sm">{suggestion.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {suggestion.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
