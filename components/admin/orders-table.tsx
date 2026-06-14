"use client";

import { Order } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateOrderStatus, updatePaymentStatus } from "@/app/actions/admin";
import toast from "react-hot-toast";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
const paymentStatuses = ["unpaid", "paid", "failed", "refunded"];

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  processing: "secondary",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
};

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function handleStatusChange(orderId: string, status: string) {
    const result = await updateOrderStatus(orderId, status);
    if (result.error) toast.error(result.error);
    else toast.success("Status updated");
  }

  async function handlePaymentChange(orderId: string, status: string) {
    const result = await updatePaymentStatus(orderId, status);
    if (result.error) toast.error(result.error);
    else toast.success("Payment status updated");
  }

  if (orders.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No orders yet.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden py-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Order
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Customer
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Total
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Status
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Payment
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Date
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                expanded={expandedId === order.id}
                onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
                onStatusChange={handleStatusChange}
                onPaymentChange={handlePaymentChange}
              />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function OrderRow({
  order,
  expanded,
  onToggle,
  onStatusChange,
  onPaymentChange,
}: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (id: string, s: string) => void;
  onPaymentChange: (id: string, s: string) => void;
}) {
  return (
    <>
      <tr className="hover:bg-muted/30 transition-colors">
        <td className="px-4 py-3 text-sm font-mono">{order.id.slice(0, 8)}</td>
        <td className="px-4 py-3">
          <p className="text-sm font-medium">{order.customer_name}</p>
          <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
        </td>
        <td className="px-4 py-3 text-sm text-right font-medium">
          ${Number(order.total).toFixed(2)}
        </td>
        <td className="px-4 py-3">
          <select
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value)}
            className="text-xs px-2 py-1 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </td>
        <td className="px-4 py-3">
          <select
            value={order.payment_status}
            onChange={(e) => onPaymentChange(order.id, e.target.value)}
            className="text-xs px-2 py-1 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
          >
            {paymentStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </td>
        <td className="px-4 py-3 text-xs text-muted-foreground">
          {new Date(order.created_at).toLocaleDateString()}
        </td>
        <td className="px-4 py-3">
          <button
            onClick={onToggle}
            className="text-muted-foreground hover:text-foreground"
          >
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </td>
      </tr>
      {expanded && order.items && (
        <tr>
          <td colSpan={7} className="px-4 py-3 bg-muted/30">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Address: {order.customer_address}
              </p>
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.product_name} &times; {item.quantity}
                  </span>
                  <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
