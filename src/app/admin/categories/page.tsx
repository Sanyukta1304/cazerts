"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { categories as initialCategories } from "@/data/products";

type Category = { name: string; slug: string; image: string };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", image: "" });

  const handleDelete = (slug: string) => {
    if (confirm("Delete this category?")) {
      setCategories((prev) => prev.filter((c) => c.slug !== slug));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    const slug = form.name.toLowerCase().replace(/\s+/g, "-");
    setCategories((prev) => [
      ...prev,
      { name: form.name, slug, image: form.image || "/images/placeholder.jpg" },
    ]);
    setForm({ name: "", image: "" });
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-black mb-1">
            Categories
          </h1>
          <p className="text-black/60 text-sm">
            {categories.length} categories
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-magenta text-white font-semibold px-5 py-2.5 rounded-full hover:bg-magenta-dark transition-colors"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {categories.map((cat) => (
          <div key={cat.slug} className="bg-white rounded-2xl overflow-hidden shadow-card">
            <div
              className="aspect-video bg-cover bg-center"
              style={{ backgroundImage: `url('${cat.image}')` }}
            />
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-black text-sm">{cat.name}</p>
                <p className="text-black/40 text-xs">{cat.slug}</p>
              </div>
              <button
                onClick={() => handleDelete(cat.slug)}
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
            <h2 className="text-xl font-bold text-black mb-6">Add Category</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Category Name"
                className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-magenta"
              />
              <input
                type="text"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="Image path e.g. /images/category.jpg"
                className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-magenta"
              />
              <button
                type="submit"
                className="w-full bg-magenta text-white font-semibold px-6 py-3.5 rounded-full hover:bg-magenta-dark transition-colors"
              >
                Add Category
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}