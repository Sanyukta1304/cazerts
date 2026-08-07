"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, Plus, Minus } from "lucide-react";
import { getProducts, Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function SignatureDesserts() {
  const [signature, setSignature] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [toast, setToast] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getProducts()
      .then((data) => {
        setSignature(data.filter((p) => p.category_name === "Sundaes"));
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

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="section bg-white relative">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-magenta uppercase tracking-[0.25em] text-xs font-semibold mb-3">
            Fan Favourites
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-black">
            Signature Desserts
          </h2>
        </motion.div>

        {loading ? (
          <p className="text-center text-black/40 text-sm">Loading desserts...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {signature.map((item, i) => {
              const isExpanded = expanded[item.id];
              const quantity = getQuantity(item.id);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group relative rounded-3xl overflow-hidden shadow-card hover:shadow-premium transition-all duration-300 bg-cream flex flex-col"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url('${item.image_url}')` }}
                    />
                    <span className="absolute top-4 left-4 bg-gold text-black text-xs font-bold px-3 py-1.5 rounded-full">
                      Signature
                    </span>
                    <button
                      onClick={() => handleToggleWishlist(item)}
                      aria-label="Add to wishlist"
                      className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white transition-colors"
                    >
                      <Heart
                        size={18}
                        className={
                          isWishlisted(item.id)
                            ? "fill-magenta text-magenta"
                            : "text-magenta"
                        }
                      />
                    </button>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-black mb-2">
                      {item.name}
                    </h3>
                    <p
                      className={`text-black/60 text-sm leading-relaxed mb-1 ${
                        isExpanded ? "" : "line-clamp-2"
                      }`}
                    >
                      {item.description}
                    </p>
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className="text-magenta text-xs font-semibold mb-4 text-left hover:underline w-fit"
                    >
                      {isExpanded ? "Show less" : "Read more"}
                    </button>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-magenta font-extrabold text-lg">
                        ₹{item.price}
                      </span>

                      {quantity === 0 ? (
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="flex items-center gap-2 bg-magenta text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-magenta-dark transition-colors"
                        >
                          <ShoppingCart size={16} />
                          Add to Cart
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 bg-magenta rounded-full px-2 py-1.5">
                          <button
                            onClick={() => handleDecrease(item)}
                            aria-label="Decrease quantity"
                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 text-white transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-white font-bold text-sm w-4 text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => handleIncrease(item)}
                            aria-label="Increase quantity"
                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 text-white transition-colors"
                          >
                            <Plus size={14} />
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

      {/* Toast notification */}
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