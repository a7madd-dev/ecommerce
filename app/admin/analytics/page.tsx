import { getAnalytics } from "@/lib/queries";
import { AnalyticsPageClient } from "./analytics-client";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const analyticsData = await getAnalytics();
  return <AnalyticsPageClient data={analyticsData} />;
}
