import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { PWAProvider } from "@/components/PWAProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4f46e5" },
    { media: "(prefers-color-scheme: dark)", color: "#1e293b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "Rumah Tahfidh An-Nahl - Sistem Absensi",
    template: "%s | An-Nahl",
  },
  description: "Sistem Manajemen Absensi & Penggajian Rumah Tahfidh An-Nahl. Kelola absensi, aktivitas mengajar, dan penggajian dengan mudah.",
  keywords: ["absensi", "penggajian", "tahfidz", "pendidikan", "manajemen"],
  authors: [{ name: "Rumah Tahfidh An-Nahl" }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/icons/icon-512x512.png", color: "#4f46e5" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "An-Nahl",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Rumah Tahfidh An-Nahl",
    title: "Rumah Tahfidh An-Nahl - Sistem Absensi",
    description: "Sistem Manajemen Absensi & Penggajian Rumah Tahfidh An-Nahl",
  },
  twitter: {
    card: "summary",
    title: "Rumah Tahfidh An-Nahl - Sistem Absensi",
    description: "Sistem Manajemen Absensi & Penggajian",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="An-Nahl" />
        <link rel="apple-touch-startup-image" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <PWAProvider />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
