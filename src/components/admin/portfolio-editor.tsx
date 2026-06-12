"use client";

import { useState } from "react";

import { DraftEditorField } from "@/components/admin/draft-editor-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PortfolioProjectWithMedia } from "@/lib/db";

type PortfolioEditorProps = {
  initialProjects: PortfolioProjectWithMedia[];
};

export function PortfolioEditor({ initialProjects }: PortfolioEditorProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState("");

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

  const saveProject = async (slug: string) => {
    const project = projects.find((item) => item.slug === slug);
    if (!project) {
      return;
    }

    setSavingKey(slug);
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

    setMessage(`Project \"${slug}\" updated.`);
    setSavingKey(null);
  };

  return (
    <div className="space-y-4">
      {message && <p className="rounded-md border bg-muted px-3 py-2 text-sm">{message}</p>}

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
                onChange={(event) =>
                  updateProjectField(project.slug, "sort_order", event.target.value)
                }
              />
            </div>

            <DraftEditorField
              id={`project-description-${project.slug}`}
              label="Description"
              value={project.description}
              onChange={(nextValue) =>
                updateProjectField(project.slug, "description", nextValue)
              }
            />

            <Button
              type="button"
              onClick={() => saveProject(project.slug)}
              disabled={savingKey === project.slug}
            >
              {savingKey === project.slug ? "Saving..." : "Save Project"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
