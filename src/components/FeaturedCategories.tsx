"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getCategories } from "@/lib/products";

type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
};

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data as Category[]))
      .catch((err) => console.error("Failed to load categories:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section bg-cream">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-magenta uppercase tracking-[0.25em] text-xs font-semibold mb-3">
            Explore
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-black">
            Our Dessert Categories
          </h2>
        </motion.div>

        {loading ? (
          <p className="text-center text-black/40 text-sm">Loading categories...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link
                  href={`/menu?category=${cat.slug}`}
                  className="group block relative rounded-2xl overflow-hidden aspect-[3/4] shadow-card hover:shadow-premium transition-all duration-300 bg-black/5"
                >
                  {cat.image_url && (
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url('${cat.image_url}')` }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                    <h3 className="text-white font-bold text-base md:text-lg">
                      {cat.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}