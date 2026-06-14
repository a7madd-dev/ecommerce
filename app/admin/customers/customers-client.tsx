"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Customer } from "@/types";

const statusStyles: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  vip: "bg-purple-50 text-purple-700",
  inactive: "bg-gray-100 text-gray-600",
};

export function CustomersPageClient({ customers }: { customers: Customer[] }) {
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-muted-foreground mt-1">
            {customers.length} total customers
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card className="py-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Orders</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Spent</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {customer.avatar}
                        </div>
                        <span className="text-sm font-medium">{customer.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{customer.email}</td>
                    <td className="p-4 text-sm">{customer.total_orders}</td>
                    <td className="p-4 text-sm font-medium">${customer.total_spent.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium uppercase", statusStyles[customer.status])}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{customer.joined_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
