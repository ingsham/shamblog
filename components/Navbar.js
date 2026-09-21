import Link from "next/link";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "SHAM";

export default function Navbar() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex items-center justify-between h-12 text-xs text-muted">
          <span>{today}</span>
          <Link href="/admin" className="hover:text-ink transition-colors">
            Admin
          </Link>
        </div>
        <div className="flex items-center justify-between border-t border-line py-5">
          <Link
            href="/"
            className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink"
          >
            {siteName}
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="hover:text-accent-ink transition-colors">
              Home
            </Link>
            <Link
              href="/#latest"
              className="hidden sm:inline hover:text-accent-ink transition-colors"
            >
              Latest
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
