"use client";

import { useState, useMemo } from "react";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { OrdersChart } from "@/components/charts/orders-chart";
import { ConversionChart } from "@/components/charts/conversion-chart";
import { TrafficChart } from "@/components/charts/traffic-chart";
import { cn } from "@/lib/utils";
import type { AnalyticsData } from "@/types";

const ranges = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "1Y", days: 365 },
];

export function AnalyticsPageClient({ data }: { data: AnalyticsData[] }) {
  const [selectedRange, setSelectedRange] = useState(30);

  const filteredData = useMemo(
    () => data.slice(-selectedRange),
    [data, selectedRange]
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your store performance
          </p>
        </div>
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {ranges.map((r) => (
            <button
              key={r.label}
              onClick={() => setSelectedRange(r.days)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                selectedRange === r.days
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <RevenueChart data={filteredData} />
        <OrdersChart data={filteredData} />
        <ConversionChart data={filteredData} />
        <TrafficChart />
      </div>
    </div>
  );
}
