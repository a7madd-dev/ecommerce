import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CartProvider } from "@/components/cart/cart-context";
import { CartSheet } from "@/components/cart/cart-sheet";
import { CheckoutDialog } from "@/components/cart/checkout-dialog";
import { SuccessOverlay } from "@/components/cart/success-overlay";
import { getCart } from "@/lib/cart";
import { auth } from "@/lib/auth";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, session] = await Promise.all([getCart(), auth()]);

  const user = session?.user
    ? {
        name: session.user.name || "",
        email: session.user.email || "",
        role: session.user.role,
        image: session.user.image || null,
      }
    : null;

  return (
    <CartProvider initialItems={cart}>
      <SiteHeader user={user} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CartSheet />
      <CheckoutDialog />
      <SuccessOverlay />
    </CartProvider>
  );
}
