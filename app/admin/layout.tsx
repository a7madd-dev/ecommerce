import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata = {
  title: "Admin — Store",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted/30 overflow-x-hidden">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-4 pt-18 lg:pt-8 lg:p-8">{children}</main>
    </div>
  );
}
