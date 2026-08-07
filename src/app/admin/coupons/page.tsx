"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";

type Coupon = {
  code: string;
  discount: number;
  active: boolean;
};

const initialCoupons: Coupon[] = [
  { code: "SWEET10", discount: 10, active: true },
  { code: "CAZERTS20", discount: 20, active: true },
];

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", discount: "" });

  const toggleActive = (code: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.code === code ? { ...c, active: !c.active } : c))
    );
  };

  const handleDelete = (code: string) => {
    if (confirm("Delete this coupon?")) {
      setCoupons((prev) => prev.filter((c) => c.code !== code));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.discount) return;
    setCoupons((prev) => [
      ...prev,
      { code: form.code.toUpperCase(), discount: Number(form.discount), active: true },
    ]);
    setForm({ code: "", discount: "" });
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-black mb-1">
            Coupons
          </h1>
          <p className="text-black/60 text-sm">{coupons.length} coupon codes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-magenta text-white font-semibold px-5 py-2.5 rounded-full hover:bg-magenta-dark transition-colors"
        >
          <Plus size={18} />
          Add Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {coupons.map((coupon) => (
          <div key={coupon.code} className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-extrabold text-lg text-black tracking-wide">
                  {coupon.code}
                </p>
                <p className="text-magenta font-semibold text-sm">
                  {coupon.discount}% off
                </p>
              </div>
              <button
                onClick={() => handleDelete(coupon.code)}
                className="p-2 rounded-lg hover:bg-red-50 text-black/40 hover:text-red-500 transition-colors"
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <button
              onClick={() => toggleActive(coupon.code)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                coupon.active
                  ? "bg-green-100 text-green-700"
                  : "bg-black/5 text-black/40"
              }`}
            >
              {coupon.active ? "Active" : "Inactive"}
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-5 right-5 text-black/40 hover:text-black"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-black mb-6">Add Coupon</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="Coupon Code e.g. SAVE15"
                className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-magenta uppercase"
              />
              <input
                type="number"
                required
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: e.target.value })}
                placeholder="Discount %"
                className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-magenta"
              />
              <button
                type="submit"
                className="w-full bg-magenta text-white font-semibold px-6 py-3.5 rounded-full hover:bg-magenta-dark transition-colors"
              >
                Add Coupon
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}