import { getCustomers } from "@/lib/queries";
import { CustomersPageClient } from "./customers-client";

export default async function AdminCustomersPage() {
  const customers = await getCustomers();
  return <CustomersPageClient customers={customers} />;
}
