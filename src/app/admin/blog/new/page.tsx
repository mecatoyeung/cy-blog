import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { BlogPostCreateForm } from "@/components/admin/blog-post-create-form";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { hasAdminPasswordConfigured, isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminBlogCreatePage() {
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

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:px-12 md:py-10">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Create Blog Post</h1>
          <p className="mt-2 text-muted-foreground">Add a new blog post and publish it to your site.</p>
        </div>
        <div className="flex items-center gap-2">
          <ButtonLink href="/admin" variant="secondary">Back to Admin</ButtonLink>
        </div>
      </section>

      <Card>
        <CardContent className="pt-6">
          <BlogPostCreateForm />
        </CardContent>
      </Card>
    </main>
  );
}
