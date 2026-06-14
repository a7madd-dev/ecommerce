import { getCart } from "@/lib/cart";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/shop/checkout-form";

export default async function CheckoutPage() {
  const cart = await getCart();

  if (cart.length === 0) {
    redirect("/cart");
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">Checkout</h1>
      <p className="text-muted-foreground mb-8">
        {cart.length} item{cart.length !== 1 ? "s" : ""} &middot; ${total.toFixed(2)}
      </p>
      <CheckoutForm />
    </div>
  );
}
