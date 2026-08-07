"use client";

import { motion } from "framer-motion";
import { Heart, Award, Users, Sparkles } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Made With Love",
    description: "Every dessert is handcrafted with care, using recipes perfected over time.",
  },
  {
    icon: Award,
    title: "Premium Quality",
    description: "We never compromise on ingredients — only the finest go into CAZERTS desserts.",
  },
  {
    icon: Users,
    title: "For Every Celebration",
    description: "Birthdays, anniversaries, or just a sweet craving — we're part of your moments.",
  },
  {
    icon: Sparkles,
    title: "Crafted To Impress",
    description: "Beautiful presentation meets unforgettable taste in every single order.",
  },
];

export default function AboutPage() {
  return (
    <div className="pt-28 bg-cream">
      {/* Hero */}
      <section className="section pb-12">
        <div className="container-max text-center max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-magenta uppercase tracking-[0.25em] text-xs font-semibold mb-3"
          >
            Our Story
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-black mb-6"
          >
            About CAZERTS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-black/60 text-base md:text-lg leading-relaxed"
          >
            CAZERTS was born from a simple belief — dessert should be an
            experience, not an afterthought. We specialize in handcrafted
            sundaes, signature cake cans, brownies, cheesecakes, waffles,
            milkshakes, coffee, and indulgent chocolate desserts, each made
            with premium ingredients and presented with care. Every bite is
            designed to turn an ordinary moment into a celebration.
          </motion.p>
        </div>
      </section>

      {/* Image + story */}
      <section className="section pt-0">
        <div className="container-max grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl overflow-hidden aspect-[4/3] bg-cover bg-center shadow-card"
            style={{ backgroundImage: "url('/images/about-story.jpg')" }}
          />
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-extrabold text-black mb-4">
              Every Bite,  A Celebration.
            </h2>
            <p className="text-black/60 leading-relaxed mb-4">
              What started as a passion for creating memorable dessert
              experiences has grown into a brand loved for its quality,
              presentation, and consistency. From our signature cake cans to
              our indulgent sundaes, everything at CAZERTS is made to be
              shared, savoured, and remembered.
            </p>
            <p className="text-black/60 leading-relaxed">
              We believe great desserts bring people together — and that's
              exactly what we aim to deliver with every order.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-white">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-black">
              What We Stand For
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl bg-cream hover:shadow-card transition-shadow"
              >
                <div className="w-14 h-14 rounded-full bg-magenta/10 flex items-center justify-center mx-auto mb-4">
                  <val.icon size={26} className="text-magenta" />
                </div>
                <h3 className="font-bold text-black mb-2">{val.title}</h3>
                <p className="text-black/60 text-sm leading-relaxed">
                  {val.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}