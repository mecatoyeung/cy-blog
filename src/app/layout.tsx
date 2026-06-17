import type { Metadata } from "next";
import { Noto_Sans } from 'next/font/google';
import { PublicSiteGate } from "@/components/public-site-gate";
import { SiteHeader } from "@/components/site-header";
import { getUserPasswordHash } from "@/lib/user-auth";
import "./globals.css";

// Configure the font
const notoSans = Noto_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'], // Add the specific weights your design requires
  display: 'swap', // Ensures text remains visible while the font loads
});

export const metadata: Metadata = {
  title: "Cato Yeung | Resume & Blog",
  description: "My portfolio and engineering blog.",
  icons: {
    icon: [
      {
        url: "/img/favicon/favicon-96x96.png",
        type: "image/png",
        sizes: "96x96",
      },
      {
        url: "/img/favicon/favicon.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/img/favicon/favicon.ico",
    apple: [
      {
        url: "/img/favicon/apple-touch-icon.png",
        sizes: "180x180",
      },
    ],
  },
  manifest: "/img/favicon/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userPasswordHash = getUserPasswordHash();

  return (
    <html
      lang="en"
      className={`${notoSans.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <PublicSiteGate passwordHash={userPasswordHash}>
          {children}
        </PublicSiteGate>
      </body>
    </html>
  );
}
