import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = (requestHeaders.get("x-forwarded-host")
    ?? requestHeaders.get("host")
    ?? "localhost:3000").split(",")[0].trim();
  const protocol = (requestHeaders.get("x-forwarded-proto")
    ?? (host.startsWith("localhost") ? "http" : "https")).split(",")[0].trim();
  const origin = `${protocol}://${host}`;
  const title = "Free Gibberish Detector – Check Words & Text";
  const description = "Check any word or phrase instantly to see whether it looks meaningful or like random gibberish. Free, private, and no LLM required.";
  const socialImage = `${origin}/og.png`;

  return {
    title,
    description,
    applicationName: "Gibberish Detector",
    alternates: {
      canonical: origin,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: origin,
      siteName: "Gibberish Detector",
      images: [{
        url: socialImage,
        width: 1200,
        height: 630,
        alt: "Gibberish Detector checking a sample query",
      }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
