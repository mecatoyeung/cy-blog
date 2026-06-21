import { ArrowRight, FileText, PenSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPosts, getPortfolioProjects, getResume } from "@/lib/db";
import { richTextToPlainText, truncateWords } from "@/lib/rich-text";

export const dynamic = "force-static";

import "./globals.css";

export default function Home() {
  const resume = getResume();
  const latestPosts = getPosts().slice(0, 3);
  const latestWorks = getPortfolioProjects().slice(0, 3);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:gap-8 md:px-12 md:py-10">
      <section className="rounded-xl border bg-card/95 p-5 shadow-sm sm:p-8">
        
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
          {resume?.name}
        </h1>
        <Badge className="mb-4" variant="outline">
          {resume?.title}
        </Badge>
        <p className="mt-6 max-w-3xl leading-7 text-muted-foreground whitespace-pre-wrap">
          {resume?.summary}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/blog" className="gap-2">
            <PenSquare size={16} />
            Read Blog
          </ButtonLink>
          <ButtonLink href="/portfolio" variant="secondary" className="gap-2">
            <PenSquare size={16} />
            Read Portofolio
          </ButtonLink>
          <ButtonLink href="/resume" variant="secondary"  className="gap-2">
            <FileText size={16} />
            View Resume
          </ButtonLink>
        </div>
      </section>

      <section>
        <h2 className="mb-5 text-2xl font-semibold tracking-tight">The Latest Blog Posts</h2>
        <div className="grid gap-5 md:grid-cols-3">
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
        </div>
      </section>

      <section>
        <h2 className="mb-5 text-2xl font-semibold tracking-tight">The Latest Works</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {latestWorks.map((work) => (
            <Card key={work.slug} className="border-primary/20">
              <CardHeader>
                <CardTitle>{work.title}</CardTitle>
                <CardDescription>{truncateWords(richTextToPlainText(work.description), 40)}</CardDescription>
              </CardHeader>
              <CardContent>
                <ButtonLink href={`/portfolio/${work.slug}`} variant="ghost" size="sm" className="gap-2 px-0">
                  View project
                  <ArrowRight size={14} />
                </ButtonLink>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
