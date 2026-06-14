"use client";

import { useState } from "react";
import { processCheckout } from "@/app/actions/checkout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function CheckoutForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await processCheckout({
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
    });

    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    } else if (result?.orderId) {
      toast.success("Order placed!");
      window.location.href = `/order-confirmation?id=${result.orderId}`;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Full Name</label>
        <Input name="name" placeholder="John Doe" required className="h-11 rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Phone Number</label>
        <Input name="phone" placeholder="+1 234 567 8900" required className="h-11 rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Delivery Address</label>
        <textarea
          name="address"
          placeholder="Street address, city, state, zip code"
          required
          rows={3}
          className="w-full px-3 py-2 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring resize-none"
        />
      </div>
      <Button type="submit" size="lg" className="w-full rounded-xl h-12" disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            Processing...
          </span>
        ) : (
          "Place Order"
        )}
      </Button>
    </form>
  );
}
