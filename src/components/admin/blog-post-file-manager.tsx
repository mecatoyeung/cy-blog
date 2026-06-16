"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BlogPostFileRecord } from "@/lib/blog-post-files";

type BlogPostFileManagerProps = {
  slug: string;
  initialFiles?: BlogPostFileRecord[];
};

export function BlogPostFileManager({ slug, initialFiles = [] }: BlogPostFileManagerProps) {
  const normalizedSlug = slug.trim();
  const [files, setFiles] = useState<BlogPostFileRecord[]>(initialFiles);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeDeleteUrl, setActiveDeleteUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const loadFiles = async (nextSlug: string) => {
    if (!nextSlug) {
      setFiles([]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/posts/${encodeURIComponent(nextSlug)}/media`, {
        method: "GET",
        cache: "no-store",
      });

      const result = (await response.json().catch(() => ({ error: "Unable to load files." }))) as {
        error?: string;
        files?: BlogPostFileRecord[];
      };

      if (!response.ok || !Array.isArray(result.files)) {
        throw new Error(result.error ?? "Unable to load files.");
      }

      setFiles(result.files);
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Unable to load files.";
      setMessage(messageText);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFiles = async () => {
    if (!normalizedSlug || filesToUpload.length === 0) {
      return;
    }

    setIsUploading(true);
    setMessage("");

    try {
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.set("file", file);

        const response = await fetch(`/api/admin/posts/${encodeURIComponent(normalizedSlug)}/media`, {
          method: "POST",
          body: formData,
        });

        const result = (await response.json().catch(() => ({ error: "Unable to upload file." }))) as {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to upload file.");
        }
      }

      await loadFiles(normalizedSlug);
      setFilesToUpload([]);
      setMessage(`${filesToUpload.length} file(s) uploaded.`);
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Unable to upload file.";
      setMessage(messageText);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (url: string) => {
    if (!normalizedSlug) {
      return;
    }

    setActiveDeleteUrl(url);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/posts/${encodeURIComponent(normalizedSlug)}/media`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const result = (await response.json().catch(() => ({ error: "Unable to delete file." }))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to delete file.");
      }

      setFiles((current) => current.filter((file) => file.url !== url));
      setMessage("File deleted.");
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Unable to delete file.";
      setMessage(messageText);
    } finally {
      setActiveDeleteUrl(null);
    }
  };

  const copyPath = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setMessage(`Copied ${url}`);
    } catch {
      setMessage("Unable to copy path.");
    }
  };

  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="space-y-1">
        <Label htmlFor="blog-post-file-upload">File Management</Label>
        <p className="text-xs text-muted-foreground">
          Upload blog images to /public/img/blog/{normalizedSlug || "[slug]"}. Copy the root-relative path to use in your post content.
        </p>
        {!normalizedSlug && (
          <p className="text-xs text-muted-foreground">
            Enter the post slug first. Changing the slug later will point uploads at a different folder.
          </p>
        )}
      </div>

      {message && <p className="rounded-md border bg-muted px-3 py-2 text-sm">{message}</p>}

      <Input
        id="blog-post-file-upload"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        multiple
        disabled={!normalizedSlug || isUploading}
        onChange={(event) => setFilesToUpload(Array.from(event.target.files ?? []))}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={uploadFiles}
          disabled={!normalizedSlug || isUploading || filesToUpload.length === 0}
        >
          {isUploading ? "Uploading..." : `Upload Selected (${filesToUpload.length})`}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => void loadFiles(normalizedSlug)}
          disabled={!normalizedSlug || isLoading || isUploading}
        >
          {isLoading ? "Refreshing..." : "Refresh Files"}
        </Button>
      </div>

      {!normalizedSlug ? null : files.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading files..." : "No files uploaded for this post yet."}
        </p>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <div key={file.url} className="rounded-md border p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <Input value={file.url} readOnly aria-label={`Path for ${file.name}`} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => void copyPath(file.url)}>
                    Copy Path
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void deleteFile(file.url)}
                    disabled={activeDeleteUrl === file.url}
                  >
                    {activeDeleteUrl === file.url ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}