"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ShoppingCart, Plus, Minus, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { getProducts, getProductImages, getProductStock, Product, ProductImage } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [gallery, setGallery] = useState<ProductImage[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  // Live stock count, refreshed independently of the product list so it's
  // as up to date as possible. null = untracked/unlimited.
  const [liveStock, setLiveStock] = useState<number | null>(null);
  const [stockNotice, setStockNotice] = useState("");
  const [checkingStock, setCheckingStock] = useState(false);

  useEffect(() => {
    getProducts()
      .then(async (allProducts) => {
        const found = allProducts.find((p) => p.id === params.id);
        setProduct(found || null);

        if (found) {
          setLiveStock(found.stock_quantity);

          const relatedItems = allProducts
            .filter((p) => p.category_name === found.category_name && p.id !== found.id)
            .slice(0, 3);
          setRelated(relatedItems);

          const galleryImages = await getProductImages(found.id);
          setGallery(galleryImages);

          // Refresh stock independently in case it's changed very
          // recently (e.g. someone just bought the last one).
          const freshStock = await getProductStock(found.id);
          setLiveStock(freshStock);
        }
      })
      .catch((err) => console.error("Failed to load product:", err))
      .finally(() => setLoading(false));
  }, [params.id]);

  const isOutOfStock = liveStock !== null && liveStock <= 0;
  const isLowStock = liveStock !== null && liveStock > 0 && liveStock <= 5;

  function increaseQuantity() {
    setQuantity((q) => {
      if (liveStock !== null && q >= liveStock) {
        setStockNotice(`Only ${liveStock} left in stock.`);
        return q;
      }
      setStockNotice("");
      return q + 1;
    });
  }

  function decreaseQuantity() {
    setStockNotice("");
    setQuantity((q) => Math.max(1, q - 1));
  }

  const handleAddToCart = async () => {
    if (!product || isOutOfStock) return;

    setCheckingStock(true);
    setStockNotice("");
    try {
      // Re-check right before adding, in case stock changed since the
      // page loaded.
      const freshStock = await getProductStock(product.id);
      setLiveStock(freshStock);

      if (freshStock !== null && freshStock <= 0) {
        setStockNotice("Sorry, this just sold out.");
        return;
      }
      if (freshStock !== null && quantity > freshStock) {
        setStockNotice(`Only ${freshStock} left in stock — please lower the quantity.`);
        setQuantity(freshStock);
        return;
      }

      addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setCheckingStock(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 text-center min-h-screen bg-cream">
        <p className="text-black/40 text-sm">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 pb-20 text-center min-h-screen bg-cream">
        <h1 className="text-2xl font-bold text-black mb-4">
          Product not found
        </h1>
        <Link href="/menu" className="text-magenta font-semibold hover:underline">
          Back to Menu
        </Link>
      </div>
    );
  }

  // Main photo first, then up to 5 gallery photos.
  const slides = [
    { id: "main", imageUrl: product.image_url },
    ...gallery.map((g) => ({ id: g.id, imageUrl: g.imageUrl })),
  ];
  const hasMultipleSlides = slides.length > 1;

  function goToSlide(index: number) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    setActiveIndex(index);
  }

  function handleDragEnd(_: any, info: PanInfo) {
    const threshold = 60;
    if (info.offset.x > threshold) {
      goToSlide(activeIndex - 1);
    } else if (info.offset.x < -threshold) {
      goToSlide(activeIndex + 1);
    }
  }

  return (
    <div className="pt-28 pb-16 bg-cream min-h-screen">
      <div className="container-max px-6 md:px-12 lg:px-20">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-black/60 hover:text-magenta transition-colors mb-8 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative rounded-3xl aspect-square shadow-card overflow-hidden mb-4 bg-black/5">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={slides[activeIndex].id}
                  drag={hasMultipleSlides ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.15}
                  onDragEnd={handleDragEnd}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`absolute inset-0 bg-cover bg-center ${
                    isOutOfStock ? "grayscale opacity-60" : ""
                  } ${hasMultipleSlides ? "cursor-grab active:cursor-grabbing" : ""}`}
                  style={{ backgroundImage: `url('${slides[activeIndex].imageUrl}')` }}
                />
              </AnimatePresence>

              {isOutOfStock && (
                <span className="absolute top-4 left-4 bg-magenta text-white text-xs font-bold px-3 py-1.5 rounded-full z-10">
                  Out of Stock
                </span>
              )}
              {!isOutOfStock && isLowStock && (
                <span className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10">
                  Only {liveStock} left
                </span>
              )}

              {hasMultipleSlides && (
                <>
                  <button
                    onClick={() => goToSlide(activeIndex - 1)}
                    aria-label="Previous photo"
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full hover:bg-white transition-colors z-10"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => goToSlide(activeIndex + 1)}
                    aria-label="Next photo"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full hover:bg-white transition-colors z-10"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {hasMultipleSlides && (
              <div className="flex gap-3">
                {slides.map((slide, i) => (
                  <button
                    key={slide.id}
                    onClick={() => goToSlide(i)}
                    className={`w-16 h-16 rounded-xl bg-cover bg-center border-2 transition-colors ${
                      i === activeIndex
                        ? "border-magenta"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                    style={{ backgroundImage: `url('${slide.imageUrl}')` }}
                    aria-label="View photo"
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Product info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-magenta text-xs font-semibold uppercase tracking-wide mb-2">
              {product.category_name}
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-black mb-4">
              {product.name}
            </h1>
            <p className="text-black/60 leading-relaxed mb-6">
              {product.description}
            </p>
            <p className="text-magenta font-extrabold text-3xl mb-8">
              ₹{product.price}
            </p>

            {isOutOfStock && (
              <p className="text-magenta font-bold text-sm mb-6">
                Currently out of stock — check back soon!
              </p>
            )}
            {!isOutOfStock && isLowStock && (
              <p className="text-amber-600 font-bold text-sm mb-6">
                Only {liveStock} left in stock — order soon!
              </p>
            )}

            {/* Quantity selector */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-black mb-3">Quantity</p>
              <div className="flex items-center gap-3 bg-white rounded-full px-2 py-2 w-fit shadow-card">
                <button
                  onClick={decreaseQuantity}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-magenta/10 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-bold">{quantity}</span>
                <button
                  onClick={increaseQuantity}
                  disabled={liveStock !== null && quantity >= liveStock}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-magenta/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {stockNotice && (
              <p className="text-amber-600 text-sm font-semibold mb-6">{stockNotice}</p>
            )}

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || checkingStock}
              className="flex items-center justify-center gap-2 bg-magenta text-white font-semibold px-8 py-4 rounded-full hover:bg-magenta-dark transition-colors w-full sm:w-auto disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={18} />
              {isOutOfStock
                ? "Out of Stock"
                : checkingStock
                ? "Checking stock..."
                : added
                ? "Added to Cart!"
                : `Add to Cart — ₹${product.price * quantity}`}
            </button>
          </motion.div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-extrabold text-black mb-8">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/product/${item.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-premium transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <div
                      className={`absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 ${
                        !item.in_stock ? "grayscale opacity-60" : ""
                      }`}
                      style={{ backgroundImage: `url('${item.image_url}')` }}
                    />
                    {!item.in_stock && (
                      <span className="absolute top-3 left-3 bg-magenta text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-black text-sm mb-1">
                      {item.name}
                    </h3>
                    <p className="text-magenta font-bold text-sm">
                      ₹{item.price}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}