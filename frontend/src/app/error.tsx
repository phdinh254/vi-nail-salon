"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="max-w-md">
        <h1 className="text-2xl font-semibold text-neutral-950">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm text-neutral-600">{error.message}</p>
        <button
          className="mt-6 rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-white"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
