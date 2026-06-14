"use client";

import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Eye,
  ArrowUp,
  Package,
  BarChart3,
  Megaphone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Revenue", value: "$48,259", change: "+12.5%", icon: DollarSign, color: "text-green-600 bg-green-50" },
  { label: "Orders", value: "1,247", change: "+8.2%", icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
  { label: "Conversion Rate", value: "3.6%", change: "+0.4%", icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
  { label: "Visitors", value: "24,891", change: "+15.3%", icon: Eye, color: "text-orange-600 bg-orange-50" },
];

const recentOrders = [
  { id: "ORD-7291", customer: "Sarah Chen", amount: "$342.00", status: "delivered", date: "Feb 14, 2024" },
  { id: "ORD-7290", customer: "Marcus Johnson", amount: "$189.00", status: "shipped", date: "Feb 13, 2024" },
  { id: "ORD-7289", customer: "Emily Rodriguez", amount: "$567.50", status: "processing", date: "Feb 13, 2024" },
  { id: "ORD-7288", customer: "David Kim", amount: "$129.99", status: "pending", date: "Feb 12, 2024" },
  { id: "ORD-7287", customer: "Rachel Foster", amount: "$445.00", status: "delivered", date: "Feb 12, 2024" },
];

const statusColors: Record<string, string> = {
  delivered: "bg-green-50 text-green-700",
  shipped: "bg-purple-50 text-purple-700",
  processing: "bg-blue-50 text-blue-700",
  pending: "bg-yellow-50 text-yellow-700",
};

export default function AdminDashboard() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back. Here&apos;s what&apos;s happening today.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="py-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUp className="size-3 text-green-600" />
                    <span className="text-xs font-medium text-green-600">
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    stat.color
                  )}
                >
                  <stat.icon className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Order
                    </th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-3 text-sm font-medium">{order.id}</td>
                      <td className="py-3 text-sm">{order.customer}</td>
                      <td className="py-3 text-sm font-medium">
                        {order.amount}
                      </td>
                      <td className="py-3">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                            statusColors[order.status]
                          )}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {order.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start gap-2 rounded-xl">
              <Link href="/admin/campaigns/create">
                <Megaphone className="size-4" /> Start New Campaign
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start gap-2 rounded-xl"
            >
              <Link href="/admin/products">
                <Package className="size-4" /> Add Product
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start gap-2 rounded-xl"
            >
              <Link href="/admin/analytics">
                <BarChart3 className="size-4" /> View Analytics
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start gap-2 rounded-xl"
            >
              <Link href="/admin/campaigns">
                <TrendingUp className="size-4" /> Campaign Performance
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start gap-2 rounded-xl"
            >
              <Link href="/admin/orders">
                <ShoppingBag className="size-4" /> Manage Orders
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start gap-2 rounded-xl"
            >
              <Link href="/admin/customers">
                <Eye className="size-4" /> View Customers
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
