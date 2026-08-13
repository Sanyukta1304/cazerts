import { supabase } from "@/lib/supabase";

export type Product = {
  id: string; // real Supabase UUID
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  category_name: string; // joined from categories table
  in_stock: boolean;
  // Exact quantity currently available. null = not tracked for this
  // product yet, treated as unlimited/in stock.
  stock_quantity: number | null;
};

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      description,
      price,
      image_url,
      category_id,
      categories ( name )
    `);

  if (error) {
    console.error("Error fetching products:", error);
    throw error;
  }

  const { data: inventoryRows, error: inventoryError } = await supabase
    .from("inventory")
    .select("product_id, stock");

  if (inventoryError) {
    console.error("Error fetching inventory:", inventoryError);
  }

  const stockMap = new Map<string, number>();
  for (const row of inventoryRows ?? []) {
    stockMap.set(row.product_id, row.stock);
  }

  return (data || []).map((p: any) => {
    const stockQuantity = stockMap.has(p.id) ? stockMap.get(p.id)! : null;
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      image_url: p.image_url,
      category_id: p.category_id,
      category_name: p.categories?.name || "Uncategorized",
      // No inventory row at all = never been marked out of stock = in stock.
      in_stock: stockQuantity === null || stockQuantity > 0,
      stock_quantity: stockQuantity,
    };
  });
}

// Looks up live stock for a single product — used on the product detail
// page to double-check availability right before checkout, in case it
// changed since the product list was first loaded.
export async function getProductStock(productId: string): Promise<number | null> {
  const { data, error } = await supabase
    .from("inventory")
    .select("stock")
    .eq("product_id", productId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching stock:", error);
    return null;
  }

  return data ? data.stock : null;
}

// Looks up live stock for several products in one call — used by the
// cart and checkout pages so every line item's availability is checked
// together instead of one request per item.
export async function getStockForProductIds(
  productIds: string[]
): Promise<Map<string, number | null>> {
  const result = new Map<string, number | null>();
  if (productIds.length === 0) return result;

  const { data, error } = await supabase
    .from("inventory")
    .select("product_id, stock")
    .in("product_id", productIds);

  if (error) {
    console.error("Error fetching stock:", error);
    return result;
  }

  for (const id of productIds) result.set(id, null);
  for (const row of data ?? []) {
    result.set(row.product_id, row.stock);
  }
  return result;
}

// Reduces stock after an order is placed on the main site, so admin and
// the site stay in sync automatically. Only affects products that already
// have a tracked stock row — untracked products stay unlimited. Never
// goes below 0.
export async function decrementStock(productId: string, qty: number): Promise<void> {
  const { data, error: fetchError } = await supabase
    .from("inventory")
    .select("stock")
    .eq("product_id", productId)
    .maybeSingle();

  if (fetchError) {
    console.error("Error reading stock before decrement:", fetchError);
    return;
  }

  // Not tracked — nothing to decrement.
  if (!data) return;

  const newStock = Math.max(0, data.stock - qty);
  const { error: updateError } = await supabase
    .from("inventory")
    .update({ stock: newStock, updated_at: new Date().toISOString() })
    .eq("product_id", productId);

  if (updateError) {
    console.error("Error decrementing stock:", updateError);
  }
}

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, image_url");

  if (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }

  return data || [];
}

// ============================================
// Product photo gallery — extra photos shown on the product detail page,
// beyond the single main product.image_url cover photo.
// ============================================

export type ProductImage = {
  id: string;
  imageUrl: string;
  sortOrder: number;
};

export async function getProductImages(productId: string): Promise<ProductImage[]> {
  const { data, error } = await supabase
    .from("product_images")
    .select("id, image_url, sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching product gallery:", error);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
  }));
}