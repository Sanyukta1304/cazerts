import { supabase } from "@/lib/supabase";
import { CartItem } from "@/context/CartContext";

export type CheckoutInput = {
  name: string;
  email?: string;
  phone: string;
  gender?: string;
  locationId: string; // e.g. "btm-layout", "indiranagar", "koramangala"
  orderMode: "delivery" | "pickup" | "dinein";
  paymentMethod: "cash" | "upi" | "card";
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryPincode?: string;
  items: CartItem[];
  total: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
};

export type SubmitOrderResult = {
  orderId: string;
  billNo: string;
};

// Location codes used in bill numbers: CZT-01-001, CZT-02-001, etc.
// Kept in sync with cazerts-admin's lib/order-store.ts LOCATION_CODES.
const LOCATION_CODES: Record<string, string> = {
  "btm-layout": "01",
  indiranagar: "02",
  koramangala: "03",
};

function getLocationCode(locationId: string): string {
  return LOCATION_CODES[locationId] ?? "00";
}

async function generateUniqueBillNo(locationId: string): Promise<string> {
  const code = getLocationCode(locationId);

  const { data, error } = await supabase
    .from("orders")
    .select("bill_no")
    .eq("location_id", locationId)
    .not("bill_no", "is", null);

  if (error) {
    console.error("Error generating bill number:", error);
    return `CZT-${code}-${Date.now()}`;
  }

  let max = 0;
  const pattern = new RegExp(`^CZT-${code}-(\\d+)$`);
  for (const row of data ?? []) {
    const match = pattern.exec(row.bill_no ?? "");
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > max) max = num;
    }
  }
  const next = max + 1;
  return `CZT-${code}-${String(next).padStart(3, "0")}`;
}

// Find existing customer by phone, or create a new one
async function findOrCreateCustomer(
  name: string,
  phone: string,
  email?: string,
  gender?: string
) {
  const { data: existing, error: findError } = await supabase
    .from("customers")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (findError) {
    console.error("Error finding customer:", findError);
    throw findError;
  }

  if (existing) {
    return existing.id;
  }

  const { data: created, error: createError } = await supabase
    .from("customers")
    .insert({ name, phone, email: email || null, gender: gender || null })
    .select("id")
    .single();

  if (createError) {
    console.error("Error creating customer:", createError);
    throw createError;
  }

  return created.id;
}

export async function submitOrder(input: CheckoutInput): Promise<SubmitOrderResult> {
  const customerId = await findOrCreateCustomer(input.name, input.phone, input.email, input.gender);
  const billNo = await generateUniqueBillNo(input.locationId);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      status: "pending",
      total: input.total,
      location_id: input.locationId,
      order_mode: input.orderMode,
      payment_method: input.paymentMethod,
      delivery_address: input.deliveryAddress || null,
      delivery_city: input.deliveryCity || null,
      delivery_pincode: input.deliveryPincode || null,
      razorpay_order_id: input.razorpayOrderId || null,
      razorpay_payment_id: input.razorpayPaymentId || null,
      bill_no: billNo,
    })
    .select("id")
    .single();

  if (orderError) {
    console.error("Error creating order:", orderError);
    throw orderError;
  }

  const orderItems = input.items.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    product_name: item.name,
    quantity: item.quantity,
    price: item.price,
    category: item.category_name,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error("Error creating order items:", itemsError);
    throw itemsError;
  }

  return { orderId: order.id, billNo };
}

// Keeps the customers table's name in sync with the profile name a
// logged-in user sets on the login/profile page. Best-effort: if no
// customer row exists yet for this phone (first-time visitor who hasn't
// checked out), this simply updates 0 rows and does nothing.
export async function syncCustomerName(phone: string, name: string): Promise<void> {
  const { error } = await supabase.from("customers").update({ name }).eq("phone", phone);
  if (error) {
    console.error("Error syncing customer name:", error);
  }
}

