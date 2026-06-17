import { Badge } from "@/components/ui/badge";
import { Carousel } from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextContent } from "@/components/rich-text-content";
import { getPortfolioProjects } from "@/lib/db";

export const dynamic = "force-static";

export default function PortfolioPage() {
  const projects = getPortfolioProjects();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:px-12 md:py-10">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Portfolio</h1>
        <p className="mt-2 text-muted-foreground">
          A selection of projects I have designed, built, and shipped.
        </p>
      </section>

      <section className="grid gap-6">
        {projects.map((project) => (
          <Card key={project.slug} className="overflow-hidden">
            {project.media.length > 0 && (
              <Carousel media={project.media} title={project.title} />
            )}
            <CardHeader>
              <div className="flex flex-wrap gap-2">
                {project.tags.split(",").map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
              <CardTitle className="mt-1 text-xl">{project.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextContent
                value={project.description}
                className="space-y-4 leading-7 text-muted-foreground"
              />
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
