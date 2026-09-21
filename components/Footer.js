const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "SHAM";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line mt-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-display text-xl font-semibold text-ink">
            {siteName}
          </p>
          <p className="text-sm text-muted mt-1 max-w-sm">
            Independent stories on ideas, culture and the news that matters.
          </p>
        </div>
        <p className="text-sm text-muted">
          &copy; {year} {siteName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
