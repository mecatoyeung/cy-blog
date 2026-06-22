import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { withBasePath } from "@/lib/base-path";
import { getPosts } from "@/lib/db";
import { richTextFirstImage } from "@/lib/rich-text";

export const dynamic = "force-static";

export default function BlogPage() {
  const posts = getPosts();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:px-12 md:py-10">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Blog</h1>
        <p className="mt-2 text-muted-foreground">
          Articles are loaded from SQLite and rendered as static pages during build.
        </p>
      </section>

      <section className="grid gap-4">
        {posts.map((post) => {
          const firstImage = richTextFirstImage(post.body);

          return (
            <Card key={post.slug} className="overflow-hidden">
              <div className="relative aspect-video w-full bg-muted">
                {firstImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    <img
                      src={withBasePath(firstImage.src)}
                      alt={firstImage.alt || `${post.title} preview`}
                      className="h-full w-full object-cover"
                    />
                  </Link>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Preview image unavailable
                  </div>
                )}
              </div>

              <CardHeader>
                <div className="mb-2 flex flex-wrap gap-2">
                  {post.tags.split(",").map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <CardTitle>
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription>{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Published {post.published_at}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </main>
  );
}
