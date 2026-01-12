"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Shield, Users, Palette } from "lucide-react";

const colorOptions = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Orange", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Red", value: "#ef4444" },
  { name: "Indigo", value: "#6366f1" },
];

export default function NewRolePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
    minAge: "",
    requiresBackgroundCheck: false,
    requiresTraining: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a role name");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/volunteers/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create role");
      }

      toast.success("Role created successfully!");
      router.push("/dashboard/volunteers/roles");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create role"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/volunteers/roles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create Volunteer Role</h1>
          <p className="text-muted-foreground">
            Define a new role for your volunteer team
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Greeter, Usher, Kids Ministry Teacher"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the responsibilities and expectations for this role..."
                rows={3}
              />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Role Color
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, color: color.value }))
                    }
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      formData.color === color.value
                        ? "border-foreground scale-110"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="minAge">Minimum Age (Optional)</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="minAge"
                  name="minAge"
                  type="number"
                  min="0"
                  value={formData.minAge}
                  onChange={handleChange}
                  placeholder="e.g., 18"
                  className="pl-10"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Volunteers must be at least this age to serve in this role
              </p>
            </div>

            <div className="space-y-3">
              <Label>Requirements</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requiresBackgroundCheck"
                  name="requiresBackgroundCheck"
                  checked={formData.requiresBackgroundCheck}
                  onChange={handleChange}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="requiresBackgroundCheck" className="cursor-pointer">
                  Requires background check
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requiresTraining"
                  name="requiresTraining"
                  checked={formData.requiresTraining}
                  onChange={handleChange}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="requiresTraining" className="cursor-pointer">
                  Requires training completion
                </Label>
              </div>
            </div>

            {/* Preview */}
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: formData.color }}
                  />
                  <span className="font-medium">
                    {formData.name || "Role Name"}
                  </span>
                </div>
                {formData.description && (
                  <p className="text-sm text-muted-foreground mt-1 ml-7">
                    {formData.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2 ml-7">
                  {formData.minAge && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      Age {formData.minAge}+
                    </span>
                  )}
                  {formData.requiresBackgroundCheck && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                      Background Check
                    </span>
                  )}
                  {formData.requiresTraining && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                      Training Required
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link href="/dashboard/volunteers/roles">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Role"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
