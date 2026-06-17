import type { Metadata } from "next";
import { Noto_Sans } from 'next/font/google';
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

// Configure the font
const notoSans = Noto_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'], // Add the specific weights your design requires
  display: 'swap', // Ensures text remains visible while the font loads
});

export const metadata: Metadata = {
  title: "Cato Yeung | Resume & Blog",
  description: "A static Next.js portfolio and engineering blog generated from SQLite.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${notoSans.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
