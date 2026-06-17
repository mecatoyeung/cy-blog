import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Noto_Sans } from 'next/font/google';
import { withBasePath } from "@/lib/base-path";
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
  const logoSrc = withBasePath("/img/Coding Panda.png");

  return (
    <html
      lang="en"
      className={`${notoSans.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
          <nav className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 px-4 py-3 sm:px-6 md:grid md:grid-cols-3 md:gap-0 md:px-12">
            {/* Left: site name */}
            <Link
              href="/"
              className="text-center text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground sm:text-sm md:text-left"
            >
              Cato Yeung&apos;s Portfolio and Blog
            </Link>

            {/* Center: panda logo */}
            <div className="flex justify-center md:justify-center">
              <Link href="/" aria-label="Home">
                <Image
                  src={logoSrc}
                  alt="Coding Panda logo"
                  width={96}
                  height={72}
                  className="swing object-cover sm:h-[72px] sm:w-[96px]"
                  priority
                />
              </Link>
            </div>

            {/* Right: navigation links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground font-bold md:justify-end">
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <Link href="/blog" className="hover:text-foreground">
                Blog
              </Link>
              <Link href="/portfolio" className="hover:text-foreground">
                Portfolio
              </Link>
              <Link href="/resume" className="hover:text-foreground">
                Resume
              </Link>
              <Link href="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
