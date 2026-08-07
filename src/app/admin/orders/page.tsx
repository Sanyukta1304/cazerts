"use client";

import { useState } from "react";
import { Eye, X } from "lucide-react";

type OrderStatus = "Pending" | "Preparing" | "Out for Delivery" | "Delivered" | "Cancelled";

type Order = {
  id: string;
  customer: string;
  items: string;
  total: number;
  status: OrderStatus;
  date: string;
};

const initialOrders: Order[] = [
  { id: "CZ1042", customer: "Ananya Sharma", items: "Death By Chocolate x2", total: 498, status: "Delivered", date: "28 Jul 2026" },
  { id: "CZ1043", customer: "Rohan Mehta", items: "Red Velvet Cake Can x1", total: 199, status: "Out for Delivery", date: "29 Jul 2026" },
  { id: "CZ1044", customer: "Priya Nair", items: "Tiramisu Sundae x1, Oreo Cake Can x2", total: 667, status: "Preparing", date: "30 Jul 2026" },
  { id: "CZ1045", customer: "Karthik Iyer", items: "Gudbud x3", total: 687, status: "Pending", date: "30 Jul 2026" },
];

const statusColors: Record<OrderStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Preparing: "bg-blue-100 text-blue-700",
  "Out for Delivery": "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const statusOptions: OrderStatus[] = ["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selected, setSelected] = useState<Order | null>(null);

  const updateStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-black mb-1">
        Orders
      </h1>
      <p className="text-black/60 text-sm mb-8">{orders.length} total orders</p>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-black/5 text-left text-black/50 text-xs uppercase tracking-wide">
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Items</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-black/5 last:border-0">
                <td className="px-6 py-4 font-medium text-black">#{order.id}</td>
                <td className="px-6 py-4 text-black/70">{order.customer}</td>
                <td className="px-6 py-4 text-black/50 max-w-[200px] truncate">{order.items}</td>
                <td className="px-6 py-4 font-semibold text-magenta">₹{order.total}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setSelected(order)}
                    className="p-2 rounded-lg hover:bg-magenta/10 text-black/60 hover:text-magenta transition-colors"
                    aria-label="View"
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-5 right-5 text-black/40 hover:text-black"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-black mb-1">Order #{selected.id}</h2>
            <p className="text-black/50 text-sm mb-6">{selected.date}</p>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-black/60">Customer</span>
                <span className="font-medium text-black">{selected.customer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/60">Items</span>
                <span className="font-medium text-black text-right">{selected.items}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/60">Total</span>
                <span className="font-bold text-magenta">₹{selected.total}</span>
              </div>
            </div>

            <label className="block text-sm font-semibold text-black mb-2">
              Update Status
            </label>
            <select
              value={selected.status}
              onChange={(e) => updateStatus(selected.id, e.target.value as OrderStatus)}
              className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-magenta"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}