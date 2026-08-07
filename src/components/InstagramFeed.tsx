"use client";

import { motion } from "framer-motion";
import { Instagram } from "lucide-react";

const floatingEmojis = ["🍫", "🍨", "🧁", "🍰", "☕", "🍓"];

export default function InstagramFeed() {
  return (
    <section className="section bg-white relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-magenta/10 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      {/* Floating emojis */}
      {floatingEmojis.map((emoji, i) => (
        <motion.span
          key={i}
          className="absolute text-3xl md:text-4xl select-none pointer-events-none opacity-30"
          style={{
            left: `${10 + i * 15}%`,
            top: "100%",
          }}
          animate={{
            y: ["0%", "-800%"],
            rotate: [0, i % 2 === 0 ? 15 : -15, 0],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            delay: i * 1.5,
            ease: "linear",
          }}
        >
          {emoji}
        </motion.span>
      ))}

      <div className="container-max relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-magenta uppercase tracking-[0.25em] text-xs font-semibold mb-3">
            Follow The Celebration
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-black mb-4">
            @cazerts on Instagram
          </h2>
          <motion.a
            href="https://www.instagram.com/cazerts/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-magenta to-magenta-dark text-white font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity shadow-premium"
          >
            <Instagram size={18} />
            Follow Us
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}