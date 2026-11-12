import { supabase } from "@/lib/supabase";

export type ValidPromo = {
  id: string;
  code: string;
  eventName: string;
  discountType: "percent" | "flat";
  discountValue: number;
  minOrder: number;
  maxDiscount: number | null;
};

export type PromoResult =
  | { ok: true; promo: ValidPromo }
  | { ok: false; message: string };

const IST_OFFSET_MS = 330 * 60 * 1000;

function todayIST(): string {
  return new Date(Date.now() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

// Last 10 digits, so "+91 98765 43210" and "9876543210" match.
function normalizePhone(p: string): string {
  return p.replace(/\D/g, "").slice(-10);
}

// Rupees off for a given subtotal. 0 if the minimum order isn't met.
export function promoDiscount(p: ValidPromo, subtotal: number): number {
  if (subtotal < p.minOrder) return 0;

  let d =
    p.discountType === "percent"
      ? (subtotal * p.discountValue) / 100
      : p.discountValue;

  if (p.discountType === "percent" && p.maxDiscount) {
    d = Math.min(d, p.maxDiscount);
  }
  return Math.min(Math.round(d), subtotal);
}

export async function validatePromo(
  codeInput: string,
  phone: string,
  subtotal: number
): Promise<PromoResult> {
  const code = codeInput.trim().toUpperCase();
  if (!code) return { ok: false, message: "Enter a coupon code." };

  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error) {
    console.error("Error checking promo code:", error);
    return { ok: false, message: "Couldn't check the code. Please try again." };
  }

  if (!data || !data.active) return { ok: false, message: "Invalid coupon code." };

  const today = todayIST();
  if (data.valid_from && today < data.valid_from) {
    return { ok: false, message: "This code isn't active yet." };
  }
  if (data.valid_to && today > data.valid_to) {
    return { ok: false, message: "This code has expired." };
  }

  const myPhone = normalizePhone(phone);

  if (data.audience === "specific") {
    const allowed: string[] = data.phones ?? [];
    if (!myPhone || !allowed.includes(myPhone)) {
      return { ok: false, message: "This code isn't available for your account." };
    }
  }

  const minOrder = Number(data.min_order) || 0;
  if (subtotal < minOrder) {
    return { ok: false, message: `Add ₹${minOrder - subtotal} more to use this code (minimum order ₹${minOrder}).` };
  }

  if (data.once_per_customer) {
    const { count, error: countError } = await supabase
      .from("promo_redemptions")
      .select("id", { count: "exact", head: true })
      .eq("code_id", data.id)
      .eq("phone", myPhone);

    if (countError) {
      console.error("Error checking promo usage:", countError);
      return { ok: false, message: "Couldn't check the code. Please try again." };
    }
    if ((count ?? 0) > 0) {
      return { ok: false, message: "You've already used this code." };
    }
  }

  return {
    ok: true,
    promo: {
      id: data.id,
      code: data.code,
      eventName: data.event_name ?? "",
      discountType: data.discount_type,
      discountValue: Number(data.discount_value),
      minOrder,
      maxDiscount: data.max_discount === null ? null : Number(data.max_discount),
    },
  };
}

// Call after the order is saved. Never blocks the order if it fails.
export async function recordRedemption(
  codeId: string,
  phone: string,
  billNo: string
): Promise<void> {
  const { error } = await supabase.from("promo_redemptions").insert({
    code_id: codeId,
    phone: normalizePhone(phone),
    bill_no: billNo,
  });
  if (error) console.error("Error recording promo use:", error);
}