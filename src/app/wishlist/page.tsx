"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, X } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="pt-32 pb-20 bg-cream min-h-screen flex flex-col items-center justify-center text-center px-6">
        <Heart size={64} className="text-black/20 mb-6" />
        <h1 className="text-2xl md:text-3xl font-extrabold text-black mb-3">
          Your wishlist is empty
        </h1>
        <p className="text-black/60 mb-8">
          Save your favourite desserts here to order later.
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
          Your Wishlist
        </motion.h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlist.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-white rounded-3xl overflow-hidden shadow-card"
            >
              <button
                onClick={() => toggleWishlist(item)}
                className="absolute top-4 right-4 z-10 bg-white/90 p-2 rounded-full hover:bg-red-50 transition-colors"
                aria-label="Remove from wishlist"
              >
                <X size={16} className="text-black/60" />
              </button>
              <div
                className="aspect-[4/3] bg-cover bg-center"
                style={{ backgroundImage: `url('${item.image}')` }}
              />
              <div className="p-6">
                <h3 className="text-lg font-bold text-black mb-2">
                  {item.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-magenta font-extrabold text-lg">
                    ₹{item.price}
                  </span>
                  <button
                    onClick={() => addToCart(item)}
                    className="flex items-center gap-2 bg-magenta text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-magenta-dark transition-colors"
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}