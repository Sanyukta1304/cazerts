"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Truck, ShieldCheck } from "lucide-react";
import { categories } from "@/data/products";

const perks = [
  {
    icon: Clock,
    title: "Fast Preparation",
    description: "Your desserts are freshly made and ready quickly.",
  },
  {
    icon: Truck,
    title: "Doorstep Delivery",
    description: "Delivered safely and on time, right to your door.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "UPI and Card payments protected with Razorpay.",
  },
];

export default function OrderPage() {
  return (
    <div className="pt-28 pb-16 bg-cream min-h-screen">
      <div className="container-max px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative text-center mb-14 max-w-2xl mx-auto"
        >
          <span className="absolute -top-8 -right-6 md:right-2 text-7xl md:text-8xl opacity-35 animate-float select-none pointer-events-none drop-shadow-sm">
            🍦
          </span>
          <span
            className="absolute -bottom-6 -left-6 md:left-2 text-6xl md:text-7xl opacity-35 animate-float select-none pointer-events-none drop-shadow-sm"
            style={{ animationDelay: "2s" }}
          >
            🍨
          </span>

          <p className="relative text-magenta uppercase tracking-[0.25em] text-xs font-semibold mb-3">
            Order Online
          </p>
          <h1 className="relative text-3xl md:text-5xl font-extrabold text-black mb-4">
            Get Your Desserts Delivered
          </h1>
          <p className="relative text-black/60 text-base md:text-lg">
            Browse our full menu and get your favourite CAZERTS desserts
            delivered fresh — close enough that the ice cream doesn't cry on
            the way.
          </p>
          <Link
            href="/menu"
            className="relative inline-flex items-center gap-2 mt-8 bg-magenta text-white font-semibold px-8 py-4 rounded-full hover:bg-magenta-dark transition-colors shadow-premium"
          >
            Browse Full Menu
            <ArrowRight size={18} />
          </Link>
        </motion.div>

        {/* Quick category access */}
        <div className="mb-16">
          <h2 className="text-xl md:text-2xl font-bold text-black mb-6 text-center">
            Order By Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <Link
                  href={`/menu?category=${cat.slug}`}
                  className="group block relative rounded-2xl overflow-hidden aspect-[4/3] shadow-card hover:shadow-premium transition-all duration-300"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url('${cat.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-sm md:text-base">
                      {cat.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Perks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {perks.map((perk, i) => (
            <motion.div
              key={perk.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 text-center shadow-card"
            >
              <div className="w-12 h-12 rounded-full bg-magenta/10 flex items-center justify-center mx-auto mb-4">
                <perk.icon size={22} className="text-magenta" />
              </div>
              <h3 className="font-bold text-black mb-1">{perk.title}</h3>
              <p className="text-black/60 text-sm">{perk.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}