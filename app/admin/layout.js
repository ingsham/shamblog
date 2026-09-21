export const metadata = {
  title: 'Newsroom',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <div className="admin-shell">{children}</div>;
}
