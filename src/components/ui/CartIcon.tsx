"use client";

import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCartStore } from "@/lib/store/useCartStore";

export default function CartIcon({ onClick }: { onClick?: () => void }) {
  const items = useCartStore((state) => state.items);
  const totalQty = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <button onClick={onClick} className="relative">
      <ShoppingCartIcon className="w-6 h-6 text-gray-700" />
      <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
        {totalQty}
      </span>
    </button>
  );
}