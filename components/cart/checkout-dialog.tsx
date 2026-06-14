"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "./cart-context";
import { processCheckout } from "@/app/actions/checkout";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  MapPin,
  Phone,
  User,
  Package,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

type Step = "info" | "review";

export function CheckoutDialog() {
  const { items, total, isCheckoutOpen, closeCheckout, showSuccess } =
    useCart();

  const [step, setStep] = useState<Step>("info");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleClose() {
    closeCheckout();
    // Reset after animation
    setTimeout(() => {
      setStep("info");
      setErrors({});
    }, 200);
  }

  function validateInfo(): boolean {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Name is too short";
    if (!/^[+]?[\d\s()-]{7,}$/.test(form.phone))
      e.phone = "Enter a valid phone number";
    if (form.address.trim().length < 10)
      e.address = "Address must be at least 10 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function goToReview() {
    if (validateInfo()) setStep("review");
  }

  async function handlePlaceOrder() {
    setLoading(true);
    const result = await processCheckout({
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
    });

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    if (result.orderId) {
      setForm({ name: "", phone: "", address: "" });
      setStep("info");
      showSuccess(result.orderId);
    }
    setLoading(false);
  }

  return (
    <Dialog open={isCheckoutOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-2xl">
        {/* Progress Bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: step === "info" ? "50%" : "100%" }}
          />
        </div>

        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-xl">
            {step === "info" ? "Your Details" : "Review Order"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5">
          {step === "info" ? (
            <InfoStep
              form={form}
              errors={errors}
              onChange={(field, value) => {
                setForm((prev) => ({ ...prev, [field]: value }));
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next[field];
                  return next;
                });
              }}
              onNext={goToReview}
              onCancel={handleClose}
            />
          ) : (
            <ReviewStep
              form={form}
              items={items}
              total={total}
              loading={loading}
              onBack={() => setStep("info")}
              onPlaceOrder={handlePlaceOrder}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoStep({
  form,
  errors,
  onChange,
  onNext,
  onCancel,
}: {
  form: { name: string; phone: string; address: string };
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onNext: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium flex items-center gap-2">
          <User className="size-3.5 text-muted-foreground" />
          Full Name
        </label>
        <Input
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="John Doe"
          className={`h-11 rounded-xl ${errors.name ? "border-destructive" : ""}`}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium flex items-center gap-2">
          <Phone className="size-3.5 text-muted-foreground" />
          Phone Number
        </label>
        <Input
          value={form.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="+1 234 567 8900"
          className={`h-11 rounded-xl ${errors.phone ? "border-destructive" : ""}`}
        />
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium flex items-center gap-2">
          <MapPin className="size-3.5 text-muted-foreground" />
          Delivery Address
        </label>
        <textarea
          value={form.address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="Street address, city, state, zip code"
          rows={3}
          className={`w-full px-3 py-2.5 rounded-xl border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none ${
            errors.address ? "border-destructive" : ""
          }`}
        />
        {errors.address && (
          <p className="text-xs text-destructive">{errors.address}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          className="flex-1 h-11 rounded-xl"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button className="flex-1 h-11 rounded-xl" onClick={onNext}>
          Continue
          <ArrowRight className="size-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

function ReviewStep({
  form,
  items,
  total,
  loading,
  onBack,
  onPlaceOrder,
}: {
  form: { name: string; phone: string; address: string };
  items: { product_id: string; name: string; price: number; quantity: number; image_url: string }[];
  total: number;
  loading: boolean;
  onBack: () => void;
  onPlaceOrder: () => void;
}) {
  return (
    <div className="space-y-5">
      {/* Delivery info summary */}
      <div className="bg-muted/50 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Name</span>
          <span className="font-medium">{form.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Phone</span>
          <span className="font-medium">{form.phone}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Address</span>
          <span className="font-medium text-right max-w-[60%]">
            {form.address}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Package className="size-3.5" />
          Items ({items.length})
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {items.map((item) => (
            <div key={item.product_id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden relative flex-shrink-0">
                {item.image_url && (
                  <Image
                    src={item.image_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  Qty: {item.quantity}
                </p>
              </div>
              <span className="text-sm font-semibold tabular-nums">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex justify-between items-baseline">
        <span className="font-medium">Total</span>
        <span className="text-xl font-bold">${total.toFixed(2)}</span>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
        <Shield className="size-3.5 flex-shrink-0" />
        Stock is verified at checkout. Your order is secure.
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="h-11 rounded-xl px-4"
          onClick={onBack}
          disabled={loading}
        >
          <ArrowLeft className="size-4 mr-1" />
          Back
        </Button>
        <Button
          className="flex-1 h-11 rounded-xl font-semibold"
          onClick={onPlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin mr-1.5" />
              Processing...
            </>
          ) : (
            "Place Order"
          )}
        </Button>
      </div>
    </div>
  );
}
