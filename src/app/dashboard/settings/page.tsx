import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Church,
  Globe,
  MapPin,
  Mail,
  Phone,
  Palette,
  Bell,
  Shield,
  CreditCard,
  Save,
} from "lucide-react";

async function getChurchData(userId: string) {
  return prisma.churchUser.findFirst({
    where: { userId },
    include: { church: true },
  });
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const churchData = await getChurchData(session.user.id);

  if (!churchData) {
    redirect("/onboarding");
  }

  const church = churchData.church;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your church profile and system settings
        </p>
      </div>

      {/* Settings Navigation */}
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm">
          <Church className="mr-2 h-4 w-4" />
          Church Profile
        </Button>
        <Link href="/dashboard/settings/notifications">
          <Button variant="ghost" size="sm">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
        </Link>
        <Link href="/dashboard/settings/billing">
          <Button variant="ghost" size="sm">
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </Button>
        </Link>
        <Link href="/dashboard/settings/team">
          <Button variant="ghost" size="sm">
            <Shield className="mr-2 h-4 w-4" />
            Team & Permissions
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Church Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Church className="h-5 w-5" />
                Church Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="name">Church Name</Label>
                  <Input
                    id="name"
                    defaultValue={church.name}
                    placeholder="Church name"
                  />
                </div>
                <div>
                  <Label htmlFor="denomination">Denomination</Label>
                  <Input
                    id="denomination"
                    defaultValue={church.denomination || ""}
                    placeholder="Denomination"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      defaultValue={church.phone || ""}
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={church.email || ""}
                      placeholder="Contact email"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    defaultValue={church.website || ""}
                    placeholder="https://www.yourchurch.com"
                  />
                </div>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    defaultValue={church.address || ""}
                    placeholder="Street address"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      defaultValue={church.city || ""}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      defaultValue={church.state || ""}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      defaultValue={church.zipCode || ""}
                      placeholder="ZIP"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      defaultValue={church.country || ""}
                      placeholder="Country"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      defaultValue={church.timezone || "America/New_York"}
                      className="w-full h-10 rounded-md border border-input bg-background px-3"
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                </div>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Branding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Label>Church Logo</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                      {church.logo ? (
                        <img
                          src={church.logo}
                          alt="Logo"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Church className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <Button variant="outline" type="button">
                      Upload Logo
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="color"
                      id="primaryColor"
                      defaultValue="#0ea5e9"
                      className="w-10 h-10 rounded border"
                    />
                    <Input
                      defaultValue="#0ea5e9"
                      className="w-32"
                    />
                  </div>
                </div>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Subscription */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-semibold">{church.subscriptionTier}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold text-green-600">
                  {church.subscriptionStatus}
                </span>
              </div>
              {church.trialEndsAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Trial Ends</span>
                  <span className="font-semibold">
                    {new Date(church.trialEndsAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              <Link href="/dashboard/settings/billing">
                <Button variant="outline" className="w-full">
                  Manage Subscription
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/dashboard/settings/team"
                className="block p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <p className="font-medium">Team Management</p>
                <p className="text-sm text-muted-foreground">
                  Add users and set permissions
                </p>
              </Link>
              <Link
                href="/dashboard/settings/integrations"
                className="block p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <p className="font-medium">Integrations</p>
                <p className="text-sm text-muted-foreground">
                  Connect external services
                </p>
              </Link>
              <Link
                href="/dashboard/settings/import"
                className="block p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <p className="font-medium">Import Data</p>
                <p className="text-sm text-muted-foreground">
                  Import from other systems
                </p>
              </Link>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                These actions are irreversible. Please proceed with caution.
              </p>
              <Button variant="outline" className="w-full text-destructive">
                Export All Data
              </Button>
              <Button variant="destructive" className="w-full">
                Delete Church Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
