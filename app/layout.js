import './globals.css';
import { siteUrl } from '@/lib/utils';

export const metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: 'SHAM — reporting worth your time',
    template: '%s · SHAM',
  },
  description:
    'SHAM is an independent publication covering world affairs, business, technology, culture and sport, with reporting that explains why it matters.',
  applicationName: 'SHAM',
  openGraph: {
    type: 'website',
    siteName: 'SHAM',
    title: 'SHAM — reporting worth your time',
    description: 'Independent reporting on world affairs, business, technology, culture and sport.',
    url: '/',
  },
  twitter: { card: 'summary_large_image', title: 'SHAM', description: 'Reporting worth your time.' },
  icons: { icon: '/icon.svg' },
  alternates: { types: { 'application/rss+xml': '/rss.xml' } },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3f4ef' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1219' },
  ],
  width: 'device-width',
  initialScale: 1,
};

// Applies the saved theme before first paint so there is no flash of the wrong one.
const THEME_SCRIPT = `try{var t=localStorage.getItem('sham-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..600&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
