import { ArrowRight, FileText, PenSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPosts, getResume } from "@/lib/db";

export const dynamic = "force-static";

export default function Home() {
  const resume = getResume();
  const latestPosts = getPosts().slice(0, 2);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:gap-8 md:px-12 md:py-10">
      <section className="rounded-xl border bg-card/95 p-5 shadow-sm sm:p-8">
        <Badge className="mb-4" variant="outline">
          Software Architect
        </Badge>
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
          {resume?.name ?? "Engineer"}
        </h1>
        <p className="mt-2 text-base text-muted-foreground sm:text-xl">{resume?.title}</p>
        <p className="mt-6 max-w-3xl leading-7 text-muted-foreground">{resume?.summary}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/resume" className="gap-2">
            <FileText size={16} />
            View Resume
          </ButtonLink>
          <ButtonLink href="/blog" variant="secondary" className="gap-2">
            <PenSquare size={16} />
            Read Blog
          </ButtonLink>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {latestPosts.map((post) => (
          <Card key={post.slug} className="border-primary/20">
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
              <CardDescription>{post.excerpt}</CardDescription>
            </CardHeader>
            <CardContent>
              <ButtonLink href={`/blog/${post.slug}`} variant="ghost" size="sm" className="gap-2 px-0">
                Continue reading
                <ArrowRight size={14} />
              </ButtonLink>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
