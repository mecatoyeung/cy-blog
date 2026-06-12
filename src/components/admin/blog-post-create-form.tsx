"use client";

import { useState } from "react";

import { DraftEditorField } from "@/components/admin/draft-editor-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CreatePostDraft = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  published_at: string;
  tags: string;
};

function getTodayDateString() {
  return new Date().toISOString().split("T")[0] ?? "";
}

export function BlogPostCreateForm() {
  const [post, setPost] = useState<CreatePostDraft>({
    slug: "",
    title: "",
    excerpt: "",
    body: "",
    published_at: getTodayDateString(),
    tags: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const onSave = async () => {
    setIsSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post),
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => ({ error: "Unable to create post." }))) as {
        error?: string;
      };
      setMessage(result.error ?? "Unable to create post.");
      setIsSaving(false);
      return;
    }

    window.location.href = `/admin/blog/${post.slug}`;
  };

  return (
    <div className="space-y-4">
      {message && <p className="rounded-md border bg-muted px-3 py-2 text-sm text-red-600">{message}</p>}

      <div className="space-y-2">
        <Label htmlFor="new-post-slug">Slug</Label>
        <Input
          id="new-post-slug"
          placeholder="example-post-slug"
          value={post.slug}
          onChange={(event) => setPost((current) => ({ ...current, slug: event.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-post-title">Title</Label>
        <Input
          id="new-post-title"
          value={post.title}
          onChange={(event) => setPost((current) => ({ ...current, title: event.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-post-excerpt">Excerpt</Label>
        <Textarea
          id="new-post-excerpt"
          className="min-h-20"
          value={post.excerpt}
          onChange={(event) => setPost((current) => ({ ...current, excerpt: event.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-post-published">Published Date (YYYY-MM-DD)</Label>
        <Input
          id="new-post-published"
          value={post.published_at}
          onChange={(event) =>
            setPost((current) => ({ ...current, published_at: event.target.value }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-post-tags">Tags (comma-separated)</Label>
        <Input
          id="new-post-tags"
          value={post.tags}
          onChange={(event) => setPost((current) => ({ ...current, tags: event.target.value }))}
        />
      </div>

      <DraftEditorField
        id="new-post-body"
        label="Body"
        value={post.body}
        onChange={(value) => setPost((current) => ({ ...current, body: value }))}
      />

      <Button type="button" onClick={onSave} disabled={isSaving}>
        {isSaving ? "Creating..." : "Create Post"}
      </Button>
    </div>
  );
}
