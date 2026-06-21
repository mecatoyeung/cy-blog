import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPortfolioProjects } from "@/lib/db";
import { withBasePath } from "@/lib/base-path";

export const dynamic = "force-static";

export default function PortfolioPage() {
  const projects = getPortfolioProjects();

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:px-12 md:py-10">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Portfolio</h1>
        <p className="mt-2 text-muted-foreground">
          A selection of projects I have designed, built, and shipped.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {projects.map((project) => {
          const coverImage = project.media.find((item) => item.type === "image");

          return (
            <Link key={project.slug} href={`/portfolio/${project.slug}`} className="group block h-full">
              <Card className="h-full overflow-hidden transition group-hover:-translate-y-0.5 group-hover:shadow-lg">
                <div className="relative aspect-video w-full bg-muted">
                  {coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={withBasePath(coverImage.url)}
                      alt={coverImage.alt || `${project.title} preview`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      Preview image unavailable
                    </div>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.split(",").map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
