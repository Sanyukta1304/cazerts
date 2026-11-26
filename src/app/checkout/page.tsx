"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Tag, CheckCircle2, AlertCircle, MapPin, Store, X, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { submitOrder } from "@/lib/orders";
import { getAllStoreClosures, StoreClosure } from "@/lib/store-closure";
import { HOURS_LABEL, resolveStoreState } from "@/lib/store-hours";
import { getStockForProductIds, decrementStock } from "@/lib/products";
import {
  promoDiscount,
  recordRedemption,
  validatePromo,
  ValidPromo,
} from "@/lib/promoCodes";

type OrderMode = "delivery" | "pickup" | "dinein";

// Delivery and Pickup are "coming soon" for now. Dine In is the only active mode.
const modes: { key: OrderMode; label: string; comingSoon?: boolean }[] = [
  { key: "delivery", label: "Delivery", comingSoon: true },
  { key: "pickup", label: "Pickup", comingSoon: true },
  { key: "dinein", label: "Dine In" },
];

const STORE_LOCATIONS = [
  { id: "btm-layout", name: "BTM Layout" },
  { id: "indiranagar", name: "Indiranagar" },
  { id: "koramangala", name: "Koramangala" },
];

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login?redirect=/checkout");
    }
  }, [isLoggedIn, router]);

  // Dine In is the only mode for now.
  const [mode, setMode] = useState<OrderMode>("dinein");

  useEffect(() => {
    localStorage.setItem("cazerts-order-mode", "dinein");
  }, []);

  const needsAddress = mode === "delivery";

  const [distance, setDistance] = useState<"within4" | "beyond4">("within4");
  const [locationId, setLocationId] = useState(STORE_LOCATIONS[0].id);
  // Once the customer picks a store themselves, we never switch it for them.
  const [storePicked, setStorePicked] = useState(false);

  // Each store's open/closed state is worked out on its own: opening BTM
  // never opens Indiranagar or Koramangala, and closing one never closes another.
  const [closures, setClosures] = useState<StoreClosure[]>([]);
  const [closuresLoaded, setClosuresLoaded] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    let cancelled = false;

    function refresh() {
      setNow(new Date());
      getAllStoreClosures()
        .then((c) => {
          if (!cancelled) setClosures(c);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setClosuresLoaded(true);
        });
    }

    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  function stateFor(id: string) {
    return resolveStoreState(closures.find((c) => c.locationId === id), now);
  }

  const storeState = stateFor(locationId);
  const isStoreClosed = storeState.state === "closed";
  const openStores = STORE_LOCATIONS.filter(
    (loc) => loc.id !== locationId && stateFor(loc.id).state === "open"
  );

  // If the starting store (BTM) is closed but another store is open, begin
  // on the first open store. Skipped once the customer has chosen a store.
  useEffect(() => {
    if (!closuresLoaded || storePicked) return;
    if (resolveStoreState(closures.find((c) => c.locationId === locationId), now).state === "open") return;

    const firstOpen = STORE_LOCATIONS.find(
      (loc) =>
        resolveStoreState(closures.find((c) => c.locationId === loc.id), now).state === "open"
    );
    if (firstOpen) setLocationId(firstOpen.id);
  }, [closuresLoaded, closures, now, storePicked, locationId]);

  // Live stock for everything currently in the cart, checked right on
  // this page so nothing can be ordered after it's sold out elsewhere.
  const [stockIssues, setStockIssues] = useState<{ name: string; available: number }[]>([]);
  const [stockChecked, setStockChecked] = useState(false);

  useEffect(() => {
    if (cart.length === 0) return;
    setStockChecked(false);
    getStockForProductIds(cart.map((item) => item.id))
      .then((map) => {
        const issues: { name: string; available: number }[] = [];
        for (const item of cart) {
          const stock = map.get(item.id);
          if (stock !== undefined && stock !== null && item.quantity > stock) {
            issues.push({ name: item.name, available: stock });
          }
        }
        setStockIssues(issues);
      })
      .catch(() => {
        // Non-critical — if this fails, we just won't block on stock.
      })
      .finally(() => setStockChecked(true));
  }, [cart]);

  const hasStockIssues = stockIssues.length > 0;

  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    pincode: "",
  });

  // Auto-fill name from the logged-in profile once available
  useEffect(() => {
    if (user?.name) {
      setForm((prev) => ({ ...prev, name: user.name || "" }));
    }
  }, [user?.name]);

  const [couponCode, setCouponCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<ValidPromo | null>(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedBillNo, setPlacedBillNo] = useState("");
  const [placedTotal, setPlacedTotal] = useState(0);
  const [paymentError, setPaymentError] = useState("");
  const [savingOrder, setSavingOrder] = useState(false);

  const isDeliveryBlocked = mode === "delivery" && distance === "beyond4";
  const deliveryFee =
    mode === "delivery" && distance === "within4"
      ? cartTotal >= 499
        ? 0
        : 30
      : 0;

  const discountAmount = appliedPromo ? promoDiscount(appliedPromo, cartTotal) : 0;
  const finalTotal = Math.max(cartTotal + deliveryFee - discountAmount, 0);

  const isFormValid =
    !isDeliveryBlocked &&
    !isStoreClosed &&
    !hasStockIssues &&
    (needsAddress
      ? form.name.trim() !== "" &&
        form.address.trim() !== "" &&
        form.city.trim() !== "" &&
        form.pincode.trim() !== ""
      : form.name.trim() !== "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const applyCoupon = async () => {
    if (applyingCoupon) return;
    setApplyingCoupon(true);
    setCouponMessage("");

    const result = await validatePromo(couponCode, user?.phone || "", cartTotal);

    if (result.ok) {
      setAppliedPromo(result.promo);
      const off = promoDiscount(result.promo, cartTotal);
      setCouponMessage(`✓ ${result.promo.code} applied! You save ₹${off}`);
    } else {
      setAppliedPromo(null);
      setCouponMessage(result.message);
    }
    setApplyingCoupon(false);
  };

  const removeCoupon = () => {
    setAppliedPromo(null);
    setCouponCode("");
    setCouponMessage("");
  };

  // Places the order with no online payment. The customer pays at the shop.
  const handlePlaceOrder = async () => {
    if (!user?.phone) {
      setPaymentError("You must be logged in to place an order.");
      return;
    }
    if (savingOrder) return;

    setPaymentError("");
    setSavingOrder(true);

    try {
      // Re-check the chosen store right now: it may have closed since the
      // page loaded. If this check itself fails, we carry on.
      try {
        const fresh = await getAllStoreClosures();
        setClosures(fresh);
        setNow(new Date());
        const freshState = resolveStoreState(
          fresh.find((c) => c.locationId === locationId),
          new Date()
        );
        if (freshState.state === "closed") {
          setPaymentError(
            "This store just closed, so we couldn't place your order. Please choose another store or try again later."
          );
          return;
        }
      } catch {
        // ignore, and place the order
      }

      const result = await submitOrder({
        name: form.name,
        phone: user.phone,
        gender: user.gender,
        locationId,
        orderMode: mode,
        paymentMethod: "cash", // customer pays at the shop
        deliveryAddress: needsAddress ? form.address : undefined,
        deliveryCity: needsAddress ? form.city : undefined,
        deliveryPincode: needsAddress ? form.pincode : undefined,
        items: cart,
        total: finalTotal,
        discount: discountAmount,
      });

      // Remember that this customer used the code (for once-per-customer codes).
      if (appliedPromo) {
        await recordRedemption(appliedPromo.id, user.phone, result.billNo);
      }

      // Reduce stock for every tracked item now that the order is placed —
      // keeps admin and the site in sync automatically.
      for (const item of cart) {
        try {
          await decrementStock(item.id, item.quantity);
        } catch {
          // Non-critical for the order itself — inventory can be
          // corrected manually if this fails.
        }
      }

      setPlacedBillNo(result.billNo);
      setPlacedTotal(finalTotal);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      console.error("Failed to save order:", err);
      setPaymentError("We couldn't place your order. Please try again.");
    } finally {
      setSavingOrder(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="pt-32 pb-20 bg-cream min-h-screen flex items-center justify-center">
        <p className="text-black/50 text-sm">Redirecting to login...</p>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="pt-32 pb-20 bg-cream min-h-screen flex flex-col items-center justify-center text-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CheckCircle2 size={72} className="text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl md:text-3xl font-extrabold text-black mb-3">
            Order Placed Successfully!
          </h1>

          {placedBillNo && (
            <div className="inline-block bg-white rounded-2xl px-6 py-4 mb-6 shadow-card">
              <p className="text-black/40 text-xs uppercase tracking-wide mb-1">Your Bill Number</p>
              <p className="text-2xl font-extrabold text-magenta">{placedBillNo}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl px-6 py-4 mb-8 shadow-card max-w-md mx-auto">
            <p className="text-black font-semibold">
              Please pay ₹{placedTotal} at the shop
            </p>
            <p className="text-black/50 text-sm mt-1">
              Show this bill number at the counter and pay there. Your desserts
              will be served fresh.
            </p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="bg-magenta text-white font-semibold px-8 py-3.5 rounded-full hover:bg-magenta-dark transition-colors"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="pt-32 pb-20 bg-cream min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-2xl font-extrabold text-black mb-3">
          Your cart is empty
        </h1>
        <p className="text-black/60 mb-8">Add some desserts before checking out.</p>
        <button
          onClick={() => router.push("/menu")}
          className="bg-magenta text-white font-semibold px-8 py-3.5 rounded-full hover:bg-magenta-dark transition-colors"
        >
          Explore Menu
        </button>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16 bg-cream min-h-screen">
      <div className="container-max px-6 md:px-12 lg:px-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-extrabold text-black mb-6"
        >
          Checkout
        </motion.h1>

        {/* Mode toggle */}
        <div className="mb-8">
          <div className="inline-flex bg-white rounded-full p-1.5 shadow-card gap-1">
            {modes.map((m) => (
              <button
                key={m.key}
                type="button"
                disabled={m.comingSoon}
                onClick={() => !m.comingSoon && setMode(m.key)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                  m.comingSoon
                    ? "text-black/30 cursor-not-allowed"
                    : mode === m.key
                    ? "bg-magenta text-white shadow-premium"
                    : "text-black/60 hover:text-black"
                }`}
              >
                {m.label}
                {m.comingSoon && (
                  <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black/40">
                    Soon
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-black/40">
            Delivery and Pickup are coming soon. For now, place your order here and pay at the shop.
          </p>
        </div>

        {isStoreClosed && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-5 py-4 rounded-2xl mb-6">
            {storeState.state === "closed" && storeState.source === "admin" ? (
              <>
                This store is closed right now.
                {storeState.reason && <> Reason: {storeState.reason}.</>}
              </>
            ) : (
              <>
                This store isn't taking orders right now. We're open daily from {HOURS_LABEL} —
                please check back then.
              </>
            )}
            {openStores.length > 0 && (
              <p className="mt-1 font-normal">
                Open now: {openStores.map((s) => s.name).join(", ")}. Choose one of these stores to order.
              </p>
            )}
          </div>
        )}
        {hasStockIssues && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-5 py-4 rounded-2xl mb-6">
            <p className="mb-1">Some items in your cart have limited stock:</p>
            <ul className="list-disc list-inside font-normal">
              {stockIssues.map((issue) => (
                <li key={issue.name}>
                  {issue.name} — only {issue.available} available
                </li>
              ))}
            </ul>
            <p className="mt-2 font-normal">
              Please go back to your cart and reduce the quantity before continuing.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Details + Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Store selector */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card">
              <h2 className="text-lg font-bold text-black mb-5 flex items-center gap-2">
                <MapPin size={18} className="text-magenta" />
                Choose Store
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {STORE_LOCATIONS.map((loc) => {
                  const st = stateFor(loc.id);
                  const closed = closuresLoaded && st.state === "closed";
                  const note =
                    st.state === "closed"
                      ? st.source === "admin"
                        ? st.reason || "Closed right now"
                        : "Opens 2:00 PM"
                      : "";

                  return (
                    <button
                      key={loc.id}
                      type="button"
                      disabled={closed}
                      onClick={() => {
                        setLocationId(loc.id);
                        setStorePicked(true);
                      }}
                      className={`py-3 px-2 rounded-xl border-2 font-semibold text-sm transition-colors ${
                        closed
                          ? "border-black/10 bg-black/5 text-black/30 cursor-not-allowed"
                          : locationId === loc.id
                          ? "border-magenta bg-magenta/5 text-magenta"
                          : "border-black/10 text-black/60 hover:border-black/25"
                      }`}
                    >
                      {loc.name}
                      {closed && (
                        <span className="mt-1 block text-[11px] font-medium normal-case text-red-400">
                          Closed{note ? ` · ${note}` : ""}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact / Delivery details */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card">
              <h2 className="text-lg font-bold text-black mb-5">
                {needsAddress ? "Delivery Details" : "Contact Details"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-magenta sm:col-span-2"
                />
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-black/50 mb-1.5">
                    Phone Number (linked to your account)
                  </label>
                  <input
                    type="tel"
                    value={user?.phone || ""}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-black/10 bg-black/5 text-black/60 cursor-not-allowed"
                  />
                </div>
                {needsAddress && (
                  <>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-black mb-2">
                        How far are you from our store?
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setDistance("within4")}
                          className={`py-3 rounded-xl border-2 font-semibold text-sm transition-colors ${
                            distance === "within4"
                              ? "border-magenta bg-magenta/5 text-magenta"
                              : "border-black/10 text-black/60"
                          }`}
                        >
                          0 - 4 km
                        </button>
                        <button
                          type="button"
                          onClick={() => setDistance("beyond4")}
                          className={`py-3 rounded-xl border-2 font-semibold text-sm transition-colors ${
                            distance === "beyond4"
                              ? "border-red-400 bg-red-50 text-red-500"
                              : "border-black/10 text-black/60"
                          }`}
                        >
                          Beyond 4 km
                        </button>
                      </div>
                      {isDeliveryBlocked && (
                        <p className="text-red-500 text-xs mt-2">
                          Sorry, we don't deliver beyond 4 km. Please choose Pickup or Dine In instead, or visit our store!
                        </p>
                      )}
                      {!isDeliveryBlocked && distance === "within4" && (
                        <p className="text-black/40 text-xs mt-2">
                          {cartTotal >= 499
                            ? "🎉 Free delivery on this order!"
                            : "₹30 delivery fee applies (free above ₹499)"}
                        </p>
                      )}
                    </div>
                    <input
                      type="text"
                      name="address"
                      required
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Full Address"
                      className="px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-magenta sm:col-span-2"
                    />
                    <input
                      type="text"
                      name="city"
                      required
                      value={form.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-magenta"
                    />
                    <input
                      type="text"
                      name="pincode"
                      required
                      value={form.pincode}
                      onChange={handleChange}
                      placeholder="Pincode"
                      className="px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-magenta"
                    />
                  </>
                )}
              </div>
              {!needsAddress && (
                <p className="text-black/40 text-xs mt-4">
                  {mode === "pickup"
                    ? "We'll text you when your order is ready for pickup at the store."
                    : "Just place your order and enjoy it fresh at our store — no reservation needed."}
                </p>
              )}
            </div>

            {/* Payment: pay at the shop */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card">
              <h2 className="text-lg font-bold text-black mb-5 flex items-center gap-2">
                <Store size={18} className="text-magenta" />
                Payment
              </h2>
              <div className="rounded-xl border-2 border-magenta bg-magenta/5 px-5 py-4">
                <p className="text-sm font-semibold text-magenta">Pay at the shop</p>
                <p className="mt-1 text-xs text-black/50">
                  Online payment is coming soon. Place your order now, then come
                  to the store and pay at the counter.
                </p>
              </div>
              {!isFormValid && !isStoreClosed && stockChecked && !hasStockIssues && (
                <p className="text-amber-600 text-xs mt-3">
                  Please fill in your {needsAddress ? "delivery" : "contact"} details above to place the order.
                </p>
              )}
              {paymentError && (
                <div className="flex items-start gap-2 mt-4 bg-red-50 text-red-600 text-xs p-3 rounded-xl">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card h-fit">
            <h2 className="text-lg font-bold text-black mb-5">
              Order Summary
            </h2>

            <div className="space-y-3 mb-5 max-h-48 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-black/70">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium text-black">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="flex gap-2 mb-2">
              <div className="flex-1 flex items-center gap-2 border border-black/10 rounded-xl px-3">
                <Tag size={16} className="text-black/40" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !appliedPromo) applyCoupon();
                  }}
                  disabled={!!appliedPromo}
                  placeholder="Coupon code"
                  className="w-full py-2.5 text-sm uppercase focus:outline-none disabled:bg-transparent disabled:text-black/60"
                />
              </div>
              {appliedPromo ? (
                <button
                  type="button"
                  onClick={removeCoupon}
                  aria-label="Remove coupon"
                  className="bg-black/5 text-black/60 px-4 rounded-xl hover:bg-black/10 transition-colors"
                >
                  <X size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={applyingCoupon || !couponCode.trim()}
                  className="bg-black text-white text-sm font-semibold px-4 rounded-xl hover:bg-black/80 transition-colors disabled:opacity-40"
                >
                  {applyingCoupon ? "..." : "Apply"}
                </button>
              )}
            </div>
            {couponMessage && (
              <p
                className={`text-xs mb-4 ${
                  appliedPromo ? "text-green-600" : "text-red-500"
                }`}
              >
                {couponMessage}
              </p>
            )}

            <div className="space-y-2 text-sm border-t border-black/10 pt-4">
              <div className="flex justify-between text-black/60">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              {needsAddress && !isDeliveryBlocked && (
                <div className="flex justify-between text-black/60">
                  <span>Delivery</span>
                  <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
                </div>
              )}
              {appliedPromo && discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Discount ({appliedPromo.code}
                    {appliedPromo.discountType === "percent"
                      ? ` · ${appliedPromo.discountValue}%`
                      : ""}
                    )
                  </span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-black text-base border-t border-black/10 pt-3">
                <span>Total</span>
                <span>₹{finalTotal.toFixed(0)}</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={!isFormValid || savingOrder}
                className="w-full flex items-center justify-center gap-2 bg-magenta text-white font-semibold py-4 rounded-full hover:bg-magenta-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {savingOrder && <Loader2 size={16} className="animate-spin" />}
                Place order · pay ₹{finalTotal.toFixed(0)} at shop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}