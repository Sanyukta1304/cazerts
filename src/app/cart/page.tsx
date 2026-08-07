"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const handleCheckoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggedIn) {
      router.push("/checkout");
    } else {
      router.push("/login?redirect=/checkout");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="pt-32 pb-20 bg-cream min-h-screen flex flex-col items-center justify-center text-center px-6">
        <ShoppingBag size={64} className="text-black/20 mb-6" />
        <h1 className="text-2xl md:text-3xl font-extrabold text-black mb-3">
          Your cart is empty
        </h1>
        <p className="text-black/60 mb-8">
          Looks like you haven't added any desserts yet.
        </p>
        <Link
          href="/menu"
          className="bg-magenta text-white font-semibold px-8 py-3.5 rounded-full hover:bg-magenta-dark transition-colors"
        >
          Explore Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16 bg-cream min-h-screen">
      <div className="container-max px-6 md:px-12 lg:px-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-extrabold text-black mb-10"
        >
          Your Cart
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-4 md:p-5 shadow-card flex flex-col md:flex-row md:items-center gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className="w-16 h-16 md:w-24 md:h-24 rounded-xl bg-cover bg-center shrink-0"
                    style={{ backgroundImage: `url('${item.image_url}')` }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-black text-sm md:text-base">
                      {item.name}
                    </h3>
                    <p className="text-black/50 text-xs md:text-sm">
                      {item.category_name}
                    </p>
                    <p className="text-magenta font-bold mt-1">₹{item.price}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                  <div className="inline-flex items-center bg-cream rounded-full shrink-0">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-magenta/10 transition-colors shrink-0"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center font-semibold text-sm shrink-0">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-magenta/10 transition-colors shrink-0"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Remove item"
                    className="text-black/40 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-3xl p-6 md:p-8 shadow-card h-fit sticky top-28"
          >
            <h2 className="text-xl font-bold text-black mb-6">
              Order Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-black/60">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-black/60">
                <span>Delivery</span>
                <span>₹0</span>
              </div>
              <div className="border-t border-black/10 pt-3 flex justify-between font-bold text-black text-base">
                <span>Total</span>
                <span>₹{cartTotal + 0}</span>
              </div>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="mt-6 w-full text-center bg-magenta text-white font-semibold px-6 py-3.5 rounded-full hover:bg-magenta-dark transition-colors"
            >
              {isLoggedIn ? "Proceed to Checkout" : "Login to Proceed"}
            </button>
            <Link
              href="/menu"
              className="mt-3 block text-center text-magenta font-medium text-sm hover:underline"
            >
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}