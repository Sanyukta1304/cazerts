"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Phone, CheckCircle2, Check } from "lucide-react";
import { useAuth, Gender } from "@/context/AuthContext";
import { syncCustomerName } from "@/lib/orders";

const FEMALE_AVATARS = ["female-1", "female-2", "female-3", "female-4", "female-5", "female-6"];
const MALE_AVATARS = ["male-1", "male-2", "male-3", "male-4", "male-5", "male-6"];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, updateProfile } = useAuth();
  const redirectTo = searchParams.get("redirect") || "/";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<Gender>("female");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const avatarOptions = gender === "female" ? FEMALE_AVATARS : MALE_AVATARS;

  const handleSelectGender = (g: Gender) => {
    setGender(g);
    setSelectedAvatar("");
  };

  const handleSendOtp = () => {
    if (phone.trim().length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    setError("");
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    alert(`Demo OTP (would be sent via SMS in production): ${code}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!otpSent) {
      setError("Please send and enter the OTP first.");
      return;
    }
    if (otp !== generatedOtp) {
      setError("Incorrect OTP. Please try again.");
      return;
    }
    if (!selectedAvatar) {
      setError("Please choose an avatar.");
      return;
    }

    setError("");
    login(phone);
    updateProfile(name.trim(), gender, selectedAvatar);
    syncCustomerName(phone, name.trim()).catch(() => {
      // Non-critical — leaderboard name will just stay as-is if this fails.
    });
    setSuccess(true);

    setTimeout(() => {
      router.push(redirectTo);
    }, 1200);
  };

  if (success) {
    return (
      <div className="pt-28 pb-16 bg-cream min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-extrabold text-black">Logged in successfully!</h1>
          <p className="text-black/60 mt-2">Redirecting you now...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-16 bg-cream min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-3xl shadow-card p-8 md:p-10 w-full max-w-md"
      >
        <div className="w-14 h-14 rounded-full bg-magenta/10 flex items-center justify-center mx-auto mb-5">
          <Phone size={24} className="text-magenta" />
        </div>
        <h1 className="text-2xl font-extrabold text-black text-center mb-2">
          Login or Sign Up
        </h1>
        <p className="text-black/60 text-sm text-center mb-8">
          Just a few details to get you started
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-magenta"
          />

          <div>
            <div className="flex items-center gap-2 border border-black/10 rounded-xl px-4">
              <span className="text-black/50 text-sm">+91</span>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                disabled={otpSent}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="10-digit phone number"
                className="w-full py-3 focus:outline-none disabled:text-black/50"
              />
              {!otpSent && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-magenta text-sm font-semibold whitespace-nowrap py-3"
                >
                  Send OTP
                </button>
              )}
            </div>

            {otpSent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3"
              >
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 4-digit OTP"
                  className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-magenta text-center text-lg tracking-[0.5em]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                  }}
                  className="text-black/40 text-xs mt-2 hover:text-black transition-colors"
                >
                  Change phone number
                </button>
              </motion.div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-3">
              Choose your gender
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSelectGender("female")}
                className={`py-3 rounded-xl border-2 font-semibold text-sm transition-colors ${
                  gender === "female"
                    ? "border-magenta bg-magenta/5 text-magenta"
                    : "border-black/10 text-black/60"
                }`}
              >
                Female
              </button>
              <button
                type="button"
                onClick={() => handleSelectGender("male")}
                className={`py-3 rounded-xl border-2 font-semibold text-sm transition-colors ${
                  gender === "male"
                    ? "border-magenta bg-magenta/5 text-magenta"
                    : "border-black/10 text-black/60"
                }`}
              >
                Male
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-3">
              Choose your avatar
            </label>
            <div className="grid grid-cols-3 gap-3">
              {avatarOptions.map((avatarId) => (
                <button
                  key={avatarId}
                  type="button"
                  onClick={() => setSelectedAvatar(avatarId)}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-colors ${
                    selectedAvatar === avatarId
                      ? "border-magenta"
                      : "border-black/10 hover:border-black/30"
                  }`}
                >
                  <img
                    src={`/avatars/${avatarId}.jpg`}
                    alt="Avatar option"
                    className="w-full h-full object-cover"
                  />
                  {selectedAvatar === avatarId && (
                    <span className="absolute top-1.5 right-1.5 bg-magenta text-white rounded-full p-1">
                      <Check size={12} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            type="submit"
            className="w-full bg-magenta text-white font-semibold px-6 py-3.5 rounded-full hover:bg-magenta-dark transition-colors"
          >
            {otpSent ? "Verify & Continue" : "Continue"}
          </button>
        </form>

        <button
          onClick={() => router.push("/")}
          className="block mx-auto text-center text-black/40 text-xs mt-6 hover:text-black/60"
        >
          Back to Home
        </button>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}