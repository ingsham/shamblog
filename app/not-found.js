import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-28 text-center">
      <p className="font-display text-6xl font-bold text-accent-ink">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-2 text-muted">
        The story you&apos;re looking for may have been moved or unpublished.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-accent-ink transition-colors"
      >
        Back to homepage
      </Link>
    </div>
  );
}
