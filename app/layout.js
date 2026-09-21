import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "SHAM";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Stories worth your time`,
    template: `%s · ${siteName}`,
  },
  description:
    "SHAM is an independent publication covering ideas, culture and the news that matters — written for curious readers.",
  openGraph: {
    siteName,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
