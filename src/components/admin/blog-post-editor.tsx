"use client";

import { useState } from "react";

import { DraftEditorField } from "@/components/admin/draft-editor-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PostRecord } from "@/lib/db";

type BlogPostEditorProps = {
  initialPost: PostRecord;
};

export function BlogPostEditor({ initialPost }: BlogPostEditorProps) {
  const [post, setPost] = useState(initialPost);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string>("");

  const onSave = async () => {
    setIsSaving(true);
    setMessage("");

    const response = await fetch(`/api/admin/posts/${post.slug}`, {
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
      setIsSaving(false);
      return;
    }

    setMessage("Post updated.");
    setIsSaving(false);
  };

  return (
    <div className="space-y-4">
      {message && <p className="rounded-md border bg-muted px-3 py-2 text-sm">{message}</p>}

      <div className="space-y-2">
        <Label htmlFor="post-title">Title</Label>
        <Input
          id="post-title"
          value={post.title}
          onChange={(event) => setPost((current) => ({ ...current, title: event.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="post-excerpt">Excerpt</Label>
        <Textarea
          id="post-excerpt"
          className="min-h-20"
          value={post.excerpt}
          onChange={(event) => setPost((current) => ({ ...current, excerpt: event.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="post-published">Published Date (YYYY-MM-DD)</Label>
        <Input
          id="post-published"
          value={post.published_at}
          onChange={(event) =>
            setPost((current) => ({ ...current, published_at: event.target.value }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="post-tags">Tags (comma-separated)</Label>
        <Input
          id="post-tags"
          value={post.tags}
          onChange={(event) => setPost((current) => ({ ...current, tags: event.target.value }))}
        />
      </div>

      <DraftEditorField
        id="post-body"
        label="Body"
        value={post.body}
        onChange={(value) => setPost((current) => ({ ...current, body: value }))}
      />

      <Button type="button" onClick={onSave} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Post"}
      </Button>
    </div>
  );
}
