import { AdminDashboardList } from "@/components/admin/admin-dashboard-list";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { hasAdminPasswordConfigured, isAdminAuthenticated } from "@/lib/admin-auth";
import { getPortfolioProjects, getPosts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!hasAdminPasswordConfigured()) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:px-12 md:py-10">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Admin Area</h1>
          <p className="mt-2 text-red-600">
            ADMIN_PASSWORD is not configured. Add it to your environment variables.
          </p>
        </section>
      </main>
    );
  }

  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:px-12 md:py-10">
        <section>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Admin Area</h1>
          <p className="mt-2 text-muted-foreground">Enter password to access admin tools.</p>
        </section>

        <AdminLoginForm />
      </main>
    );
  }

  const posts = getPosts();
  const projects = getPortfolioProjects();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:px-12 md:py-10">
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Admin Area</h1>
        <p className="mt-2 text-muted-foreground">
          Manage resume content, blog posts, and portfolio projects.
        </p>
        </div>
        <AdminLogoutButton />
      </section>

      <AdminDashboardList posts={posts} projects={projects} />
    </main>
  );
}
