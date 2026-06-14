import { getCustomers } from "@/lib/queries";
import { CustomersPageClient } from "./customers-client";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await getCustomers();
  return <CustomersPageClient customers={customers} />;
}
