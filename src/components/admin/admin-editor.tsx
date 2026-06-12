"use client";

import { useState } from "react";

import { DraftEditorField } from "@/components/admin/draft-editor-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PortfolioProjectWithMedia, PostRecord } from "@/lib/db";

type AdminEditorProps = {
  initialPosts: PostRecord[];
  initialProjects: PortfolioProjectWithMedia[];
};

export function AdminEditor({ initialPosts, initialProjects }: AdminEditorProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [projects, setProjects] = useState(initialProjects);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  const updatePostField = (slug: string, field: keyof PostRecord, value: string) => {
    setPosts((current) =>
      current.map((post) => (post.slug === slug ? { ...post, [field]: value } : post))
    );
  };

  const updateProjectField = (
    slug: string,
    field: "title" | "description" | "tags" | "sort_order",
    value: string
  ) => {
    setProjects((current) =>
      current.map((project) => {
        if (project.slug !== slug) {
          return project;
        }

        if (field === "sort_order") {
          const numeric = Number.parseInt(value, 10);
          return { ...project, sort_order: Number.isNaN(numeric) ? 0 : numeric };
        }

        return { ...project, [field]: value };
      })
    );
  };

  const savePost = async (slug: string) => {
    const post = posts.find((item) => item.slug === slug);
    if (!post) {
      return;
    }

    setSavingKey(`post:${slug}`);
    setMessage("");

    const response = await fetch(`/api/admin/posts/${slug}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: post.title,
        excerpt: post.excerpt,
        body: post.body,
        published_at: post.published_at,
        tags: post.tags,
      }),
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => ({ error: "Unable to save post." }))) as {
        error?: string;
      };
      setMessage(result.error ?? "Unable to save post.");
      setSavingKey(null);
      return;
    }

    setMessage(`Post \"${slug}\" updated.`);
    setSavingKey(null);
  };

  const saveProject = async (slug: string) => {
    const project = projects.find((item) => item.slug === slug);
    if (!project) {
      return;
    }

    setSavingKey(`project:${slug}`);
    setMessage("");

    const response = await fetch(`/api/admin/portfolio/${slug}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: project.title,
        description: project.description,
        tags: project.tags,
        sort_order: project.sort_order,
      }),
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => ({ error: "Unable to save project." }))) as {
        error?: string;
      };
      setMessage(result.error ?? "Unable to save project.");
      setSavingKey(null);
      return;
    }

    setMessage(`Portfolio project \"${slug}\" updated.`);
    setSavingKey(null);
  };

  return (
    <div className="space-y-8">
      {message && <p className="rounded-md border bg-muted px-3 py-2 text-sm">{message}</p>}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Blog Editor</h2>
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.slug}>
              <CardHeader>
                <CardTitle>{post.slug}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`post-title-${post.slug}`}>Title</Label>
                  <Input
                    id={`post-title-${post.slug}`}
                    value={post.title}
                    onChange={(event) => updatePostField(post.slug, "title", event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`post-excerpt-${post.slug}`}>Excerpt</Label>
                  <Textarea
                    id={`post-excerpt-${post.slug}`}
                    value={post.excerpt}
                    onChange={(event) => updatePostField(post.slug, "excerpt", event.target.value)}
                    className="min-h-20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`post-date-${post.slug}`}>Published Date (YYYY-MM-DD)</Label>
                  <Input
                    id={`post-date-${post.slug}`}
                    value={post.published_at}
                    onChange={(event) => updatePostField(post.slug, "published_at", event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`post-tags-${post.slug}`}>Tags (comma-separated)</Label>
                  <Input
                    id={`post-tags-${post.slug}`}
                    value={post.tags}
                    onChange={(event) => updatePostField(post.slug, "tags", event.target.value)}
                  />
                </div>

                <DraftEditorField
                  id={`post-body-${post.slug}`}
                  label="Body"
                  value={post.body}
                  onChange={(nextValue) => updatePostField(post.slug, "body", nextValue)}
                />

                <Button
                  onClick={() => savePost(post.slug)}
                  disabled={savingKey === `post:${post.slug}`}
                >
                  {savingKey === `post:${post.slug}` ? "Saving..." : "Save Post"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Portfolio Editor</h2>
        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project.slug}>
              <CardHeader>
                <CardTitle>{project.slug}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`project-title-${project.slug}`}>Title</Label>
                  <Input
                    id={`project-title-${project.slug}`}
                    value={project.title}
                    onChange={(event) => updateProjectField(project.slug, "title", event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`project-tags-${project.slug}`}>Tags (comma-separated)</Label>
                  <Input
                    id={`project-tags-${project.slug}`}
                    value={project.tags}
                    onChange={(event) => updateProjectField(project.slug, "tags", event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`project-order-${project.slug}`}>Sort Order</Label>
                  <Input
                    id={`project-order-${project.slug}`}
                    value={String(project.sort_order)}
                    onChange={(event) => updateProjectField(project.slug, "sort_order", event.target.value)}
                  />
                </div>

                <DraftEditorField
                  id={`project-description-${project.slug}`}
                  label="Description"
                  value={project.description}
                  onChange={(nextValue) => updateProjectField(project.slug, "description", nextValue)}
                />

                <Button
                  onClick={() => saveProject(project.slug)}
                  disabled={savingKey === `project:${project.slug}`}
                >
                  {savingKey === `project:${project.slug}` ? "Saving..." : "Save Project"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
