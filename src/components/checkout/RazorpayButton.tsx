"use client";

import { useState } from "react";
import { loadRazorpayScript } from "@/lib/loadRazorpay";

interface RazorpayButtonProps {
  amount: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess: (paymentId: string, orderId: string) => void;
  onFailure?: (error: string) => void;
  disabled?: boolean;
}

export default function RazorpayButton({
  amount,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onFailure,
  disabled,
}: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        onFailure?.("Failed to load Razorpay. Check your internet connection.");
        setLoading(false);
        return;
      }

      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        console.error("create-order failed:", orderData);
        onFailure?.(orderData.error || "Failed to create order");
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "CAZERTS",
        description: "Order Payment",
        order_id: orderData.orderId,
        prefill: {
          name: customerName || "",
          email: customerEmail || "",
          contact: customerPhone || "",
        },
        theme: {
          color: "#E6007E",
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: false,
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              console.error("verify request failed:", verifyData);
              onFailure?.(verifyData.error || "Payment verification failed.");
              setLoading(false);
              return;
            }

            if (verifyData.verified) {
              onSuccess(response.razorpay_payment_id, response.razorpay_order_id);
            } else {
              onFailure?.("Payment verification failed. Please contact support.");
            }
          } catch (verifyError) {
            console.error("verify handler error:", verifyError);
            onFailure?.("Could not verify payment. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on("payment.failed", function (response: any) {
        console.error("payment.failed:", response.error);
        onFailure?.(response.error.description || "Payment failed");
        setLoading(false);
      });

      rzp.open();
      setLoading(false);
    } catch (error) {
      console.error("Razorpay payment error:", error);
      onFailure?.("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || loading || amount <= 0}
      className="w-full rounded-full bg-[#E6007E] px-6 py-3 font-semibold text-white transition hover:bg-[#c40069] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Processing..." : `Pay ₹${amount.toFixed(2)}`}
    </button>
  );
}