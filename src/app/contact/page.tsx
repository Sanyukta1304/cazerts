"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setError("");
    setSubmitting(true);

    const { error: insertError } = await supabase.from("contact_messages").insert({
      name: form.name,
      email: form.email,
      message: form.message,
    });

    setSubmitting(false);

    if (insertError) {
      console.error("Error sending message:", insertError);
      setError("Couldn't send your message. Please try again.");
      return;
    }

    setSubmitted(true);
    setForm({ name: "", email: "", message: "" });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="pt-28 pb-16 bg-cream min-h-screen">
      <div className="container-max px-6 md:px-12 lg:px-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-14">
          <p className="text-magenta uppercase tracking-[0.25em] text-xs font-semibold mb-3">Get In Touch</p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-black">Contact Us</h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-6">
            <a href="https://maps.google.com/?q=Bengaluru,Karnataka,India" target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl p-6 shadow-card flex items-start gap-4 hover:shadow-premium transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-magenta/10 flex items-center justify-center shrink-0">
                <MapPin size={22} className="text-magenta" />
              </div>
              <div>
                <h3 className="font-bold text-black mb-1">Visit Us</h3>
                <p className="text-black/60 text-sm">Bengaluru, Karnataka, India</p>
              </div>
            </a>

            <a href="tel:+910000000000" className="bg-white rounded-2xl p-6 shadow-card flex items-start gap-4 hover:shadow-premium transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-magenta/10 flex items-center justify-center shrink-0">
                <Phone size={22} className="text-magenta" />
              </div>
              <div>
                <h3 className="font-bold text-black mb-1">Call Us</h3>
                <p className="text-black/60 text-sm">+91 00000 00000</p>
              </div>
            </a>

            <a href="mailto:hello@cazerts.com" className="bg-white rounded-2xl p-6 shadow-card flex items-start gap-4 hover:shadow-premium transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-magenta/10 flex items-center justify-center shrink-0">
                <Mail size={22} className="text-magenta" />
              </div>
              <div>
                <h3 className="font-bold text-black mb-1">Email Us</h3>
                <p className="text-black/60 text-sm">hello@cazerts.com</p>
              </div>
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="bg-white rounded-3xl p-8 shadow-card">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Name</label>
                <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="Your name" className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-magenta" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Email</label>
                <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-magenta" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Message</label>
                <textarea name="message" required rows={5} value={form.message} onChange={handleChange} placeholder="How can we help you?" className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-magenta resize-none" />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 px-4 py-3 rounded-xl">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-magenta text-white font-semibold px-6 py-3.5 rounded-full hover:bg-magenta-dark transition-colors disabled:opacity-60"
              >
                <Send size={16} />
                {submitting ? "Sending..." : "Send Message"}
              </button>

              {submitted && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-green-600 font-medium">
                  ✓ Message sent! We'll get back to you soon.
                </motion.p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}