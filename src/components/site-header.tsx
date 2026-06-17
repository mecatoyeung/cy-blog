"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { withBasePath } from "@/lib/base-path";

export function SiteHeader() {
  const [isLogoVisible, setIsLogoVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 8) {
        setIsLogoVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollY.current + 2) {
        setIsLogoVisible(false);
      } else if (currentScrollY < lastScrollY.current - 2) {
        setIsLogoVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 px-4 py-3 sm:px-6 md:grid md:grid-cols-3 md:gap-0 md:px-12">
        <Link
          href="/"
          className="text-center text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground sm:text-sm md:text-left"
        >
          Cato Yeung&apos;s Portfolio and Blog
        </Link>

        <div className="flex justify-center md:justify-center">
          <Link
            href="/"
            aria-label="Home"
            className={isLogoVisible ? "block" : "hidden"}
          >
            <Image
              src={withBasePath("/img/Coding Panda.png")}
              alt="Coding Panda logo"
              width={96}
              height={72}
              className="swing object-cover sm:h-[72px] sm:w-[96px]"
              priority
            />
          </Link>
        </div>

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
  );
}