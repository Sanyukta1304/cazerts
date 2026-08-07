"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { products as initialProducts, Product } from "@/data/products";

const categoryOptions = [
  "Sundaes", "Cake Cans", "Brownies", "Cheesecakes",
  "Waffles", "Milkshakes", "Coffee", "Cold Beverages",
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "", category: categoryOptions[0], description: "", price: "", image: "",
  });

  const openAddForm = () => {
    setEditing(null);
    setForm({ name: "", category: categoryOptions[0], description: "", price: "", image: "" });
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      category: product.category,
      description: product.description,
      price: String(product.price),
      image: product.image,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this product?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    if (editing) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? { ...p, ...form, price: Number(form.price) }
            : p
        )
      );
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: form.name,
        category: form.category,
        description: form.description,
        price: Number(form.price),
        image: form.image || "/images/placeholder.jpg",
      };
      setProducts((prev) => [newProduct, ...prev]);
    }
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-black mb-1">
            Products
          </h1>
          <p className="text-black/60 text-sm">
            {products.length} products total
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-magenta text-white font-semibold px-5 py-2.5 rounded-full hover:bg-magenta-dark transition-colors"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-black/5 text-left text-black/50 text-xs uppercase tracking-wide">
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-black/5 last:border-0">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg bg-cover bg-center shrink-0"
                    style={{ backgroundImage: `url('${p.image}')` }}
                  />
                  <span className="font-medium text-black">{p.name}</span>
                </td>
                <td className="px-6 py-4 text-black/60">{p.category}</td>
                <td className="px-6 py-4 font-semibold text-magenta">₹{p.price}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEditForm(p)}
                      className="p-2 rounded-lg hover:bg-magenta/10 text-black/60 hover:text-magenta transition-colors"
                      aria-label="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-black/60 hover:text-red-500 transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-lg relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-5 right-5 text-black/40 hover:text-black"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-black mb-6">
              {editing ? "Edit Product" : "Add Product"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Product Name"
                className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-magenta"
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-magenta"
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-magenta resize-none"
              />
              <input
                type="number"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Price (₹)"
                className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-magenta"
              />
              <input
                type="text"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="Image path e.g. /images/product.jpg"
                className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-magenta"
              />
              <button
                type="submit"
                className="w-full bg-magenta text-white font-semibold px-6 py-3.5 rounded-full hover:bg-magenta-dark transition-colors"
              >
                {editing ? "Save Changes" : "Add Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}