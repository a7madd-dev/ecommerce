import { getCampaigns } from "@/lib/queries";
import { CampaignsPageClient } from "./campaigns-client";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();
  return <CampaignsPageClient campaigns={campaigns} />;
}
