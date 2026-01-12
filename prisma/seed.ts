import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create test user
  const hashedPassword = await bcrypt.hash("password123", 12);
  
  const user = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      hashedPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log("✅ Created user:", user.email);

  // Create demo church
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 30);

  const church = await prisma.church.upsert({
    where: { slug: "grace-community-church" },
    update: {},
    create: {
      name: "Grace Community Church",
      slug: "grace-community-church",
      email: "admin@example.com",
      phone: "(555) 123-4567",
      address: "123 Faith Street",
      city: "Springfield",
      state: "IL",
      country: "USA",
      postalCode: "62701",
      description: "A welcoming community of faith",
      subscriptionStatus: "TRIAL",
      subscriptionTier: "PREMIUM",
      trialEndsAt,
      enabledModules: [
        "members",
        "events",
        "communications",
        "donations",
        "volunteers",
        "website",
        "checkin",
        "sermons",
      ],
      maxMembers: 1000,
      maxStorage: 50,
      badgeSystemEnabled: true,
    },
  });

  console.log("✅ Created church:", church.name);

  // Connect user to church as owner
  await prisma.churchUser.upsert({
    where: {
      userId_churchId: {
        userId: user.id,
        churchId: church.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      churchId: church.id,
      role: "OWNER",
    },
  });

  console.log("✅ Connected user as church owner");

  // Create default donation fund
  const generalFund = await prisma.donationFund.upsert({
    where: {
      id: "default-general-fund",
    },
    update: {},
    create: {
      id: "default-general-fund",
      churchId: church.id,
      name: "General Fund",
      description: "General tithes and offerings",
      isDefault: true,
    },
  });

  const missionsFund = await prisma.donationFund.create({
    data: {
      churchId: church.id,
      name: "Missions Fund",
      description: "Support for global and local missions",
      goal: 50000,
    },
  }).catch(() => null);

  const buildingFund = await prisma.donationFund.create({
    data: {
      churchId: church.id,
      name: "Building Fund",
      description: "Building maintenance and improvements",
      goal: 100000,
    },
  }).catch(() => null);

  console.log("✅ Created donation funds");

  // Create sample members
  const members = [
    {
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@example.com",
      phone: "(555) 234-5678",
      membershipStatus: "MEMBER" as const,
      membershipDate: new Date("2020-03-15"),
      gender: "MALE" as const,
    },
    {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.j@example.com",
      phone: "(555) 345-6789",
      membershipStatus: "MEMBER" as const,
      membershipDate: new Date("2019-06-20"),
      gender: "FEMALE" as const,
    },
    {
      firstName: "Michael",
      lastName: "Williams",
      email: "m.williams@example.com",
      phone: "(555) 456-7890",
      membershipStatus: "REGULAR_ATTENDER" as const,
      gender: "MALE" as const,
    },
    {
      firstName: "Emily",
      lastName: "Brown",
      email: "emily.b@example.com",
      phone: "(555) 567-8901",
      membershipStatus: "VISITOR" as const,
      gender: "FEMALE" as const,
    },
    {
      firstName: "David",
      lastName: "Davis",
      email: "david.d@example.com",
      phone: "(555) 678-9012",
      membershipStatus: "MEMBER" as const,
      membershipDate: new Date("2021-01-10"),
      gender: "MALE" as const,
    },
  ];

  for (const memberData of members) {
    await prisma.member.upsert({
      where: {
        churchId_email: {
          churchId: church.id,
          email: memberData.email,
        },
      },
      update: {},
      create: {
        churchId: church.id,
        ...memberData,
      },
    });
  }

  console.log("✅ Created sample members");

  // Create sample groups
  const groups = [
    {
      name: "Young Adults",
      category: "SMALL_GROUP" as const,
      description: "A community for those in their 20s and 30s",
      meetingDay: "Tuesday",
      meetingTime: "7:00 PM",
      location: "Fellowship Hall",
    },
    {
      name: "Worship Team",
      category: "MINISTRY_TEAM" as const,
      description: "Musicians and vocalists leading worship",
      meetingDay: "Saturday",
      meetingTime: "4:00 PM",
      location: "Sanctuary",
    },
    {
      name: "Children's Ministry",
      category: "CHILDREN" as const,
      description: "Teaching and caring for children ages 0-12",
      meetingDay: "Sunday",
      meetingTime: "9:00 AM",
      location: "Kids Wing",
    },
    {
      name: "Men's Bible Study",
      category: "MEN" as const,
      description: "Weekly Bible study for men",
      meetingDay: "Thursday",
      meetingTime: "6:30 AM",
      location: "Conference Room",
    },
    {
      name: "Women's Fellowship",
      category: "WOMEN" as const,
      description: "Community and study for women",
      meetingDay: "Wednesday",
      meetingTime: "10:00 AM",
      location: "Fellowship Hall",
    },
  ];

  for (const groupData of groups) {
    await prisma.group.create({
      data: {
        churchId: church.id,
        ...groupData,
      },
    }).catch(() => null);
  }

  console.log("✅ Created sample groups");

  // Create sample events
  const now = new Date();
  const events = [
    {
      title: "Sunday Worship Service",
      category: "SERVICE" as const,
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - now.getDay()), 10, 0),
      endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - now.getDay()), 12, 0),
      location: "Main Sanctuary",
      isRecurring: true,
      recurrenceRule: "RRULE:FREQ=WEEKLY;BYDAY=SU",
      enableCheckIn: true,
      isPublished: true,
      publishToWebsite: true,
    },
    {
      title: "Wednesday Night Prayer",
      category: "PRAYER" as const,
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + ((3 - now.getDay() + 7) % 7), 19, 0),
      endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + ((3 - now.getDay() + 7) % 7), 20, 30),
      location: "Prayer Room",
      isRecurring: true,
      isPublished: true,
    },
    {
      title: "Youth Group",
      category: "YOUTH" as const,
      startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + ((5 - now.getDay() + 7) % 7), 18, 30),
      endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + ((5 - now.getDay() + 7) % 7), 21, 0),
      location: "Youth Center",
      isRecurring: true,
      isPublished: true,
      publishToWebsite: true,
    },
    {
      title: "Community Outreach",
      category: "OUTREACH" as const,
      startDate: new Date(now.getFullYear(), now.getMonth() + 1, 15, 9, 0),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 15, 14, 0),
      description: "Serving our local community through food distribution and home repairs",
      location: "Various Locations",
      requiresRegistration: true,
      maxAttendees: 50,
      isPublished: true,
      publishToWebsite: true,
    },
  ];

  for (const eventData of events) {
    await prisma.event.create({
      data: {
        churchId: church.id,
        ...eventData,
      },
    }).catch(() => null);
  }

  console.log("✅ Created sample events");

  // Create volunteer roles
  const volunteerRoles = [
    { name: "Greeter", ministry: "Hospitality", description: "Welcome visitors and members" },
    { name: "Usher", ministry: "Hospitality", description: "Help seat guests and collect offering" },
    { name: "Worship Leader", ministry: "Worship", description: "Lead musical worship", requiresBackgroundCheck: true },
    { name: "Sound Tech", ministry: "Tech", description: "Operate sound equipment" },
    { name: "Kids Teacher", ministry: "Children", description: "Teach children's classes", requiresBackgroundCheck: true },
    { name: "Nursery Worker", ministry: "Children", description: "Care for infants and toddlers", requiresBackgroundCheck: true },
    { name: "Parking Team", ministry: "Hospitality", description: "Direct parking and assist guests" },
  ];

  for (const roleData of volunteerRoles) {
    await prisma.volunteerRole.create({
      data: {
        churchId: church.id,
        ...roleData,
      },
    }).catch(() => null);
  }

  console.log("✅ Created volunteer roles");

  // Create sample resources
  const resources = [
    { name: "Main Sanctuary", type: "ROOM" as const, capacity: 500, location: "Building A" },
    { name: "Fellowship Hall", type: "ROOM" as const, capacity: 200, location: "Building A" },
    { name: "Conference Room A", type: "ROOM" as const, capacity: 20, location: "Building B" },
    { name: "Youth Room", type: "ROOM" as const, capacity: 50, location: "Building C" },
    { name: "Projector", type: "EQUIPMENT" as const },
    { name: "PA System (Portable)", type: "EQUIPMENT" as const },
    { name: "Church Van (15 passenger)", type: "VEHICLE" as const, requiresApproval: true },
  ];

  for (const resourceData of resources) {
    await prisma.resource.create({
      data: {
        churchId: church.id,
        ...resourceData,
      },
    }).catch(() => null);
  }

  console.log("✅ Created resources");

  // Create a sermon series and sermons
  const series = await prisma.sermonSeries.create({
    data: {
      churchId: church.id,
      title: "Faith Foundations",
      description: "A journey through the core beliefs of Christianity",
      isActive: true,
    },
  }).catch(() => null);

  if (series) {
    const sermons = [
      {
        title: "The Power of Faith",
        speaker: "Pastor John",
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
        scripture: "Hebrews 11:1-6",
        description: "Exploring what it means to live by faith",
        isPublished: true,
        seriesOrder: 1,
      },
      {
        title: "Walking in Love",
        speaker: "Pastor John",
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14),
        scripture: "1 Corinthians 13:1-13",
        description: "Understanding God's love and sharing it with others",
        isPublished: true,
        seriesOrder: 2,
      },
    ];

    for (const sermonData of sermons) {
      await prisma.sermon.create({
        data: {
          churchId: church.id,
          seriesId: series.id,
          ...sermonData,
          publishedAt: new Date(),
        },
      }).catch(() => null);
    }
  }

  console.log("✅ Created sample sermons");

  // Create message templates
  const templates = [
    {
      name: "Welcome Email",
      category: "Onboarding",
      type: "EMAIL" as const,
      subject: "Welcome to {{churchName}}!",
      content: "Dear {{firstName}},\n\nWe're so glad you visited {{churchName}}! We hope you felt welcomed and blessed.\n\nWe'd love to help you get connected. Please don't hesitate to reach out if you have any questions.\n\nBlessings,\nThe {{churchName}} Team",
      variables: ["firstName", "churchName"],
    },
    {
      name: "Event Reminder",
      category: "Events",
      type: "EMAIL" as const,
      subject: "Reminder: {{eventName}} is coming up!",
      content: "Hi {{firstName}},\n\nJust a friendly reminder that {{eventName}} is happening on {{eventDate}} at {{eventTime}}.\n\nLocation: {{eventLocation}}\n\nWe can't wait to see you there!\n\nBlessings,\n{{churchName}}",
      variables: ["firstName", "eventName", "eventDate", "eventTime", "eventLocation", "churchName"],
    },
    {
      name: "Birthday Greeting",
      category: "Engagement",
      type: "EMAIL" as const,
      subject: "Happy Birthday, {{firstName}}! 🎂",
      content: "Dear {{firstName}},\n\nHappy Birthday! We hope your special day is filled with joy, love, and blessings.\n\nMay this new year of life bring you closer to God and fill you with His peace.\n\nWith love,\nYour {{churchName}} Family",
      variables: ["firstName", "churchName"],
    },
    {
      name: "Volunteer Reminder",
      category: "Volunteers",
      type: "SMS" as const,
      subject: null,
      content: "Hi {{firstName}}! Reminder: You're scheduled to serve as {{role}} on {{date}} at {{time}}. Reply CONFIRM to confirm or HELP if you need to find a sub. Thanks!",
      variables: ["firstName", "role", "date", "time"],
    },
  ];

  for (const templateData of templates) {
    await prisma.messageTemplate.create({
      data: {
        churchId: church.id,
        ...templateData,
      },
    }).catch(() => null);
  }

  console.log("✅ Created message templates");

  console.log("\n🎉 Database seeding completed!");
  console.log("\n📧 Test Credentials:");
  console.log("   Email: admin@example.com");
  console.log("   Password: password123");
  console.log("\n🔗 Church URL: /c/grace-community-church");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
