"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CustomField } from "@/types";

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState("Store");
  const [storeDesc, setStoreDesc] = useState("Premium products crafted for modern living");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("America/New_York");

  const [customFields, setCustomFields] = useState<CustomField[]>([
    { id: "cf-1", label: "Engraving Text", type: "text", required: false },
    { id: "cf-2", label: "Gift Wrap Color", type: "select", required: false, options: ["Gold", "Silver", "Red", "Blue"] },
  ]);

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);

  const addField = () => {
    setCustomFields((prev) => [
      ...prev,
      { id: `cf-${Date.now()}`, label: "", type: "text", required: false },
    ]);
  };

  const removeField = (i: number) => {
    setCustomFields((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateField = (i: number, updates: Partial<CustomField>) => {
    setCustomFields((prev) => {
      const copy = [...prev];
      copy[i] = { ...copy[i], ...updates };
      return copy;
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your store preferences
        </p>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* Store Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Store Settings</CardTitle>
            <CardDescription>General store configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Store Name</label>
              <Input
                className="mt-1.5"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="mt-1.5 w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={storeDesc}
                onChange={(e) => setStoreDesc(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Currency</label>
                <select
                  className="mt-1.5 w-full h-9 rounded-md border bg-background px-3 text-sm"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (&euro;)</option>
                  <option value="GBP">GBP (&pound;)</option>
                  <option value="CAD">CAD (C$)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Timezone</label>
                <select
                  className="mt-1.5 w-full h-9 rounded-md border bg-background px-3 text-sm"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="America/New_York">Eastern (ET)</option>
                  <option value="America/Chicago">Central (CT)</option>
                  <option value="America/Denver">Mountain (MT)</option>
                  <option value="America/Los_Angeles">Pacific (PT)</option>
                  <option value="Europe/London">GMT</option>
                  <option value="Europe/Paris">CET</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Product Fields */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Custom Product Fields</CardTitle>
                <CardDescription className="mt-1">
                  Define additional fields for product customization
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg gap-1" onClick={addField}>
                <Plus className="size-3.5" /> Add Field
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {customFields.map((field, i) => (
              <div key={field.id} className="flex gap-3 items-start p-3 bg-muted/50 rounded-xl">
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Field label"
                      value={field.label}
                      onChange={(e) => updateField(i, { label: e.target.value })}
                    />
                    <select
                      className="h-9 rounded-md border bg-background px-3 text-sm"
                      value={field.type}
                      onChange={(e) =>
                        updateField(i, { type: e.target.value as CustomField["type"] })
                      }
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="select">Select</option>
                      <option value="color">Color</option>
                      <option value="textarea">Textarea</option>
                    </select>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) =>
                          updateField(i, { required: e.target.checked })
                        }
                        className="rounded"
                      />
                      Required
                    </label>
                  </div>
                  {field.type === "select" && (
                    <Input
                      placeholder="Options (comma separated): Gold, Silver, Red"
                      value={field.options?.join(", ") || ""}
                      onChange={(e) =>
                        updateField(i, {
                          options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        })
                      }
                    />
                  )}
                </div>
                <Button variant="ghost" size="icon-xs" onClick={() => removeField(i)}>
                  <X className="size-3.5" />
                </Button>
              </div>
            ))}
            {customFields.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No custom fields configured. Click &ldquo;Add Field&rdquo; to get started.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Email Notifications", desc: "Receive email updates about store activity", value: emailNotifs, setter: setEmailNotifs },
              { label: "Order Updates", desc: "Get notified when orders change status", value: orderUpdates, setter: setOrderUpdates },
              { label: "Low Stock Alerts", desc: "Alert when product stock falls below threshold", value: lowStockAlerts, setter: setLowStockAlerts },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <button
                  onClick={() => item.setter(!item.value)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    item.value ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      item.value ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button size="lg" className="rounded-xl">
          Save Settings
        </Button>
      </div>
    </div>
  );
}
