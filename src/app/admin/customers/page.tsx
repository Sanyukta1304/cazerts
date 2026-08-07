"use client";

import { Mail, Phone } from "lucide-react";

const customers = [
  { name: "Ananya Sharma", email: "ananya@example.com", phone: "+91 90000 11111", orders: 5, spent: 2450 },
  { name: "Rohan Mehta", email: "rohan@example.com", phone: "+91 90000 22222", orders: 3, spent: 1120 },
  { name: "Priya Nair", email: "priya@example.com", phone: "+91 90000 33333", orders: 8, spent: 3890 },
  { name: "Karthik Iyer", email: "karthik@example.com", phone: "+91 90000 44444", orders: 2, spent: 687 },
  { name: "Sneha Reddy", email: "sneha@example.com", phone: "+91 90000 55555", orders: 6, spent: 2980 },
];

export default function AdminCustomersPage() {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-black mb-1">
        Customers
      </h1>
      <p className="text-black/60 text-sm mb-8">{customers.length} registered customers</p>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-black/5 text-left text-black/50 text-xs uppercase tracking-wide">
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Orders</th>
              <th className="px-6 py-4">Total Spent</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.email} className="border-b border-black/5 last:border-0">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-magenta/10 text-magenta font-bold flex items-center justify-center text-xs shrink-0">
                    {c.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-medium text-black">{c.name}</p>
                    <div className="flex items-center gap-1 text-black/40 text-xs mt-0.5">
                      <Mail size={12} /> {c.email}
                    </div>
                    <div className="flex items-center gap-1 text-black/40 text-xs mt-0.5">
                      <Phone size={12} /> {c.phone}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-black/70">{c.orders}</td>
                <td className="px-6 py-4 font-semibold text-magenta">₹{c.spent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}