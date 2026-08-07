"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Package, MapPin, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getCustomerOrders, OrderHistoryItem } from "@/lib/orders";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  processing: "Preparing",
  ready: "Ready",
  completed: "Completed",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-black/5 text-black/60",
  processing: "bg-amber-50 text-amber-600",
  ready: "bg-blue-50 text-blue-600",
  completed: "bg-green-50 text-green-600",
};

const MODE_LABEL: Record<string, string> = {
  delivery: "Delivery",
  pickup: "Pickup",
  dinein: "Dine In",
};

export default function OrderHistoryPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login?redirect=/order-history");
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    async function load() {
      if (!user?.phone) return;
      const data = await getCustomerOrders(user.phone);
      setOrders(data);
      setLoading(false);
    }
    if (isLoggedIn && user?.phone) load();
  }, [isLoggedIn, user?.phone]);

  if (!isLoggedIn) {
    return (
      <div className="pt-32 pb-20 bg-cream min-h-screen flex items-center justify-center">
        <p className="text-black/50 text-sm">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16 bg-cream min-h-screen">
      <div className="container-max px-6 md:px-12 lg:px-20 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-magenta uppercase tracking-[0.25em] text-xs font-semibold mb-3">
            Your Orders
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-black">Order History</h1>
        </motion.div>

        {loading ? (
          <p className="text-center text-black/40">Loading your orders...</p>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-14 text-center shadow-card">
            <Package size={40} className="text-black/20 mx-auto mb-4" />
            <p className="text-black/50 mb-6">You haven't placed any orders yet.</p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-magenta text-white font-semibold px-6 py-3 rounded-full hover:bg-magenta-dark transition-colors"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="bg-white rounded-3xl p-6 shadow-card"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <span className="font-bold text-black">{order.billNo}</span>
                    <span className="text-black/30 text-xs ml-2 inline-flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_COLOR[order.status] ?? "bg-black/5 text-black/60"}`}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                    <span className="text-xs font-semibold text-black/50 bg-black/5 px-3 py-1.5 rounded-full">
                      {MODE_LABEL[order.orderMode] ?? order.orderMode}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-black/5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 text-sm">
                      <div>
                        <span className="text-black font-medium">{item.name}</span>
                        <span className="text-black/40 ml-2">× {item.quantity}</span>
                      </div>
                      <span className="text-black font-semibold">
                        ₹{item.quantity * item.price}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-black/10">
                  <span className="text-xs text-black/40 flex items-center gap-1">
                    <MapPin size={11} />
                    {order.locationId}
                  </span>
                  <span className="font-extrabold text-magenta">₹{order.total}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}