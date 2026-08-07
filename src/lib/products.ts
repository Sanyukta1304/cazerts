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

  return (data || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    image_url: p.image_url,
    category_id: p.category_id,
    category_name: p.categories?.name || "Uncategorized",
    // No inventory row at all = never been marked out of stock = in stock.
    in_stock: !stockMap.has(p.id) || stockMap.get(p.id)! > 0,
  }));
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