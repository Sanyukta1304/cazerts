"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Package, CheckCircle2, Truck, Clock } from "lucide-react";

const steps = [
  { label: "Order Placed", icon: Clock },
  { label: "Preparing", icon: Package },
  { label: "Out for Delivery", icon: Truck },
  { label: "Delivered", icon: CheckCircle2 },
];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [searched, setSearched] = useState(false);
  // Mock: any non-empty order ID returns step 2 (Preparing) as current status
  const currentStep = 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setSearched(true);
  };

  return (
    <div className="pt-28 pb-16 bg-cream min-h-screen">
      <div className="container-max px-6 md:px-12 lg:px-20 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-magenta uppercase tracking-[0.25em] text-xs font-semibold mb-3">
            Track Your Order
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-black">
            Where's My Order?
          </h1>
        </motion.div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-10">
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter Order ID e.g. CZ1042"
            className="flex-1 px-5 py-3.5 rounded-full border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-magenta"
          />
          <button
            type="submit"
            className="flex items-center gap-2 bg-magenta text-white font-semibold px-6 py-3.5 rounded-full hover:bg-magenta-dark transition-colors"
          >
            <Search size={16} />
            Track
          </button>
        </form>

        {searched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl p-8 shadow-card"
          >
            <p className="text-black/50 text-sm mb-1">Order ID</p>
            <p className="font-bold text-black text-lg mb-8">
              #{orderId.toUpperCase()}
            </p>

            <div className="relative">
              {steps.map((step, i) => {
                const done = i <= currentStep;
                return (
                  <div key={step.label} className="flex items-start gap-4 pb-8 last:pb-0 relative">
                    {i < steps.length - 1 && (
                      <div
                        className={`absolute left-[19px] top-10 w-0.5 h-full ${
                          i < currentStep ? "bg-magenta" : "bg-black/10"
                        }`}
                      />
                    )}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        done ? "bg-magenta text-white" : "bg-black/5 text-black/30"
                      }`}
                    >
                      <step.icon size={18} />
                    </div>
                    <div className="pt-2">
                      <p className={`font-semibold text-sm ${done ? "text-black" : "text-black/40"}`}>
                        {step.label}
                      </p>
                      {i === currentStep && (
                        <p className="text-magenta text-xs mt-1">Current status</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}