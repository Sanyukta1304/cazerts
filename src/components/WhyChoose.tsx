"use client";

import { motion } from "framer-motion";
import { Sparkles, Leaf, Camera, BadgeCheck, Zap, Heart } from "lucide-react";

const reasons = [
  {
    icon: Leaf,
    title: "Premium Ingredients",
    description: "Single-origin cocoa, real cream, and seasonal fruit go into every dessert we craft — no shortcuts, ever.",
  },
  {
    icon: Sparkles,
    title: "Freshly Prepared",
    description: "Nothing sits in a freezer. Each order is handcrafted fresh the moment you place it, so every bite tastes just-made.",
  },
  {
    icon: Camera,
    title: "Instagram-Worthy",
    description: "From the drizzle to the final garnish, every plate is styled like a magazine cover — as beautiful as it is delicious.",
  },
  {
    icon: BadgeCheck,
    title: "Consistent Quality",
    description: "Same recipe, same care, same signature bite — whether it's your first order or your fiftieth.",
  },
  {
    icon: Zap,
    title: "Fast Service",
    description: "From counter to celebration in minutes, without ever rushing the craft that makes it worth the wait.",
  },
  {
    icon: Heart,
    title: "Made With Love",
    description: "Because every celebration deserves a dessert made with the same joy you're celebrating.",
  },
];

export default function WhyChoose() {
  return (
    <section className="section bg-cream">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <h2 className="font-serif text-4xl md:text-5xl text-black mb-3">
            Obsessed with the details
          </h2>
          <p className="text-black/50 text-base">
            Six reasons every dessert feels like a celebration.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-card hover:shadow-premium hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-magenta to-gold flex items-center justify-center mb-5">
                <reason.icon size={24} className="text-white" />
              </div>
              <h3 className="font-bold text-lg text-black mb-2">
                {reason.title}
              </h3>
              <p className="text-black/60 text-sm leading-relaxed">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}