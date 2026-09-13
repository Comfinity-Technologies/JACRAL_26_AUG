import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { apiClient } from "../api/client";
import { useAuth } from "./useAuth";
import { getImageUrl } from "../utils/image";

export type CartItem = {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  // Merged fields for frontend rendering
  name?: string;
  category?: string;
  image?: string;
};

export type CartState = {
  id?: number;
  items: CartItem[];
  total: number;
};

/**
 * useCart – all cart data is persisted ONLY in the backend database.
 * No localStorage is used. Guest carts are held in React state (memory only)
 * and are synced to the backend when the user logs in.
 */
export function useCart() {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartState>({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);

  // Guest cart lives ONLY in memory (React state), never in localStorage
  const [guestItems, setGuestItems] = useState<CartItem[]>([]);

  // Track if we already merged guest→backend to prevent double-merges
  const mergedRef = useRef(false);

  // ── Enrich items with product name/image from the API ──
  const enrichCartItems = async (items: CartItem[]) => {
    const enriched = [...items];
    for (let i = 0; i < enriched.length; i++) {
      try {
        const res = await apiClient.get(`/api/v1/products/${enriched[i].product_id}`);
        const p = res.data;
        enriched[i].name = p.name;
        enriched[i].category =
          typeof p.category === "string" ? p.category : p.category?.name;
        enriched[i].image = getImageUrl(p.image_url);
      } catch (err) {
        console.error("Failed to fetch product for cart item", err);
      }
    }
    return enriched;
  };

  // ── Fetch authenticated cart from backend ──
  const fetchCart = useCallback(async () => {
    if (!user) {
      const total = guestItems.reduce((acc, item) => acc + item.subtotal, 0);
      setCart({ items: guestItems, total });
      return;
    }
    try {
      setLoading(true);
      const res = await apiClient.get("/api/v1/cart");
      const enrichedItems = await enrichCartItems(res.data.items || []);
      setCart({
        id: res.data.id,
        items: enrichedItems,
        total: parseFloat(res.data.total),
      });
    } catch (err) {
      console.warn("Error fetching backend cart", err);
    } finally {
      setLoading(false);
    }
  }, [user, guestItems]);

  // ── When user logs in, sync guest items → backend, then clear guest state ──
  useEffect(() => {
    if (!user) {
      mergedRef.current = false;
      return;
    }
    if (mergedRef.current) return;

    const syncGuestToBackend = async () => {
      if (guestItems.length === 0) {
        fetchCart();
        return;
      }
      mergedRef.current = true;
      try {
        await Promise.all(
          guestItems.map((item) =>
            apiClient.post("/api/v1/cart/items", {
              product_id: item.product_id,
              quantity: item.quantity,
            })
          )
        );
        setGuestItems([]); // clear in-memory guest cart
        fetchCart();
      } catch (err) {
        console.error("Failed to sync guest cart to backend", err);
        fetchCart();
      }
    };

    syncGuestToBackend();
  }, [user]);

  // ── Refresh on auth change ──
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ── Add to cart ──
  const addToCart = async (productId: number, quantity: number = 1) => {
    if (user) {
      // Authenticated: write directly to backend
      await apiClient.post("/api/v1/cart/items", { product_id: productId, quantity });
      await fetchCart();
      return;
    }

    // Guest: keep in React state only
    try {
      const res = await apiClient.get(`/api/v1/products/${productId}`);
      const p = res.data;
      const price = typeof p.price === "string" ? parseFloat(p.price) : p.price;

      setGuestItems((prev) => {
        const idx = prev.findIndex((i) => i.product_id === productId);
        if (idx > -1) {
          const updated = [...prev];
          const newQty = updated[idx].quantity + quantity;
          updated[idx] = {
            ...updated[idx],
            quantity: newQty,
            subtotal: newQty * price,
          };
          return updated;
        }
        return [
          ...prev,
          {
            id: Date.now(),
            product_id: productId,
            quantity,
            unit_price: price,
            subtotal: price * quantity,
            name: p.name,
            category:
              typeof p.category === "string" ? p.category : p.category?.name,
            image: getImageUrl(p.image_url),
          },
        ];
      });
    } catch (err) {
      console.error("Failed to add guest item", err);
      throw err;
    }
  };

  // ── Increase quantity ──
  const increaseQuantity = async (itemId: number) => {
    if (!user) {
      setGuestItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unit_price }
            : item
        )
      );
      return;
    }
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) return;
    await apiClient.patch(`/api/v1/cart/items/${itemId}`, { quantity: item.quantity + 1 });
    await fetchCart();
  };

  // ── Decrease quantity ──
  const decreaseQuantity = async (itemId: number) => {
    if (!user) {
      setGuestItems((prev) =>
        prev
          .map((item) =>
            item.id === itemId
              ? { ...item, quantity: item.quantity - 1, subtotal: (item.quantity - 1) * item.unit_price }
              : item
          )
          .filter((item) => item.quantity > 0)
      );
      return;
    }
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) return;
    if (item.quantity <= 1) return removeFromCart(itemId);
    await apiClient.patch(`/api/v1/cart/items/${itemId}`, { quantity: item.quantity - 1 });
    await fetchCart();
  };

  // ── Remove item ──
  const removeFromCart = async (itemId: number) => {
    if (!user) {
      setGuestItems((prev) => prev.filter((i) => i.id !== itemId));
      return;
    }
    await apiClient.delete(`/api/v1/cart/items/${itemId}`);
    await fetchCart();
  };

  // ── Clear cart ──
  const clearCart = async () => {
    setGuestItems([]);
    if (user) {
      await apiClient.delete("/api/v1/cart");
      await fetchCart();
    }
  };

  const activeItems = user && cart.items.length > 0 ? cart.items : guestItems;

  const itemCount = useMemo(
    () => activeItems.reduce((total, item) => total + item.quantity, 0),
    [activeItems]
  );

  const subtotal = useMemo(
    () => activeItems.reduce((total, item) => total + item.subtotal, 0),
    [activeItems]
  );

  const delivery = subtotal === 0 ? 0 : subtotal >= 500 ? 0 : 50;
  const total = subtotal + delivery;

  return {
    items: activeItems,
    itemCount,
    subtotal,
    delivery,
    total,
    loading,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart,
  };
}