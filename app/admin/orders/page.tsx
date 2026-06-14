"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type OrderStatus = "all" | "pending" | "processing" | "shipped" | "delivered";

const mockOrders = [
  { id: "ORD-7291", customer: "Sarah Chen", items: 3, total: 342.0, status: "delivered", payment: "paid", date: "Feb 14, 2024" },
  { id: "ORD-7290", customer: "Marcus Johnson", items: 1, total: 189.0, status: "shipped", payment: "paid", date: "Feb 13, 2024" },
  { id: "ORD-7289", customer: "Emily Rodriguez", items: 4, total: 567.5, status: "processing", payment: "paid", date: "Feb 13, 2024" },
  { id: "ORD-7288", customer: "David Kim", items: 1, total: 129.99, status: "pending", payment: "unpaid", date: "Feb 12, 2024" },
  { id: "ORD-7287", customer: "Rachel Foster", items: 2, total: 445.0, status: "delivered", payment: "paid", date: "Feb 12, 2024" },
  { id: "ORD-7286", customer: "Alex Tanaka", items: 1, total: 179.99, status: "shipped", payment: "paid", date: "Feb 11, 2024" },
  { id: "ORD-7285", customer: "Isabella Rossi", items: 2, total: 270.0, status: "cancelled", payment: "refunded", date: "Feb 11, 2024" },
  { id: "ORD-7284", customer: "Oliver Webb", items: 5, total: 891.0, status: "delivered", payment: "paid", date: "Feb 10, 2024" },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  processing: "bg-blue-50 text-blue-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

const paymentColors: Record<string, string> = {
  paid: "bg-green-50 text-green-700",
  unpaid: "bg-yellow-50 text-yellow-700",
  refunded: "bg-gray-100 text-gray-600",
  failed: "bg-red-50 text-red-700",
};

const tabs: { label: string; value: OrderStatus }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
];

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus>("all");

  const filtered =
    activeTab === "all"
      ? mockOrders
      : mockOrders.filter((o) => o.status === activeTab);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground mt-1">
          Manage and track customer orders
        </p>
      </div>

      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit mb-6 overflow-x-auto max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.value
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="py-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Order</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Items</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="p-4 text-sm font-medium">{order.id}</td>
                    <td className="p-4 text-sm">{order.customer}</td>
                    <td className="p-4 text-sm text-muted-foreground">{order.items}</td>
                    <td className="p-4 text-sm font-medium">${order.total.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize", statusColors[order.status])}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize", paymentColors[order.payment])}>
                        {order.payment}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{order.date}</td>
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
