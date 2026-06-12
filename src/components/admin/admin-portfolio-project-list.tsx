"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PortfolioProjectWithMedia } from "@/lib/db";

type AdminPortfolioProjectListProps = {
  projects: PortfolioProjectWithMedia[];
};

export function AdminPortfolioProjectList({ projects }: AdminPortfolioProjectListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const deleteProject = async (slug: string) => {
    const confirmed = window.confirm("Delete this portfolio project? This action cannot be undone.");
    if (!confirmed) {
      return;
    }

    setError("");
    setIsDeleting(slug);

    const response = await fetch(`/api/admin/portfolio/${slug}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => ({ error: "Unable to delete project." }))) as {
        error?: string;
      };
      setError(result.error ?? "Unable to delete project.");
      setIsDeleting(null);
      return;
    }

    setIsDeleting(null);
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Portfolio Projects</CardTitle>
          <ButtonLink href="/admin/portfolio/new" size="sm">Create Project</ButtonLink>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {projects.map((project) => (
          <div key={project.slug} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
            <p className="font-medium">{project.title}</p>
            <div className="flex items-center gap-2">
              <ButtonLink href={`/admin/portfolio/${project.slug}`} size="sm">Edit</ButtonLink>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => deleteProject(project.slug)}
                disabled={isDeleting === project.slug}
              >
                {isDeleting === project.slug ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <p className="text-sm text-muted-foreground">No portfolio projects found.</p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </CardContent>
    </Card>
  );
}