// ============================================
// Crowns — used by the Navbar to show a logged-in customer's crown count.
// Crowns = 20% of total lifetime spend, rounded to the nearest whole crown.
// Kept in sync with cazerts-admin's getCrownLeaderboard logic.
// ============================================

export type CustomerCrowns = {
  crowns: number;
  totalSpent: number;
};

export async function getCustomerCrowns(phone: string): Promise<CustomerCrowns> {
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (customerError) {
    console.error("Error finding customer for crowns:", customerError);
    throw customerError;
  }

  if (!customer) {
    return { crowns: 0, totalSpent: 0 };
  }

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("total")
    .eq("customer_id", customer.id);

  if (ordersError) {
    console.error("Error fetching orders for crowns:", ordersError);
    throw ordersError;
  }

  const totalSpent = (orders ?? []).reduce((sum, o) => sum + (o.total ?? 0), 0);
  const crowns = Math.round(totalSpent * 0.2);

  return { crowns, totalSpent };
}

// ============================================
// Leaderboard — all customers ranked by crowns, all-time.
// Crowns = 20% of total lifetime spend, rounded to the nearest whole crown.
// ============================================

export type LeaderboardEntry = {
  customerId: string;
  name: string;
  totalSpent: number;
  crowns: number;
};

async function buildFullLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("customer_id, total, customers(name)");

  if (error) {
    console.error("Error building leaderboard:", error);
    throw error;
  }

  const map = new Map<string, LeaderboardEntry>();
  for (const row of data ?? []) {
    const customerId = row.customer_id as string;
    if (!customerId) continue;
    const name = (row as any).customers?.name ?? "Customer";
    const total = (row.total as number) ?? 0;

    const existing = map.get(customerId);
    if (existing) {
      existing.totalSpent += total;
    } else {
      map.set(customerId, { customerId, name, totalSpent: total, crowns: 0 });
    }
  }

  const list = Array.from(map.values());
  for (const entry of list) {
    entry.crowns = Math.round(entry.totalSpent * 0.2);
  }

  return list.sort((a, b) => b.crowns - a.crowns);
}

export async function getLeaderboard(limit: number = 5): Promise<LeaderboardEntry[]> {
  const full = await buildFullLeaderboard();
  return full.slice(0, limit);
}

export type CustomerRank = {
  rank: number;
  crowns: number;
  totalSpent: number;
  customerId: string;
};

export async function getCustomerRank(phone: string): Promise<CustomerRank | null> {
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (customerError) {
    console.error("Error finding customer for rank:", customerError);
    throw customerError;
  }

  if (!customer) return null;

  const full = await buildFullLeaderboard();
  const index = full.findIndex((entry) => entry.customerId === customer.id);
  if (index === -1) return null;

  const entry = full[index];
  return { rank: index + 1, crowns: entry.crowns, totalSpent: entry.totalSpent, customerId: customer.id };
}

// ============================================
// Order History — a logged-in customer's own past orders.
// ============================================

export type OrderHistoryItem = {
  id: string;
  billNo: string;
  status: string;
  total: number;
  orderMode: string;
  paymentMethod: string;
  locationId: string;
  createdAt: string;
  items: {
    name: string;
    category: string;
    quantity: number;
    price: number;
  }[];
};

export async function getCustomerOrders(phone: string): Promise<OrderHistoryItem[]> {
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (customerError) {
    console.error("Error finding customer for order history:", customerError);
    throw customerError;
  }

  if (!customer) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching order history:", error);
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    billNo: row.bill_no ?? "—",
    status: row.status,
    total: row.total,
    orderMode: row.order_mode,
    paymentMethod: row.payment_method,
    locationId: row.location_id,
    createdAt: row.created_at,
    items: (row.order_items ?? []).map((i: any) => ({
      name: i.product_name,
      category: i.category ?? "",
      quantity: i.quantity,
      price: i.price,
    })),
  }));
}