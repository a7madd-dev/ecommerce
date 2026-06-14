import { getServiceClient } from "./supabase";

export async function createLog(
  action: string,
  details: string,
  userId?: string | null
) {
  const supabase = getServiceClient();
  await supabase.from("logs").insert({
    action,
    details,
    user_id: userId ?? null,
  });
}
