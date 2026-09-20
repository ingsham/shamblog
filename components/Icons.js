const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function IconSearch(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

export function IconSun(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19" />
    </svg>
  );
}

export function IconMoon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M20 14.5A8.2 8.2 0 0 1 9.5 4 8.3 8.3 0 1 0 20 14.5Z" />
    </svg>
  );
}

export function IconHeart({ filled = false, ...props }) {
  return (
    <svg {...base} {...props} fill={filled ? 'currentColor' : 'none'}>
      <path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" />
    </svg>
  );
}

export function IconComment(props) {
  return (
    <svg {...base} {...props}>
      <path d="M20 12.5a7 7 0 0 1-7 7H8l-4 2.5.9-3.6A7 7 0 0 1 11 4.5h2a7 7 0 0 1 7 7Z" />
    </svg>
  );
}

export function IconLink(props) {
  return (
    <svg {...base} {...props}>
      <path d="M10 13.5a3.6 3.6 0 0 0 5.2.3l2.8-2.8a3.6 3.6 0 0 0-5.1-5.1l-1.4 1.4" />
      <path d="M14 10.5a3.6 3.6 0 0 0-5.2-.3L6 13a3.6 3.6 0 0 0 5.1 5.1l1.4-1.4" />
    </svg>
  );
}

export function IconShare(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5v11" />
      <path d="m8 7.2 4-3.7 4 3.7" />
      <path d="M5.5 13v6a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5v-6" />
    </svg>
  );
}

export function IconX(props) {
  return (
    <svg {...base} strokeWidth={0} fill="currentColor" {...props}>
      <path d="M17.5 3h2.9l-6.3 7.2L21.6 21h-5.8l-4.5-5.9L6 21H3.1l6.8-7.7L2.7 3h5.9l4.1 5.4Zm-1 16.2h1.6L8.1 4.7H6.4Z" />
    </svg>
  );
}

export function IconFacebook(props) {
  return (
    <svg {...base} strokeWidth={0} fill="currentColor" {...props}>
      <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.25-1.5 1.5-1.5h1.6V4.3c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.1H7.5v3h2.7V21Z" />
    </svg>
  );
}

export function IconWhatsapp(props) {
  return (
    <svg {...base} strokeWidth={0} fill="currentColor" {...props}>
      <path d="M12 2.8a9.1 9.1 0 0 0-7.8 13.8L3 21.6l5.2-1.3A9.1 9.1 0 1 0 12 2.8Zm0 1.8a7.3 7.3 0 0 1 0 14.6 7.2 7.2 0 0 1-3.7-1l-.3-.2-2.7.7.7-2.6-.2-.3a7.3 7.3 0 0 1 6.2-11.2Zm-3.3 3.8c-.2 0-.4 0-.6.3-.2.3-.8.8-.8 1.9s.9 2.2 1 2.3c.1.2 1.6 2.6 4 3.5 1.9.7 2.3.6 2.7.5.4 0 1.3-.5 1.5-1.1.2-.6.2-1 .1-1.1l-.5-.3-1.6-.8c-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6 6 0 0 1-1.8-1.1 6.7 6.7 0 0 1-1.2-1.6c-.1-.2 0-.3.1-.4l.4-.5.2-.4v-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4Z" />
    </svg>
  );
}

export function IconLinkedin(props) {
  return (
    <svg {...base} strokeWidth={0} fill="currentColor" {...props}>
      <path d="M6.9 20.5H3.6V9.3h3.3ZM5.2 7.9A1.9 1.9 0 1 1 7.1 6a1.9 1.9 0 0 1-1.9 1.9Zm15.3 12.6h-3.3v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.5H9.9V9.3H13v1.5a3.5 3.5 0 0 1 3.1-1.7c3.3 0 4.4 2.2 4.4 5Z" />
    </svg>
  );
}

export function IconTelegram(props) {
  return (
    <svg {...base} strokeWidth={0} fill="currentColor" {...props}>
      <path d="M21.3 4.4 2.9 11.5c-1 .4-1 1 .2 1.3l4.4 1.4 1.7 5.2c.2.6.1.8.7.8.5 0 .7-.2 1-.5l2.2-2.1 4.5 3.3c.8.5 1.4.2 1.6-.8l3-14c.3-1.2-.5-1.8-1.9-1.7ZM7.9 13.6l9.7-6.1c.5-.3.9-.1.6.2l-8.3 7.5-.3 3.4Z" />
    </svg>
  );
}

export function IconReddit(props) {
  return (
    <svg {...base} strokeWidth={0} fill="currentColor" {...props}>
      <path d="M22 11.8a2.3 2.3 0 0 0-3.9-1.6 11.3 11.3 0 0 0-5.7-1.8l1-4.5 3.2.7a1.7 1.7 0 1 0 .2-1.4l-3.9-.8a.7.7 0 0 0-.8.5l-1.2 5.5a11.3 11.3 0 0 0-5.8 1.8A2.3 2.3 0 1 0 2.8 14a4.3 4.3 0 0 0 0 .7c0 3.5 4.1 6.3 9.2 6.3s9.2-2.8 9.2-6.3a4.3 4.3 0 0 0 0-.7 2.3 2.3 0 0 0 .8-2.2ZM7.6 13.6a1.6 1.6 0 1 1 1.6 1.6 1.6 1.6 0 0 1-1.6-1.6Zm8.6 4.1a5.9 5.9 0 0 1-4.2 1.3 5.9 5.9 0 0 1-4.2-1.3.5.5 0 1 1 .7-.7 5 5 0 0 0 3.5 1 5 5 0 0 0 3.5-1 .5.5 0 1 1 .7.7Zm-.4-2.5a1.6 1.6 0 1 1 1.6-1.6 1.6 1.6 0 0 1-1.6 1.6Z" />
    </svg>
  );
}

export function IconMail(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m4 7 8 5.5L20 7" />
    </svg>
  );
}

export function IconEye(props) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

export function IconMenu(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconPlus(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconArrow(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h13M13 6.5 18.5 12 13 17.5" />
    </svg>
  );
}
