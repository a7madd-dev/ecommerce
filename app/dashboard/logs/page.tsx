import { getServiceClient } from "@/lib/supabase";
import { Log } from "@/types";
import { LogsView } from "@/components/admin/logs-view";

export const dynamic = "force-dynamic";

export default async function LogsPage() {
  const supabase = getServiceClient();

  const { data: logs } = await supabase
    .from("logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Activity Logs</h1>
      <LogsView logs={(logs as Log[]) || []} />
    </div>
  );
}
