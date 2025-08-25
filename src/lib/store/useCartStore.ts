import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image?: string;
  qty: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "qty">) => void;
  removeFromCart: (id: string) => void;
  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;
  clearCart: () => void;
  totalQty: number;
  totalPrice: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (item) => {
        const items = get().items;
        const existing = items.find((i) => i.id === item.id);

        if (existing) {
          set({
            items: items.map((i) =>
              i.id === item.id ? { ...i, qty: i.qty + 1 } : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, qty: 1 }] });
        }
      },

      removeFromCart: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      increaseQty: (id) =>
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, qty: i.qty + 1 } : i
          ),
        }),

      decreaseQty: (id) =>
        set({
          items: get().items
            .map((i) =>
              i.id === id ? { ...i, qty: i.qty - 1 } : i
            )
            .filter((i) => i.qty > 0),
        }),

      clearCart: () => set({ items: [] }),

      get totalQty() {
        return get().items.reduce((sum, i) => sum + i.qty, 0);
      },

      get totalPrice() {
        return get().items.reduce((sum, i) => sum + i.qty * i.price, 0);
      },
    }),
    { name: "cart-storage" } // saglabā localStorage
  )
);