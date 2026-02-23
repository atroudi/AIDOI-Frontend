import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { TopBar } from "@/components/layout/top-bar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />

      {/* Main content area */}
      <div className="ml-60">
        <TopBar />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
