import { getServiceClient } from "@/lib/supabase";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { RecentLogs } from "@/components/admin/recent-logs";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = getServiceClient();

  const [productsRes, ordersRes, logsRes] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("logs").select("*").order("created_at", { ascending: false }).limit(10),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <DashboardStats
        totalProducts={productsRes.count ?? 0}
        totalOrders={ordersRes.count ?? 0}
      />
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <RecentLogs logs={logsRes.data ?? []} />
      </div>
    </div>
  );
}
