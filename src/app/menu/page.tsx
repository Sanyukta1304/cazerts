"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, Plus, Minus, ArrowRight } from "lucide-react";
import { getProducts, getCategories, Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import Link from "next/link";
import { useRouter } from "next/navigation";  

function MenuContent() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  const { cart, cartCount, cartTotal, addToCart, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [toast, setToast] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
      })
      .catch((err) => console.error("Failed to load menu data:", err))
      .finally(() => setLoading(false));
  }, []);

  const initialCategory = categoryFromUrl
    ? categories.find((c) => c.slug === categoryFromUrl)?.name ?? "All"
    : "All";

  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    if (categoryFromUrl && categories.length > 0) {
      const match = categories.find((c) => c.slug === categoryFromUrl);
      if (match) setActiveCategory(match.name);
    }
  }, [categoryFromUrl, categories]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter((p) => p.category_name === activeCategory);
  }, [activeCategory, products]);

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
    updateQuantity(item.id, getQuantity(item.id) + 1);
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
    <div className="pt-28 pb-16 bg-cream min-h-screen relative">
      <div className="container-max px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-magenta uppercase tracking-[0.25em] text-xs font-semibold mb-3">
            Our Menu
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-black">
            Handcrafted Just For You
          </h1>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setActiveCategory("All")}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
              activeCategory === "All"
                ? "bg-magenta text-white"
                : "bg-white text-black/70 hover:bg-magenta/10"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                activeCategory === cat.name
                  ? "bg-magenta text-white"
                  : "bg-white text-black/70 hover:bg-magenta/10"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-black/40 text-sm py-20">Loading menu...</p>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((item, i) => {
              const quantity = getQuantity(item.id);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-premium transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Link href={`/product/${item.id}`} className="block absolute inset-0">
                      <div
                        className={`absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 ${
                          !item.in_stock ? "grayscale opacity-60" : ""
                        }`}
                        style={{ backgroundImage: `url('${item.image_url}')` }}
                      />
                    </Link>
                    {!item.in_stock && (
                      <span className="absolute top-4 left-4 bg-magenta text-white text-xs font-bold px-3 py-1.5 rounded-full z-10">
                        Out of Stock
                      </span>
                    )}
                    <button
                      onClick={() => handleToggleWishlist(item)}
                      aria-label="Add to wishlist"
                      className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white transition-colors z-10"
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
                  <div className="p-6">
                    <p className="text-magenta text-xs font-semibold uppercase tracking-wide mb-1">
                      {item.category_name}
                    </p>
                    <h3 className="text-lg font-bold text-black mb-2">
                      {item.name}
                    </h3>
                    <p className="text-black/60 text-sm leading-relaxed mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-magenta font-extrabold text-lg">
                        ₹{item.price}
                      </span>

                      {!item.in_stock ? (
                        <span className="text-magenta text-xs font-bold px-4 py-2.5">
                          Unavailable
                        </span>
                      ) : quantity === 0 ? (
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
        ) : (
          <p className="text-center text-black/50 py-20">
            No items found in this category yet.
          </p>
        )}
      </div>

      <AnimatePresence>
        {cartCount > 0 && (
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
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center">Loading menu...</div>}>
      <MenuContent />
    </Suspense>
  );
}