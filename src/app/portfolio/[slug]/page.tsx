import { notFound } from "next/navigation";

import { RichTextContent } from "@/components/rich-text-content";
import { Badge } from "@/components/ui/badge";
import { Carousel } from "@/components/ui/carousel";
import { getPortfolioProjectBySlug, getPortfolioProjects } from "@/lib/db";

export const dynamic = "force-static";

type PortfolioProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPortfolioProjects().map((project) => ({ slug: project.slug }));
}

export default async function PortfolioProjectPage({ params }: PortfolioProjectPageProps) {
  const { slug } = await params;
  const project = getPortfolioProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:px-12 md:py-10">
      <article className="rounded-xl border bg-card p-5 sm:p-8">
        <div className="mb-4 flex flex-wrap gap-2">
          {project.tags.split(",").map((tag) => (
            <Badge key={tag} variant="outline">
              {tag.trim()}
            </Badge>
          ))}
        </div>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{project.title}</h1>

        {project.media.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <Carousel media={project.media} title={project.title} />
          </div>
        )}

        <RichTextContent
          value={project.description}
          className="mt-6 space-y-5 break-words leading-7 text-foreground/90 sm:mt-8"
        />
      </article>
    </main>
  );
}
