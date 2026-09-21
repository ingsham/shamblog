"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Posts", exact: true },
  { href: "/admin/posts/new", label: "New post" },
  { href: "/admin/comments", label: "Comments" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-ink text-paper"
                : "text-ink hover:bg-line/60"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
