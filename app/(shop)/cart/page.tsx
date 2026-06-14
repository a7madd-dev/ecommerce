import { getCart } from "@/lib/cart";
import { CartView } from "@/components/shop/cart-view";

export default async function CartPage() {
  const cart = await getCart();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <CartView items={cart} />
    </div>
  );
}
