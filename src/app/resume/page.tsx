import { Mail, MapPin } from "lucide-react";

import { RichTextContent } from "@/components/rich-text-content";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getExperiences, getResume } from "@/lib/db";

export const dynamic = "force-static";

export default function ResumePage() {
  const resume = getResume();
  const experiences = getExperiences();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:px-12 md:py-10">
      <section className="rounded-xl border bg-card p-5 sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Introduce myself</h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">{resume?.summary}</p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Badge variant="outline" className="gap-2">
            <Mail size={14} />
            {resume?.email}
          </Badge>
          <Badge variant="outline" className="gap-2">
            <MapPin size={14} />
            {resume?.location}
          </Badge>
          <Badge className="break-all">{resume?.website}</Badge>
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="text-1xl font-semibold tracking-tight sm:text-4xl">Work Experiences</h2>
        {experiences.map((experience) => (
          <Card key={`${experience.company}-${experience.period}`}>
            <CardHeader>
              <CardTitle>{experience.role}</CardTitle>
              <CardDescription>
                {experience.company} · {experience.period}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RichTextContent
                value={experience.highlights}
                className="space-y-3 leading-7 text-muted-foreground"
              />
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
