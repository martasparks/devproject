"use client";

import { useCartStore } from "@/lib/store/useCartStore";

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, totalPrice, removeFromCart, increaseQty, decreaseQty, clearCart } =
    useCartStore();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        ></div>
      )}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-lg font-bold">Mans Grozs</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-150px)]">
          {items.length === 0 ? (
            <p>Grozs ir tukšs</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p>{item.title}</p>
                  <p className="text-sm text-gray-500">€{item.price.toFixed(2)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => decreaseQty(item.id)}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => increaseQty(item.id)}>+</button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-500">
                  Dzēst
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t">
          <p>Kopā: <b>€{totalPrice.toFixed(2)}</b></p>
          <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded">
            Pasūtīt
          </button>
          <button onClick={clearCart} className="mt-2 w-full text-sm text-gray-500">
            Notīrīt grozu
          </button>
        </div>
      </div>
    </>
  );
}