"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "./cart-context";
import { CheckCircle2, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

export function SuccessOverlay() {
  const { isSuccessOpen, closeSuccess, lastOrderId } = useCart();
  const [copied, setCopied] = useState(false);
  const [show, setShow] = useState(false);

  // Stagger animation
  useEffect(() => {
    if (isSuccessOpen) {
      const t = setTimeout(() => setShow(true), 100);
      return () => clearTimeout(t);
    }
    setShow(false);
  }, [isSuccessOpen]);

  function copyOrderId() {
    if (lastOrderId) {
      navigator.clipboard.writeText(lastOrderId);
      setCopied(true);
      toast.success("Order ID copied");
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Dialog open={isSuccessOpen} onOpenChange={(o) => !o && closeSuccess()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border-0 shadow-2xl gap-0">
        {/* Gradient top */}
        <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 px-6 pt-12 pb-8 text-center">
          <div
            className={`transition-all duration-700 ${
              show
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-50 translate-y-4"
            }`}
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-5">
              <CheckCircle2 className="size-10 text-white" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Order Confirmed!
            </h2>
            <p className="text-white/80 mt-2 text-sm">
              Thank you for your purchase
            </p>
          </div>
        </div>

        {/* Content */}
        <div
          className={`px-6 py-6 transition-all duration-500 delay-300 ${
            show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {lastOrderId && (
            <div className="bg-muted/50 rounded-xl p-4 mb-6">
              <p className="text-xs text-muted-foreground mb-1.5">Order ID</p>
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm font-mono font-medium">
                  {lastOrderId.slice(0, 18)}...
                </code>
                <button
                  onClick={copyOrderId}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                >
                  {copied ? (
                    <Check className="size-3.5 text-green-600" />
                  ) : (
                    <Copy className="size-3.5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3 text-sm text-center text-muted-foreground mb-6">
            <p>
              We&apos;ll process your order shortly.
              <br />
              You&apos;ll receive updates on your phone.
            </p>
          </div>

          <Button
            className="w-full h-11 rounded-xl font-semibold"
            onClick={closeSuccess}
          >
            Continue Shopping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
