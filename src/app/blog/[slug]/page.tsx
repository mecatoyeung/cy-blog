import { notFound } from "next/navigation";

import { RichTextContent } from "@/components/rich-text-content";
import { Badge } from "@/components/ui/badge";
import { getPostBySlug, getPosts } from "@/lib/db";

export const dynamic = "force-static";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 md:px-12 md:py-10">
      <article className="rounded-xl border bg-card p-5 sm:p-8">
        <div className="mb-4 flex flex-wrap gap-2">
          {post.tags.split(",").map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{post.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">Published {post.published_at}</p>

        <RichTextContent
          value={post.body}
          className="mt-6 space-y-5 break-words leading-7 text-foreground/90 sm:mt-8"
        />
      </article>
    </main>
  );
}
