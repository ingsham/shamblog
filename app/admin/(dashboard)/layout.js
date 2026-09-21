import { getAdminSession } from "@/lib/auth";
import Sidebar from "@/components/admin/Sidebar";
import LogoutButton from "@/components/admin/LogoutButton";

export const metadata = { title: "Admin dashboard" };

export default async function AdminDashboardLayout({ children }) {
  const session = await getAdminSession();

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
      <div className="flex items-center justify-between border-b border-line pb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">
            Admin dashboard
          </h1>
          {session?.sub && (
            <p className="text-sm text-muted mt-1">
              Signed in as {session.sub}
            </p>
          )}
        </div>
        <LogoutButton />
      </div>
      <div className="mt-8 grid lg:grid-cols-[200px_1fr] gap-8">
        <Sidebar />
        <div>{children}</div>
      </div>
    </div>
  );
}
