import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "@/components/Providers";
import { getServerLocale } from "@/lib/i18nServer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteName = "ARBINOTE";
const siteDescription =
  "ARBINOTE est la plateforme de référence pour noter et comparer les arbitres de Ligue 1 tunisienne : calendrier, classements et votes en direct.";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `${siteName} | Notation Ligue 1 Tunisie`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: ["ARBINOTE", "Note arbitre", "Ligue 1 Tunisie", "classement arbitres", "notation arbitres", "Supabase"],
  authors: [{ name: siteName }],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", sizes: "any" },
      { url: "/logo-light.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/logo-light.png", sizes: "512x512", type: "image/png" }],
  },
  openGraph: {
    title: siteName,
    description: siteDescription,
    url: "/",
    siteName,
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/logo-light.png",
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: ["/logo-light.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialLocale = await getServerLocale();
  const dir = initialLocale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={initialLocale} dir={dir} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('arbinote-theme');
                  document.documentElement.classList.toggle(
                    'dark',
                    theme === 'dark' ||
                      (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)
                  );
                } catch (e) {}
              })();
            `,
          }}
        />
        <Providers initialLocale={initialLocale}>{children}</Providers>
      </body>
    </html>
  );
}
