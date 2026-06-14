"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Trophy,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  MousePointerClick,
  ArrowUp,
  ArrowDown,
  Crown,
  Eye,
  Rocket,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Campaign } from "@/types";

const COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899", "#06B6D4", "#84CC16"];

export function CampaignsPageClient({ campaigns: initialCampaigns }: { campaigns: Campaign[] }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const deleteCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    if (selectedCampaign?.id === id) setSelectedCampaign(null);
  };

  // Derived analytics
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
  const totalOrders = campaigns.reduce((s, c) => s + c.orders, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const avgConversion = campaigns.length > 0
    ? campaigns.reduce((s, c) => s + c.conversion_rate, 0) / campaigns.length
    : 0;

  // Winner = highest ROI
  const winner = useMemo(
    () => campaigns.length > 0 ? campaigns.reduce((best, c) => (c.roi > best.roi ? c : best), campaigns[0]) : null,
    [campaigns]
  );

  // Revenue by campaign chart data
  const revenueBycamp = campaigns
    .map((c) => ({ name: c.name.length > 14 ? c.name.slice(0, 14) + "…" : c.name, revenue: c.revenue, roi: c.roi, fullName: c.name }))
    .sort((a, b) => b.revenue - a.revenue);

  // Channel distribution
  const channelData = useMemo(() => {
    const map: Record<string, number> = {};
    campaigns.forEach((c) => {
      map[c.channel] = (map[c.channel] || 0) + c.revenue;
    });
    return Object.entries(map).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [campaigns]);

  // ROI comparison
  const roiData = campaigns
    .map((c) => ({ name: c.name.length > 12 ? c.name.slice(0, 12) + "…" : c.name, roi: c.roi, fullName: c.name }))
    .sort((a, b) => b.roi - a.roi);

  // Conversion rate comparison
  const conversionData = campaigns
    .map((c) => ({
      name: c.name.length > 12 ? c.name.slice(0, 12) + "…" : c.name,
      conversionRate: c.conversion_rate,
      fullName: c.name,
    }))
    .sort((a, b) => b.conversionRate - a.conversionRate);

  // Radar data for winner comparison (normalized 0-100)
  const radarData = useMemo(() => {
    if (!winner) return [];
    const maxRev = Math.max(...campaigns.map((c) => c.revenue));
    const maxROI = Math.max(...campaigns.map((c) => c.roi));
    const maxConv = Math.max(...campaigns.map((c) => c.conversion_rate));
    const maxAOV = Math.max(...campaigns.map((c) => c.average_order_value));
    const maxUsage = Math.max(...campaigns.map((c) => c.usage_count / c.max_usage));
    return [
      { metric: "Revenue", value: Math.round((winner.revenue / maxRev) * 100) },
      { metric: "ROI", value: Math.round((winner.roi / maxROI) * 100) },
      { metric: "Conversion", value: Math.round((winner.conversion_rate / maxConv) * 100) },
      { metric: "AOV", value: Math.round((winner.average_order_value / maxAOV) * 100) },
      { metric: "Usage Rate", value: Math.round(((winner.usage_count / winner.max_usage) / maxUsage) * 100) },
    ];
  }, [winner, campaigns]);

  // Selected campaign daily performance
  const dailyData = selectedCampaign?.daily_stats || winner?.daily_stats || [];

  const getStatusBadge = (campaign: Campaign) => {
    const now = new Date();
    const end = new Date(campaign.end_date);
    const start = new Date(campaign.start_date);
    if (!campaign.is_active || end < now) {
      return <Badge variant="destructive" className="text-[10px]">Expired</Badge>;
    }
    if (start > now) {
      return <Badge variant="outline" className="text-[10px] text-yellow-700 border-yellow-300 bg-yellow-50">Scheduled</Badge>;
    }
    return <Badge variant="outline" className="text-[10px] text-green-700 border-green-300 bg-green-50">Active</Badge>;
  };

  const activeCampaign = selectedCampaign || winner;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Performance analytics & management
          </p>
        </div>
        <Button asChild className="rounded-xl gap-2">
          <Link href="/admin/campaigns/create">
            <Rocket className="size-4" /> Start New Campaign
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-600 bg-green-50", change: "+18.4%" },
          { label: "Total Orders", value: totalOrders.toLocaleString(), icon: ShoppingBag, color: "text-blue-600 bg-blue-50", change: "+12.1%" },
          { label: "Total Clicks", value: totalClicks.toLocaleString(), icon: MousePointerClick, color: "text-purple-600 bg-purple-50", change: "+22.7%" },
          { label: "Avg Conversion", value: `${avgConversion.toFixed(1)}%`, icon: TrendingUp, color: "text-orange-600 bg-orange-50", change: "+1.2%" },
        ].map((stat) => (
          <Card key={stat.label} className="py-0">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-lg sm:text-2xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUp className="size-3 text-green-600" />
                    <span className="text-xs font-medium text-green-600">{stat.change}</span>
                  </div>
                </div>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", stat.color)}>
                  <stat.icon className="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Winner Banner */}
      {winner && (
        <div className="mb-8 bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 border border-yellow-200 rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-lg">
                <Trophy className="size-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{winner.name}</h3>
                  <Crown className="size-4 text-yellow-600" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Top performer with {winner.roi}% ROI &middot; ${winner.revenue.toLocaleString()} revenue &middot; {winner.conversion_rate}% conversion
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-700">{winner.roi}%</p>
                <p className="text-xs text-muted-foreground">ROI</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-700">${winner.average_order_value}</p>
                <p className="text-xs text-muted-foreground">AOV</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-700">{winner.conversion_rate}%</p>
                <p className="text-xs text-muted-foreground">Conv.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue by Campaign */}
        <Card className="py-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue by Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueBycamp} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "12px" }}
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ""}
                  />
                  <Bar dataKey="revenue" radius={[0, 6, 6, 0]} maxBarSize={28}>
                    {revenueBycamp.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* ROI Comparison */}
        <Card className="py-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">ROI Comparison (%)</CardTitle>
            <CardDescription>Higher ROI = more efficient spend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roiData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={50} />
                  <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "12px" }}
                    formatter={(value) => [`${value}%`, "ROI"]}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ""}
                  />
                  <Bar dataKey="roi" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {roiData.map((entry, i) => (
                      <Cell key={i} fill={entry.fullName === winner?.name ? "#F59E0B" : "#3B82F6"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Channel Revenue Distribution */}
        <Card className="py-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={channelData} cx="50%" cy="45%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                    {channelData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "12px" }}
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                  />
                  <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(value) => <span style={{ color: "#6b7280", fontSize: "12px" }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate Comparison */}
        <Card className="py-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Conversion Rate (%)</CardTitle>
            <CardDescription>Click-to-order conversion by campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={50} />
                  <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "12px" }}
                    formatter={(value) => [`${value}%`, "Conversion"]}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ""}
                  />
                  <Bar dataKey="conversionRate" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {conversionData.map((entry, i) => (
                      <Cell key={i} fill={entry.fullName === winner?.name ? "#F59E0B" : "#10B981"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Winner Radar Chart */}
        <Card className="py-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="size-4 text-yellow-500" /> Winner Profile
            </CardTitle>
            <CardDescription>{winner?.name} — normalized performance scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="value" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Performance Trend */}
        <Card className="py-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Daily Revenue Trend</CardTitle>
                <CardDescription>
                  {activeCampaign?.name || "Select a campaign"}
                </CardDescription>
              </div>
              {selectedCampaign && (
                <Button variant="ghost" size="xs" onClick={() => setSelectedCampaign(null)}>
                  Show Winner
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })}
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "12px" }}
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString("en", { month: "long", day: "numeric" })}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} fill="url(#dailyGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign List Table */}
      <Card className="py-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>All Campaigns</CardTitle>
            <p className="text-sm text-muted-foreground">{campaigns.length} campaigns</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Campaign</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Code</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Revenue</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Orders</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Conv.</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">ROI</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Channel</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Usage</th>
                  <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => {
                  const isWinner = campaign.id === winner?.id;
                  const isSelected = selectedCampaign?.id === campaign.id;
                  return (
                    <tr
                      key={campaign.id}
                      onClick={() => setSelectedCampaign(campaign)}
                      className={cn(
                        "border-b last:border-0 transition-colors cursor-pointer",
                        isSelected ? "bg-primary/5" : "hover:bg-muted/50",
                        isWinner && "bg-yellow-50/50"
                      )}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {isWinner && <Trophy className="size-3.5 text-yellow-500 flex-shrink-0" />}
                          <span className="text-sm font-medium">{campaign.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{campaign.code}</code>
                      </td>
                      <td className="p-4">{getStatusBadge(campaign)}</td>
                      <td className="p-4 text-sm font-semibold">${campaign.revenue.toLocaleString()}</td>
                      <td className="p-4 text-sm">{campaign.orders}</td>
                      <td className="p-4">
                        <span className={cn(
                          "text-sm font-medium",
                          campaign.conversion_rate >= 5 ? "text-green-600" : campaign.conversion_rate >= 3 ? "text-blue-600" : "text-muted-foreground"
                        )}>
                          {campaign.conversion_rate}%
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <span className={cn(
                            "text-sm font-bold",
                            campaign.roi >= 500 ? "text-green-600" : campaign.roi >= 300 ? "text-blue-600" : "text-muted-foreground"
                          )}>
                            {campaign.roi}%
                          </span>
                          {campaign.roi >= 500 && <ArrowUp className="size-3 text-green-600" />}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className="text-[10px] capitalize">{campaign.channel}</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.min(100, (campaign.usage_count / campaign.max_usage) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {campaign.usage_count}/{campaign.max_usage}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon-xs" title="View details" onClick={() => setSelectedCampaign(campaign)}>
                            <Eye className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon-xs">
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon-xs" onClick={() => deleteCampaign(campaign.id)}>
                            <Trash2 className="size-3.5 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Selected Campaign Detail Panel */}
      {selectedCampaign && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle>{selectedCampaign.name}</CardTitle>
                {selectedCampaign.id === winner?.id && (
                  <Badge className="gap-1 bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">
                    <Trophy className="size-3" /> Winner
                  </Badge>
                )}
                {getStatusBadge(selectedCampaign)}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedCampaign(null)}>
                Close
              </Button>
            </div>
            <CardDescription>{selectedCampaign.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { label: "Revenue", value: `$${selectedCampaign.revenue.toLocaleString()}` },
                { label: "Orders", value: selectedCampaign.orders.toString() },
                { label: "AOV", value: `$${selectedCampaign.average_order_value}` },
                { label: "Conversion", value: `${selectedCampaign.conversion_rate}%` },
                { label: "ROI", value: `${selectedCampaign.roi}%` },
                { label: "Clicks", value: selectedCampaign.clicks.toLocaleString() },
              ].map((stat) => (
                <div key={stat.label} className="p-3 bg-muted/50 rounded-xl text-center">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold mt-0.5">{stat.value}</p>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Code:</span>{" "}
                <code className="font-mono font-medium">{selectedCampaign.code}</code>
              </div>
              <div>
                <span className="text-muted-foreground">Discount:</span>{" "}
                <span className="font-medium">{selectedCampaign.discount_percent}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Channel:</span>{" "}
                <span className="font-medium capitalize">{selectedCampaign.channel}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Audience:</span>{" "}
                <span className="font-medium">{selectedCampaign.target_audience}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Min Order:</span>{" "}
                <span className="font-medium">${selectedCampaign.min_order_value}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Period:</span>{" "}
                <span className="font-medium">{selectedCampaign.start_date} — {selectedCampaign.end_date}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Usage:</span>{" "}
                <span className="font-medium">{selectedCampaign.usage_count} / {selectedCampaign.max_usage}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
