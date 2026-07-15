import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="max-w-md">
        <h1 className="text-2xl font-semibold text-neutral-950">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-neutral-600">
          The requested page is not available.
        </p>
        <Link
          className="mt-6 inline-flex rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-white"
          href="/"
        >
          Back home
        </Link>
      </section>
    </main>
  );
}
