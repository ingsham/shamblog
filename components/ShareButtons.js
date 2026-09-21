"use client";

import { useState } from "react";

function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7.1l-5.6-7.3L4.2 22H1l8.2-9.3L0.9 2H8.2l5 6.7L18.9 2Zm-1.2 18h1.9L6.4 4h-2l13.3 16Z" />
    </svg>
  );
}
function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 22v-8.4h2.8l.4-3.3h-3.2V8.1c0-1 .3-1.6 1.7-1.6h1.6V3.5c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.7H7.5v3.3h2.8V22h3.2Z" />
    </svg>
  );
}
function LinkedInIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6.94 8.5H3.56V21h3.38V8.5ZM5.25 3c-1.15 0-1.98.82-1.98 1.9 0 1.06.8 1.9 1.94 1.9h.02c1.17 0 1.98-.84 1.98-1.9C7.2 3.82 6.4 3 5.25 3ZM21 21h-3.38v-6.6c0-1.65-.6-2.78-2.07-2.78-1.13 0-1.8.76-2.1 1.5-.1.26-.13.62-.13.99V21H10v-8.5c0-1.5-.02-2.75-.02-3.99h.02l3.38-.01V10c.55-.95 1.5-2.23 3.55-2.23 2.55 0 4.07 1.68 4.07 5.28V21Z" />
    </svg>
  );
}
function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.36A10 10 0 1 0 12 2Zm0 18.1a8.06 8.06 0 0 1-4.1-1.12l-.3-.18-3.08.8.82-3-.2-.31A8.1 8.1 0 1 1 12 20.1Zm4.48-6.06c-.24-.12-1.43-.7-1.65-.79-.22-.08-.38-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1-.37-1.9-1.17-.7-.63-1.18-1.4-1.32-1.64-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.75-1.82-.2-.48-.4-.42-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.13 3.64.58.25 1.03.4 1.38.51.58.18 1.1.16 1.52.1.46-.07 1.43-.58 1.63-1.15.2-.56.2-1.04.14-1.15-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}
function TelegramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.9 4.3 18.6 20c-.24 1.06-.9 1.32-1.82.82l-5-3.68-2.42 2.32c-.27.27-.5.5-1.02.5l.36-5.1 9.3-8.4c.4-.36-.09-.56-.63-.2L6.3 12.5 1.4 11c-1.05-.33-1.07-1.05.22-1.55L20.6 3.1c.88-.32 1.65.2 1.3 1.2Z" />
    </svg>
  );
}
function LinkIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M9 15 15 9M10.5 6 12 4.5a3.5 3.5 0 0 1 5 5L15.5 11M13.5 18l-1.5 1.5a3.5 3.5 0 0 1-5-5L8.5 13" strokeLinecap="round" />
    </svg>
  );
}

export default function ShareButtons({ url, title }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      Icon: XIcon,
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      Icon: FacebookIcon,
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      Icon: LinkedInIcon,
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      Icon: WhatsAppIcon,
    },
    {
      name: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      Icon: TelegramIcon,
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable; ignore
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {links.map(({ name, href, Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${name}`}
          className="h-9 w-9 flex items-center justify-center rounded-full border border-line text-ink hover:border-accent hover:text-accent-ink transition-colors"
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        aria-label="Copy link"
        className="h-9 px-3 flex items-center gap-1.5 rounded-full border border-line text-ink hover:border-accent hover:text-accent-ink transition-colors text-sm"
      >
        <LinkIcon className="h-4 w-4" />
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
