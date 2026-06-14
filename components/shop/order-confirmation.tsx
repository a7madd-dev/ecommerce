import { Order } from "@/types";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function OrderConfirmation({ order }: { order: Order }) {
  return (
    <div className="text-center">
      <CheckCircle className="size-16 text-green-500 mx-auto mb-4" />
      <h1 className="text-3xl font-bold mb-2">Order Placed!</h1>
      <p className="text-muted-foreground mb-8">
        Thank you, {order.customer_name}. Your order has been received.
      </p>

      <div className="bg-muted/50 rounded-2xl p-6 text-left space-y-4 mb-8">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Order ID</span>
          <span className="font-mono text-sm">{order.id.slice(0, 8)}...</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Status</span>
          <Badge variant="outline" className="capitalize">{order.status}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Payment</span>
          <Badge variant="outline" className="capitalize">{order.payment_status}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total</span>
          <span className="font-bold">${Number(order.total).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Phone</span>
          <span>{order.customer_phone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Address</span>
          <span className="text-right max-w-[60%]">{order.customer_address}</span>
        </div>

        {order.items && order.items.length > 0 && (
          <>
            <Separator />
            <h3 className="font-semibold mb-3">Items</h3>
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm py-1">
                <span>
                  {item.product_name} &times; {item.quantity}
                </span>
                <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </>
        )}
      </div>

      <Link href="/">
        <Button size="lg" className="rounded-xl">Continue Shopping</Button>
      </Link>
    </div>
  );
}
