"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Megaphone,
  Calendar,
  Percent,
  Tag,
  Users,
  Target,
  DollarSign,
  Hash,
  FileText,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const channelOptions = [
  { value: "email", label: "Email", icon: "📧", desc: "Target your subscriber list" },
  { value: "social", label: "Social Media", icon: "📱", desc: "Instagram, Facebook, TikTok" },
  { value: "paid", label: "Paid Ads", icon: "📢", desc: "Google, Meta, display networks" },
  { value: "affiliate", label: "Affiliate", icon: "🤝", desc: "Partner & influencer programs" },
  { value: "organic", label: "Organic", icon: "🌱", desc: "SEO landing pages & blog" },
];

const audienceOptions = [
  "All Customers",
  "New Signups",
  "VIP Customers",
  "Repeat Buyers",
  "Cart Abandoners",
  "Social Followers",
  "Affiliate Traffic",
  "Search Visitors",
];

export default function CreateCampaignPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    code: "",
    discountPercent: "",
    minOrderValue: "",
    maxUsage: "",
    startDate: "",
    endDate: "",
    channel: "",
    targetAudience: "",
    isActive: true,
    autoApply: false,
    stackable: false,
    freeShipping: false,
    limitPerCustomer: "",
  });

  const [step, setStep] = useState(1);

  const updateForm = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isStep1Valid = form.name && form.code && form.discountPercent;
  const isStep2Valid = form.startDate && form.endDate && form.channel && form.targetAudience;

  const handlePublish = () => {
    router.push("/admin/campaigns");
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild className="rounded-xl">
          <Link href="/admin/campaigns">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Start New Campaign</h1>
          <p className="text-muted-foreground mt-0.5">
            Configure all details for your promotion
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
          <Megaphone className="size-3.5" />
          Draft
        </Badge>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-3 mb-8">
        {[
          { n: 1, label: "Details" },
          { n: 2, label: "Targeting" },
          { n: 3, label: "Review" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-3 flex-1">
            <button
              onClick={() => setStep(s.n)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-1 justify-center",
                step === s.n
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : step > s.n
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                {step > s.n ? "✓" : s.n}
              </span>
              {s.label}
            </button>
            {i < 2 && (
              <div className={cn("h-px w-8 flex-shrink-0", step > s.n ? "bg-primary" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Campaign Details */}
      {step === 1 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5 text-primary" /> Campaign Information
              </CardTitle>
              <CardDescription>Basic details about your promotion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <label className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
                  <Tag className="size-3.5 text-muted-foreground" /> Campaign Name
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="e.g. Summer Clearance 2024"
                  className="h-11"
                />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
                  <FileText className="size-3.5 text-muted-foreground" /> Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  placeholder="Describe the purpose and goals of this campaign..."
                  className="w-full min-h-[100px] rounded-xl border border-input bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="size-5 text-primary" /> Discount Configuration
              </CardTitle>
              <CardDescription>Set up the discount rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
                    <Hash className="size-3.5 text-muted-foreground" /> Promo Code
                  </label>
                  <Input
                    value={form.code}
                    onChange={(e) => updateForm("code", e.target.value.toUpperCase())}
                    placeholder="SUMMER24"
                    className="h-11 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
                    <Percent className="size-3.5 text-muted-foreground" /> Discount Percentage
                  </label>
                  <Input
                    type="number"
                    value={form.discountPercent}
                    onChange={(e) => updateForm("discountPercent", e.target.value)}
                    placeholder="20"
                    min="1"
                    max="100"
                    className="h-11"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
                    <DollarSign className="size-3.5 text-muted-foreground" /> Minimum Order Value
                  </label>
                  <Input
                    type="number"
                    value={form.minOrderValue}
                    onChange={(e) => updateForm("minOrderValue", e.target.value)}
                    placeholder="0 (no minimum)"
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
                    <Users className="size-3.5 text-muted-foreground" /> Max Total Uses
                  </label>
                  <Input
                    type="number"
                    value={form.maxUsage}
                    onChange={(e) => updateForm("maxUsage", e.target.value)}
                    placeholder="1000"
                    className="h-11"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
                  <Hash className="size-3.5 text-muted-foreground" /> Limit Per Customer
                </label>
                <Input
                  type="number"
                  value={form.limitPerCustomer}
                  onChange={(e) => updateForm("limitPerCustomer", e.target.value)}
                  placeholder="1 (leave empty for unlimited)"
                  className="h-11 max-w-xs"
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-sm font-medium">Additional Options</p>
                {[
                  { key: "autoApply", label: "Auto-apply at checkout", desc: "Discount applies automatically when conditions are met" },
                  { key: "stackable", label: "Stackable with other codes", desc: "Allow combining with other active promotions" },
                  { key: "freeShipping", label: "Include free shipping", desc: "Waive shipping fees on qualifying orders" },
                ].map((opt) => (
                  <label
                    key={opt.key}
                    className="flex items-start gap-3 p-3 rounded-xl border hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form[opt.key as keyof typeof form] as boolean}
                      onChange={(e) => updateForm(opt.key, e.target.checked)}
                      className="rounded mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              size="lg"
              className="rounded-xl px-8"
              disabled={!isStep1Valid}
              onClick={() => setStep(2)}
            >
              Next: Targeting
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Targeting & Schedule */}
      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5 text-primary" /> Schedule
              </CardTitle>
              <CardDescription>When should this campaign run?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Start Date</label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => updateForm("startDate", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">End Date</label>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => updateForm("endDate", e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => updateForm("isActive", e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Activate immediately on start date</span>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="size-5 text-primary" /> Channel
              </CardTitle>
              <CardDescription>Where will you distribute this campaign?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {channelOptions.map((ch) => (
                  <button
                    key={ch.value}
                    onClick={() => updateForm("channel", ch.value)}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-xl border text-left transition-all",
                      form.channel === ch.value
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "hover:border-primary/30 hover:bg-muted/50"
                    )}
                  >
                    <span className="text-2xl">{ch.icon}</span>
                    <div>
                      <p className="text-sm font-semibold">{ch.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{ch.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="size-5 text-primary" /> Target Audience
              </CardTitle>
              <CardDescription>Who should see this campaign?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {audienceOptions.map((aud) => (
                  <button
                    key={aud}
                    onClick={() => updateForm("targetAudience", aud)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                      form.targetAudience === aud
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:border-primary/30 hover:bg-muted/50"
                    )}
                  >
                    {aud}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" size="lg" className="rounded-xl" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              size="lg"
              className="rounded-xl px-8"
              disabled={!isStep2Valid}
              onClick={() => setStep(3)}
            >
              Next: Review
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Summary</CardTitle>
              <CardDescription>Review all details before publishing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                {[
                  { label: "Campaign Name", value: form.name },
                  { label: "Promo Code", value: form.code, mono: true },
                  { label: "Discount", value: `${form.discountPercent}%` },
                  { label: "Min. Order", value: form.minOrderValue ? `$${form.minOrderValue}` : "None" },
                  { label: "Max Uses", value: form.maxUsage || "Unlimited" },
                  { label: "Per Customer", value: form.limitPerCustomer || "Unlimited" },
                  { label: "Start Date", value: form.startDate },
                  { label: "End Date", value: form.endDate },
                  { label: "Channel", value: channelOptions.find((c) => c.value === form.channel)?.label || "—" },
                  { label: "Audience", value: form.targetAudience || "—" },
                  { label: "Auto-apply", value: form.autoApply ? "Yes" : "No" },
                  { label: "Stackable", value: form.stackable ? "Yes" : "No" },
                  { label: "Free Shipping", value: form.freeShipping ? "Yes" : "No" },
                  { label: "Status", value: form.isActive ? "Active on start" : "Draft" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between py-2 border-b border-dashed">
                    <span className="text-sm text-muted-foreground">{row.label}</span>
                    <span className={cn("text-sm font-medium", "mono" in row && row.mono && "font-mono")}>{row.value}</span>
                  </div>
                ))}
              </div>
              {form.description && (
                <div className="mt-4 p-3 bg-muted/50 rounded-xl">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{form.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" size="lg" className="rounded-xl" onClick={() => setStep(2)}>
              Back
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="rounded-xl">
                Save as Draft
              </Button>
              <Button size="lg" className="rounded-xl px-8 gap-2" onClick={handlePublish}>
                <Megaphone className="size-4" /> Publish Campaign
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
