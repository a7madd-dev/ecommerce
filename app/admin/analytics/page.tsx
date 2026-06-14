import { getAnalytics } from "@/lib/queries";
import { AnalyticsPageClient } from "./analytics-client";

export default async function AnalyticsPage() {
  const analyticsData = await getAnalytics();
  return <AnalyticsPageClient data={analyticsData} />;
}
