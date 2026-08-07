"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CreditCard, Smartphone, Tag, CheckCircle2, AlertCircle, MapPin } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import RazorpayButton from "@/components/checkout/RazorpayButton";
import { submitOrder } from "@/lib/orders";

const COUPONS: Record<string, number> = {
  SWEET10: 10,
  CAZERTS20: 20,
};

type OrderMode = "delivery" | "pickup" | "dinein";

const modes: { key: OrderMode; label: string }[] = [
  { key: "delivery", label: "Delivery" },
  { key: "pickup", label: "Pickup" },
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

  const [mode, setMode] = useState<OrderMode>("delivery");

  useEffect(() => {
    const stored = localStorage.getItem("cazerts-order-mode") as OrderMode | null;
    if (stored) setMode(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("cazerts-order-mode", mode);
  }, [mode]);

  const needsAddress = mode === "delivery";

  const [distance, setDistance] = useState<"within4" | "beyond4">("within4");
  const [locationId, setLocationId] = useState(STORE_LOCATIONS[0].id);

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

  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi");
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedBillNo, setPlacedBillNo] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [savingOrder, setSavingOrder] = useState(false);

  const isDeliveryBlocked = mode === "delivery" && distance === "beyond4";
  const deliveryFee =
    mode === "delivery" && distance === "within4"
      ? cartTotal >= 499
        ? 0
        : 30
      : 0;

  const discountAmount = (cartTotal * appliedDiscount) / 100;
  const finalTotal = Math.max(cartTotal + deliveryFee - discountAmount, 0);

  const isSunday = new Date().getDay() === 0;

  const isFormValid =
    !isDeliveryBlocked &&
    (needsAddress
      ? form.name.trim() !== "" &&
        form.address.trim() !== "" &&
        form.city.trim() !== "" &&
        form.pincode.trim() !== ""
      : form.name.trim() !== "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const applyCoupon = () => {
    if (!isSunday) {
      setAppliedDiscount(0);
      setCouponMessage("🎉 Coupons are only valid on Sundays! Come back then for a sweet discount.");
      return;
    }

    const code = couponCode.trim().toUpperCase();
    if (COUPONS[code]) {
      setAppliedDiscount(COUPONS[code]);
      setCouponMessage(`✓ Coupon applied! ${COUPONS[code]}% off`);
    } else {
      setAppliedDiscount(0);
      setCouponMessage("Invalid coupon code");
    }
  };

  const handlePaymentSuccess = async (paymentId: string, razorpayOrderId: string) => {
    if (!user?.phone) {
      setPaymentError("You must be logged in to complete checkout.");
      return;
    }

    setPaymentError("");
    setSavingOrder(true);

    try {
      const result = await submitOrder({
        name: form.name,
        phone: user.phone,
        gender: user.gender,
        locationId,
        orderMode: mode,
        paymentMethod,
        deliveryAddress: needsAddress ? form.address : undefined,
        deliveryCity: needsAddress ? form.city : undefined,
        deliveryPincode: needsAddress ? form.pincode : undefined,
        items: cart,
        total: finalTotal,
        razorpayOrderId,
        razorpayPaymentId: paymentId,
      });

      setPlacedBillNo(result.billNo);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      console.error("Failed to save order:", err);
      setPaymentError(
        "Your payment succeeded, but we couldn't save your order. Please contact us with your payment ID: " + paymentId
      );
    } finally {
      setSavingOrder(false);
    }
  };

  const handlePaymentFailure = (error: string) => {
    setPaymentError(error);
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

          <p className="text-black/60 mb-8 max-w-md">
            Thank you for your order. Your desserts are being prepared with
            love{" "}
            {mode === "delivery"
              ? "and will be on their way soon."
              : mode === "pickup"
              ? "and will be ready for pickup soon."
              : "and will be served fresh at your table shortly."}
          </p>
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
        <div className="flex justify-start mb-8">
          <div className="inline-flex bg-white rounded-full p-1.5 shadow-card gap-1">
            {modes.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMode(m.key)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                  mode === m.key
                    ? "bg-magenta text-white shadow-premium"
                    : "text-black/60 hover:text-black"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

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
                {STORE_LOCATIONS.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setLocationId(loc.id)}
                    className={`py-3 rounded-xl border-2 font-semibold text-sm transition-colors ${
                      locationId === loc.id
                        ? "border-magenta bg-magenta/5 text-magenta"
                        : "border-black/10 text-black/60"
                    }`}
                  >
                    {loc.name}
                  </button>
                ))}
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

            {/* Payment method */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card">
              <h2 className="text-lg font-bold text-black mb-5">
                Payment Method
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`flex items-center justify-center gap-2 py-4 rounded-xl border-2 font-semibold text-sm transition-colors ${
                    paymentMethod === "upi"
                      ? "border-magenta bg-magenta/5 text-magenta"
                      : "border-black/10 text-black/60"
                  }`}
                >
                  <Smartphone size={18} />
                  UPI
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center justify-center gap-2 py-4 rounded-xl border-2 font-semibold text-sm transition-colors ${
                    paymentMethod === "card"
                      ? "border-magenta bg-magenta/5 text-magenta"
                      : "border-black/10 text-black/60"
                  }`}
                >
                  <CreditCard size={18} />
                  Card
                </button>
              </div>
              <p className="text-black/40 text-xs mt-4">
                Secure payments powered by Razorpay. Both UPI and Card are
                available in the payment window regardless of your selection
                above.
              </p>
              {isDeliveryBlocked ? (
                <p className="text-red-500 text-xs mt-3">
                  Delivery isn't available beyond 4 km. Please switch to Pickup or Dine In above.
                </p>
              ) : (
                !isFormValid && (
                  <p className="text-amber-600 text-xs mt-3">
                    Please fill in your {needsAddress ? "delivery" : "contact"} details above to proceed to payment.
                  </p>
                )
              )}
              {savingOrder && (
                <p className="text-black/50 text-xs mt-3">Saving your order...</p>
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
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code"
                  className="w-full py-2.5 text-sm focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={applyCoupon}
                className="bg-black text-white text-sm font-semibold px-4 rounded-xl hover:bg-black/80 transition-colors"
              >
                Apply
              </button>
            </div>
            {isSunday && (
              <p className="text-magenta text-xs mb-3">
                🎉 It's Sunday — coupons are live today!
              </p>
            )}
            {couponMessage && (
              <p
                className={`text-xs mb-4 ${
                  appliedDiscount > 0 ? "text-green-600" : "text-red-500"
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
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedDiscount}%)</span>
                  <span>-₹{discountAmount.toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-black text-base border-t border-black/10 pt-3">
                <span>Total</span>
                <span>₹{finalTotal.toFixed(0)}</span>
              </div>
            </div>

            <div className="mt-6">
              <RazorpayButton
                amount={finalTotal}
                customerName={form.name}
                customerPhone={user?.phone || ""}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
                disabled={!isFormValid || savingOrder}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}