import { PublicLoginForm } from "@/components/public-login-form";
import { hasUserPasswordConfigured } from "@/lib/user-auth";

export const dynamic = "force-dynamic";

export default function UnlockPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:px-12 md:py-10">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Site Access</h1>
        <p className="mt-2 text-muted-foreground">
          This site is password protected.
        </p>
      </section>

      {hasUserPasswordConfigured() ? (
        <PublicLoginForm />
      ) : (
        <section>
          <p className="text-red-600">
            USER_PASSWORD is not configured. Add it to your environment variables.
          </p>
        </section>
      )}
    </main>
  );
}