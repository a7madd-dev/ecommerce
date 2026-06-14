"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { CartItem } from "@/types";
import {
  addToCart as serverAddToCart,
  updateCartItem as serverUpdateCartItem,
  removeCartItem as serverRemoveCartItem,
} from "@/app/actions/cart";
import { syncCart as serverSyncCart } from "@/app/actions/cart-sync";
import toast from "react-hot-toast";

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isSuccessOpen: boolean;
  lastOrderId: string | null;
  addItem: (product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    stock: number;
  }) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  showSuccess: (orderId: string) => void;
  closeSuccess: () => void;
  clearItems: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({
  children,
  initialItems = [],
}: {
  children: ReactNode;
  initialItems?: CartItem[];
}) {
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Sync client state from server on mount
  useEffect(() => {
    if (initialItems.length > 0 && items.length === 0) {
      setItems(initialItems);
    }
  }, [initialItems]); // eslint-disable-line react-hooks/exhaustive-deps

  const addItem = useCallback(
    (product: {
      id: string;
      name: string;
      price: number;
      image_url: string;
      stock: number;
    }) => {
      // Optimistic update
      setItems((prev) => {
        const existing = prev.find((i) => i.product_id === product.id);
        if (existing) {
          if (existing.quantity >= product.stock) {
            toast.error(`Only ${product.stock} available`);
            return prev;
          }
          return prev.map((i) =>
            i.product_id === product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        }
        return [
          ...prev,
          {
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image_url: product.image_url,
            stock: product.stock,
          },
        ];
      });

      toast.success("Added to cart", {
        style: { borderRadius: "12px" },
        icon: "🛒",
      });

      // Server sync (fire-and-forget, rollback on error)
      serverAddToCart({
        productId: product.id,
        quantity: 1,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        stock: product.stock,
      }).then((result) => {
        if (result.error) {
          // Rollback optimistic update
          setItems((prev) => {
            const existing = prev.find((i) => i.product_id === product.id);
            if (existing && existing.quantity === 1) {
              return prev.filter((i) => i.product_id !== product.id);
            }
            return prev.map((i) =>
              i.product_id === product.id
                ? { ...i, quantity: i.quantity - 1 }
                : i
            );
          });
          toast.error(result.error);
        }
      });
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      const prevItems = items;

      if (quantity <= 0) {
        setItems((prev) => prev.filter((i) => i.product_id !== productId));
      } else {
        setItems((prev) =>
          prev.map((i) =>
            i.product_id === productId ? { ...i, quantity } : i
          )
        );
      }

      serverUpdateCartItem(productId, quantity).then((result) => {
        if (result.error) {
          setItems(prevItems);
          toast.error(result.error);
        }
      });
    },
    [items]
  );

  const removeItem = useCallback(
    (productId: string) => {
      const prevItems = items;
      setItems((prev) => prev.filter((i) => i.product_id !== productId));

      serverRemoveCartItem(productId).then((result) => {
        if ("error" in result) {
          setItems(prevItems);
          toast.error((result as { error: string }).error);
        }
      });
    },
    [items]
  );

  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const openCheckout = useCallback(() => {
    setIsCartOpen(false);
    // Small delay for smoother transition between overlays
    setTimeout(() => setIsCheckoutOpen(true), 150);
  }, []);
  const closeCheckout = useCallback(() => setIsCheckoutOpen(false), []);

  const showSuccess = useCallback((orderId: string) => {
    setIsCheckoutOpen(false);
    setLastOrderId(orderId);
    setItems([]);
    setTimeout(() => setIsSuccessOpen(true), 150);
  }, []);
  const closeSuccess = useCallback(() => {
    setIsSuccessOpen(false);
    setLastOrderId(null);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        isCartOpen,
        isCheckoutOpen,
        isSuccessOpen,
        lastOrderId,
        addItem,
        updateQuantity,
        removeItem,
        openCart,
        closeCart,
        openCheckout,
        closeCheckout,
        showSuccess,
        closeSuccess,
        clearItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
