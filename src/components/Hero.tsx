"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      >
        <source src="/videos/hero-bg.mp4" type="video/mp4" />
      </video>
      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-gold uppercase tracking-[0.3em] text-xs md:text-sm mb-4 font-medium"
        >
          Premium Dessert Experience
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-white text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
        >
          Every Bite,
          <br />
          <span className="text-magenta">A Celebration.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-white/80 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Premium handcrafted sundaes, cake cans, cheesecakes,
           and signature chocolate desserts made for every
          celebration.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/menu"
            className="bg-magenta text-white font-semibold px-8 py-4 rounded-full hover:bg-magenta-dark transition-colors shadow-premium"
          >
            Explore Menu
          </Link>
          <Link
            href="/order"
            className="glass text-white font-semibold px-8 py-4 rounded-full hover:bg-white/20 transition-colors border border-white/30"
          >
            Order Now
          </Link>
        </motion.div>
      </div>
    </section>
  );
}