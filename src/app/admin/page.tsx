import { Package, ShoppingBag, Users, Ticket, TrendingUp, DollarSign } from "lucide-react";
import { products } from "@/data/products";

const stats = [
  { label: "Total Products", value: products.length, icon: Package, color: "bg-magenta" },
  { label: "Total Orders", value: 128, icon: ShoppingBag, color: "bg-gold" },
  { label: "Total Customers", value: 342, icon: Users, color: "bg-black" },
  { label: "Active Coupons", value: 2, icon: Ticket, color: "bg-magenta-dark" },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-black mb-2">
        Dashboard
      </h1>
      <p className="text-black/60 mb-8">
        Welcome back! Here's an overview of your store.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-6 shadow-card"
          >
            <div className={`w-11 h-11 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon size={20} className="text-white" />
            </div>
            <p className="text-black/50 text-sm mb-1">{stat.label}</p>
            <p className="text-2xl font-extrabold text-black">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-magenta" />
            <h2 className="font-bold text-black">Recent Activity</h2>
          </div>
          <ul className="space-y-3 text-sm text-black/60">
            <li className="flex justify-between border-b border-black/5 pb-3">
              <span>New order #1042 placed</span>
              <span className="text-black/40">2 min ago</span>
            </li>
            <li className="flex justify-between border-b border-black/5 pb-3">
              <span>Coupon SWEET10 used</span>
              <span className="text-black/40">15 min ago</span>
            </li>
            <li className="flex justify-between border-b border-black/5 pb-3">
              <span>New customer registered</span>
              <span className="text-black/40">1 hour ago</span>
            </li>
            <li className="flex justify-between">
              <span>Product "Gudbud" stock updated</span>
              <span className="text-black/40">3 hours ago</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={18} className="text-magenta" />
            <h2 className="font-bold text-black">Quick Summary</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-black/60">Today's Revenue</span>
                <span className="font-semibold text-black">₹12,450</span>
              </div>
              <div className="w-full bg-black/5 rounded-full h-2">
                <div className="bg-magenta h-2 rounded-full" style={{ width: "68%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-black/60">Monthly Target</span>
                <span className="font-semibold text-black">₹3,20,000</span>
              </div>
              <div className="w-full bg-black/5 rounded-full h-2">
                <div className="bg-gold h-2 rounded-full" style={{ width: "45%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}