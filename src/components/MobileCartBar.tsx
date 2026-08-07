"use client";

import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function MobileCartBar() {
  const { cartCount, cartTotal } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  // Don't show the bar on the cart or checkout pages themselves.
  const hiddenOn = ["/cart", "/checkout"];
  const shouldHide = hiddenOn.some((path) => pathname.startsWith(path));

  return (
    <AnimatePresence>
      {cartCount > 0 && !shouldHide && (
        <motion.button
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          onClick={() => router.push("/cart")}
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-magenta text-white flex items-center justify-between px-6 py-4 shadow-2xl"
        >
          <span className="flex items-center gap-2 font-semibold text-sm">
            <ShoppingCart size={18} />
            {cartCount} item{cartCount !== 1 ? "s" : ""} · ₹{cartTotal}
          </span>
          <span className="flex items-center gap-1 font-bold text-sm">
            Checkout
            <ArrowRight size={16} />
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}