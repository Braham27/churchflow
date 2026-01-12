import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "ChurchFlow - Modern Church Management Platform",
    template: "%s | ChurchFlow",
  },
  description:
    "Organize, engage, and grow your church community with our all-in-one cloud-based management platform. Membership, events, donations, and more.",
  keywords: [
    "church management",
    "church software",
    "membership management",
    "online giving",
    "event management",
    "volunteer scheduling",
    "church database",
  ],
  authors: [{ name: "ChurchFlow" }],
  creator: "ChurchFlow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "ChurchFlow",
    title: "ChurchFlow - Modern Church Management Platform",
    description:
      "Organize, engage, and grow your church community with our all-in-one cloud-based management platform.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ChurchFlow",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChurchFlow - Modern Church Management Platform",
    description:
      "Organize, engage, and grow your church community with our all-in-one cloud-based management platform.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
