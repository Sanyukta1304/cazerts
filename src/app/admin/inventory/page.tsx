"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { products } from "@/data/products";

type StockItem = {
  id: string;
  name: string;
  category: string;
  stock: number;
};

const initialStock: StockItem[] = products.map((p, i) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  stock: [45, 8, 30, 3, 60, 15, 22, 5, 40, 2, 18][i % 11],
}));

const LOW_STOCK_THRESHOLD = 10;

export default function AdminInventoryPage() {
  const [stock, setStock] = useState<StockItem[]>(initialStock);

  const updateStock = (id: string, value: number) => {
    setStock((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stock: Math.max(0, value) } : item))
    );
  };

  const lowStockCount = stock.filter((s) => s.stock <= LOW_STOCK_THRESHOLD).length;

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-black mb-1">
        Inventory
      </h1>
      <p className="text-black/60 text-sm mb-8">
        {stock.length} products tracked
        {lowStockCount > 0 && (
          <span className="text-red-500 font-medium"> · {lowStockCount} low on stock</span>
        )}
      </p>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-black/5 text-left text-black/50 text-xs uppercase tracking-wide">
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((item) => {
              const isLow = item.stock <= LOW_STOCK_THRESHOLD;
              return (
                <tr key={item.id} className="border-b border-black/5 last:border-0">
                  <td className="px-6 py-4 font-medium text-black">{item.name}</td>
                  <td className="px-6 py-4 text-black/60">{item.category}</td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={item.stock}
                      onChange={(e) => updateStock(item.id, Number(e.target.value))}
                      className="w-20 px-3 py-2 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-magenta text-center"
                    />
                  </td>
                  <td className="px-6 py-4">
                    {isLow ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-full w-fit">
                        <AlertTriangle size={12} />
                        Low Stock
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-full w-fit">
                        In Stock
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}