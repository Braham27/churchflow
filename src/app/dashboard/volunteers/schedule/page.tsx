import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

// Mock schedule data
const scheduleData = [
  {
    date: "Sunday, January 12",
    shifts: [
      {
        time: "8:00 AM - 10:30 AM",
        role: "Greeter",
        volunteers: ["John Doe", "Jane Smith"],
        needed: 2,
      },
      {
        time: "8:00 AM - 10:30 AM",
        role: "Usher",
        volunteers: ["Mike Johnson"],
        needed: 3,
      },
      {
        time: "8:00 AM - 10:30 AM",
        role: "Nursery",
        volunteers: ["Sarah Williams", "Emily Brown"],
        needed: 2,
      },
      {
        time: "10:30 AM - 1:00 PM",
        role: "Greeter",
        volunteers: ["David Chen"],
        needed: 2,
      },
      {
        time: "10:30 AM - 1:00 PM",
        role: "Usher",
        volunteers: ["Tom Wilson", "Amy Davis"],
        needed: 3,
      },
    ],
  },
  {
    date: "Wednesday, January 15",
    shifts: [
      {
        time: "6:00 PM - 8:30 PM",
        role: "Children's Ministry",
        volunteers: ["Lisa Anderson", "Mark Taylor"],
        needed: 4,
      },
      {
        time: "6:00 PM - 8:30 PM",
        role: "Sound Tech",
        volunteers: ["Chris Martin"],
        needed: 1,
      },
    ],
  },
  {
    date: "Sunday, January 19",
    shifts: [
      {
        time: "8:00 AM - 10:30 AM",
        role: "Greeter",
        volunteers: [],
        needed: 2,
      },
      {
        time: "8:00 AM - 10:30 AM",
        role: "Usher",
        volunteers: ["Mike Johnson", "David Chen"],
        needed: 3,
      },
      {
        time: "8:00 AM - 10:30 AM",
        role: "Nursery",
        volunteers: ["Sarah Williams"],
        needed: 2,
      },
    ],
  },
];

export default async function VolunteerSchedulePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/volunteers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Volunteer Schedule</h1>
          <p className="text-muted-foreground">
            View and manage upcoming volunteer assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium">January 2026</span>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter by Role
        </Button>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-2" />
          Filter by Volunteer
        </Button>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          Date Range
        </Button>
      </div>

      {/* Schedule */}
      <div className="space-y-6">
        {scheduleData.map((day) => (
          <Card key={day.date}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {day.date}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {day.shifts.map((shift, index) => {
                  const isFilled = shift.volunteers.length >= shift.needed;
                  const needsVolunteers = shift.volunteers.length < shift.needed;
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        needsVolunteers ? "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[150px]">
                          <Clock className="h-4 w-4" />
                          {shift.time}
                        </div>
                        <div>
                          <p className="font-medium">{shift.role}</p>
                          <p className="text-sm text-muted-foreground">
                            {shift.volunteers.length > 0 
                              ? shift.volunteers.join(", ")
                              : "No volunteers assigned"
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-sm font-medium ${
                          isFilled ? "text-green-600" : "text-orange-600"
                        }`}>
                          {shift.volunteers.length}/{shift.needed} filled
                        </span>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
