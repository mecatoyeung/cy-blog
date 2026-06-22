"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ExperienceRecord, ResumeRecord } from "@/lib/db";

type ResumeEditorProps = {
  initialResume: ResumeRecord;
  initialExperiences: ExperienceRecord[];
};

type ExperienceDraft = ExperienceRecord & {
  localId: number;
};

export function ResumeEditor({ initialResume, initialExperiences }: ResumeEditorProps) {
  const [resume, setResume] = useState(initialResume);
  const [experiences, setExperiences] = useState<ExperienceDraft[]>(() =>
    initialExperiences.map((experience, index) => ({
      ...experience,
      localId: index + 1,
    }))
  );
  const nextExperienceId = useRef(initialExperiences.length + 1);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const addExperience = () => {
    setExperiences((current) => [
      ...current,
      {
        localId: nextExperienceId.current++,
        company: "",
        role: "",
        period: "",
        highlights: "",
      },
    ]);
  };

  const updateExperience = (index: number, field: keyof ExperienceRecord, value: string) => {
    setExperiences((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const removeExperience = (index: number) => {
    setExperiences((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const moveExperience = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= experiences.length) {
      return;
    }

    setExperiences((current) => {
      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const onSave = async () => {
    setIsSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/resume", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...resume,
        experiences: experiences.map(({ company, role, period, highlights }) => ({
          company,
          role,
          period,
          highlights,
        })),
      }),
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => ({ error: "Unable to save resume." }))) as {
        error?: string;
      };
      setMessage(result.error ?? "Unable to save resume.");
      setIsSaving(false);
      return;
    }

    setMessage("Resume updated.");
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {message && <p className="rounded-md border bg-muted px-3 py-2 text-sm">{message}</p>}

      <div className="space-y-2">
        <Label htmlFor="resume-name">Name</Label>
        <Input
          id="resume-name"
          value={resume.name}
          onChange={(event) => setResume((current) => ({ ...current, name: event.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="resume-title">Title</Label>
        <Input
          id="resume-title"
          value={resume.title}
          onChange={(event) => setResume((current) => ({ ...current, title: event.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="resume-summary">Summary</Label>
        <Textarea
          id="resume-summary"
          className="min-h-24"
          value={resume.summary}
          onChange={(event) =>
            setResume((current) => ({ ...current, summary: event.target.value }))
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="resume-email">Email</Label>
          <Input
            id="resume-email"
            value={resume.email}
            onChange={(event) =>
              setResume((current) => ({ ...current, email: event.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="resume-location">Location</Label>
          <Input
            id="resume-location"
            value={resume.location}
            onChange={(event) =>
              setResume((current) => ({ ...current, location: event.target.value }))
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="resume-website">Website</Label>
        <Input
          id="resume-website"
          value={resume.website}
          onChange={(event) =>
            setResume((current) => ({ ...current, website: event.target.value }))
          }
        />
      </div>

      <section className="space-y-4 rounded-md border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight">Experiences</h2>
          <Button type="button" size="sm" variant="secondary" onClick={addExperience}>
            Add Experience
          </Button>
        </div>

        <div className="space-y-4">
          {experiences.map((item, index) => (
            <div key={item.localId} className="space-y-3 rounded-md border p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`experience-company-${index}`}>Company</Label>
                  <Input
                    id={`experience-company-${index}`}
                    value={item.company}
                    onChange={(event) => updateExperience(index, "company", event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`experience-role-${index}`}>Role</Label>
                  <Input
                    id={`experience-role-${index}`}
                    value={item.role}
                    onChange={(event) => updateExperience(index, "role", event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`experience-period-${index}`}>Period</Label>
                <Input
                  id={`experience-period-${index}`}
                  value={item.period}
                  onChange={(event) => updateExperience(index, "period", event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`experience-highlights-${index}`}>Highlights (HTML)</Label>
                <Textarea
                  id={`experience-highlights-${index}`}
                  className="min-h-32 font-mono"
                  placeholder="<ul><li>Shipped feature X</li><li>Improved latency by 40%</li></ul>"
                  value={item.highlights}
                  onChange={(event) =>
                    updateExperience(index, "highlights", event.target.value)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Raw HTML is supported and sanitized before rendering on the public resume page.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => moveExperience(index, -1)}
                  disabled={index === 0}
                >
                  Move Up
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => moveExperience(index, 1)}
                  disabled={index === experiences.length - 1}
                >
                  Move Down
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => removeExperience(index)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}

          {experiences.length === 0 && (
            <p className="text-sm text-muted-foreground">No experiences added yet.</p>
          )}
        </div>
      </section>

      <Button type="button" onClick={onSave} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Resume"}
      </Button>
    </div>
  );
}