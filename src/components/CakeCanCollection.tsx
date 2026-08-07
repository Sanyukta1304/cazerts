"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, Plus, Minus } from "lucide-react";
import { getProducts, Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function CakeCanCollection() {
  const [cakeCans, setCakeCans] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    getProducts()
      .then((data) => {
        setCakeCans(data.filter((p) => p.category_name === "Cake Cans"));
      })
      .catch((err) => console.error("Failed to load products:", err))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const getQuantity = (id: string) => {
    const item = cart.find((c) => c.id === id);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (item: Product) => {
    addToCart(item);
    showToast(`${item.name} added to cart! 🛒`);
  };

  const handleIncrease = (item: Product) => {
    const qty = getQuantity(item.id);
    updateQuantity(item.id, qty + 1);
  };

  const handleDecrease = (item: Product) => {
    const qty = getQuantity(item.id);
    if (qty <= 1) {
      removeFromCart(item.id);
    } else {
      updateQuantity(item.id, qty - 1);
    }
  };

  const handleToggleWishlist = (item: Product) => {
    const wasWishlisted = isWishlisted(item.id);
    toggleWishlist(item);
    showToast(
      wasWishlisted
        ? `${item.name} removed from favorites`
        : `${item.name} added to favorites! ❤️`
    );
  };

  return (
    <section className="section bg-cream relative">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-magenta uppercase tracking-[0.25em] text-xs font-semibold mb-3">
            Signature Collection
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-black">
            Cake Can Collection
          </h2>
          <p className="text-black/60 max-w-xl mx-auto mt-4 text-sm md:text-base">
            Layered, portable, and utterly indulgent — our cake cans pack
            premium flavour into every scoop.
          </p>
        </motion.div>

        {loading ? (
          <p className="text-center text-black/40 text-sm">Loading cake cans...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
            {cakeCans.map((item, i) => {
              const quantity = getQuantity(item.id);
              const tag = i % 3 === 0 ? "Bestseller" : i % 3 === 1 ? "New" : "Popular";

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-premium transition-all duration-300"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <div
                      className={`absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 ${
                        !item.in_stock ? "grayscale opacity-60" : ""
                      }`}
                      style={{ backgroundImage: `url('${item.image_url}')` }}
                    />
                    {item.in_stock ? (
                      <span className="absolute top-3 left-3 bg-gold text-black text-[10px] font-bold px-2.5 py-1 rounded-full">
                        {tag}
                      </span>
                    ) : (
                      <span className="absolute top-3 left-3 bg-magenta text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                        Out of Stock
                      </span>
                    )}
                    <button
                      onClick={() => handleToggleWishlist(item)}
                      aria-label="Add to wishlist"
                      className="absolute top-3 right-3 bg-white/90 p-2 rounded-full hover:bg-white transition-colors"
                    >
                      <Heart
                        size={16}
                        className={
                          isWishlisted(item.id)
                            ? "fill-magenta text-magenta"
                            : "text-magenta"
                        }
                      />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-black text-sm md:text-base mb-1 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-black/50 text-xs leading-relaxed line-clamp-2 mb-3">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-magenta font-extrabold text-sm md:text-base">
                        ₹{item.price}
                      </span>

                      {!item.in_stock ? (
                        <span className="text-magenta text-[11px] font-bold">
                          Unavailable
                        </span>
                      ) : quantity === 0 ? (
                        <button
                          onClick={() => handleAddToCart(item)}
                          aria-label="Add to cart"
                          className="bg-magenta/10 text-magenta p-2 rounded-full hover:bg-magenta hover:text-white transition-colors"
                        >
                          <ShoppingCart size={16} />
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-magenta rounded-full px-1.5 py-1">
                          <button
                            onClick={() => handleDecrease(item)}
                            aria-label="Decrease quantity"
                            className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/20 text-white transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-white font-bold text-xs w-3 text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => handleIncrease(item)}
                            aria-label="Increase quantity"
                            className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/20 text-white transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 30, x: "-50%" }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-8 left-1/2 bg-black text-white text-sm font-medium px-6 py-3.5 rounded-full shadow-premium z-50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}