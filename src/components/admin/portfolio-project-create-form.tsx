"use client";

import { useState } from "react";

import { DraftEditorField } from "@/components/admin/draft-editor-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreatePortfolioProjectDraft = {
  slug: string;
  title: string;
  description: string;
  tags: string;
  sort_order: number;
  media: { type: "image"; url: string; alt: string }[];
};

export function PortfolioProjectCreateForm() {
  const [project, setProject] = useState<CreatePortfolioProjectDraft>({
    slug: "",
    title: "",
    description: "",
    tags: "",
    sort_order: 0,
    media: [],
  });
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");

  const uploadImages = async () => {
    const slug = project.slug.trim();
    if (!slug) {
      setMessage("Enter a slug before uploading images.");
      return;
    }

    if (filesToUpload.length === 0) {
      return;
    }

    setIsUploading(true);
    setMessage("");

    try {
      const uploadedItems: { type: "image"; url: string; alt: string }[] = [];

      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.set("file", file);

        const response = await fetch(`/api/admin/portfolio/${encodeURIComponent(slug)}/media`, {
          method: "POST",
          body: formData,
        });

        const result = (await response
          .json()
          .catch(() => ({ error: "Unable to upload image." }))) as { error?: string; url?: string };

        if (!response.ok || typeof result.url !== "string") {
          throw new Error(result.error ?? "Unable to upload image.");
        }

        uploadedItems.push({
          type: "image",
          url: result.url,
          alt: file.name.replace(/\.[^.]+$/, ""),
        });
      }

      setProject((current) => ({ ...current, media: [...current.media, ...uploadedItems] }));
      setFilesToUpload([]);
      setMessage(`${uploadedItems.length} image(s) uploaded.`);
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Unable to upload image.";
      setMessage(messageText);
    } finally {
      setIsUploading(false);
    }
  };

  const moveMediaItem = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    setProject((current) => {
      if (targetIndex < 0 || targetIndex >= current.media.length) {
        return current;
      }

      const nextMedia = [...current.media];
      const [item] = nextMedia.splice(index, 1);
      nextMedia.splice(targetIndex, 0, item);
      return { ...current, media: nextMedia };
    });
  };

  const removeMediaItem = (index: number) => {
    setProject((current) => ({
      ...current,
      media: current.media.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const onSave = async () => {
    setIsSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/portfolio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(project),
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => ({ error: "Unable to create project." }))) as {
        error?: string;
      };
      setMessage(result.error ?? "Unable to create project.");
      setIsSaving(false);
      return;
    }

    window.location.href = `/admin/portfolio/${project.slug}`;
  };

  return (
    <div className="space-y-4">
      {message && <p className="rounded-md border bg-muted px-3 py-2 text-sm text-red-600">{message}</p>}

      <div className="space-y-2">
        <Label htmlFor="new-portfolio-slug">Slug</Label>
        <Input
          id="new-portfolio-slug"
          placeholder="example-project-slug"
          value={project.slug}
          onChange={(event) => setProject((current) => ({ ...current, slug: event.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-portfolio-title">Title</Label>
        <Input
          id="new-portfolio-title"
          value={project.title}
          onChange={(event) => setProject((current) => ({ ...current, title: event.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-portfolio-tags">Tags (comma-separated)</Label>
        <Input
          id="new-portfolio-tags"
          value={project.tags}
          onChange={(event) => setProject((current) => ({ ...current, tags: event.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-portfolio-sort-order">Sort Order</Label>
        <Input
          id="new-portfolio-sort-order"
          value={String(project.sort_order)}
          onChange={(event) => {
            const numeric = Number.parseInt(event.target.value, 10);
            setProject((current) => ({
              ...current,
              sort_order: Number.isNaN(numeric) ? 0 : numeric,
            }));
          }}
        />
      </div>

      <DraftEditorField
        id="new-portfolio-description"
        label="Description"
        value={project.description}
        onChange={(value) => setProject((current) => ({ ...current, description: value }))}
      />

      <div className="space-y-3 rounded-md border p-3">
        <div className="space-y-1">
          <Label htmlFor="new-portfolio-carousel-upload">Carousel Images</Label>
          <p className="text-xs text-muted-foreground">
            Upload images to public/img/portfolio/{project.slug.trim() || "[slug]"}.
          </p>
        </div>

        <Input
          id="new-portfolio-carousel-upload"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          multiple
          onChange={(event) => setFilesToUpload(Array.from(event.target.files ?? []))}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" onClick={uploadImages} disabled={isUploading || filesToUpload.length === 0}>
            {isUploading ? "Uploading..." : `Upload Selected (${filesToUpload.length})`}
          </Button>
        </div>

        {project.media.length === 0 && (
          <p className="text-sm text-muted-foreground">No carousel images yet.</p>
        )}

        <div className="space-y-3">
          {project.media.map((item, index) => (
            <div key={`${item.url}-${index}`} className="space-y-2 rounded-md border p-3">
              <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.alt || `Carousel image ${index + 1}`} className="h-full w-full object-cover" />
              </div>

              <p className="truncate text-xs text-muted-foreground">{item.url}</p>

              <div className="space-y-2">
                <Label htmlFor={`new-media-alt-${index}`}>Alt Text</Label>
                <Input
                  id={`new-media-alt-${index}`}
                  value={item.alt}
                  onChange={(event) =>
                    setProject((current) => ({
                      ...current,
                      media: current.media.map((mediaItem, mediaIndex) =>
                        mediaIndex === index ? { ...mediaItem, alt: event.target.value } : mediaItem
                      ),
                    }))
                  }
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => moveMediaItem(index, -1)} disabled={index === 0}>
                  Move Up
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => moveMediaItem(index, 1)}
                  disabled={index === project.media.length - 1}
                >
                  Move Down
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeMediaItem(index)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button type="button" onClick={onSave} disabled={isSaving}>
        {isSaving ? "Creating..." : "Create Project"}
      </Button>
    </div>
  );
}
