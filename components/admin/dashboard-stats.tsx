import { Package, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  totalProducts: number;
  totalOrders: number;
}

export function DashboardStats({ totalProducts, totalOrders }: Props) {
  const stats = [
    {
      label: "Total Products",
      value: totalProducts,
      icon: Package,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
      color: "text-green-600 bg-green-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {stats.map((stat) => (
        <Card key={stat.label} className="py-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}
              >
                <stat.icon className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
