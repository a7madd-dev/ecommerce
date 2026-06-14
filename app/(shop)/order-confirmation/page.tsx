import { getServiceClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { OrderConfirmation } from "@/components/shop/order-confirmation";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ id?: string }>;
}

export default async function OrderConfirmationPage({ searchParams }: Props) {
  const params = await searchParams;
  if (!params.id) redirect("/");

  const supabase = getServiceClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", params.id)
    .single();

  if (!order) redirect("/");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <OrderConfirmation order={order} />
    </div>
  );
}
