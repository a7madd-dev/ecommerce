import { getServiceClient } from "@/lib/supabase";
import { Order } from "@/types";
import { OrdersTable } from "@/components/admin/orders-table";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const supabase = getServiceClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <OrdersTable orders={(orders as Order[]) || []} />
    </div>
  );
}
