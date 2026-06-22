"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PortfolioProjectWithMedia, PostRecord } from "@/lib/db";

type AdminDashboardListProps = {
  posts: PostRecord[];
  projects: PortfolioProjectWithMedia[];
};

export function AdminDashboardList({ posts, projects }: AdminDashboardListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [projectError, setProjectError] = useState("");
  const router = useRouter();

  const deletePost = async (slug: string) => {
    const confirmed = window.confirm("Delete this blog post? This action cannot be undone.");
    if (!confirmed) {
      return;
    }

    setError("");
    setIsDeleting(slug);

    const response = await fetch(`/api/admin/posts/${slug}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => ({ error: "Unable to delete post." }))) as {
        error?: string;
      };
      setError(result.error ?? "Unable to delete post.");
      setIsDeleting(null);
      return;
    }

    setIsDeleting(null);
    router.refresh();
  };

  const deleteProject = async (slug: string) => {
    const confirmed = window.confirm("Delete this portfolio project? This action cannot be undone.");
    if (!confirmed) {
      return;
    }

    setProjectError("");
    setIsDeletingProject(slug);

    const response = await fetch(`/api/admin/portfolio/${slug}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => ({ error: "Unable to delete project." }))) as {
        error?: string;
      };
      setProjectError(result.error ?? "Unable to delete project.");
      setIsDeletingProject(null);
      return;
    }

    setIsDeletingProject(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Resume</CardTitle>
            <ButtonLink href="/admin/resume" size="sm">Edit Resume</ButtonLink>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Update profile details and work experience shown on the resume page.
          </p>
        </CardContent>
      </Card>

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
                  disabled={isDeletingProject === project.slug}
                >
                  {isDeletingProject === project.slug ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <p className="text-sm text-muted-foreground">No portfolio projects found.</p>
          )}

          {projectError && <p className="text-sm text-red-600">{projectError}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Blog Posts</CardTitle>
            <ButtonLink href="/admin/blog/new" size="sm">Add Blog Post</ButtonLink>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {posts.map((post) => (
            <div key={post.slug} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
              <p className="font-medium">{post.title}</p>
              <div className="flex items-center gap-2">
                <ButtonLink href={`/admin/blog/${post.slug}`} size="sm">Edit</ButtonLink>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => deletePost(post.slug)}
                  disabled={isDeleting === post.slug}
                >
                  {isDeleting === post.slug ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <p className="text-sm text-muted-foreground">No posts found.</p>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
