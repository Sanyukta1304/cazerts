"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabase";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fireConfetti = () => {
    const colors = ["#E6007E", "#C9A227", "#FFFFFF", "#FF3FA0"];

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors,
      startVelocity: 45,
      scalar: 1.1,
    });

    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.6 },
        colors,
      });
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;

    const normalizedEmail = email.trim().toLowerCase();
    setSubmitting(true);

    const { error } = await supabase
      .from("subscribers")
      .insert({ email: normalizedEmail });

    setSubmitting(false);

    if (error) {
      // Postgres unique-violation code for the email column
      if (error.code === "23505") {
        setAlreadySubscribed(true);
        setEmail("");
        setTimeout(() => setAlreadySubscribed(false), 3500);
        return;
      }
      console.error("Error subscribing:", error);
      return;
    }

    setSubmitted(true);
    setEmail("");
    fireConfetti();
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <motion.section
      animate={{
        background: [
          "linear-gradient(135deg, #E6007E 0%, #B3005F 100%)",
          "linear-gradient(135deg, #FF3FA0 0%, #E6007E 50%, #B3005F 100%)",
          "linear-gradient(135deg, #B3005F 0%, #E6007E 100%)",
          "linear-gradient(135deg, #E6007E 0%, #B3005F 100%)",
        ],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="section relative overflow-hidden"
    >
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

      <div className="container-max relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto text-center bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-12 shadow-premium"
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={28} className="text-magenta" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Join The Celebration
          </h2>
          <p className="text-white/80 mb-8">
            Subscribe for exclusive offers, new dessert launches, and
            member-only treats.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-5 py-3.5 rounded-full bg-white text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-gold shadow-sm"
            />
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center justify-center gap-2 bg-black text-white font-semibold px-6 py-3.5 rounded-full hover:bg-black/80 transition-colors shrink-0 disabled:opacity-60"
            >
              <Send size={16} />
              {submitting ? "Subscribing..." : "Subscribe"}
            </motion.button>
          </form>

          {submitted && (
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 text-white text-sm mt-4 font-medium"
            >
              🎉 Thanks for subscribing! Check your inbox soon.
            </motion.p>
          )}

          {alreadySubscribed && (
            <motion.p
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: [0, -8, 8, -6, 6, -3, 3, 0] }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center gap-2 text-white text-sm mt-4 font-medium"
            >
              <CheckCircle2 size={16} />
              You're already part of the celebration! 🎂
            </motion.p>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}