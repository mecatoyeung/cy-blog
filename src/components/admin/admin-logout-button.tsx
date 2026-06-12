"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function AdminLogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const onLogout = async () => {
    setIsLoading(true);

    await fetch("/api/admin/logout", {
      method: "POST",
    });

    window.location.reload();
  };

  return (
    <Button type="button" variant="secondary" onClick={onLogout} disabled={isLoading}>
      {isLoading ? "Signing out..." : "Sign Out"}
    </Button>
  );
}
