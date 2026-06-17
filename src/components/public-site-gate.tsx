"use client";

import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const USER_PASSWORD_STORAGE_KEY = "cy-blog:user-password-hash";

type PublicSiteGateProps = {
  children: React.ReactNode;
  passwordHash: string | null;
};

function isProtectedPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/resume" ||
    pathname === "/contact" ||
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname === "/portfolio" ||
    pathname.startsWith("/portfolio/")
  );
}

async function sha256(value: string) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("user-password-change", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("user-password-change", onStoreChange);
  };
}

function getStoredPasswordHash() {
  return window.localStorage.getItem(USER_PASSWORD_STORAGE_KEY);
}

export function PublicSiteGate({ children, passwordHash }: PublicSiteGateProps) {
  const pathname = usePathname();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const protectedPath = isProtectedPath(pathname);
  const storedPasswordHash = useSyncExternalStore(
    subscribe,
    getStoredPasswordHash,
    () => null
  );
  const isUnlocked = !protectedPath || !passwordHash || storedPasswordHash === passwordHash;

  if (isUnlocked) {
    return <>{children}</>;
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const hashedPassword = await sha256(password);
      if (hashedPassword !== passwordHash) {
        setError("Invalid password.");
        setIsLoading(false);
        return;
      }

      window.localStorage.setItem(USER_PASSWORD_STORAGE_KEY, hashedPassword);
      window.dispatchEvent(new Event("user-password-change"));
      setPassword("");
    } catch {
      setError("Unable to verify password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:px-12 md:py-10">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Site Access</h1>
        <p className="mt-2 text-muted-foreground">This site is password protected.</p>
      </section>

      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Protected Site</CardTitle>
          <CardDescription>Enter the site password to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="user-password">Password</Label>
              <Input
                id="user-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Unlocking..." : "Unlock"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}