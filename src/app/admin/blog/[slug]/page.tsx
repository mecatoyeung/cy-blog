import { notFound } from "next/navigation";

import { BlogPostEditor } from "@/components/admin/blog-post-editor";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { hasAdminPasswordConfigured, isAdminAuthenticated } from "@/lib/admin-auth";
import { listBlogPostFiles } from "@/lib/blog-post-files";
import { getPostBySlug } from "@/lib/db";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AdminBlogEditPage({ params }: PageProps) {
  if (!hasAdminPasswordConfigured()) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:px-12 md:py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Admin Area</h1>
        <p className="text-red-600">ADMIN_PASSWORD is not configured. Add it to your environment variables.</p>
      </main>
    );
  }

  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:px-12 md:py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Admin Area</h1>
        <p className="text-muted-foreground">Enter password to access admin tools.</p>
        <AdminLoginForm />
      </main>
    );
  }

  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const postFiles = await listBlogPostFiles(post.slug);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:px-12 md:py-10">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Edit Blog Post</h1>
          <p className="mt-2 text-muted-foreground">{post.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <ButtonLink href="/admin" variant="secondary">Back to Admin</ButtonLink>
        </div>
      </section>

      <Card>
        <CardContent className="pt-6">
          <BlogPostEditor initialPost={post} initialFiles={postFiles} />
        </CardContent>
      </Card>
    </main>
  );
}
