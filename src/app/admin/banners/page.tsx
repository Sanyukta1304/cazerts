"use client";

import { useState } from "react";
import { Plus, Trash2, X, Eye, EyeOff } from "lucide-react";

type Banner = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  active: boolean;
};

const initialBanners: Banner[] = [
  {
    id: "1",
    title: "Every Bite,  A Celebration.",
    subtitle: "Premium handcrafted sundaes, cake cans & more.",
    image: "/images/hero-dessert.jpg",
    active: true,
  },
  {
    id: "2",
    title: "New: Belgian Chocolate Cake Can",
    subtitle: "Try our newest indulgent flavour, launching this week.",
    image: "/images/cake-can-belgian.jpg",
    active: false,
  },
];

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", subtitle: "", image: "" });

  const toggleActive = (id: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this banner?")) {
      setBanners((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    setBanners((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: form.title,
        subtitle: form.subtitle,
        image: form.image || "/images/placeholder.jpg",
        active: true,
      },
    ]);
    setForm({ title: "", subtitle: "", image: "" });
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-black mb-1">
            Banner Management
          </h1>
          <p className="text-black/60 text-sm">{banners.length} banners</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-magenta text-white font-semibold px-5 py-2.5 rounded-full hover:bg-magenta-dark transition-colors"
        >
          <Plus size={18} />
          Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-2xl overflow-hidden shadow-card">
            <div
              className="aspect-video bg-cover bg-center relative"
              style={{ backgroundImage: `url('${banner.image}')` }}
            >
              <div className="absolute inset-0 bg-black/40 flex items-end p-4">
                <div>
                  <p className="text-white font-bold text-sm">{banner.title}</p>
                  <p className="text-white/70 text-xs">{banner.subtitle}</p>
                </div>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <button
                onClick={() => toggleActive(banner.id)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                  banner.active
                    ? "bg-green-100 text-green-700"
                    : "bg-black/5 text-black/40"
                }`}
              >
                {banner.active ? <Eye size={12} /> : <EyeOff size={12} />}
                {banner.active ? "Active" : "Hidden"}
              </button>
              <button
                onClick={() => handleDelete(banner.id)}
                className="p-2 rounded-lg hover:bg-red-50 text-black/40 hover:text-red-500 transition-colors"
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
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
            <h2 className="text-xl font-bold text-black mb-6">Add Banner</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Banner Title"
                className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-magenta"
              />
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="Subtitle"
                className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-magenta"
              />
              <input
                type="text"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="Image path e.g. /images/banner.jpg"
                className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-magenta"
              />
              <button
                type="submit"
                className="w-full bg-magenta text-white font-semibold px-6 py-3.5 rounded-full hover:bg-magenta-dark transition-colors"
              >
                Add Banner
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}