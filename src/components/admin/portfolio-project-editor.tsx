"use client";

import { useState } from "react";

import { DraftEditorField } from "@/components/admin/draft-editor-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PortfolioProjectWithMedia } from "@/lib/db";

type PortfolioProjectEditorProps = {
  initialProject: PortfolioProjectWithMedia;
};

export function PortfolioProjectEditor({ initialProject }: PortfolioProjectEditorProps) {
  const [project, setProject] = useState(initialProject);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");

  const uploadImages = async () => {
    if (filesToUpload.length === 0) {
      return;
    }

    setIsUploading(true);
    setMessage("");

    try {
      const uploadedItems: PortfolioProjectWithMedia["media"] = [];

      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.set("file", file);

        const response = await fetch(
          `/api/admin/portfolio/${encodeURIComponent(project.slug)}/media`,
          {
            method: "POST",
            body: formData,
          }
        );

        const result = (await response
          .json()
          .catch(() => ({ error: "Unable to upload image." }))) as { error?: string; url?: string };

        if (!response.ok || typeof result.url !== "string") {
          throw new Error(result.error ?? "Unable to upload image.");
        }

        uploadedItems.push({
          id: Date.now() + uploadedItems.length,
          project_id: project.id,
          type: "image",
          url: result.url,
          alt: file.name.replace(/\.[^.]+$/, ""),
          sort_order: project.media.length + uploadedItems.length,
        });
      }

      setProject((current) => ({
        ...current,
        media: [...current.media, ...uploadedItems],
      }));
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

    const response = await fetch(`/api/admin/portfolio/${project.slug}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: project.title,
        description: project.description,
        tags: project.tags,
        sort_order: project.sort_order,
        media: project.media.map((item, index) => ({
          type: item.type,
          url: item.url,
          alt: item.alt,
          sort_order: index,
        })),
      }),
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => ({ error: "Unable to save project." }))) as {
        error?: string;
      };
      setMessage(result.error ?? "Unable to save project.");
      setIsSaving(false);
      return;
    }

    setMessage("Project updated.");
    setIsSaving(false);
  };

  return (
    <div className="space-y-4">
      {message && <p className="rounded-md border bg-muted px-3 py-2 text-sm">{message}</p>}

      <div className="space-y-2">
        <Label htmlFor="portfolio-title">Title</Label>
        <Input
          id="portfolio-title"
          value={project.title}
          onChange={(event) => setProject((current) => ({ ...current, title: event.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="portfolio-tags">Tags (comma-separated)</Label>
        <Input
          id="portfolio-tags"
          value={project.tags}
          onChange={(event) => setProject((current) => ({ ...current, tags: event.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="portfolio-sort-order">Sort Order</Label>
        <Input
          id="portfolio-sort-order"
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
        id="portfolio-description"
        label="Description"
        value={project.description}
        onChange={(value) => setProject((current) => ({ ...current, description: value }))}
      />

      <div className="space-y-3 rounded-md border p-3">
        <div className="space-y-1">
          <Label htmlFor="portfolio-carousel-upload">Carousel Images</Label>
          <p className="text-xs text-muted-foreground">
            Upload images to public/img/portfolio/{project.slug}.
          </p>
        </div>

        <Input
          id="portfolio-carousel-upload"
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
          <p className="text-sm text-muted-foreground">No carousel items yet.</p>
        )}

        <div className="space-y-3">
          {project.media.map((item, index) => (
            <div key={`${item.url}-${item.id}-${index}`} className="space-y-2 rounded-md border p-3">
              <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
                {item.type === "video" ? (
                  <video src={item.url} className="h-full w-full object-cover" controls />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.alt || `Carousel image ${index + 1}`} className="h-full w-full object-cover" />
                )}
              </div>

              <p className="truncate text-xs text-muted-foreground">{item.url}</p>

              <div className="space-y-2">
                <Label htmlFor={`media-alt-${index}`}>Alt Text</Label>
                <Input
                  id={`media-alt-${index}`}
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
        {isSaving ? "Saving..." : "Save Project"}
      </Button>
    </div>
  );
}
