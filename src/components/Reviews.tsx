"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star, PenLine } from "lucide-react";

const staticReviews = [
  {
    id: "s1",
    name: "Ananya Sharma",
    rating: 5,
    text: "The Death By Chocolate sundae is unreal. Presentation was gorgeous and it tasted even better than it looked.",
  },
  {
    id: "s2",
    name: "Rohan Mehta",
    rating: 5,
    text: "Ordered the Red Velvet Cake Can for a birthday — everyone was obsessed. Will definitely order again.",
  },
  {
    id: "s3",
    name: "Priya Nair",
    rating: 4,
    text: "Loved the Tiramisu Sundae, rich and not overly sweet. Delivery was quick too.",
  },
  {
    id: "s4",
    name: "Karthik Iyer",
    rating: 5,
    text: "CAZERTS has genuinely the best cheesecake cans I've had in the city. Consistent quality every time.",
  },
];

export default function Reviews() {
  return (
    <section className="section bg-cream">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-magenta uppercase tracking-[0.25em] text-xs font-semibold mb-3">
            Loved By Our Customers
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-black">
            Customer Reviews
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {staticReviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-white rounded-2xl p-6 shadow-card hover:shadow-premium transition-all duration-300"
            >
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    size={16}
                    className={
                      idx < review.rating
                        ? "fill-gold text-gold"
                        : "fill-black/10 text-black/10"
                    }
                  />
                ))}
              </div>
              <p className="text-black/70 text-sm leading-relaxed mb-4">
                "{review.text}"
              </p>
              <p className="font-semibold text-black text-sm">{review.name}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/write-review"
            className="inline-flex items-center gap-2 bg-magenta text-white font-semibold px-7 py-3.5 rounded-full hover:bg-magenta-dark transition-colors shadow-premium"
          >
            <PenLine size={18} />
            Write a Review
          </Link>
        </div>
      </div>
    </section>
  );
}