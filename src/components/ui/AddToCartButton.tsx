"use client";

import { useCartStore } from "@/lib/store/useCartStore";

export default function AddToCartButton({ product }: { product: { id: string; title: string; price: number; image?: string } }) {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <button
      onClick={() => addToCart(product)}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Pievienot grozam
    </button>
  );
}